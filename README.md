# Shahmeer Baqai Portfolio - GitHub-Backed CMS

Ultra-advanced 3D portfolio website with GitHub-integrated content management system, supporting large file uploads and automatic Cloudflare Pages deployment.

## 🚀 Quick Deploy Instructions

### Step 1: Upload to GitHub
1. **Create new repository**: `SHAHMEERHACKER101/Portfolio-Pro`
2. **Extract and upload**: All files to repository root
3. **Verify structure**: Ensure `index.html` is at root level

### Step 2: Deploy on Cloudflare Pages
1. **Connect repository** to Cloudflare Pages
2. **Build settings**: Framework = None, Build output = `/`
3. **Deploy**: Automatic deployment will start

### Step 3: Admin Setup
1. **Visit live site** and click Admin button (top-right on hover)
2. **Login**: Username `shahmeer606`, Password `9MJMKHmjfP695IW`
3. **GitHub Setup**:
   - Username: `SHAHMEERHACKER101`
   - Token: Your GitHub Personal Access Token (with repo + workflow scopes)
   - Repo: `Portfolio-Pro`

## ✅ Features

- **3D Neural Network Background**: Real-time animated particle system
- **Custom Cursor Effects**: Magnetic cursor with hover animations  
- **GitHub File Storage**: Upload files directly to GitHub (up to 100MB)
- **PDF Preview**: Built-in PDF.js integration for document preview
- **Admin Dashboard**: Complete file management and message system
- **Auto-Deploy**: Changes trigger automatic site rebuilds
- **Mobile Responsive**: Optimized for all devices

## 🔐 Admin Features

### File Upload System
- **Drag & drop** or click to select files
- **Supported formats**: PDF, images, videos, documents
- **Auto-thumbnails**: Generated for all file types
- **GitHub storage**: Files stored in `/uploads/` directory
- **Live updates**: Site rebuilds automatically after uploads

### Portfolio Management
- **Visual grid**: See all uploaded files with thumbnails
- **Preview system**: Click any item to preview content
- **Delete function**: Remove files from GitHub with one click
- **Category filtering**: Organize by content type

### Message Center
- **Contact forms**: Visitors can send messages
- **Admin review**: Mark messages as read/unread
- **Local storage**: Messages saved in browser

## 🛠️ File Structure

```
Portfolio-Pro/
├── index.html              # Main portfolio page
├── styles/main.css         # Complete styling system
├── scripts/
│   ├── main.js            # 3D animations & core functionality
│   ├── admin.js           # GitHub-integrated admin system
│   └── preview.js         # File preview with PDF.js
├── lib/
│   ├── three.min.js       # 3D graphics library
│   ├── pdf.min.js         # PDF preview system
│   └── pdf.worker.js      # PDF processing worker
├── data/
│   └── portfolio.json     # Portfolio metadata
├── uploads/               # GitHub-stored files
│   └── thumbs/           # Generated thumbnails
└── README.md             # This file
```

## 🎯 Success Verification

After deployment, verify these features work:

1. **✅ Site loads** with 3D neural network background
2. **✅ Admin button** appears on hover (top-right)
3. **✅ Login works** with provided credentials
4. **✅ GitHub setup** accepts your token and connects
5. **✅ File upload** successfully stores in GitHub
6. **✅ Portfolio displays** uploaded files correctly
7. **✅ Preview system** shows PDFs and other files
8. **✅ Contact form** saves messages to admin panel

## 🔧 Troubleshooting

### Admin Button Not Working
- **Clear browser cache** (Ctrl+F5)
- **Check console** for JavaScript errors
- **Verify modal elements** exist in DOM

### GitHub Upload Issues  
- **Token expired**: Generate new Personal Access Token
- **Wrong permissions**: Ensure 'repo' and 'workflow' scopes
- **File too large**: GitHub limit is 100MB per file

### Site Not Updating
- **Check Cloudflare Pages**: View deployment status
- **Manual rebuild**: Trigger deployment from dashboard
- **DNS propagation**: May take up to 24 hours for custom domains

## 🎨 Customization

### Update Content
- **Skills**: Edit `skillsData` in `scripts/main.js`
- **Reviews**: Edit `reviewsData` in `scripts/main.js`
- **Colors**: Modify CSS variables in `styles/main.css`

### Admin Credentials
- **Username/Password**: Update in `scripts/admin.js`
- **GitHub settings**: Configured per session in admin panel

## 📞 Support

For technical issues:
1. **Check browser console** for error messages
2. **Verify GitHub token** has correct permissions
3. **Test with smaller files** if uploads fail
4. **Contact through portfolio** contact form when live

---

**Copyright © 2024 Shahmeer Baqai** • Ultra-Advanced Portfolio System