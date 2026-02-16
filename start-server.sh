#!/bin/bash
echo "Starting local preview server for Auxspire website..."
echo ""
echo "Server will be available at: http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""

# Try Python 3 first
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m http.server 8000
# Fallback to Node.js
elif command -v node &> /dev/null && [ -f "server.js" ]; then
    node server.js
else
    echo "Neither Python nor Node.js server found."
    echo "Please install Python 3 or Node.js to run the preview server."
    exit 1
fi
