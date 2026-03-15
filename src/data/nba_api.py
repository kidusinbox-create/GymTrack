import logging
import os
from datetime import date, datetime

import requests

logger = logging.getLogger(__name__)

BASE_URL = "https://api.balldontlie.io/v1"


def _headers() -> dict:
    api_key = os.getenv("BALLDONTLIE_API_KEY", "")
    return {"Authorization": api_key}


def _get(endpoint: str, params: dict = None) -> dict:
    """Make an authenticated GET request to BallDontLie API."""
    url = f"{BASE_URL}{endpoint}"
    resp = requests.get(url, headers=_headers(), params=params, timeout=15)
    resp.raise_for_status()
    return resp.json()


def get_todays_games() -> list[dict]:
    """GET /games?dates[]=YYYY-MM-DD for today.
    Returns list of games with teams, time, status."""
    today = date.today().isoformat()
    data = _get("/games", params={"dates[]": today})
    return data.get("data", [])


def get_game_live(game_id: int) -> dict:
    """GET /games/{id}. Returns live score, quarter scores,
    period, time remaining, status."""
    data = _get(f"/games/{game_id}")
    return data.get("data", data)


def get_injuries() -> list[dict]:
    """GET /injuries. Returns player injuries with status
    (Out/Doubtful/Questionable/Probable), team, reason."""
    data = _get("/injuries")
    return data.get("data", [])


def get_team_standings() -> list[dict]:
    """GET /standings. Returns W-L records, conference rank, last 10 record."""
    data = _get("/standings")
    return data.get("data", [])


def get_player_season_averages(
    player_ids: list[int], season: int = None
) -> list[dict]:
    """GET /season_averages?season={season}&player_ids[]={id}.
    Returns pts, reb, ast, usage rate etc."""
    if season is None:
        # Current NBA season: if month >= October, use current year; else previous year
        now = datetime.now()
        season = now.year if now.month >= 10 else now.year - 1

    params = {"season": season}
    for pid in player_ids:
        params.setdefault("player_ids[]", [])
        if isinstance(params["player_ids[]"], list):
            params["player_ids[]"] = pid
            # For multiple IDs, make separate calls
            break

    # BallDontLie expects repeated params for multiple IDs
    # Use requests' list param support
    all_averages = []
    for pid in player_ids:
        data = _get("/season_averages", params={"season": season, "player_ids[]": pid})
        all_averages.extend(data.get("data", []))

    return all_averages


def get_team_recent_games(team_id: int, n: int = 10) -> list[dict]:
    """GET /games?team_ids[]={id}&per_page={n}.
    Returns last N games for form calculation."""
    # Get recent completed games
    data = _get(
        "/games",
        params={
            "team_ids[]": team_id,
            "per_page": n,
            "postseason": False,
        },
    )
    games = data.get("data", [])
    # Sort by date descending
    games.sort(key=lambda g: g.get("date", ""), reverse=True)
    return games[:n]


def get_game_odds(game_ids: list[int]) -> list[dict]:
    """GET /odds?game_ids[]={id}.
    Returns sportsbook odds for games."""
    all_odds = []
    for gid in game_ids:
        try:
            data = _get("/odds", params={"game_ids[]": gid})
            all_odds.extend(data.get("data", []))
        except requests.HTTPError as e:
            logger.warning("Failed to get odds for game %d: %s", gid, e)
    return all_odds
