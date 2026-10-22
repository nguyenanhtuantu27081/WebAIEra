Start-Process python -ArgumentList '-m', 'http.server', '8083' -WorkingDirectory 'g:\My Drive\WebAIEra\ai-era-site' -WindowStyle Hidden
Write-Host "Server started on port 8083"
Write-Host "Open http://localhost:8083/ in your browser"