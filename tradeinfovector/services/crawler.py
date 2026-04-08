"""
TIPP crawler — uses Playwright for the listing tree (CSRF-protected AJAX)
and HTTPX for individual detail pages (server-side rendered).

Tree structure (from page source)
-----------------------------------
  Static HTML already contains:
    Level 1 — chapters  : <li id="1">  … <li id="96">    (visible)
    Level 2 — headings  : <li id="97"> …                  (hidden, in <ul display:none>)
  Level 3 — commodities : loaded via AJAX when a heading is expanded
                          (requires Yii session + CSRF token → Playwright only)
"""

import re
import time
from typing import Optional

import httpx
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

_LIST_ALL_URL = "https://tipp.gov.pk/index.php?r=tradeInfo/listAll"
_DETAIL_BASE  = "https://tipp.gov.pk/index.php"

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

_TIPP_ID_RE   = re.compile(r"view&id=(\d+)", re.IGNORECASE)
_HS_LABELS        = ("hs code", "pct code", "hscode", "tariff code", "pct")
_COMMODITY_LABELS = ("commodity", "description", "product", "goods", "item")


# ---------------------------------------------------------------------------
# Playwright tree crawler
# ---------------------------------------------------------------------------

def crawl_all_tipp_ids() -> list[int]:
    """
    Load the TIPP listAll tree in a real browser, expand every node level
    by level, and return all commodity view IDs.

    Round 1 — click all chapter hitareas  (no AJAX; just reveals hidden <ul>)
    Round 2+ — click all heading hitareas (fires CSRF-authenticated AJAX)
    Repeat until no .expandable-hitarea elements remain.
    """
    all_ids: set[int] = set()

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        context = browser.new_context(ignore_https_errors=True, extra_http_headers=_HEADERS)
        page    = context.new_page()

        # ── Intercept every ajaxFillTree request/response ────────────────────
        ajax_log: list[dict] = []

        def _on_request(req):
            if "ajaxFillTree" in req.url:
                ajax_log.append({
                    "dir":       "REQ",
                    "method":    req.method,
                    "url":       req.url,
                    "post_data": req.post_data,
                })

        def _on_response(res):
            if "ajaxFillTree" in res.url:
                body = res.text()
                ajax_log.append({
                    "dir":    "RES",
                    "status": res.status,
                    "body":   body[:400],
                })
                if body and body != "[]":
                    # Real data — parse IDs immediately while we have the body
                    for tag in BeautifulSoup(body, "html.parser").find_all("a", href=True):
                        m = _TIPP_ID_RE.search(tag["href"])
                        if m:
                            all_ids.add(int(m.group(1)))

        page.on("request",  _on_request)
        page.on("response", _on_response)
        # ─────────────────────────────────────────────────────────────────────

        print("[crawl] Loading listAll …")
        page.goto(_LIST_ALL_URL, wait_until="networkidle", timeout=60_000)
        page.wait_for_timeout(8_000)   # extra time for treeview AJAX

        # Log what we observed
        print(f"[crawl] ajaxFillTree calls captured: {len(ajax_log)}")
        for entry in ajax_log[:10]:
            print(f"  {entry}")

        yw0_count = page.locator("#yw0 > li").count()
        print(f"[crawl] #yw0 > li after load: {yw0_count}")

        if yw0_count == 0:
            print("[crawl] Tree empty — CSRF token likely missing. Cannot expand.")
            browser.close()
            return list(all_ids)

        # Expand level by level
        for round_num in range(1, 20):
            count = page.locator(".expandable-hitarea").count()
            if count == 0:
                print(f"[crawl] No more expandable nodes after {round_num - 1} round(s)")
                break
            print(f"[crawl] Round {round_num}: clicking {count} node(s) …")
            page.eval_on_selector_all(
                ".expandable-hitarea",
                "els => els.forEach(el => el.click())",
            )
            page.wait_for_load_state("networkidle", timeout=60_000)

        # Also harvest from final DOM (catches anything missed in response listener)
        soup = BeautifulSoup(page.content(), "html.parser")
        for tag in soup.find_all("a", href=True):
            m = _TIPP_ID_RE.search(tag["href"])
            if m:
                all_ids.add(int(m.group(1)))

        browser.close()

    print(f"[crawl] {len(all_ids)} commodity IDs collected.")
    return list(all_ids)


# ---------------------------------------------------------------------------
# HTTPX detail-page helpers
# ---------------------------------------------------------------------------

def make_client() -> httpx.Client:
    return httpx.Client(
        headers=_HEADERS,
        timeout=30,
        verify=False,
        follow_redirects=True,
    )


def fetch_detail_page(client: httpx.Client, tipp_id: int) -> BeautifulSoup:
    response = client.get(_DETAIL_BASE, params={"r": "tradeInfo/view", "id": tipp_id})
    response.raise_for_status()
    return BeautifulSoup(response.text, "html.parser")


def extract_commodity_data(soup: BeautifulSoup) -> dict:
    """Extract hs_code and commodity_name from a TIPP detail page."""
    hs_code: Optional[str]        = None
    commodity_name: Optional[str] = None

    tables = []
    dv = soup.select_one("table.detail-view")
    if dv:
        tables.append(dv)
    tables.extend(t for t in soup.find_all("table") if t is not dv)

    for table in tables:
        for row in table.find_all("tr"):
            cells = row.find_all(["th", "td"])
            if len(cells) < 2:
                continue
            label = cells[0].get_text(strip=True).lower()
            value = cells[1].get_text(strip=True)
            if not value:
                continue
            if not hs_code and any(kw in label for kw in _HS_LABELS):
                hs_code = value
            if not commodity_name and any(kw in label for kw in _COMMODITY_LABELS):
                commodity_name = value
        if hs_code and commodity_name:
            break

    if not commodity_name:
        for tag_name in ("h1", "h2", "h3"):
            el = soup.find(tag_name)
            if el:
                text = el.get_text(strip=True)
                if text and text.lower() not in ("error", ""):
                    commodity_name = text
                    break

    if not commodity_name:
        title_el = soup.find("title")
        if title_el:
            title = title_el.get_text(strip=True)
            for sep in (" | ", " - ", "|"):
                if sep in title:
                    commodity_name = title.split(sep)[0].strip()
                    break
            else:
                commodity_name = title

    return {"hs_code": hs_code, "commodity_name": commodity_name}
