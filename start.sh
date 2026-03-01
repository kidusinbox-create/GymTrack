#!/bin/bash
# GymTrack — start backend (FastAPI) + frontend (Vite)
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "=========================================="
echo "  GymTrack"
echo "=========================================="

# ── Backend ──────────────────────────────────
BACKEND="$ROOT/backend"

# Create a virtual environment if it doesn't exist
if [ ! -d "$BACKEND/.venv" ]; then
  echo "[backend] Creating virtual environment..."
  python3 -m venv "$BACKEND/.venv"
fi

# Install / upgrade dependencies quietly
echo "[backend] Installing dependencies..."
"$BACKEND/.venv/bin/pip" install -q -r "$BACKEND/requirements.txt"

echo "[backend] Starting FastAPI on http://localhost:8000"
cd "$BACKEND"
"$BACKEND/.venv/bin/uvicorn" main:app --port 8000 --reload --log-level warning &
BACKEND_PID=$!

# Give FastAPI a moment to initialise
sleep 1

# ── Frontend ─────────────────────────────────
echo "[frontend] Starting Vite on http://localhost:5173"
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "  App   → http://localhost:5173"
echo "  API   → http://localhost:8000"
echo "  Docs  → http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" INT TERM

wait $FRONTEND_PID $BACKEND_PID
