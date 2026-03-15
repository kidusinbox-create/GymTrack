import logging
import os

import requests

logger = logging.getLogger(__name__)

BASE_URL = "https://api.the-odds-api.com/v4"


def get_nba_odds() -> list[dict]:
    """GET /sports/basketball_nba/odds/
    Returns moneyline odds from US sportsbooks.
    Converts American odds to implied probability."""
    api_key = os.getenv("ODDS_API_KEY", "")
    url = f"{BASE_URL}/sports/basketball_nba/odds/"
    params = {
        "apiKey": api_key,
        "regions": "us",
        "markets": "h2h",
        "oddsFormat": "american",
    }

    resp = requests.get(url, params=params, timeout=15)
    resp.raise_for_status()
    data = resp.json()

    results = []
    for game in data:
        game_info = {
            "id": game.get("id"),
            "home_team": game.get("home_team"),
            "away_team": game.get("away_team"),
            "commence_time": game.get("commence_time"),
            "bookmakers": [],
        }

        for bookmaker in game.get("bookmakers", []):
            for market in bookmaker.get("markets", []):
                if market.get("key") != "h2h":
                    continue
                outcomes = {}
                for outcome in market.get("outcomes", []):
                    team = outcome["name"]
                    odds = outcome["price"]
                    outcomes[team] = {
                        "american_odds": odds,
                        "implied_prob": american_to_implied_prob(odds),
                    }
                game_info["bookmakers"].append({
                    "name": bookmaker.get("key"),
                    "outcomes": outcomes,
                })

        # Compute consensus probability (average across bookmakers)
        home_probs = []
        away_probs = []
        for bm in game_info["bookmakers"]:
            for team, data in bm["outcomes"].items():
                if team == game_info["home_team"]:
                    home_probs.append(data["implied_prob"])
                else:
                    away_probs.append(data["implied_prob"])

        game_info["consensus_home_prob"] = (
            sum(home_probs) / len(home_probs) if home_probs else 0.5
        )
        game_info["consensus_away_prob"] = (
            sum(away_probs) / len(away_probs) if away_probs else 0.5
        )

        results.append(game_info)

    logger.info("Fetched odds for %d NBA games", len(results))
    return results


def american_to_implied_prob(odds: int) -> float:
    """Convert American odds to implied probability.
    Negative (favorite): prob = abs(odds) / (abs(odds) + 100)
    Positive (underdog): prob = 100 / (odds + 100)"""
    if odds < 0:
        return abs(odds) / (abs(odds) + 100)
    else:
        return 100 / (odds + 100)
