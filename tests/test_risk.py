"""Tests for risk management and database modules."""
import os
import tempfile
from unittest.mock import patch

import pytest


class TestDatabase:
    """Test SQLite database operations."""

    def setup_method(self):
        """Use a temp database for each test."""
        self.tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        self.tmp.close()
        # Patch DB_PATH to use temp file
        import src.storage.db as db_mod
        self._orig_path = db_mod.DB_PATH
        db_mod.DB_PATH = self.tmp.name

    def teardown_method(self):
        import src.storage.db as db_mod
        db_mod.DB_PATH = self._orig_path
        os.unlink(self.tmp.name)

    def test_init_db(self):
        from src.storage.db import init_db
        init_db()  # Should not raise

    def test_save_and_get_scout_hit(self):
        from src.storage.db import init_db, save_scout_hit, get_active_scouts

        init_db()
        scout_id = save_scout_hit({
            "date": "2025-03-15",
            "game_id": "12345",
            "home_team": "BOS",
            "away_team": "CHA",
            "picked_team": "BOS",
            "model_probability": 0.76,
            "kalshi_price_at_scout": 0.67,
            "sportsbook_probability": 0.72,
            "edge": 0.09,
            "injury_notes": "LaMelo OUT",
            "b2b_notes": "BOS rested",
            "form_notes": "BOS 8-2 L10",
            "recommended_contracts": 44,
            "recommended_price": 0.67,
        })
        assert scout_id > 0

        scouts = get_active_scouts("2025-03-15")
        assert len(scouts) == 1
        assert scouts[0]["home_team"] == "BOS"
        assert scouts[0]["edge"] == 0.09

    def test_save_trade(self):
        from src.storage.db import init_db, save_scout_hit, save_trade

        init_db()
        scout_id = save_scout_hit({
            "date": "2025-03-15",
            "game_id": "12345",
            "home_team": "BOS",
            "away_team": "CHA",
            "picked_team": "BOS",
            "model_probability": 0.76,
            "kalshi_price_at_scout": 0.67,
            "sportsbook_probability": 0.72,
            "edge": 0.09,
        })

        trade_id = save_trade({
            "scout_hit_id": scout_id,
            "trade_type": "entry",
            "side": "yes",
            "contracts": 44,
            "price": 0.67,
            "total_cost": 29.48,
            "kalshi_ticker": "KXNBA-BOS-CHA",
            "is_simulated": True,
        })
        assert trade_id > 0

    def test_update_scout_status(self):
        from src.storage.db import init_db, save_scout_hit, update_scout_status, get_active_scouts

        init_db()
        scout_id = save_scout_hit({
            "date": "2025-03-15",
            "game_id": "12345",
            "home_team": "BOS",
            "away_team": "CHA",
            "picked_team": "BOS",
            "model_probability": 0.76,
            "kalshi_price_at_scout": 0.67,
            "sportsbook_probability": 0.72,
            "edge": 0.09,
        })

        update_scout_status(scout_id, "resolved")
        scouts = get_active_scouts("2025-03-15")
        assert len(scouts) == 0  # resolved scouts excluded

    def test_save_daily_summary(self):
        from src.storage.db import init_db, save_daily_summary

        init_db()
        save_daily_summary({
            "date": "2025-03-15",
            "total_trades": 3,
            "wins": 2,
            "losses": 1,
            "gross_pnl": 15.50,
            "fees": 0.50,
            "net_pnl": 15.00,
            "bankroll_eod": 515.00,
        })
        # Upsert should work
        save_daily_summary({
            "date": "2025-03-15",
            "total_trades": 4,
            "wins": 3,
            "losses": 1,
            "gross_pnl": 25.00,
            "fees": 0.75,
            "net_pnl": 24.25,
            "bankroll_eod": 524.25,
        })

    def test_get_today_pnl_empty(self):
        from src.storage.db import init_db, get_today_pnl

        init_db()
        pnl = get_today_pnl("2025-03-15")
        assert pnl == 0.0


class TestConfig:
    def test_load_config(self):
        from src.config import load_config
        config = load_config()
        assert config["risk"]["starting_bankroll"] == 500
        assert config["risk"]["min_edge_threshold"] == 0.08
        assert config["risk"]["kelly_fraction"] == 0.25
        assert config["scout"]["star_player_usage_threshold"] == 25.0
        assert config["auto_trade"]["enabled"] is False
        assert "env" in config

    def test_env_vars_loaded(self):
        from src.config import load_config
        config = load_config()
        # Should have loaded from .env
        assert config["env"]["kalshi_env"] == "demo"


class TestRiskStructure:
    def test_bankroll_imports(self):
        from src.risk import bankroll
        assert callable(bankroll.kelly_size)
        assert callable(bankroll.contracts_from_dollars)

    def test_kill_switch_imports(self):
        from src.risk import kill_switch
        assert callable(kill_switch.check_kill_switch)
