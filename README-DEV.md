# Auxspire Website - Development Guide

## Local Preview Setup

This guide will help you set up a local preview server to view and develop the Auxspire website.

### Prerequisites

You need one of the following installed:
- **Python 3** (recommended - usually pre-installed on most systems)
- **Node.js** (alternative option)

### Quick Start

#### Option 1: Using Python (Recommended)

**Windows:**
```bash
start-server.bat
```

**Mac/Linux:**
```bash
chmod +x start-server.sh
./start-server.sh
```

**Manual Python command:**
```bash
python -m http.server 8000
# or
python3 -m http.server 8000
```

#### Option 2: Using Node.js

**Windows/Mac/Linux:**
```bash
node server.js
```

### Accessing the Site

Once the server is running, open your browser and navigate to:

**http://localhost:8000**

The homepage will be available at:
- http://localhost:8000/index.htm

### Available Pages

- **Homepage:** http://localhost:8000/index.htm
- **About Us:** http://localhost:8000/about-us/index.htm
- **Contact:** http://localhost:8000/contact/index.htm
- **Client Portal:** http://localhost:8000/client-portal/index.htm (new)
- **Case Studies:** http://localhost:8000/case-studies/index.htm (new)

### Stopping the Server

Press `Ctrl+C` in the terminal/command prompt to stop the server.

### Troubleshooting

**Port 8000 already in use:**
- Change the port number in `server.js` (line 5) or in the Python command
- Update the port in the start scripts

**Python not found:**
- Install Python 3 from https://www.python.org/
- Or use the Node.js option instead

**Node.js not found:**
- Install Node.js from https://nodejs.org/
- Or use the Python option instead

### Development Notes

- All HTML files use `.htm` extension (WordPress export format)
- CSS and JavaScript files are in `wp-content/themes/brooklyn/`
- Images are in `wp-content/uploads/`
- New pages should follow the same structure as existing pages

### File Structure

```
auxspire.com/
├── index.htm (homepage)
├── about-us/
├── contact/
├── client-portal/ (new)
├── case-studies/ (new)
├── wp-content/ (theme files, plugins, uploads)
└── server.js (Node.js server)
```

### Next Steps

1. Start the preview server using one of the methods above
2. Open http://localhost:8000 in your browser
3. Make changes to HTML/CSS/JS files
4. Refresh the browser to see changes
