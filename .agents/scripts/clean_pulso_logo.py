from pathlib import Path

from PIL import Image


source = Path("attached_assets/image_1789400252847.png")
destination = Path("attached_assets/pulso-petronect-logo.png")

image = Image.open(source).convert("RGBA")
pixels = image.load()

for y in range(image.height):
    for x in range(image.width):
        red, green, blue, _ = pixels[x, y]
        neutral = max(red, green, blue) - min(red, green, blue) <= 14
        light_background = (red + green + blue) / 3 >= 155
        if neutral and light_background:
            pixels[x, y] = (red, green, blue, 0)
        else:
            pixels[x, y] = (red, green, blue, 255)

box = image.getbbox()
if box:
    image = image.crop(box)

image.save(destination, optimize=True)
print(f"Saved transparent logo to {destination} with size {image.size}")