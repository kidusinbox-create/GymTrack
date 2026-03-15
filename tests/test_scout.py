"""Tests for scout module (Session 2 placeholder) and data layer."""
import os
from unittest.mock import patch, MagicMock

from src.data.odds_api import american_to_implied_prob


class TestOddsConversion:
    def test_heavy_favorite(self):
        # -200 means bet $200 to win $100
        prob = american_to_implied_prob(-200)
        assert abs(prob - 0.6667) < 0.001

    def test_slight_favorite(self):
        prob = american_to_implied_prob(-110)
        assert abs(prob - 0.5238) < 0.001

    def test_underdog(self):
        prob = american_to_implied_prob(150)
        assert abs(prob - 0.4) < 0.001

    def test_big_underdog(self):
        prob = american_to_implied_prob(300)
        assert abs(prob - 0.25) < 0.001

    def test_even_money(self):
        prob = american_to_implied_prob(100)
        assert abs(prob - 0.5) < 0.001


class TestNbaApiStructure:
    """Verify module imports and function signatures exist."""

    def test_imports(self):
        from src.data import nba_api
        assert callable(nba_api.get_todays_games)
        assert callable(nba_api.get_game_live)
        assert callable(nba_api.get_injuries)
        assert callable(nba_api.get_team_standings)
        assert callable(nba_api.get_player_season_averages)
        assert callable(nba_api.get_team_recent_games)
        assert callable(nba_api.get_game_odds)

    def test_odds_api_imports(self):
        from src.data import odds_api
        assert callable(odds_api.get_nba_odds)
        assert callable(odds_api.american_to_implied_prob)

    def test_kalshi_client_imports(self):
        from src.data import kalshi_client
        assert callable(kalshi_client.get_kalshi_client)
        assert callable(kalshi_client.get_nba_markets)
        assert callable(kalshi_client.get_market_price)
        assert callable(kalshi_client.place_order)
        assert callable(kalshi_client.get_positions)
        assert callable(kalshi_client.get_balance)


class TestTelegramBot:
    """Test Telegram bot functions."""

    def test_imports(self):
        from src.alerts import telegram_bot
        assert callable(telegram_bot.send_alert)
        assert callable(telegram_bot.send_scout_alert)
        assert callable(telegram_bot.send_scale_alert)
        assert callable(telegram_bot.send_exit_alert)
        assert callable(telegram_bot.send_kill_switch_alert)

    def test_send_alert_no_credentials(self):
        """Without credentials, send_alert prints locally and returns False."""
        from src.alerts.telegram_bot import send_alert

        with patch.dict(os.environ, {"TELEGRAM_BOT_TOKEN": "PLACEHOLDER", "TELEGRAM_CHAT_ID": "PLACEHOLDER"}):
            result = send_alert("test message")
            assert result is False
