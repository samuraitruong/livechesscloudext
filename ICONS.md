# Icon Generation Guide

This extension requires three icon files in PNG format. Here are several ways to generate them:

## Quick Start (Recommended)

1. **Open `create-icons.html` in your web browser**
2. Click "Download All Icons" button
3. Save all three files to the `icons/` directory:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`

That's it! The extension is ready to use.

## Alternative Methods

### Method 1: Python (Pillow)

```bash
pip install Pillow
python3 generate-icons.py
```

### Method 2: Node.js (Canvas)

```bash
npm install canvas
node generate-icons-simple.js
```

### Method 3: Shell Script

```bash
chmod +x generate-icons.sh
./generate-icons.sh
```

This opens the HTML generator in your default browser.

### Method 4: Online Tools

If you prefer, you can use online icon generators:
- https://www.favicon-generator.org/
- https://realfavicongenerator.net/

Just create a 128x128 icon with a chess theme and these tools will generate all required sizes.

## Icon Design

The generated icons feature:
- **Background**: Purple gradient (#667eea to #764ba2)
- **Symbol**: White chess pawn (♟)
- **Style**: Modern, clean design suitable for Chrome extensions

## File Structure

After generation, your `icons/` directory should contain:
```
icons/
├── icon16.png   (16x16 pixels - toolbar icon)
├── icon48.png   (48x48 pixels - extension management)
└── icon128.png  (128x128 pixels - Chrome Web Store)
```

## Troubleshooting

**Icons not showing in Chrome?**
- Make sure files are named exactly: `icon16.png`, `icon48.png`, `icon128.png`
- Verify files are in the `icons/` directory (not a subdirectory)
- Check that files are valid PNG images
- Reload the extension in `chrome://extensions/`

**HTML generator not working?**
- Make sure JavaScript is enabled in your browser
- Try a different browser (Chrome, Firefox, Safari all work)
- Check browser console for errors

