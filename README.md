# Latin Learning Website

A modern, responsive website designed for teaching Latin with 5 different homepage theme options.

## Features

- **5 Theme Options**: Switch between different visual styles using the dropdown menu
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Smooth Animations**: Elements animate into view as you scroll
- **Theme Persistence**: Your selected theme is remembered using localStorage

## Theme Options

1. **Classic Scholar** - Traditional academic style with warm earth tones
2. **Modern Minimalist** - Clean black and white contemporary design
3. **Vibrant Interactive** - Colorful gradient theme with purple and pink
4. **Ancient Roman** - Dark theme with luxurious gold accents
5. **Academic Professional** - Professional blue and gray theme

## How to Use

### Locally

1. Clone this repository
2. Open `index.html` in your web browser
3. Use the dropdown menu in the top-right corner to switch between themes

### With a Web Server

```bash
# Using Python 3
python3 -m http.server 8080

# Using Python 2
python -m SimpleHTTPServer 8080

# Using Node.js
npx http-server -p 8080
```

Then visit `http://localhost:8080` in your browser.

## File Structure

- `index.html` - Main HTML structure with all page sections
- `styles.css` - Comprehensive CSS with all 5 theme styles
- `script.js` - JavaScript for theme switching and animations

## Sections Included

- **Navigation Bar** - Sticky header with menu links
- **Hero Section** - Eye-catching intro with call-to-action buttons
- **Features Grid** - "Why Learn Latin?" with 4 key benefits
- **Learning Journey** - 4-step path from fundamentals to mastery
- **Testimonials** - Student feedback and reviews
- **Footer** - Quick links and contact information

## Customization

Each theme is defined in `styles.css` using theme-specific CSS classes (`.theme-classic`, `.theme-modern`, etc.). To modify a theme, simply edit the corresponding section in the CSS file.

## Browser Support

Works on all modern browsers including:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## License

This project is open source and available for educational purposes.