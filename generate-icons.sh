#!/bin/bash
# Generate icons using the HTML file
# This script opens the HTML file in the default browser

echo "Opening icon generator in browser..."
echo "Please download all three icons and save them to the icons/ directory"

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
HTML_FILE="$SCRIPT_DIR/create-icons.html"

# Open in default browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "$HTML_FILE"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open "$HTML_FILE" 2>/dev/null || sensible-browser "$HTML_FILE" 2>/dev/null
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows
    start "$HTML_FILE"
else
    echo "Please open create-icons.html in your browser manually"
fi

echo ""
echo "After downloading, make sure the files are saved as:"
echo "  - icons/icon16.png"
echo "  - icons/icon48.png"
echo "  - icons/icon128.png"

