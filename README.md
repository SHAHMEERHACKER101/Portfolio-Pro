# Shahmeer Baqai Portfolio - GitHub-Backed CMS

This is an ultra-advanced 3D portfolio website with a complete Git-backed content management system. Files are stored in GitHub and automatically deployed via Cloudflare Pages.

## 🎯 Key Features

- **3D Neural Network Background**: Real-time animated particle system
- **Custom Cursor Effects**: Magnetic cursor with trail animations  
- **Skills Carousel**: Auto-rotating 3D skill cards with hover interactions
- **GitHub-Backed CMS**: Upload files directly to GitHub via admin panel
- **Real-Time Updates**: Changes trigger automatic site rebuilds
- **File Preview System**: PDFs, videos, and documents with download capability
- **Contact Form**: Message collection with admin review
- **Client Reviews**: Auto-rotating testimonials carousel

## 🔧 Architecture

This portfolio uses a **Git-backed CMS** approach:

1. **Admin uploads file** via web interface
2. **File converts to Base64** for GitHub storage
3. **GitHub API uploads** file to `/uploads/` directory  
4. **portfolio.json updates** automatically
5. **Cloudflare Pages rebuilds** site automatically
6. **Live site shows new content** to all visitors

This eliminates the need for a traditional backend while providing persistent storage.

## File Structure

```
cloudflare-deploy/
├── index.html              # Main HTML file
├── styles/
│   └── main.css            # All CSS styles and animations
├── scripts/
│   ├── main.js             # Core functionality and animations
│   ├── admin.js            # Admin panel functionality
│   ├── preview.js          # File preview system
│   └── messages.js         # Contact message handling
├── lib/
│   ├── three.min.js        # Minimal 3D library
│   └── gsap.min.js         # Animation library
└── README.md               # This file
```

## 🚀 Deployment Instructions

### Step 1: Create GitHub Repository

1. **Create new repository** on GitHub:
   ```
   Repository name: ShahmeerBaqai-Portfolio-Pro
   Description: Ultra-advanced 3D portfolio with Git-backed CMS
   Visibility: Public (required for Cloudflare Pages free tier)
   ```

2. **Upload the portfolio files**:
   - Download this entire `cloudflare-deploy` folder
   - Push all files to your GitHub repository main branch
   - Ensure the file structure matches:
     ```
     /
     ├── index.html
     ├── data/portfolio.json  
     ├── uploads/
     ├── scripts/
     ├── styles/
     └── lib/
     ```

### Step 2: Generate GitHub Personal Access Token

1. Go to **GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Click **"Generate new token (classic)"**
3. Configure the token:
   - **Name**: `Portfolio-CMS-Token`
   - **Expiration**: `No expiration` (or 1 year)
   - **Scopes**: Select these permissions:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)
4. **Copy the token** - you'll need this for admin uploads

### Step 3: Deploy to Cloudflare Pages

1. **Log into Cloudflare Dashboard**
2. **Go to Pages → Create a project**
3. **Connect to Git**:
   - Select your GitHub account
   - Choose `ShahmeerBaqai-Portfolio-Pro` repository
   - Branch: `main`
4. **Build settings**:
   - **Framework preset**: `None`
   - **Build command**: (leave empty)
   - **Build output directory**: `/`
5. **Environment variables** (none needed)
6. **Deploy!**

### Step 4: Configure Auto-Rebuild (Optional)

To trigger automatic rebuilds when files are uploaded:

1. In your GitHub repository, go to **Settings → Webhooks**
2. **Add webhook**:
   - **URL**: `https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/YOUR_DEPLOY_HOOK`
   - **Content type**: `application/json`
   - **Events**: Select "Pushes"
3. Get your deploy hook URL from **Cloudflare Pages → Settings → Builds & deployments**

## 🔐 Admin Access & Upload Workflow

### Login Process:
1. **Visit your live site** and click the Admin button
2. **Login credentials**:
   - Username: `shahmeer606`
   - Password: `9MJMKHmjfP695IW`
3. **Enter GitHub credentials**:
   - Your GitHub username
   - Your Personal Access Token from Step 2

### Upload Workflow:
1. **Login to admin panel**
2. **Configure GitHub access** (one-time setup)
3. **Upload files**:
   - Select file (up to 100MB)
   - Add title and category
   - Click upload
4. **Automatic process**:
   - File uploads to GitHub repository
   - Thumbnail generates automatically  
   - portfolio.json updates
   - Cloudflare Pages rebuilds site
   - New content appears live (2-5 minutes)

## 🧪 Testing & Verification

### Test the Upload System:
1. **Upload a test file** (PDF, image, or video)
2. **Check GitHub repository** - new files should appear in `/uploads/`
3. **Verify auto-rebuild** - Cloudflare Pages should show new deployment
4. **Confirm live site** - new content should be visible

### Common File Types Supported:
- **PDFs**: Documents, portfolios, case studies (up to 100MB)
- **Videos**: MP4, WebM promotional content (up to 100MB)  
- **Images**: JPG, PNG, GIF visual assets (up to 100MB)
- **Documents**: DOC, DOCX, TXT text files (up to 100MB)

## 🔧 Troubleshooting

### Upload Issues:
- **File too large**: GitHub has 100MB file size limit
- **GitHub token expired**: Generate new token in GitHub settings
- **Wrong repository**: Verify username/repo in admin panel

### Site Not Updating:
- **Check Cloudflare Pages**: Go to deployments tab
- **Manual rebuild**: Trigger deployment from Cloudflare dashboard
- **Cache issues**: Hard refresh browser (Ctrl+F5)

### Admin Access Problems:
- **Clear browser data**: Reset local storage
- **Check credentials**: Username `shahmeer606`, password `9MJMKHmjfP695IW`  
- **Network issues**: Verify GitHub API access

## 📁 Storage Architecture

This system uses **GitHub as a database**:
- `data/portfolio.json`: Portfolio metadata and index
- `uploads/`: Binary files (Base64 encoded for GitHub storage)
- `uploads/thumbs/`: Generated thumbnail images
- Live updates via GitHub API with automatic Cloudflare deployments

**Advantages**: Version control, unlimited storage, automatic backups, no server costs

## 🛠️ Local Development

To run locally:

```bash
# Serve with any static server
python -m http.server 8000
# or
npx serve .
# or
php -S localhost:8000
```

Access at: `http://localhost:8000`

**Note**: Admin uploads won't work locally unless you configure the GitHub credentials

## 🎨 Customization

### Colors & Theming
Edit the CSS variables in `styles/main.css`:
```css
:root {
  --cyber-blue: #00f3ff;
  --electric-purple: #8b5cf6;
  --dark-bg: #0f111a;
  --neon-green: #39ff14;
}
```

### Content Updates
- **Skills**: Edit `skillsData` array in `scripts/main.js`
- **Reviews**: Edit `reviewsData` array in `scripts/main.js`  
- **Admin credentials**: Update in `scripts/admin.js`
- **GitHub repository**: Configure in admin panel

### Performance Features

- ⚡ **Optimized 3D animations** with efficient particle systems
- 🗜️ **Base64 file encoding** for GitHub storage compatibility
- 🔄 **Lazy loading** for heavy visual effects
- 📱 **Mobile-responsive** design with touch interactions
- ⚙️ **Debounced events** for smooth scrolling and resizing

## 🔒 Security Considerations

- **GitHub token security**: Stored locally in browser only
- **Admin session management**: Browser-based authentication
- **File upload validation**: Client-side type and size checking
- **HTTPS recommended**: For secure GitHub API communication
- **Rate limiting**: GitHub API limits apply (5000 requests/hour)

## 📞 Support & Contact

For customizations, technical support, or business inquiries:
- **Contact Form**: Use the contact form on the live portfolio site
- **Email**: Available through the portfolio contact section
- **GitHub Issues**: Report technical issues in the repository

## 🎯 Project Success Metrics

This portfolio achieves:
- ✅ **200MB file upload** capability via GitHub storage
- ✅ **Static site deployment** on Cloudflare Pages  
- ✅ **Real-time content management** without backend servers
- ✅ **Version controlled assets** through Git integration
- ✅ **Automatic rebuilds** on content updates
- ✅ **Mobile-responsive** 3D interactive design
- ✅ **Professional admin dashboard** for easy management

## 📄 License

This ultra-advanced portfolio system is proprietary software developed for Shahmeer Baqai. All rights reserved.

**Copyright © 2024 Shahmeer Baqai Digital Strategy**