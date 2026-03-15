import os
from pathlib import Path

import yaml
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent


def load_config(config_path: str = None) -> dict:
    """Load config.yaml and merge with environment variables from .env."""
    load_dotenv(PROJECT_ROOT / ".env")

    if config_path is None:
        config_path = PROJECT_ROOT / "config.yaml"

    with open(config_path, "r") as f:
        config = yaml.safe_load(f)

    config["env"] = {
        "kalshi_api_key_id": os.getenv("KALSHI_API_KEY_ID"),
        "kalshi_private_key_path": os.getenv("KALSHI_PRIVATE_KEY_PATH", "./kalshi_private_key.pem"),
        "kalshi_env": os.getenv("KALSHI_ENV", "demo"),
        "balldontlie_api_key": os.getenv("BALLDONTLIE_API_KEY"),
        "odds_api_key": os.getenv("ODDS_API_KEY"),
        "telegram_bot_token": os.getenv("TELEGRAM_BOT_TOKEN"),
        "telegram_chat_id": os.getenv("TELEGRAM_CHAT_ID"),
    }

    return config
