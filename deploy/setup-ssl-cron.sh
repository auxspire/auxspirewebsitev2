#!/usr/bin/env bash
# Install daily NPM SSL reload on VPS (Let's Encrypt renews in NPM; nginx must reload to serve new certs).
set -e
VPS="${VPS:-root@72.61.227.53}"
CRON_LINE='15 4 * * * docker exec nginx-proxy-manager nginx -s reload 2>/dev/null || docker restart nginx-proxy-manager'

echo "==> Installing SSL reload cron on ${VPS}..."
ssh "$VPS" "(crontab -l 2>/dev/null | grep -v 'nginx-proxy-manager nginx -s reload'; echo '${CRON_LINE}') | crontab -"
ssh "$VPS" "crontab -l | grep nginx-proxy-manager || true"
echo "Done."
