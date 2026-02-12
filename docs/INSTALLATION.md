# Installation Guide

## For End Users

### Install from Chrome Web Store (Recommended)

*Coming soon - Extension pending review*

1. Visit [TabFlow on Chrome Web Store](https://chrome.google.com/webstore)
2. Click "Add to Chrome"
3. Confirm permissions
4. Open a new tab and start using TabFlow!

### Manual Installation (Development)

For developers or early testers:

1. **Download the extension**
```bash
git clone https://github.com/hasnainakber9/tabflow-startup.git
cd tabflow-startup/extension
```

2. **Open Chrome Extensions**
- Navigate to `chrome://extensions/`
- Or: Menu (three dots) → More tools → Extensions

3. **Enable Developer Mode**
- Toggle "Developer mode" in the top-right corner

4. **Load the extension**
- Click "Load unpacked"
- Select the `extension` folder from the cloned repository

5. **Verify installation**
- You should see TabFlow in your extensions list
- The icon should appear in your toolbar
- Open a new tab to see the TabFlow interface

## For Developers

### Prerequisites

- Node.js 18+ (for backend API)
- MongoDB (local or Atlas)
- Chrome Browser (version 88+)

### Extension Development Setup

1. **Clone repository**
```bash
git clone https://github.com/hasnainakber9/tabflow-startup.git
cd tabflow-startup
```

2. **Extension structure**
```
extension/
├── manifest.json          # Extension configuration
├── newtab/                # New tab page
│   ├── newtab.html
│   ├── newtab.js
│   └── styles.css
├── popup/                 # Extension popup
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── background/            # Background service worker
│   └── service-worker.js
└── icons/                 # Extension icons
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

3. **Load in Chrome**
- Follow manual installation steps above

4. **Make changes**
- Edit files in the `extension` folder
- Click the refresh icon in `chrome://extensions/` to reload
- Open new tab to see changes

### Backend API Setup

1. **Install dependencies**
```bash
cd api
npm install
```

2. **Environment configuration**

Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/tabflow
JWT_SECRET=your-super-secret-jwt-key-change-this
NEXT_PUBLIC_API_URL=http://localhost:3000
```

3. **Start MongoDB**

**Local MongoDB:**
```bash
mongod --dbpath /path/to/data
```

**Or use MongoDB Atlas:**
- Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
- Get connection string
- Update `MONGODB_URI` in `.env`

4. **Run development server**
```bash
npm run dev
```

API available at `http://localhost:3000/api`

5. **Test API endpoints**
```bash
# Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login  
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Deploy Backend to Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
cd api
vercel deploy --prod
```

4. **Configure environment variables**
- Go to Vercel dashboard
- Add `MONGODB_URI` and `JWT_SECRET`
- Redeploy if needed

5. **Update extension**
- Change `API_URL` in `extension/newtab/newtab.js`
- Change `API_URL` in `extension/background/service-worker.js`
- Reload extension

## Troubleshooting

### Extension not loading

**Issue**: Extension doesn't appear after loading

**Solution**:
- Check manifest.json is valid JSON
- Ensure all file paths are correct
- Check Chrome console for errors (`chrome://extensions/` → Errors)

### New tab not overriding

**Issue**: TabFlow doesn't appear on new tab

**Solution**:
- Only one extension can override new tab
- Disable other new tab extensions
- Reload TabFlow extension

### API connection failed

**Issue**: Cloud sync not working

**Solution**:
- Check API URL in extension code
- Verify backend is running
- Check browser console for CORS errors
- Ensure `host_permissions` in manifest.json includes API URL

### MongoDB connection error

**Issue**: Backend can't connect to database

**Solution**:
- Verify MongoDB is running
- Check `MONGODB_URI` in `.env`
- For Atlas, whitelist your IP address
- Check firewall settings

## Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 88+ | ✅ Fully Supported |
| Edge | 88+ | 🚧 Coming Soon |
| Firefox | 90+ | 🚧 Planned |
| Safari | - | ❌ Not Supported |
| Brave | 88+ | ✅ Fully Supported |

## Permissions Explained

TabFlow requests the following permissions:

- **storage**: Save intents and settings locally
- **tabs**: Detect new tabs and associate with intents
- **tabGroups**: Create color-coded tab groups
- **notifications**: Show completion reminders
- **alarms**: Check for abandoned tabs
- **identity**: (Optional) OAuth for cloud sync

## Need Help?

- 💬 [Discord Community](https://discord.gg/tabflow)
- 📧 Email: support@tabflow.app
- 🐛 [GitHub Issues](https://github.com/hasnainakber9/tabflow-startup/issues)

---

Back to [README](../README.md)