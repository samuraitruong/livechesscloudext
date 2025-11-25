// Generate icons using canvas (requires: npm install canvas)
// Or use the HTML file: create-icons.html

const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'icons');

// Check if canvas is available
let canvas;
try {
  const canvasModule = require('canvas');
  canvas = canvasModule.createCanvas;
  console.log('Using canvas module for icon generation...');
} catch (e) {
  console.log('Canvas module not found. Creating SVG icons instead...');
  console.log('To generate PNG icons, run: npm install canvas');
  createSVGIcons();
  process.exit(0);
}

function createPNGIcons() {
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const sizes = [16, 48, 128];
  
  sizes.forEach(size => {
    const canvasInstance = canvas(size, size);
    const ctx = canvasInstance.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Draw chess piece (pawn symbol)
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = Math.max(1, size / 32);
    
    const centerX = size / 2;
    const centerY = size / 2;
    const fontSize = size * 0.6;
    
    // Draw chess piece symbol
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♟', centerX, centerY);
    
    // Save as PNG
    const buffer = canvasInstance.toBuffer('image/png');
    const filepath = path.join(iconsDir, `icon${size}.png`);
    fs.writeFileSync(filepath, buffer);
    console.log(`✓ Generated icon${size}.png`);
  });
  
  console.log('\nAll icons generated successfully!');
}

function createSVGIcons() {
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const sizes = [16, 48, 128];
  
  sizes.forEach(size => {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad${size})" rx="${size * 0.1}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.6}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">♟</text>
</svg>`;
    
    const filepath = path.join(iconsDir, `icon${size}.svg`);
    fs.writeFileSync(filepath, svg);
    console.log(`✓ Generated icon${size}.svg`);
    
    // Note: SVG icons need to be converted to PNG for Chrome extensions
    console.log(`  Note: Convert ${filepath} to PNG format for Chrome extension`);
  });
  
  console.log('\nSVG icons generated. Please convert them to PNG format.');
  console.log('You can use online tools like: https://cloudconvert.com/svg-to-png');
  console.log('Or use ImageMagick: convert icon16.svg icon16.png');
}

// Try to create PNG icons, fallback to SVG
if (canvas) {
  createPNGIcons();
} else {
  createSVGIcons();
}

