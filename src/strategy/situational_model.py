# Session 2 — Strategy implementation
# Placeholder for situational_model.py


def compute_edge(
    game: dict,
    injuries: list,
    standings: dict,
    recent_form: dict,
    sportsbook_prob: float,
    kalshi_price: float,
) -> tuple[float, float]:
    """Compute estimated edge over Kalshi price.
    Returns: (edge, estimated_probability)
    Full implementation in Session 2."""
    raise NotImplementedError("Session 2")


def is_star_player(player: dict, team_id: int, season_averages: list) -> bool:
    """A star player has usage_rate >= threshold or averages 20+ PPG."""
    raise NotImplementedError("Session 2")


def is_back_to_back(team_id: int, todays_date: str, recent_games: list) -> bool:
    """Check if team played yesterday (back-to-back)."""
    raise NotImplementedError("Session 2")


def get_l10_record(recent_games: list) -> tuple[int, int]:
    """From last 10 games, return (wins, losses)."""
    raise NotImplementedError("Session 2")
