#!/usr/bin/env python3
"""
Fetch today's retail fuel price from EPPO (Energy Policy and Planning Office)
and append it to data/prices.json.

Source: https://www.eppo.go.th/index.php/th/petroleum/price/structure-oil-price
EPPO now publishes the current retail prices through its public JSON API. This
script reads that API and appends the PTT retail prices to the JSON data file.
"""

import json
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
from urllib.request import urlopen, Request

# Thai timezone
TH_TZ = timezone(timedelta(hours=7))

EPPO_OIL_API_URL = "https://www.eppo.go.th/wp-json/oil-api/v1/oil-prices"
DATA_FILE = Path(__file__).parent.parent / "data" / "prices.json"

# EPPO's API lists prices by fuel company. PTT carries all seven fuel types
# shown by this site and is the reference retailer used for the daily series.
API_FUEL_MAP = {
    "oil_ptt_gl95": "gasoline_95",
    "oil_ptt_gh95": "gasohol_95",
    "oil_ptt_gh91": "gasohol_91",
    "oil_ptt_e20": "gasohol_e20",
    "oil_ptt_e85": "gasohol_e85",
    "oil_ptt_ds": "diesel",
    "oil_ptt_dsb20": "diesel_b20",
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; thai-fuel-price-bot/1.0)"
}


def fetch_page(url: str) -> str:
    req = Request(url, headers=HEADERS)
    with urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8")


def fetch_current_prices() -> dict[str, float]:
    """Fetch the current PTT retail prices from EPPO's public API."""
    try:
        payload = json.loads(fetch_page(EPPO_OIL_API_URL))
        ptt_prices = payload["data"]["ptt"]
    except (json.JSONDecodeError, KeyError, TypeError) as exc:
        raise ValueError("EPPO API returned an unexpected response") from exc

    if payload.get("status") != "success":
        raise ValueError(f"EPPO API returned status: {payload.get('status')!r}")

    prices: dict[str, float] = {}
    for api_key, json_key in API_FUEL_MAP.items():
        try:
            value = float(ptt_prices[api_key])
        except (KeyError, TypeError, ValueError):
            continue
        if value > 5:
            prices[json_key] = round(value, 2)

    missing = set(API_FUEL_MAP.values()) - set(prices)
    if missing:
        raise ValueError(f"EPPO API did not provide prices for: {sorted(missing)}")

    return prices


def load_data() -> list[dict]:
    if DATA_FILE.exists():
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_data(data: list[dict]) -> None:
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")


def main():
    today = datetime.now(TH_TZ).strftime("%Y-%m-%d")
    print(f"Fetching EPPO fuel price for {today}...")

    # Load existing data
    data = load_data()

    # Check if today already exists
    existing_dates = {entry["date"] for entry in data}
    if today in existing_dates:
        print(f"Price for {today} already exists, skipping.")
        return

    print("Fetching current prices from EPPO API...")
    try:
        prices = fetch_current_prices()
    except (OSError, ValueError) as exc:
        print(f"ERROR: Could not fetch prices from EPPO API: {exc}", file=sys.stderr)
        sys.exit(1)

    print(f"Extracted prices: {prices}")

    # Append to data
    entry = {"date": today, "prices": prices}
    data.append(entry)
    data.sort(key=lambda e: e["date"])

    save_data(data)
    print(f"Saved price for {today} to {DATA_FILE}")


if __name__ == "__main__":
    main()
