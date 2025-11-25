// Simple script to generate extension icons
// Run with: node generate-icons.js
// Requires: npm install canvas (or use the HTML file instead)

const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// For now, create a simple note file
// To generate actual PNG icons, either:
// 1. Use create-icons.html in a browser
// 2. Install canvas: npm install canvas, then uncomment the code below
// 3. Use an online icon generator

const note = `To generate icons:
1. Open create-icons.html in your browser
2. Click the download buttons for each size
3. Save the files to this icons/ directory as:
   - icon16.png
   - icon48.png
   - icon128.png

Alternatively, use an online tool like:
- https://www.favicon-generator.org/
- https://realfavicongenerator.net/
`;

fs.writeFileSync(path.join(iconsDir, 'README.txt'), note);

console.log('Icons directory created. See icons/README.txt for instructions.');
console.log('Or open create-icons.html in your browser to generate icons.');

// Uncomment below if you have canvas installed
/*
const { createCanvas } = require('canvas');

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Draw chess piece
  ctx.fillStyle = 'white';
  ctx.font = `${size * 0.6}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('♟', size / 2, size / 2);
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), buffer);
  console.log(`Generated icon${size}.png`);
}

[16, 48, 128].forEach(generateIcon);
*/

