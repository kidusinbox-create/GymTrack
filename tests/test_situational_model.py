"""Tests for situational model — Session 2 implementation.
These tests verify the module structure exists; logic tests added in Session 2."""
import pytest


class TestSituationalModelStructure:
    def test_imports(self):
        from src.strategy import situational_model
        assert callable(situational_model.compute_edge)
        assert callable(situational_model.is_star_player)
        assert callable(situational_model.is_back_to_back)
        assert callable(situational_model.get_l10_record)

    def test_compute_edge_not_implemented(self):
        from src.strategy.situational_model import compute_edge
        with pytest.raises(NotImplementedError):
            compute_edge({}, [], {}, {}, 0.5, 0.5)

    def test_is_star_player_not_implemented(self):
        from src.strategy.situational_model import is_star_player
        with pytest.raises(NotImplementedError):
            is_star_player({}, 1, [])

    def test_is_back_to_back_not_implemented(self):
        from src.strategy.situational_model import is_back_to_back
        with pytest.raises(NotImplementedError):
            is_back_to_back(1, "2025-01-01", [])
