#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================"
echo "  LCKR - Portable Encrypted Locker"
echo "============================================"
echo ""

open_browser() {
    sleep 1
    if command -v open &>/dev/null; then
        # macOS
        open "http://localhost:8080"
    elif command -v xdg-open &>/dev/null; then
        # Linux
        xdg-open "http://localhost:8080"
    else
        echo "Open http://localhost:8080 in Chrome, Edge, or Brave."
    fi
}

if command -v python3 &>/dev/null; then
    echo "Starting LCKR at http://localhost:8080 ..."
    open_browser &
    python3 -m http.server 8080 --directory dist
elif command -v python &>/dev/null; then
    echo "Starting LCKR at http://localhost:8080 ..."
    open_browser &
    python -m http.server 8080 --directory dist
else
    echo "Python was not found on this machine."
    echo ""
    echo "To run LCKR offline, install Python (free):"
    echo "  https://python.org/downloads"
    echo ""
    echo "Or visit https://lckr.tech directly in Chrome, Edge, or Brave."
fi
