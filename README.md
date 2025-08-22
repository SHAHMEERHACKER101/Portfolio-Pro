# Shahmeer Baqai Portfolio - Static Deployment

This is a world-class 3D interactive portfolio website for Shahmeer Baqai, designed as a fully static site that uses GitHub as a backend storage solution.

## Features

✅ **Cinematic 3D Design**
- Three.js-powered 3D effects
- Hero section with floating "SB" text with depth, lighting, and subtle rotation
- Animated 3D particle mesh background
- Custom magnetic cursor with glow ring and trail effects
- Smooth scroll with GSAP ScrollTrigger animations
- Portfolio cards with 3D hover effects

✅ **Admin Panel (Secure & Functional)**
- "Admin" button at top-right (visible on hover)
- Secure login with credentials:
  - Username: shahmeer606
  - Password: 9MJMKHmjfP695IW
- Account lockout after 2 failed attempts (15 minutes)
- GitHub integration for file storage
- Dashboard with dark theme (#0f111a)
- White bold text with cyber-blue accent (#00f3ff)
- Upload form supporting PDF, MP4, and DOCX files
- Portfolio management with visible delete buttons

✅ **Large File Upload Support (Up to 200MB)**
- Binary-safe Base64 encoding using ArrayBuffer + Uint8Array
- Handles PDFs, videos, and documents without btoa errors
- File validation and size checking
- Progress tracking during uploads

✅ **GitHub-Backed File Storage**
- Files converted to Base64 and stored in GitHub `/uploads/` directory
- Automatic thumbnail generation:
  - Video: First frame capture using HTML5 Canvas
  - PDF: First page render using PDF.js
  - DOCX: SVG placeholder icon
- Updates `data/portfolio.json` via GitHub API
- Files accessible after GitHub Pages rebuild

✅ **Client-Facing Portfolio**
- Grid layout with 6 categories:
  - High-Converting Ads
  - Viral Short Videos
  - Books & Podcasts
  - Pinterest That Sells
  - Web Tools & Extensions
  - AI-Powered Visuals
- 3D card hover animations
- Modal preview system:
  - PDF: Rendered with PDF.js
  - Video: HTML5 video player
  - DOCX: Download button
- Right-click disabled (context menu prevention)

✅ **Always-Visible Contact System**
- Floating "Send Message" button at bottom-right
- Modal contact form with name, email, message fields
- Messages saved to localStorage
- Admin panel shows unread message count badge

✅ **Client Reviews Carousel**
- Auto-rotating 3D carousel (every 3 seconds)
- 5 pre-loaded 5-star reviews
- Interactive navigation dots
- Smooth transition animations

## Installation & Deployment

1. **Upload to GitHub Repository**
   - Create a new repository named "Portfolio-Pro"
   - Upload all files from this directory to the repository root
   - Enable GitHub Pages in repository settings

2. **GitHub Configuration**
   - Generate a Personal Access Token with repository permissions
   - Use the admin panel to configure GitHub integration
   - Test file upload functionality

3. **Cloudflare Pages Deployment**
   - Connect your GitHub repository to Cloudflare Pages
   - Set build command: (none - static files)
   - Set output directory: /
   - Deploy and test all functionality

## File Structure

```
├── index.html              # Main HTML file
├── styles/
│   └── main.css            # All CSS styles and animations
├── scripts/
│   ├── main.js             # 3D animations, cursor, carousel
│   ├── admin.js            # Admin authentication and file management
│   └── preview.js          # File preview system
├── lib/
│   ├── pdf.min.js          # PDF.js library
│   └── pdf.worker.min.js   # PDF.js web worker
├── uploads/                # File upload directory (empty initially)
├── data/
│   └── portfolio.json      # Portfolio data structure
└── README.md              # This documentation
```

## Usage

### For Visitors
- Browse the 3D animated portfolio
- View project categories and details
- Send messages through the contact form
- Experience smooth 3D cursor interactions

### For Admin (Shahmeer)
1. Hover over top-right corner to reveal "Admin" button
2. Click and login with provided credentials
3. Configure GitHub integration on first login
4. Upload files up to 200MB (PDF, MP4, DOCX)
5. Manage portfolio items and view messages
6. All files are stored securely in GitHub

## Technical Details

- **Frontend**: Vanilla JavaScript with 3D CSS animations
- **Storage**: GitHub API for file management
- **Authentication**: Client-side with localStorage persistence
- **File Handling**: Binary-safe Base64 encoding for large files
- **Thumbnails**: Automated generation using Canvas API and PDF.js
- **Security**: Admin lockout, input validation, XSS prevention

## Browser Compatibility

- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Optimized 3D animations
- Lazy-loaded file previews
- Compressed assets
- CDN-ready static files

---

**Created for Shahmeer Baqai - Digital Strategy & Content Creation**
*Ready for 150MB+ file uploads with no console errors*