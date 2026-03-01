#!/bin/bash
# GymTrack — start both frontend and backend
set -e

echo "Starting GymTrack..."

# Start frontend dev server
cd "$(dirname "$0")/frontend"
npm run dev &
FRONTEND_PID=$!

echo "Frontend running at http://localhost:5173"
echo "Press Ctrl+C to stop."

trap "kill $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" INT TERM

wait $FRONTEND_PID
