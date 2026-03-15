import logging
import os

import requests

logger = logging.getLogger(__name__)


def send_alert(message: str) -> bool:
    """Send a Telegram message using bot token and chat_id from env vars.
    POST https://api.telegram.org/bot{TOKEN}/sendMessage
    Use parse_mode=Markdown for formatting."""
    token = os.getenv("TELEGRAM_BOT_TOKEN", "")
    chat_id = os.getenv("TELEGRAM_CHAT_ID", "")

    if not token or token == "PLACEHOLDER" or not chat_id or chat_id == "PLACEHOLDER":
        logger.warning("Telegram credentials not configured — message not sent")
        print(f"[TELEGRAM PREVIEW] {message}")
        return False

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "Markdown",
    }

    try:
        resp = requests.post(url, json=payload, timeout=10)
        resp.raise_for_status()
        logger.info("Telegram alert sent successfully")
        return True
    except requests.RequestException as e:
        logger.error("Failed to send Telegram alert: %s", e)
        return False


def send_scout_alert(game_data: dict, edge: float, recommendation: dict) -> bool:
    """Format and send a scout hit alert."""
    home = game_data.get("home_team", "???")
    away = game_data.get("away_team", "???")
    game_time = game_data.get("game_time", "TBD")
    model_prob = game_data.get("model_probability", 0)
    kalshi_price = game_data.get("kalshi_price", 0)
    picked = game_data.get("picked_team", "???")
    injury_notes = game_data.get("injury_notes", "None")
    b2b_notes = game_data.get("b2b_notes", "None")
    form_notes = game_data.get("form_notes", "")

    contracts = recommendation.get("contracts", 0)
    price = recommendation.get("price", 0)
    total_cost = recommendation.get("total_cost", 0)
    profit = recommendation.get("profit_if_correct", 0)

    message = (
        f"🔍 *SCOUT HIT — NBA Tonight*\n\n"
        f"🏀 {away} @ {home} ({game_time})\n"
        f"📊 Model prob: {model_prob:.0%} | Kalshi: {kalshi_price:.0f}¢\n"
        f"📈 Edge: +{edge:.0%}\n"
        f"🏥 {injury_notes}\n"
        f"🏠 {b2b_notes}\n"
        f"📋 {form_notes}\n\n"
        f"💰 Buy {contracts} YES @ ${price:.2f} = ${total_cost:.2f}\n"
        f"   If correct: ${contracts:.2f} | Profit: ${profit:.2f}"
    )

    return send_alert(message)


def send_scale_alert(
    game_data: dict, current_price: float, recommendation: dict
) -> bool:
    """Format and send a scale-up alert with current score, price,
    recommended add-on."""
    home = game_data.get("home_team", "???")
    away = game_data.get("away_team", "???")
    score = game_data.get("score", "? - ?")
    period = game_data.get("period", "?")

    add_contracts = recommendation.get("recommended_contracts", 0)
    add_cost = recommendation.get("additional_cost", 0)
    total_position = recommendation.get("total_position", 0)
    total_invested = recommendation.get("total_invested", 0)
    profit = recommendation.get("profit_if_correct", 0)

    message = (
        f"📈 *SCALE UP — Confirmation Hit*\n\n"
        f"🏀 {away} @ {home}\n"
        f"📊 Score: {score} (Q{period})\n"
        f"💵 Kalshi price: {current_price:.0f}¢\n\n"
        f"➕ Add {add_contracts} contracts @ ${current_price/100:.2f} = ${add_cost:.2f}\n"
        f"📦 Total position: {total_position} contracts | ${total_invested:.2f} invested\n"
        f"💰 Profit if correct: ${profit:.2f}"
    )

    return send_alert(message)


def send_exit_alert(
    game_data: dict, current_price: float, loss_amount: float
) -> bool:
    """Format and send an exit/cut-loss alert."""
    home = game_data.get("home_team", "???")
    away = game_data.get("away_team", "???")
    score = game_data.get("score", "? - ?")

    message = (
        f"🚨 *EXIT SIGNAL — Cut Loss*\n\n"
        f"🏀 {away} @ {home}\n"
        f"📊 Score: {score}\n"
        f"💵 Kalshi price: {current_price:.0f}¢\n"
        f"📉 Loss: -${abs(loss_amount):.2f}\n\n"
        f"⚠️ Recommend selling position to limit loss."
    )

    return send_alert(message)


def send_kill_switch_alert() -> bool:
    """Alert that daily loss limit was hit and trading is paused."""
    message = (
        "🛑 *KILL SWITCH ACTIVATED*\n\n"
        "Daily loss limit reached. All trading paused until tomorrow.\n"
        "Review positions and P&L before resuming."
    )

    return send_alert(message)
