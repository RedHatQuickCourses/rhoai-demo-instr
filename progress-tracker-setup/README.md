# Progress Tracker for Antora Quick Courses

**Version 1.2** - A lightweight, client-side progress tracking system for Antora-based documentation sites. Shows checkmarks (✓) next to visited pages in the navigation sidebar.

## Features

- ✅ Visual progress indicators (green checkmarks) in navigation
- 💾 Persistent progress tracking via browser localStorage
- 📱 Works across sessions and browser restarts
- ⏱️ Includes reading time estimates for each page
- 🎨 Tab and collapsible section support
- 🔄 Easy reset functionality
- 🌐 **NEW in v1.1:** GitHub Pages compatibility with automatic URL path handling
- 🤖 **NEW in v1.1:** Automatic repository detection and configuration

## Changelog

### Version 1.2 (Current)
- ✅ **Course-scoped localStorage**: Each course now has isolated progress tracking (fixes shared progress bug across multiple courses)
- ✅ **Auto-detects course name**: Uses URL path structure to determine course ID automatically
- 🐛 **Bug fix**: Progress no longer shared across all courses on same GitHub Pages organization

### Version 1.1
- ✅ **Fixed GitHub Pages URL matching**: Progress tracker now correctly handles GitHub Pages URL structures (`/repo-name/component/version/page.html`)
- ✅ **Auto-detect repository name**: Installation script automatically detects repository name from git remote and configures "Report Issues" link
- ✅ **Added header-content.hbs**: Custom header template now included in installation
- 🐛 **Bug fix**: Resolved issue where checkmarks wouldn't appear on GitHub Pages deployments

### Version 1.0 (Initial Release)
- Initial progress tracking implementation
- Local development support
- Basic URL normalization

## Installation

### Step 1: Copy to Your Repository

Copy the entire `progress-tracker-setup` directory into your Antora quickcourse repository.

```bash
# If receiving as a zip file
unzip progress-tracker-setup.zip
mv progress-tracker-setup /path/to/your/course-repo/

# Or copy from another repo
cp -r progress-tracker-setup /path/to/your/course-repo/
```

### Step 2: Run Installation Script

```bash
cd /path/to/your/course-repo
node progress-tracker-setup/enable-tracker.js
```

The script will:
- Auto-detect your repository name from git remote
- Copy all necessary JavaScript and CSS files to `supplemental-ui/`
- Copy Handlebars templates for navigation and page rendering
- Configure the "Report Issues" link with your repository
- Update `antora-playbook.yml` to include supplemental files

### Step 3: Rebuild Your Site

```bash
npm run build
```

### Step 4: Test Locally

```bash
npm run serve
```

Open your browser to the local server (usually http://localhost:8080 or http://localhost:8081) and:
1. Navigate through several course pages
2. Look for green checkmarks (✓) appearing next to visited pages in the sidebar
3. Close and reopen your browser to verify progress persists

## What Gets Installed

### Core Files
- `supplemental-ui/js/progress-tracker.js` - Progress tracking logic
- `supplemental-ui/css/progress-tracker.css` - Checkmark styling

### Vendor Files
- `supplemental-ui/js/vendor/tabs.js` - Tab functionality
- `supplemental-ui/js/vendor/reading-time.js` - Reading time calculator
- `supplemental-ui/css/vendor/tabs.css` - Tab styles
- `supplemental-ui/css/vendor/collapsible.css` - Collapsible section styles
- `supplemental-ui/css/vendor/reading-time.css` - Reading time display styles

### Handlebars Templates
- `supplemental-ui/partials/nav-tree.hbs` - Navigation with progress tracking
- `supplemental-ui/partials/head-styles.hbs` - CSS loading
- `supplemental-ui/partials/footer-scripts.hbs` - JavaScript loading
- `supplemental-ui/partials/header-content.hbs` - Custom header with "Report Issues" link

## Usage

### For Learners

Once installed, the progress tracker works automatically:

1. **View Progress**: Green checkmarks (✓) appear next to pages you've visited
2. **Track Reading Time**: Each page shows estimated reading time below the title
3. **Persist Progress**: Your progress is saved even if you close the browser

### Reset Progress

To clear all progress and start fresh, open the browser console and run:

```javascript
clearCourseProgress()
```

## Technical Details

### Storage

Progress is stored in browser `localStorage` with the key `antora-course-progress` as a JSON array of visited page URLs.

### URL Normalization

URLs are normalized (hash fragments, query strings, and trailing slashes removed) to ensure consistent tracking across navigation methods.

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
- IE11+ with graceful degradation
- Mobile browsers (iOS Safari, Chrome Mobile)

### Requirements

- Antora 3.x documentation project
- Node.js (to run installation script)
- Existing `antora-playbook.yml` file

## Troubleshooting

### Checkmarks don't appear

1. Check browser console for JavaScript errors
2. Verify `data-progress-path` attributes exist on nav links:
   - Open browser DevTools → Elements
   - Inspect a navigation link
   - Look for `data-progress-path="/path/to/page.html"`

3. Verify localStorage is working:
   ```javascript
   localStorage.getItem('antora-course-progress')
   ```
   Should return a JSON array like `["\/course\/1\/index.html", ...]`

### Styling is broken

1. Verify `supplemental-ui/partials/head-styles.hbs` includes:
   ```handlebars
   <link rel="stylesheet" href="{{{uiRootPath}}}/css/site.css">
   ```

2. Check that all CSS files were copied:
   ```bash
   ls -la supplemental-ui/css/
   ls -la supplemental-ui/css/vendor/
   ```

### Progress doesn't persist

1. Check if localStorage is enabled in your browser
2. Verify you're not in private/incognito mode (localStorage is cleared on close)
3. Check browser console for localStorage errors

## Customization

### Change Checkmark Color

Edit `supplemental-ui/css/progress-tracker.css`:

```css
.nav-progress-mark {
  color: #00a86b;  /* Change this color */
}
```

### Change Checkmark Symbol

Edit `supplemental-ui/partials/nav-tree.hbs`, line 14:

```handlebars
<span class="nav-progress-mark" aria-hidden="true">✓</span>
<!-- Change ✓ to ✔, ●, or any symbol you prefer -->
```

### Adjust Reading Time Speed

Edit `supplemental-ui/js/vendor/reading-time.js`, line 4:

```javascript
var WPM = 200  // Words per minute, adjust as needed
```

## Uninstallation

To remove the progress tracker:

1. Delete the `supplemental-ui/` directory (if not using other supplemental files)
2. Remove `supplemental_files: ./supplemental-ui` from `antora-playbook.yml`
3. Rebuild: `npm run build`

## License

MIT License - Free to use and modify for your courses.

## Support

For issues or questions:
- Check this README first
- Review browser console for errors
- Verify all files were copied correctly during installation

## Version

v1.0 - Initial release
