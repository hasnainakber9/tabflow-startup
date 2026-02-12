# TabFlow Icons

## Required Icons

TabFlow requires the following icon sizes:

- **icon-16.png** - 16x16px - Toolbar icon
- **icon-48.png** - 48x48px - Extension management page
- **icon-128.png** - 128x128px - Chrome Web Store listing

## Design Guidelines

### Visual Identity

**Symbol**: Hexagonal prism with lightning bolt
- Represents: Focus, structure, energy
- Colors: Purple gradient (#667eea to #764ba2)
- Style: Modern, minimal, flat design

### Color Palette

- Primary: `#667eea` (Purple Blue)
- Secondary: `#764ba2` (Deep Purple)
- Accent: `#8b9cf8` (Light Purple)

### Icon Specifications

**16x16px** (Toolbar)
- Simplified logo
- High contrast
- Readable at small size
- White on gradient background

**48x48px** (Extension Page)
- Detailed logo
- Gradient background
- Lightning bolt visible
- Professional appearance

**128x128px** (Web Store)
- Full detail
- Marketing quality
- Gradient with depth
- Drop shadow subtle

## How to Create Icons

### Option 1: Design in Figma/Sketch

1. Create 128x128px artboard
2. Design hexagonal prism
3. Add lightning bolt in center
4. Apply gradient (135deg, #667eea to #764ba2)
5. Export as PNG at 1x, 2x, 3x
6. Resize to 48px and 16px

### Option 2: Use Icon Generator Tool

Use online tools like:
- [Chrome Extension Icon Generator](https://chrome-extension-icons.herokuapp.com/)
- [Canva](https://canva.com)
- [Figma](https://figma.com)

### Option 3: Commission Designer

- Fiverr: $5-20 for icon set
- Upwork: $30-100 for professional design
- 99designs: Contest for multiple options

## Temporary Placeholder

For development, you can use a simple colored square:

```bash
# Create placeholder icons (requires ImageMagick)
convert -size 16x16 xc:"#667eea" icon-16.png
convert -size 48x48 xc:"#667eea" icon-48.png
convert -size 128x128 xc:"#667eea" icon-128.png
```

Or use this online generator: https://www.favicon-generator.org/

## Current Status

⚠️ **Icons Not Included**: Due to file size, actual icon files are not in the repository.

**Action Required**: 
1. Design icons following guidelines above
2. Save as PNG in this directory
3. Test in Chrome to verify appearance

## Testing Icons

1. Load extension in Chrome
2. Check toolbar icon (16px) - should be clear and recognizable
3. Visit chrome://extensions/ - check 48px icon
4. Prepare 128px for Chrome Web Store submission

## Need Help?

Contact: design@tabflow.app