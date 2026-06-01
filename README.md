# Auxspire Website

Marketing/company site for auxspire.com. Static HTML + Node.js file server. Independent repo; deploy and preview without touching the Client Portal.

## Local dev / preview

```bash
npm run dev
# or: node server.js
```

Preview at **http://localhost:8000** (default). For port 3000: `PORT=3000 node server.js`.

## Deploy to VPS

From repo root (requires SSH key for `root@72.61.227.53` or `vps`):

**Windows:**
```cmd
deploy\deploy.cmd
```

**Linux/macOS:**
```bash
./deploy/deploy.sh
```

This syncs the repo to the VPS at `/var/www/auxspire` and restarts PM2 `auxspire-website` on port 3000.

**Production HTTPS:** `auxspire.com` is served over TLS by **Nginx Proxy Manager** (Docker), which proxies to the Coolify app on port 3002. Host nginx on port 80 is not used for the public site.

## SSL / HTTPS

If browsers show **certificate invalid** or `SEC_E_CERT_EXPIRED` but Let's Encrypt files on the server are current, NPM is serving a stale cert from memory. Fix:

```bash
./deploy/ssl-reload.sh
# or on VPS: docker restart nginx-proxy-manager
```

Install a daily reload cron (after NPM auto-renews certs):

```bash
./deploy/setup-ssl-cron.sh
```

## Nginx

A server block for this app is in `deploy/nginx.conf` (optional host nginx). Public TLS is managed in Nginx Proxy Manager. See auxspire-infra repo for initial server setup.

## Design system

The site uses a Stitch-inspired design system in `assets/css/`. All Stitch theme images are served from **`/stitch/`** (files live in `public/stitch/`). See `public/stitch/REQUIRED-ASSETS.md` for the list of required image filenames (logo.png, favicon.png, optional hero/CTA backgrounds).

- **design-system.css** – CSS variables, Desktop (Space Grotesk, #136dec) and Mobile (Inter, #0d7ff2) themes, breakpoint 768px
- **components.css** – Header, nav, mobile menu, footer, cards, forms, buttons, hero electric overlay

## Contact form

The contact page form (`contact/index.html`) uses [Web3Forms](https://web3forms.com) and submits to the email configured for access key `0c7b1332-0a6a-4e41-bbf4-4b48a9c74d99` with subject "Enquiry".
