#!/usr/bin/env python3
"""Generate the Open Graph / social share card (1200x630) for RED Web Studio.

Matches the live site UI: cream/editorial palette, Fraunces-style serif,
terracotta + sage accents.

Run: python3 scripts/generate_og_image.py
Outputs og-image.png into website/ and docs/.
"""
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
FONTS = "/mnt/skills/examples/canvas-design/canvas-fonts"

# Live-site palette (from style.css :root)
CREAM = (251, 247, 241)       # --cream  #FBF7F1
CREAM_DEEP = (244, 239, 230)  # --cream-deep
PAPER = (253, 251, 247)       # --paper
INK = (31, 27, 23)            # --ink  #1F1B17
INK_SOFT = (92, 84, 75)       # --ink-soft
INK_MUTE = (139, 131, 120)    # --ink-mute
ACCENT = (200, 69, 59)        # --accent  #C8453B
ACCENT_DEEP = (139, 47, 38)   # --accent-deep
ACCENT_TINT = (251, 234, 231) # --accent-tint
SAGE = (95, 122, 90)          # --sage  #5F7A5A
BORDER = (229, 223, 213)      # --border

def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)

# Fraunces -> Lora (serif). Inter -> Work Sans (sans).
f_logo    = font("Lora-Bold.ttf", 58)
f_studio  = font("WorkSans-Medium.ttf", 24) if os.path.exists(os.path.join(FONTS, "WorkSans-Medium.ttf")) else font("WorkSans-Regular.ttf", 24)
f_tagline = font("WorkSans-Bold.ttf", 16)
f_head    = font("Lora-Bold.ttf", 74)
f_sub     = font("WorkSans-Regular.ttf", 30)
f_pill    = font("WorkSans-Bold.ttf", 30)
f_chip    = font("WorkSans-Bold.ttf", 22)

img = Image.new("RGB", (W, H), CREAM)
draw = ImageDraw.Draw(img)

# --- Background: very subtle cream gradient ---
for y in range(H):
    t = y / H
    r = int(PAPER[0] + (CREAM_DEEP[0] - PAPER[0]) * t)
    g = int(PAPER[1] + (CREAM_DEEP[1] - PAPER[1]) * t)
    b = int(PAPER[2] + (CREAM_DEEP[2] - PAPER[2]) * t)
    draw.line([(0, y), (W, y)], fill=(r, g, b))

# --- Soft warm accent glow (top-right) ---
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
cx, cy, rad = 1120, 70, 380
for i in range(rad, 0, -2):
    a = int(90 * (1 - i / rad))
    gd.ellipse([cx - i, cy - i, cx + i, cy + i], fill=(ACCENT[0], ACCENT[1], ACCENT[2], a))
img = Image.alpha_composite(img.convert("RGBA"), glow.point(lambda p: p)).convert("RGB")
draw = ImageDraw.Draw(img)

# --- Thin editorial inner frame ---
draw.rectangle([28, 28, W - 29, H - 29], outline=BORDER, width=2)

# --- Left accent bar ---
draw.rectangle([28, 28, 42, H - 29], fill=ACCENT)

MARGIN = 84

# --- Logo: RED (terracotta serif) + Web Studio (ink-mute) + tagline ---
logo_y = 74
draw.text((MARGIN, logo_y), "RED", font=f_logo, fill=ACCENT)
red_w = draw.textbbox((0, 0), "RED", font=f_logo)[2]
draw.text((MARGIN + red_w + 18, logo_y + 24), "Web Studio", font=f_studio, fill=INK_MUTE)
# tagline (tracked uppercase, terracotta)
tx = MARGIN + 2
ty = logo_y + 66
for ch in "RESULTS. EFFICIENCY. DESIGN.":
    draw.text((tx, ty), ch, font=f_tagline, fill=ACCENT)
    tx += draw.textbbox((0, 0), ch, font=f_tagline)[2] + 3

# --- Headline (serif) — brand tagline, distinct from the link title below ---
f_big = font("Lora-Bold.ttf", 100)
hy = 206
draw.text((MARGIN, hy), "We Build.", font=f_big, fill=INK)
draw.text((MARGIN, hy + 104), "You Grow.", font=f_big, fill=ACCENT)

# --- Subheadline ---
draw.text((MARGIN, hy + 230),
          "Custom websites with a built-in AI assistant.",
          font=f_sub, fill=INK_SOFT)

# --- Bottom row: URL pill + feature chip ---
by = 524
# URL pill (terracotta, cream text)
url = "redwebstudio.com"
pad_x, pad_y = 30, 16
tw = draw.textbbox((0, 0), url, font=f_pill)[2]
pill_w = tw + pad_x * 2
ph = 60
draw.rounded_rectangle([MARGIN, by, MARGIN + pill_w, by + ph], radius=30, fill=ACCENT)
draw.text((MARGIN + pad_x, by + pad_y), url, font=f_pill, fill=PAPER)

# Feature chip (sage outline)
chip = "Free website audit"
chx = MARGIN + pill_w + 26
chip_tw = draw.textbbox((0, 0), chip, font=f_chip)[2]
draw.rounded_rectangle([chx, by + 6, chx + chip_tw + 50, by + ph - 6],
                       radius=24, outline=SAGE, width=2)
draw.ellipse([chx + 18, by + 24, chx + 30, by + 36], fill=SAGE)
draw.text((chx + 42, by + 16), chip, font=f_chip, fill=INK_SOFT)

# --- Save ---
for out in ("website/og-image.png", "docs/og-image.png"):
    os.makedirs(os.path.dirname(out), exist_ok=True)
    img.save(out, "PNG", optimize=True)
    print("wrote", out, os.path.getsize(out), "bytes")
