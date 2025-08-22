# Shahmeer Baqai - Portfolio Pro

A cinematic 3D portfolio website for digital strategist Shahmeer Baqai, featuring GitHub-powered file management and real-time updates.

## Features

- **3D Cinematic Design**: Three.js neural background with 3D logo and card tilt effects
- **GitHub Integration**: Secure file uploads and management via GitHub API
- **Real-time Updates**: Portfolio updates automatically when files are uploaded
- **File Download System**: Support for PDF, DOCX, MP4, ZIP, TXT files up to 100MB
- **Admin Panel**: Secure authentication with lockout protection
- **Custom Cursor**: Magnetic glowing cursor with trail effects
- **GSAP Animations**: Smooth scroll animations and transitions
- **Responsive Design**: Optimized for all devices

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **3D Graphics**: Three.js
- **Animations**: GSAP with ScrollTrigger
- **File Management**: GitHub REST API
- **Deployment**: Cloudflare Pages

## Quick Start

1. **Deploy to Cloudflare Pages**:
   - Upload this folder to your GitHub repository
   - Connect to Cloudflare Pages
   - Set build command: (none needed - static site)
   - Set build output directory: `/`

2. **Admin Setup**:
   - Click the "Admin" button (appears on hover in top-right)
   - Login with credentials:
     - Username: `shahmeer606`
     - Password: `9MJMKHmjfP695IW`
   - Configure GitHub credentials:
     - GitHub Username: `SHAHMEERHACKER101`
     - Personal Access Token: Your GitHub PAT with repo permissions
     - Repository: `Portfolio-Pro` (pre-filled)

3. **Upload Files**:
   - Use the admin panel to upload portfolio files
   - Supported formats: PDF, DOCX, MP4, MOV, ZIP, TXT
   - Files are stored in `/uploads/` via GitHub API
   - Portfolio updates automatically after upload

## File Structure

