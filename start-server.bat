@echo off
echo Starting local preview server for Auxspire website...
echo.
echo Server will be available at: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
python -m http.server 8000
if errorlevel 1 (
    echo.
    echo Python not found. Trying Node.js alternative...
    echo.
    if exist server.js (
        node server.js
    ) else (
        echo Neither Python nor Node.js server found.
        echo Please install Python 3 or Node.js to run the preview server.
        pause
    )
)
