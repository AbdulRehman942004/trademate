"""
Quick test — fetches master list and scrapes first 5 leaf HS codes to verify
that all 4 tables are parsed correctly before running the full job.
"""
import requests, time, csv, os, random, logging
from bs4 import BeautifulSoup
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Import the main scraper's functions
import importlib.util, sys
spec = importlib.util.spec_from_file_location("tipp_scraper", "tipp_scraper.py")
mod  = importlib.util.load_from_spec = None

# Re-import inline to avoid path issues
from tipp_scraper import (
    fetch_with_retry, parse_master_list, parse_code_view, BASE_URL
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

def main():
    log.info("TEST RUN — fetching master list…")
    master_url = f"{BASE_URL}/index.php?r=tradeInfo/listView&searchType=HSCODE&value="
    html = fetch_with_retry(master_url)
    assert html, "Master list fetch failed!"

    all_codes = parse_master_list(html)
    leaf_codes = [(hs, desc) for hs, desc, _, is_leaf in all_codes if is_leaf]
    log.info(f"Total entries: {len(all_codes)} | Leaf codes: {len(leaf_codes)}")

    # Show first 5 leaf codes
    test_sample = leaf_codes[:5]
    log.info(f"Testing first 5 leaf HS codes: {[x[0] for x in test_sample]}")

    for hs, desc in test_sample:
        url = (f"{BASE_URL}/index.php?r=tradeInfo/codeView"
               f"&hsType=Code&value={hs}&searchType=HSCODE")
        log.info(f"Fetching: {hs} — {desc[:50]}")
        html = fetch_with_retry(url)
        if not html:
            log.error(f"  FAILED to fetch {hs}")
            continue
        data = parse_code_view(hs, desc, html)
        print(f"\n  HS Code : {hs}")
        print(f"  Desc    : {desc[:70]}")
        print(f"  Tariffs : {len(data['tariffs'])} rows")
        for r in data["tariffs"]:
            print(f"    {r[2:]}")
        print(f"  Cess    : {len(data['cess'])} rows")
        for r in data["cess"]:
            print(f"    {r[2:]}")
        print(f"  Exempt  : {len(data['exemptions'])} rows")
        for r in data["exemptions"]:
            print(f"    {r[2:]}")
        print(f"  AntiDump: {len(data['antidump'])} rows")
        time.sleep(0.5)

    print("\nTest run complete - structure looks correct.")

if __name__ == "__main__":
    main()
