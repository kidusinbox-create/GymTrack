"""
Kalshi NBA Scout -> Confirm -> Scale Agent

Usage:
    python -m src.main              # Run full agent (scout + confirm loop)
    python -m src.main --scout-only # Run scout once and exit
    python -m src.main --test-alert # Send a test Telegram alert
"""
import argparse
import logging

from src.alerts.telegram_bot import send_alert
from src.config import load_config
from src.storage.db import init_db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(description="Kalshi NBA Scout Agent")
    parser.add_argument("--scout-only", action="store_true", help="Run scout once and exit")
    parser.add_argument("--test-alert", action="store_true", help="Send a test Telegram alert")
    args = parser.parse_args()

    config = load_config()
    init_db()

    if args.test_alert:
        result = send_alert("🏀 Test alert from Kalshi NBA Scout! Connection working.")
        if result:
            print("Test alert sent successfully!")
        else:
            print("Alert printed locally (Telegram credentials not configured).")
        return

    if args.scout_only:
        from src.strategy.scout import run_scout

        hits = run_scout(config)
        print(f"Found {len(hits)} scout hits")
        return

    # Full mode
    print("🏀 Kalshi NBA Scout is running...")
    print(f"   Bankroll: ${config['risk']['starting_bankroll']}")
    print(f"   Min edge: {config['risk']['min_edge_threshold']*100}%")
    print(f"   Auto-trade: {'ON' if config['auto_trade']['enabled'] else 'OFF (alerts only)'}")
    print("\n   Full orchestrator with scheduling — Session 3")
    print("   Run with --scout-only or --test-alert for now.")


if __name__ == "__main__":
    main()
