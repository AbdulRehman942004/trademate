import os
from dotenv import load_dotenv

load_dotenv()

# ── General Config ────────────────────────────────────────────────────────────
BASE_URL = "https://tipp.gov.pk"
DATA_DIR = os.getenv("DATA_DIR", "data")

# ── Scraping Parameters ───────────────────────────────────────────────────────
TIMEOUT = 25
MAX_RETRIES = 6
DELAY_MIN = 0.3
DELAY_MAX = 0.9
MAX_WORKERS = 5

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Referer": "https://tipp.gov.pk/index.php?r=tradeInfo/index",
}

# ── Proxy List ────────────────────────────────────────────────────────────────
PROXY_LIST = [
    "45.43.83.148:6431:wlukdecd:e2u6bssg5n7i",
    "82.24.236.68:7878:wlukdecd:e2u6bssg5n7i",
    "82.24.242.39:7858:wlukdecd:e2u6bssg5n7i",
    "107.181.142.34:5627:wlukdecd:e2u6bssg5n7i",
    "45.43.65.112:6626:wlukdecd:e2u6bssg5n7i",
    "107.181.148.183:6043:wlukdecd:e2u6bssg5n7i",
    "198.37.116.109:6068:wlukdecd:e2u6bssg5n7i",
    "45.39.13.121:5558:wlukdecd:e2u6bssg5n7i",
    "64.137.77.99:5534:wlukdecd:e2u6bssg5n7i",
    "103.99.33.252:6247:wlukdecd:e2u6bssg5n7i",
    "104.253.82.202:6623:wlukdecd:e2u6bssg5n7i",
    "45.41.162.100:6737:wlukdecd:e2u6bssg5n7i",
    "92.112.137.90:6033:wlukdecd:e2u6bssg5n7i",
    "154.29.65.179:6287:wlukdecd:e2u6bssg5n7i",
    "82.26.208.115:5422:wlukdecd:e2u6bssg5n7i",
    "198.23.147.145:5160:wlukdecd:e2u6bssg5n7i",
    "45.39.5.60:6498:wlukdecd:e2u6bssg5n7i",
    "50.114.99.68:6809:wlukdecd:e2u6bssg5n7i",
    "216.173.120.231:6523:wlukdecd:e2u6bssg5n7i",
    "82.27.246.212:7536:wlukdecd:e2u6bssg5n7i",
    "31.58.10.10:5978:wlukdecd:e2u6bssg5n7i",
    "45.39.25.128:5563:wlukdecd:e2u6bssg5n7i",
    "103.75.228.37:6116:wlukdecd:e2u6bssg5n7i",
    "64.137.59.61:6654:wlukdecd:e2u6bssg5n7i",
    "136.0.207.52:6629:wlukdecd:e2u6bssg5n7i",
    "82.21.244.167:5490:wlukdecd:e2u6bssg5n7i",
    "104.252.49.195:6131:wlukdecd:e2u6bssg5n7i",
    "104.239.35.132:5814:wlukdecd:e2u6bssg5n7i",
    "173.214.177.99:5790:wlukdecd:e2u6bssg5n7i",
    "104.239.90.85:6476:wlukdecd:e2u6bssg5n7i",
]

# ── AWS S3 Config ─────────────────────────────────────────────────────────────
AWS_S3_BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID_MANUAL")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY_MANUAL")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
