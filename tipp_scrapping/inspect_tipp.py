"""
Quick inspector — fetches TIPP pages through a proxy and prints the raw structure
so we can design the main scraper correctly.
"""
import requests
from bs4 import BeautifulSoup
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

PROXY_LIST = [
    "31.59.20.176:6754:wlukdecd:e2u6bssg5n7i",
    "23.95.150.145:6114:wlukdecd:e2u6bssg5n7i",
    "198.23.239.134:6540:wlukdecd:e2u6bssg5n7i",
    "45.38.107.97:6014:wlukdecd:e2u6bssg5n7i",
    "107.172.163.27:6543:wlukdecd:e2u6bssg5n7i",
    "198.105.121.200:6462:wlukdecd:e2u6bssg5n7i",
    "216.10.27.159:6837:wlukdecd:e2u6bssg5n7i",
    "142.111.67.146:5611:wlukdecd:e2u6bssg5n7i",
    "191.96.254.138:6185:wlukdecd:e2u6bssg5n7i",
    "31.58.9.4:6077:wlukdecd:e2u6bssg5n7i",
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

def make_proxy_dict(proxy_str):
    ip, port, user, pw = proxy_str.split(":")
    url = f"http://{user}:{pw}@{ip}:{port}"
    return {"http": url, "https": url}

def fetch(url, proxy_str, timeout=20):
    proxies = make_proxy_dict(proxy_str)
    r = requests.get(url, headers=HEADERS, proxies=proxies, timeout=timeout, verify=False)
    r.raise_for_status()
    return r.text

def inspect_page(name, url, proxy_str):
    print(f"\n{'='*70}")
    print(f"PAGE: {name}")
    print(f"URL : {url}")
    print(f"{'='*70}")
    html = fetch(url, proxy_str)
    soup = BeautifulSoup(html, "html.parser")

    # Print all tables found
    tables = soup.find_all("table")
    print(f"\nFound {len(tables)} table(s)\n")
    for i, tbl in enumerate(tables):
        headers = [th.get_text(strip=True) for th in tbl.find_all("th")]
        rows = tbl.find_all("tr")
        print(f"  Table {i+1}: {len(rows)} rows | Headers: {headers}")
        # Print first 3 data rows
        for row in rows[1:4]:
            cells = [td.get_text(strip=True) for td in row.find_all(["td","th"])]
            if cells:
                print(f"    Row: {cells}")

    # Print all links that look like tradeInfo links
    print("\n  Relevant links found:")
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "tradeInfo" in href or "hsType" in href or "chapter" in href.lower():
            print(f"    {a.get_text(strip=True)[:40]:<42} -> {href[:100]}")

proxy = PROXY_LIST[0]

# 1. List view for rice
inspect_page(
    "LIST VIEW (rice)",
    "https://tipp.gov.pk/index.php?r=tradeInfo/listView&value=rice&searchType=Description",
    proxy,
)

# 2. Code view for a specific HS code
inspect_page(
    "CODE VIEW (HS 100610101000)",
    "https://tipp.gov.pk/index.php?r=tradeInfo/codeView&hsType=Code&value=100610101000&searchType=HSCODE",
    proxy,
)

# 3. Try to find the "list all" / chapters page
inspect_page(
    "LIST ALL (commodities & tariffs)",
    "https://tipp.gov.pk/index.php?r=tradeInfo/listView&searchType=HSCODE&value=",
    proxy,
)
