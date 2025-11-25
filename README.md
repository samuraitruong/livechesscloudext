# Live Chess Cloud Chrome Extension

A Chrome extension that enhances the Live Chess Cloud viewing experience on https://view.livechesscloud.com/ and allows you to download game data as PGN or JSON files.

## Features

- **Automatic Game Data Capture**: Intercepts and captures JSON game data from Live Chess Cloud API
- **PGN Download**: Converts captured game data to PGN format for use in chess analysis software
- **JSON Download**: Download raw JSON data for custom processing
- **Floating Download Button**: Easy access to download captured games
- **Visual Indicator**: Shows when extension is active and how many games are captured
- **Popup Interface**: View captured game information in the extension popup

## Installation

### From Source

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top right)
4. Click "Load unpacked"
5. Select the extension directory (`livechesscloudext`)
6. The extension should now be installed and active

### Development

1. Make changes to the extension files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card to reload changes

## File Structure

```
livechesscloudext/
├── manifest.json       # Extension configuration
├── content.js          # Script that runs on Live Chess Cloud pages
├── content.css         # Styles for content script enhancements
├── popup.html          # Extension popup UI
├── popup.js            # Popup functionality
├── popup.css           # Popup styles
├── icons/              # Extension icons (to be added)
└── README.md           # This file
```

## Icons

You'll need to add icon files to the `icons/` directory:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

### Generating Icons

**Method 1: HTML Generator (Easiest)**
1. Open `create-icons.html` in your browser
2. Click "Download All Icons" or download each size individually
3. Save the downloaded files to the `icons/` directory

**Method 2: Python Script**
```bash
pip install Pillow
python3 generate-icons.py
```

**Method 3: Node.js Script (with canvas)**
```bash
npm install canvas
node generate-icons-simple.js
```

**Method 4: Shell Script**
```bash
./generate-icons.sh
# This will open the HTML generator in your browser
```

The icons feature a purple gradient background with a white chess pawn symbol (♟).

## Usage

1. Navigate to a game on https://view.livechesscloud.com/
2. The extension will automatically capture the game JSON data when the page loads
3. A download button will appear in the app bar (bottom control panel) with other game controls
4. **Single click** the download button to download PGN format
5. **Double click** or **right-click** the download button to see download options:
   - **Download PGN**: Converts the game to PGN format (compatible with chess software)
   - **Download JSON**: Downloads the raw JSON data
6. Files will be automatically downloaded with names like `round-4-game-1.pgn`
7. A badge on the button shows how many games have been captured

## Customization

### Adding Features

Edit `content.js` to add new functionality:
- Chess move analysis
- Board enhancements
- Additional export formats
- Custom keyboard shortcuts

### Styling

Modify `content.css` to customize the appearance of enhancements on the Live Chess Cloud page.

## Permissions

This extension requires:
- `activeTab` - To interact with the current tab
- `scripting` - To inject content scripts
- Host permission for `https://view.livechesscloud.com/*` - To run on Live Chess Cloud pages

## License

MIT

