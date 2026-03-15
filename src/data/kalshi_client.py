import logging
import os
from datetime import datetime, timezone

import kalshi_python

from src.config import load_config

logger = logging.getLogger(__name__)

DEMO_HOST = "https://demo-api.elections.kalshi.com/trade-api/v2"
PROD_HOST = "https://api.elections.kalshi.com/trade-api/v2"

_client_cache: dict = {}


def get_kalshi_client() -> kalshi_python.ApiClient:
    """Create authenticated Kalshi client using env vars.
    Uses RSA key-based authentication.
    Set base_url based on KALSHI_ENV (demo vs prod)."""
    if "client" in _client_cache:
        return _client_cache["client"]

    config = kalshi_python.Configuration()
    env = os.getenv("KALSHI_ENV", "demo")
    config.host = DEMO_HOST if env == "demo" else PROD_HOST

    key_id = os.getenv("KALSHI_API_KEY_ID")
    key_path = os.getenv("KALSHI_PRIVATE_KEY_PATH", "./kalshi_private_key.pem")

    if not key_id or key_id == "PLACEHOLDER":
        logger.warning("KALSHI_API_KEY_ID not set — client will be unauthenticated")
        client = kalshi_python.ApiClient(configuration=config)
        _client_cache["client"] = client
        return client

    # Read RSA private key
    with open(key_path, "r") as f:
        private_key = f.read()

    config.api_key["key_id"] = key_id
    config.api_key["private_key"] = private_key

    client = kalshi_python.ApiClient(configuration=config)
    _client_cache["client"] = client
    return client


def get_nba_markets(date: str = None) -> list[dict]:
    """Fetch NBA game markets for today.
    NBA market tickers follow pattern like KXNBA-* or similar.
    Filter by series_ticker containing NBA.
    Return: ticker, team, yes_price, no_price, volume, close_time."""
    client = get_kalshi_client()
    markets_api = kalshi_python.MarketsApi(client)

    if date is None:
        date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    results = []
    cursor = None

    while True:
        resp = markets_api.get_markets(
            series_ticker="KXNBA",
            limit=100,
            cursor=cursor,
            status="open",
        )

        for market in resp.markets or []:
            results.append({
                "ticker": market.ticker,
                "title": getattr(market, "title", ""),
                "subtitle": getattr(market, "subtitle", ""),
                "yes_price": getattr(market, "yes_bid", None),
                "no_price": getattr(market, "no_bid", None),
                "yes_ask": getattr(market, "yes_ask", None),
                "no_ask": getattr(market, "no_ask", None),
                "volume": getattr(market, "volume", 0),
                "close_time": getattr(market, "close_time", ""),
                "event_ticker": getattr(market, "event_ticker", ""),
            })

        cursor = getattr(resp, "cursor", None)
        if not cursor:
            break

    logger.info("Found %d NBA markets", len(results))
    return results


def get_market_price(ticker: str) -> dict:
    """Get current yes/no price and orderbook for a specific market."""
    client = get_kalshi_client()
    markets_api = kalshi_python.MarketsApi(client)

    market_resp = markets_api.get_market(ticker=ticker)
    market = market_resp.market

    orderbook_resp = markets_api.get_market_orderbook(ticker=ticker)
    book = orderbook_resp.orderbook

    return {
        "ticker": ticker,
        "yes_price": getattr(market, "yes_bid", None),
        "no_price": getattr(market, "no_bid", None),
        "yes_ask": getattr(market, "yes_ask", None),
        "no_ask": getattr(market, "no_ask", None),
        "volume": getattr(market, "volume", 0),
        "orderbook": {
            "yes": getattr(book, "yes", []) if book else [],
            "no": getattr(book, "no", []) if book else [],
        },
    }


def place_order(
    ticker: str,
    side: str,
    price: int,
    count: int,
    dry_run: bool = True,
) -> dict:
    """Place a limit order.

    side: 'yes' or 'no'
    price: in cents (e.g., 68 = $0.68)
    count: number of contracts
    If dry_run=True or config.auto_trade.enabled=False, just log without placing.
    """
    cfg = load_config()
    auto_trade = cfg.get("auto_trade", {}).get("enabled", False)

    order_info = {
        "ticker": ticker,
        "side": side,
        "price_cents": price,
        "count": count,
        "total_cost": round(price * count / 100, 2),
        "dry_run": dry_run or not auto_trade,
    }

    if dry_run or not auto_trade:
        logger.info("DRY RUN order: %s", order_info)
        order_info["status"] = "simulated"
        return order_info

    client = get_kalshi_client()
    portfolio_api = kalshi_python.PortfolioApi(client)

    order_req = kalshi_python.CreateOrderRequest(
        ticker=ticker,
        side=side,
        action="buy",
        count=count,
        type="limit",
        yes_price=price if side == "yes" else None,
        no_price=price if side == "no" else None,
    )

    resp = portfolio_api.create_order(create_order_request=order_req)
    order_info["status"] = "placed"
    order_info["order_id"] = getattr(resp.order, "order_id", None)
    logger.info("LIVE order placed: %s", order_info)
    return order_info


def get_positions() -> list[dict]:
    """Get current open positions."""
    client = get_kalshi_client()
    portfolio_api = kalshi_python.PortfolioApi(client)

    resp = portfolio_api.get_positions()
    positions = []
    for pos in resp.market_positions or []:
        positions.append({
            "ticker": getattr(pos, "ticker", ""),
            "yes_count": getattr(pos, "position", 0),
            "market_exposure": getattr(pos, "market_exposure", 0),
            "total_traded": getattr(pos, "total_traded", 0),
        })
    return positions


def get_balance() -> float:
    """Get account balance in dollars."""
    client = get_kalshi_client()
    portfolio_api = kalshi_python.PortfolioApi(client)

    resp = portfolio_api.get_balance()
    # Balance is returned in cents
    balance_cents = getattr(resp, "balance", 0)
    return balance_cents / 100.0
