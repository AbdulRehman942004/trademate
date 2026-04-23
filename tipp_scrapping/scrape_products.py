"""
scrape_products.py
==================
Scrapes the "Products" table from each 12-digit HS code codeView page
on tipp.gov.pk and saves results to:

    data/products.csv

Columns: HS Code, Description, Product Name, Product Family,
         Product Technical Name, Brand Name, Comments, File

Resumes automatically if interrupted (checkpoint in products_checkpoint.txt).
Does NOT touch any existing file.

Run:
    python scrape_products.py
"""

import csv
import os
import random
import time
import logging
import requests
import urllib3
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed
from s3_utils import sync_data_from_s3, sync_data_to_s3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

from config import (
    BASE_URL, DATA_DIR, PROXY_LIST, HEADERS, 
    TIMEOUT, MAX_RETRIES, DELAY_MIN, DELAY_MAX, MAX_WORKERS
)

OUT_DIR          = DATA_DIR
FILE_HS_CODES    = os.path.join(OUT_DIR, "pct codes with hierarchy.csv")
FILE_PRODUCTS    = os.path.join(OUT_DIR, "products.csv")
FILE_CHECKPOINT  = os.path.join(OUT_DIR, "products_checkpoint.txt")

PRODUCT_FIELDS = [
    "HS Code", "Description",
    "Product Name", "Product Family", "Product Technical Name",
    "Brand Name", "Comments", "File",
]

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(os.path.join(OUT_DIR, "products_scraper.log"), encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger(__name__)

# ── Proxy helpers ─────────────────────────────────────────────────────────────
_proxy_idx = 0

def _next_proxy():
    global _proxy_idx
    s = PROXY_LIST[_proxy_idx % len(PROXY_LIST)]
    _proxy_idx += 1
    ip, port, user, pw = s.split(":")
    url = f"http://{user}:{pw}@{ip}:{port}"
    return {"http": url, "https": url}

def fetch(url, retries=MAX_RETRIES):
    for attempt in range(retries):
        proxies = _next_proxy()
        try:
            r = requests.get(url, headers=HEADERS, proxies=proxies,
                             timeout=TIMEOUT, verify=False)
            r.raise_for_status()
            time.sleep(random.uniform(DELAY_MIN, DELAY_MAX))
            return r.text
        except Exception as e:
            log.warning(f"  Attempt {attempt+1}/{retries} failed for {url}: {e}")
            time.sleep(1.5 * (attempt + 1))
    log.error(f"  All retries exhausted: {url}")
    return None

# ── Parser ────────────────────────────────────────────────────────────────────

def parse_products(hs_code, description, html):
    """
    Find the Products <h1> section on the codeView page and extract
    the table beneath it. Returns list of row dicts.
    """
    soup = BeautifulSoup(html, "lxml")
    rows_out = []

    for h1 in soup.find_all("h1"):
        if h1.get_text(strip=True) != "Products":
            continue
        tbl = h1.find_next("table")
        if not tbl:
            break
        tr_list = tbl.find_all("tr")
        if not tr_list:
            break
        # First row = headers
        headers = [th.get_text(strip=True) for th in tr_list[0].find_all(["th", "td"])]
        for tr in tr_list[1:]:
            cells = [td.get_text(" ", strip=True) for td in tr.find_all(["td", "th"])]
            if not any(cells):
                continue
            rd = dict(zip(headers, cells))
            row = {
                "HS Code":                hs_code,
                "Description":            description,
                "Product Name":           rd.get("Product Name", ""),
                "Product Family":         rd.get("Product Family", ""),
                "Product Technical Name": rd.get("Product technical name",
                                                  rd.get("Product Technical Name", "")),
                "Brand Name":             rd.get("Brand Name", ""),
                "Comments":               rd.get("Comments", ""),
                "File":                   rd.get("File", ""),
            }
            rows_out.append(row)
        break   # only the first Products section

    return rows_out

# ── Checkpoint helpers ────────────────────────────────────────────────────────

def load_checkpoint():
    done = set()
    if os.path.exists(FILE_CHECKPOINT):
        with open(FILE_CHECKPOINT, encoding="utf-8") as f:
            for line in f:
                code = line.strip()
                if code:
                    done.add(code)
    return done

def save_checkpoint(hs_code):
    with open(FILE_CHECKPOINT, "a", encoding="utf-8") as f:
        f.write(hs_code + "\n")

# ── Load HS codes ─────────────────────────────────────────────────────────────

def load_hs_codes():
    """Read all 12-digit leaf HS codes from the PCT hierarchy CSV."""
    codes = []
    # Try multiple encodings — file has some non-UTF8 chars
    for enc in ("utf-8-sig", "utf-8", "cp1252", "latin-1"):
        try:
            with open(FILE_HS_CODES, newline="", encoding=enc, errors="replace") as f:
                for row in csv.DictReader(f):
                    hs = row.get("HS Code", "").strip()
                    desc = row.get("Description", "").strip()
                    if len(hs) == 12 and hs.isdigit():
                        codes.append((hs, desc))
            log.info(f"Loaded {len(codes)} HS codes (encoding: {enc})")
            return codes
        except Exception as e:
            log.warning(f"Encoding {enc} failed: {e}")
    return codes

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    
    # Sync from S3
    log.info("Syncing data from S3...")
    sync_data_from_s3(OUT_DIR)

    all_codes = load_hs_codes()
    if not all_codes:
        log.error("No HS codes loaded — aborting.")
        return

    done = load_checkpoint()
    pending = [(hs, desc) for hs, desc in all_codes if hs not in done]

    log.info(f"Total leaf codes : {len(all_codes)}")
    log.info(f"Already done     : {len(done)}")
    log.info(f"Pending          : {len(pending)}")

    if not pending:
        log.info("Nothing to do — all codes already scraped.")
        return

    # Open products CSV for append (write header only if new)
    is_new = not os.path.exists(FILE_PRODUCTS) or os.path.getsize(FILE_PRODUCTS) == 0
    prod_fh = open(FILE_PRODUCTS, "a", newline="", encoding="utf-8")
    prod_w  = csv.DictWriter(prod_fh, fieldnames=PRODUCT_FIELDS, extrasaction="ignore")
    if is_new:
        prod_w.writeheader()

    codes_done  = 0
    codes_failed = 0
    products_written = 0

    def scrape_one(args):
        hs, desc = args
        url = (f"{BASE_URL}/index.php?r=tradeInfo/codeView"
               f"&hsType=Code&value={hs}&searchType=HSCODE")
        html = fetch(url)
        if html is None:
            return hs, desc, None
        rows = parse_products(hs, desc, html)
        return hs, desc, rows

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
        futures = {ex.submit(scrape_one, item): item for item in pending}
        for fut in as_completed(futures):
            hs, desc, rows = fut.result()
            if rows is None:
                codes_failed += 1
                log.warning(f"  FAILED {hs}  (total failures: {codes_failed})")
                continue

            if rows:
                for row in rows:
                    prod_w.writerow(row)
                products_written += len(rows)
            prod_fh.flush()
            save_checkpoint(hs)

            codes_done += 1
            if codes_done % 100 == 0 or rows:
                log.info(
                    f"  total_written={products_written}"
                )
            
            # Periodically sync to S3
            if codes_done % 100 == 0:
                log.info("Performing periodic S3 sync...")
                sync_data_to_s3(OUT_DIR)

    prod_fh.close()

    # Final sync to S3
    log.info("Performing final S3 sync...")
    sync_data_to_s3(OUT_DIR)

    log.info("==============================")
    log.info(f"Codes scraped : {codes_done}")
    log.info(f"Codes failed  : {codes_failed}")
    log.info(f"Products rows : {products_written}")
    log.info(f"Output file   : {FILE_PRODUCTS}")


if __name__ == "__main__":
    main()
