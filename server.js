const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;
const MIME_TYPES = {
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.xml': 'application/xml',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Parse URL - strip query string so ?ver=6.7.0 etc. don't break file lookup
    const pathname = req.url.split('?')[0];
    const root = '.';

    // Stories → Blog (Content Feed)
    if (pathname === '/stories' || pathname === '/stories/') {
        res.writeHead(301, { Location: '/blog/' });
        res.end();
        return;
    }

    // /blog/:slug → article shell (SPA-style for Content Feed)
    const blogArticleMatch = pathname.match(/^\/blog\/([^/]+)\/?$/);
    if (blogArticleMatch && blogArticleMatch[1] !== 'article.html') {
        const slug = blogArticleMatch[1];
        // Don't treat real files under /blog/ as articles
        const maybeFile = path.join(root, 'blog', slug);
        if (!fs.existsSync(maybeFile) && !fs.existsSync(maybeFile + '.html')) {
            const article = path.join(root, 'blog', 'article.html');
            if (fs.existsSync(article)) {
                fs.readFile(article, (error, content) => {
                    if (error) {
                        res.writeHead(500);
                        res.end(`Server Error: ${error.code}`, 'utf-8');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf-8');
                    }
                });
                return;
            }
        }
    }

    function resolvePath(requestPath) {
        // Stitch assets: /stitch/* -> public/stitch/*
        if (requestPath.startsWith('/stitch/')) {
            const stitchPath = path.join(root, 'public', 'stitch', requestPath.slice(8));
            if (fs.existsSync(stitchPath)) return stitchPath;
        }

        // Images: /images/* -> public/images/*
        if (requestPath.startsWith('/images/')) {
            const imagesPath = path.join(root, 'public', requestPath.slice(1));
            if (fs.existsSync(imagesPath)) return imagesPath;
        }

        // Root-level SEO / AI-search files
        if (requestPath === '/robots.txt' || requestPath === '/sitemap.xml' || requestPath === '/llms.txt') {
            const seoPath = path.join(root, requestPath.slice(1));
            if (fs.existsSync(seoPath)) return seoPath;
        }

        // Default: serve homepage (prefer new Stitch index.html)
        if (requestPath === '/' || requestPath === '') {
            const html = path.join(root, 'index.html');
            const htm = path.join(root, 'index.htm');
            const alt = path.join(root, 'index-1.htm');
            if (fs.existsSync(html)) return html;
            if (fs.existsSync(htm)) return htm;
            if (fs.existsSync(alt)) return alt;
            return html;
        }

        // Directory: try index.html, index.htm, then index-1.htm
        if (requestPath.endsWith('/')) {
            const dir = path.join(root, requestPath);
            const html = path.join(dir, 'index.html');
            const htm = path.join(dir, 'index.htm');
            const alt = path.join(dir, 'index-1.htm');
            if (fs.existsSync(html)) return html;
            if (fs.existsSync(htm)) return htm;
            if (fs.existsSync(alt)) return alt;
            return html;
        }

        // Exact file (strip leading slash so path.join does not produce absolute path)
        const relativePath = requestPath.replace(/^\/+/, '');
        const direct = path.join(root, relativePath);
        if (fs.existsSync(direct)) {
            // Directory without trailing slash → serve index (avoid EISDIR 500 on /blog)
            const stat = fs.statSync(direct);
            if (stat.isDirectory()) {
                const html = path.join(direct, 'index.html');
                const htm = path.join(direct, 'index.htm');
                const alt = path.join(direct, 'index-1.htm');
                if (fs.existsSync(html)) return html;
                if (fs.existsSync(htm)) return htm;
                if (fs.existsSync(alt)) return alt;
            }
            return direct;
        }

        // Fallback: WordPress exports often include "-1" variants
        const ext = path.extname(direct);
        const base = direct.slice(0, -ext.length);
        if ((ext === '.htm' || ext === '.html') && !base.endsWith('-1')) {
            const alt = `${base}-1${ext}`;
            if (fs.existsSync(alt)) return alt;
        }

        return direct;
    }

    const filePath = resolvePath(pathname);

    // Get file extension
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    // Read and serve file
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else if (error.code === 'EISDIR') {
                res.writeHead(301, { Location: pathname.endsWith('/') ? pathname : pathname + '/' });
                res.end();
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`Auxspire Website Preview Server`);
    console.log(`========================================`);
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Press Ctrl+C to stop the server\n`);
});
