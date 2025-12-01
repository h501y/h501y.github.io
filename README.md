# Favicon Structure

This directory contains all favicon files for the site.

## Files
- `favicon.ico` - Legacy icon format (16x16, 32x32, 48x48)
- `favicon.svg` - Modern vector format (recommended)
- `apple-touch-icon.png` - iOS home screen icon (180x180)
- `favicon-{size}.png` - Various PNG sizes for different contexts
- `favicon-512-maskable.png` - PWA maskable icon

## Root Fallbacks
The following files are also kept in `/static/` root for browser compatibility:
- `/favicon.ico` - Default browser fallback
- `/favicon.svg` - Modern browser fallback
- `/apple-touch-icon.png` - iOS fallback

These root copies ensure compatibility with browsers that make direct requests
to standard favicon paths before parsing HTML link tags.

## Usage
All favicons are referenced in `layouts/partials/meta-head.html` with cache-busting
versioning via the `versioned-url.html` partial.

PWA icons are defined in `/static/site.webmanifest`.
