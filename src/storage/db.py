import sqlite3
from datetime import date, datetime
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent.parent / "kalshi_nba.db"


def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    """Create tables if not exist."""
    conn = _get_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS scout_hits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            game_id TEXT NOT NULL,
            home_team TEXT NOT NULL,
            away_team TEXT NOT NULL,
            picked_team TEXT NOT NULL,
            model_probability REAL NOT NULL,
            kalshi_price_at_scout REAL NOT NULL,
            sportsbook_probability REAL NOT NULL,
            edge REAL NOT NULL,
            injury_notes TEXT,
            b2b_notes TEXT,
            form_notes TEXT,
            recommended_contracts INTEGER,
            recommended_price REAL,
            status TEXT DEFAULT 'scouted',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS trades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scout_hit_id INTEGER REFERENCES scout_hits(id),
            trade_type TEXT NOT NULL,
            side TEXT NOT NULL,
            contracts INTEGER NOT NULL,
            price REAL NOT NULL,
            total_cost REAL NOT NULL,
            kalshi_ticker TEXT,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_simulated BOOLEAN DEFAULT TRUE
        );

        CREATE TABLE IF NOT EXISTS daily_summary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL UNIQUE,
            total_trades INTEGER DEFAULT 0,
            wins INTEGER DEFAULT 0,
            losses INTEGER DEFAULT 0,
            gross_pnl REAL DEFAULT 0.0,
            fees REAL DEFAULT 0.0,
            net_pnl REAL DEFAULT 0.0,
            bankroll_eod REAL,
            notes TEXT
        );
    """)
    conn.commit()
    conn.close()


def save_scout_hit(data: dict) -> int:
    """Insert a scout hit. Returns the new row id."""
    conn = _get_conn()
    cursor = conn.execute(
        """INSERT INTO scout_hits
           (date, game_id, home_team, away_team, picked_team,
            model_probability, kalshi_price_at_scout, sportsbook_probability,
            edge, injury_notes, b2b_notes, form_notes,
            recommended_contracts, recommended_price, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            data["date"],
            data["game_id"],
            data["home_team"],
            data["away_team"],
            data["picked_team"],
            data["model_probability"],
            data["kalshi_price_at_scout"],
            data["sportsbook_probability"],
            data["edge"],
            data.get("injury_notes"),
            data.get("b2b_notes"),
            data.get("form_notes"),
            data.get("recommended_contracts"),
            data.get("recommended_price"),
            data.get("status", "scouted"),
        ),
    )
    row_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return row_id


def save_trade(data: dict) -> int:
    """Insert a trade record. Returns the new row id."""
    conn = _get_conn()
    cursor = conn.execute(
        """INSERT INTO trades
           (scout_hit_id, trade_type, side, contracts, price,
            total_cost, kalshi_ticker, is_simulated)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            data.get("scout_hit_id"),
            data["trade_type"],
            data["side"],
            data["contracts"],
            data["price"],
            data["total_cost"],
            data.get("kalshi_ticker"),
            data.get("is_simulated", True),
        ),
    )
    row_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return row_id


def get_active_scouts(date_str: str = None) -> list[dict]:
    """Get today's scouted games that haven't resolved."""
    if date_str is None:
        date_str = date.today().isoformat()
    conn = _get_conn()
    rows = conn.execute(
        """SELECT * FROM scout_hits
           WHERE date = ? AND status NOT IN ('resolved', 'exited')
           ORDER BY created_at""",
        (date_str,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_today_pnl(date_str: str = None) -> float:
    """Sum realized + unrealized P&L for today."""
    if date_str is None:
        date_str = date.today().isoformat()
    conn = _get_conn()

    # Realized: trades that have resolved
    row = conn.execute(
        """SELECT COALESCE(SUM(
               CASE WHEN trade_type = 'exit' THEN
                   (contracts * price) - total_cost
               ELSE 0 END
           ), 0.0) as realized
           FROM trades t
           JOIN scout_hits s ON t.scout_hit_id = s.id
           WHERE s.date = ?""",
        (date_str,),
    ).fetchone()
    realized = row["realized"] if row else 0.0

    # Unrealized: sum of entry costs for open positions (negative until resolved)
    row2 = conn.execute(
        """SELECT COALESCE(SUM(
               CASE WHEN trade_type IN ('entry', 'scale_up') THEN -total_cost
               ELSE 0 END
           ), 0.0) as unrealized
           FROM trades t
           JOIN scout_hits s ON t.scout_hit_id = s.id
           WHERE s.date = ? AND s.status NOT IN ('resolved', 'exited')""",
        (date_str,),
    ).fetchone()
    unrealized = row2["unrealized"] if row2 else 0.0

    conn.close()
    return realized + unrealized


def update_scout_status(scout_id: int, status: str):
    """Update status of a scout hit."""
    conn = _get_conn()
    conn.execute(
        "UPDATE scout_hits SET status = ? WHERE id = ?",
        (status, scout_id),
    )
    conn.commit()
    conn.close()


def save_daily_summary(data: dict):
    """Insert or update daily summary."""
    conn = _get_conn()
    conn.execute(
        """INSERT INTO daily_summary
           (date, total_trades, wins, losses, gross_pnl, fees, net_pnl, bankroll_eod, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(date) DO UPDATE SET
               total_trades = excluded.total_trades,
               wins = excluded.wins,
               losses = excluded.losses,
               gross_pnl = excluded.gross_pnl,
               fees = excluded.fees,
               net_pnl = excluded.net_pnl,
               bankroll_eod = excluded.bankroll_eod,
               notes = excluded.notes""",
        (
            data["date"],
            data.get("total_trades", 0),
            data.get("wins", 0),
            data.get("losses", 0),
            data.get("gross_pnl", 0.0),
            data.get("fees", 0.0),
            data.get("net_pnl", 0.0),
            data.get("bankroll_eod"),
            data.get("notes"),
        ),
    )
    conn.commit()
    conn.close()
