#!/usr/bin/env python3
"""
Generate Chrome extension icons for Live Chess Cloud Extension
Requires: pip install Pillow
"""

import os
from PIL import Image, ImageDraw, ImageFont

def create_icon(size):
    """Create an icon of the specified size"""
    # Create image with gradient background
    img = Image.new('RGB', (size, size), color='#667eea')
    draw = ImageDraw.Draw(img)
    
    # Draw gradient (simplified - solid color with gradient effect)
    # For a true gradient, we'd need to draw many rectangles
    # Here we'll use a solid color that represents the gradient
    draw.rectangle([(0, 0), (size, size)], fill='#667eea')
    
    # Draw a darker rectangle at bottom for gradient effect
    overlay = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    overlay_draw.rectangle([(0, size//2), (size, size)], fill=(118, 75, 162, 180))
    img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
    draw = ImageDraw.Draw(img)
    
    # Draw chess piece symbol (pawn)
    try:
        # Try to use a system font
        font_size = int(size * 0.6)
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", font_size)
        except:
            try:
                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
            except:
                font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()
    
    # Calculate text position (centered)
    text = "♟"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size - text_width) // 2 - bbox[0]
    y = (size - text_height) // 2 - bbox[1]
    
    # Draw white chess piece
    draw.text((x, y), text, fill='white', font=font)
    
    return img

def main():
    icons_dir = os.path.join(os.path.dirname(__file__), 'icons')
    os.makedirs(icons_dir, exist_ok=True)
    
    sizes = [16, 48, 128]
    
    print("Generating Chrome extension icons...")
    for size in sizes:
        icon = create_icon(size)
        filepath = os.path.join(icons_dir, f'icon{size}.png')
        icon.save(filepath, 'PNG')
        print(f"✓ Generated {filepath}")
    
    print("\nAll icons generated successfully!")
    print(f"Icons saved to: {icons_dir}")

if __name__ == '__main__':
    try:
        main()
    except ImportError:
        print("Error: Pillow is not installed.")
        print("Install it with: pip install Pillow")
        print("\nAlternatively, use create-icons.html in your browser.")
    except Exception as e:
        print(f"Error: {e}")
        print("\nYou can also use create-icons.html in your browser to generate icons.")

