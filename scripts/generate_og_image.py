#!/usr/bin/env python3
"""Generate the Open Graph / social share card (1200x630) for RED Web Studio.

Run: python3 scripts/generate_og_image.py
Outputs og-image.png into website/ and docs/.
"""
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
FONTS = "/mnt/skills/examples/canvas-design/canvas-fonts"

# Brand colours
NAVY = (26, 26, 46)        # #1A1A2E
CHARCOAL = (45, 45, 68)    # #2D2D44
RED = (230, 57, 70)        # #E63946
RED_DARK = (193, 18, 31)   # #C1121F
WHITE = (255, 255, 255)
MUTED = (176, 176, 196)

def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)

# Fonts (closest match to site: Fraunces serif headline + Inter sans)
f_logo   = font("Lora-BoldItalic.ttf", 70)
f_studio = font("WorkSans-Bold.ttf", 26)
f_head   = font("Lora-Bold.ttf", 70)
f_sub    = font("WorkSans-Regular.ttf", 30)
f_pill   = font("WorkSans-Bold.ttf", 30)
f_chip   = font("WorkSans-Bold.ttf", 22)

img = Image.new("RGB", (W, H), NAVY)
draw = ImageDraw.Draw(img)

# --- Background: diagonal navy gradient ---
for y in range(H):
    t = y / H
    r = int(NAVY[0] + (CHARCOAL[0] - NAVY[0]) * t)
    g = int(NAVY[1] + (CHARCOAL[1] - NAVY[1]) * t)
    b = int(NAVY[2] + (CHARCOAL[2] - NAVY[2]) * t)
    draw.line([(0, y), (W, y)], fill=(r, g, b))

# --- Soft red glow (top-right) ---
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
cx, cy, rad = 1080, 90, 360
for i in range(rad, 0, -2):
    a = int(70 * (1 - i / rad))
    gd.ellipse([cx - i, cy - i, cx + i, cy + i], fill=(RED[0], RED[1], RED[2], a))
img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
draw = ImageDraw.Draw(img)

# --- Left accent bar ---
draw.rectangle([0, 0, 14, H], fill=RED)

MARGIN = 80

# --- Logo: RED (red) + WEB STUDIO (white, tracked) ---
logo_y = 64
draw.text((MARGIN, logo_y), "RED", font=f_logo, fill=RED)
red_w = draw.textbbox((0, 0), "RED", font=f_logo)[2]
# tracked uppercase "WEB STUDIO"
sx = MARGIN + red_w + 22
sy = logo_y + 34
for ch in "WEB STUDIO":
    draw.text((sx, sy), ch, font=f_studio, fill=WHITE)
    sx += draw.textbbox((0, 0), ch, font=f_studio)[2] + 4

# --- Headline (two lines) ---
hy = 230
draw.text((MARGIN, hy), "Professional Web Design", font=f_head, fill=WHITE)
# second line with red accent word
line2_a = "+ "
line2_b = "AI Chatbot"
draw.text((MARGIN, hy + 86), line2_a, font=f_head, fill=WHITE)
aw = draw.textbbox((0, 0), line2_a, font=f_head)[2]
draw.text((MARGIN + aw, hy + 86), line2_b, font=f_head, fill=RED)

# --- Subheadline ---
draw.text((MARGIN, hy + 188),
          "Beautiful websites that convert for UK small businesses.",
          font=f_sub, fill=MUTED)

# --- Bottom row: URL pill + feature chip ---
by = 540
# URL pill (red rounded)
url = "redwebstudio.com"
pad_x, pad_y = 30, 16
tw = draw.textbbox((0, 0), url, font=f_pill)[2]
pill_w = tw + pad_x * 2
ph = 60
draw.rounded_rectangle([MARGIN, by, MARGIN + pill_w, by + ph], radius=30, fill=RED)
draw.text((MARGIN + pad_x, by + pad_y), url, font=f_pill, fill=WHITE)

# Feature chip
chip = "Lead-capturing AI included"
chx = MARGIN + pill_w + 28
chip_tw = draw.textbbox((0, 0), chip, font=f_chip)[2]
draw.rounded_rectangle([chx, by + 6, chx + chip_tw + 48, by + ph - 6],
                       radius=24, outline=RED, width=2)
# small dot
draw.ellipse([chx + 18, by + 24, chx + 30, by + 36], fill=RED)
draw.text((chx + 40, by + 16), chip, font=f_chip, fill=WHITE)

# --- Save ---
for out in ("website/og-image.png", "docs/og-image.png"):
    os.makedirs(os.path.dirname(out), exist_ok=True)
    img.save(out, "PNG", optimize=True)
    print("wrote", out, os.path.getsize(out), "bytes")
