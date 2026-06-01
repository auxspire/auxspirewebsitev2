#!/usr/bin/env bash
# Reload Nginx Proxy Manager so renewed Let's Encrypt certs are served (not stale in memory).
# Run on VPS after cert renewal or when browsers report SEC_E_CERT_EXPIRED despite valid files on disk.
set -e
VPS="${VPS:-root@72.61.227.53}"
CONTAINER="${NPM_CONTAINER:-nginx-proxy-manager}"

echo "==> Reloading SSL in ${CONTAINER} on ${VPS}..."
ssh "$VPS" "docker exec ${CONTAINER} nginx -t && docker exec ${CONTAINER} nginx -s reload" \
  || ssh "$VPS" "docker restart ${CONTAINER}"

echo "==> Checking auxspire.com certificate..."
ssh "$VPS" "docker exec ${CONTAINER} openssl s_client -connect 127.0.0.1:443 -servername auxspire.com </dev/null 2>/dev/null | openssl x509 -noout -subject -dates"

echo "Done."
