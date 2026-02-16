@echo off
REM Deploy Auxspire website to VPS. Run from repo root. Requires SSH key (vps or root@72.61.227.53).
setlocal
cd /d "%~dp0\.."
set VPS=root@72.61.227.53

echo ==> Creating /var/www/auxspire on VPS...
ssh %VPS% "mkdir -p /var/www/auxspire"
if errorlevel 1 exit /b 1

echo ==> Uploading Nginx config...
scp deploy\nginx.conf %VPS%:/etc/nginx/sites-available/auxspire-app.conf 2>nul
ssh %VPS% "ln -sf /etc/nginx/sites-available/auxspire-app.conf /etc/nginx/sites-enabled/ 2>/dev/null; nginx -t 2>/dev/null && systemctl reload nginx 2>/dev/null; true"

echo ==> Syncing website files...
scp -r "%CD%\*" %VPS%:/var/www/auxspire/
if errorlevel 1 exit /b 1

echo ==> Restarting PM2...
ssh %VPS% "cd /var/www/auxspire && PORT=3000 pm2 delete auxspire-website 2>/dev/null; PORT=3000 pm2 start server.js --name auxspire-website; pm2 save"

echo.
echo Done. Try http://auxspire.com or http://72.61.227.53:3000
endlocal
pause
