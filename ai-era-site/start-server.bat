@echo off
cd /d "%~dp0"
start /b python -m http.server 8083
echo Server started on port 8083
echo Open http://localhost:8083/ in your browser
pause