import requests
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

PROXIES = [
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

TEST_URL = "https://httpbin.org/ip"
TIMEOUT = 10


def parse_proxy(proxy_str):
    ip, port, user, password = proxy_str.split(":")
    return {
        "http": f"http://{user}:{password}@{ip}:{port}",
        "https": f"http://{user}:{password}@{ip}:{port}",
    }, f"{ip}:{port}"


def test_proxy(proxy_str):
    proxy_dict, label = parse_proxy(proxy_str)
    try:
        start = time.time()
        response = requests.get(TEST_URL, proxies=proxy_dict, timeout=TIMEOUT)
        elapsed = round((time.time() - start) * 1000)
        if response.status_code == 200:
            ip_seen = response.json().get("origin", "unknown")
            return label, True, elapsed, ip_seen
        else:
            return label, False, None, f"HTTP {response.status_code}"
    except requests.exceptions.ProxyError as e:
        return label, False, None, f"ProxyError: {str(e)[:60]}"
    except requests.exceptions.ConnectTimeout:
        return label, False, None, "Timeout"
    except Exception as e:
        return label, False, None, f"Error: {str(e)[:60]}"


def main():
    print(f"Testing {len(PROXIES)} proxies against {TEST_URL}\n")
    print(f"{'Proxy':<26} {'Status':<8} {'Latency':<12} {'IP / Notes'}")
    print("-" * 75)

    results = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(test_proxy, p): p for p in PROXIES}
        for future in as_completed(futures):
            results.append(future.result())

    # Sort by proxy label for consistent output
    results.sort(key=lambda x: x[0])

    working, failed = 0, 0
    for label, ok, latency, note in results:
        status = "OK" if ok else "FAIL"
        lat_str = f"{latency} ms" if latency else "-"
        print(f"{label:<26} {status:<8} {lat_str:<12} {note}")
        if ok:
            working += 1
        else:
            failed += 1

    print("-" * 75)
    print(f"\nSummary: {working} working, {failed} failed out of {len(PROXIES)} proxies.")


if __name__ == "__main__":
    main()
