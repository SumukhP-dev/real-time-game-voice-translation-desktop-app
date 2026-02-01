"""
Script to create multi-game application icon with microphone overlay
Creates a professional icon representing voice translation for any game
"""
from PIL import Image, ImageDraw
import os

def create_gradient_background(size, start_color, end_color):
    """Create a gradient background"""
    gradient = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(gradient)
    
    for y in range(size):
        # Interpolate between start and end color
        ratio = y / size
        r = int(start_color[0] * (1 - ratio) + end_color[0] * ratio)
        g = int(start_color[1] * (1 - ratio) + end_color[1] * ratio)
        b = int(start_color[2] * (1 - ratio) + end_color[2] * ratio)
        draw.line([(0, y), (size, y)], fill=(r, g, b, 255))
    
    return gradient

def create_app_icon():
    """Create multi-game logo with microphone on top"""
    # Create a 256x256 icon (standard size for Windows icons)
    size = 256
    icon = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    
    center_x = size // 2
    center_y = size // 2
    
    # Create a modern gradient background (blue to purple)
    # Using a professional color scheme suitable for gaming/tech
    start_color = (30, 60, 120)  # Deep blue
    end_color = (80, 40, 120)    # Purple-blue
    background = create_gradient_background(size, start_color, end_color)
    
    # Paste gradient background
    icon.paste(background, (0, 0))
    
    # Optional: Add a subtle circular border/glow effect
    draw = ImageDraw.Draw(icon)
    border_margin = 10
    draw.ellipse(
        [border_margin, border_margin, size - border_margin, size - border_margin],
        outline=(255, 255, 255, 100),
        width=3
    )
    
    # Load the blue microphone image
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    mic_path = os.path.join(root_dir, 'blue_microphone.png')
    
    if not os.path.exists(mic_path):
        raise FileNotFoundError(f"Microphone image not found at: {mic_path}")
    
    # Load and process the microphone image
    mic_image = Image.open(mic_path)
    
    # Convert to RGBA if needed
    if mic_image.mode != 'RGBA':
        mic_image = mic_image.convert('RGBA')
    
    # Remove any black background or watermark by making transparent pixels
    # Create a mask to remove black/very dark pixels (likely background)
    mic_data = mic_image.getdata()
    new_mic_data = []
    for item in mic_data:
        # If pixel is very dark (likely background), make it transparent
        if item[0] < 30 and item[1] < 30 and item[2] < 30:
            new_mic_data.append((0, 0, 0, 0))  # Transparent
        else:
            new_mic_data.append(item)
    mic_image.putdata(new_mic_data)
    
    # Resize microphone to be prominent (centered on icon)
    mic_height = 180  # Large size for visibility
    # Calculate width maintaining aspect ratio
    aspect_ratio = mic_image.width / mic_image.height
    mic_width = int(mic_height * aspect_ratio)
    mic_resized = mic_image.resize((mic_width, mic_height), Image.Resampling.LANCZOS)
    
    # Position microphone centered on the icon
    mic_x = center_x - mic_width // 2
    mic_y = center_y - mic_height // 2
    
    # Paste the microphone onto the icon with transparency
    icon.paste(mic_resized, (mic_x, mic_y), mic_resized)
    
    # Save as ICO file with multiple sizes
    icon_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    icon_images = []
    
    for ico_size in icon_sizes:
        resized = icon.resize(ico_size, Image.Resampling.LANCZOS)
        icon_images.append(resized)
    
    # Save ICO file
    icon_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'app_icon.ico')
    icon.save(icon_path, format='ICO', sizes=[(s[0], s[1]) for s in icon_sizes])
    print(f"✓ Icon created: {icon_path}")
    
    # Also save as PNG for reference
    png_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'app_icon.png')
    icon.save(png_path, format='PNG')
    print(f"✓ PNG version created: {png_path}")
    
    return icon_path

if __name__ == "__main__":
    try:
        create_app_icon()
        print("\n✓ Icon creation completed successfully!")
    except ImportError:
        print("Error: PIL/Pillow not installed.")
        print("Install it with: pip install Pillow")
    except Exception as e:
        print(f"Error creating icon: {e}")
        import traceback
        traceback.print_exc()
