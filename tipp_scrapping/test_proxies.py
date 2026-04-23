import requests
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from config import PROXY_LIST as PROXIES

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
