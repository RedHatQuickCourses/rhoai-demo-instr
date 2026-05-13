const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Progress Tracker Installation...\n');

// Get the directory where this script is located (progress-tracker-setup)
const SETUP_DIR = __dirname;
// Target directory is where the user invoked the script from
const TARGET_DIR = process.cwd();

// File mappings: source (in setup) -> destination (in project)
const FILE_MAPPINGS = {
  // Core progress tracker files
  'supplemental-ui/js/progress-tracker.js': 'supplemental-ui/js/progress-tracker.js',
  'supplemental-ui/css/progress-tracker.css': 'supplemental-ui/css/progress-tracker.css',

  // Vendor JavaScript files
  'supplemental-ui/js/vendor/tabs.js': 'supplemental-ui/js/vendor/tabs.js',
  'supplemental-ui/js/vendor/reading-time.js': 'supplemental-ui/js/vendor/reading-time.js',

  // Vendor CSS files
  'supplemental-ui/css/vendor/tabs.css': 'supplemental-ui/css/vendor/tabs.css',
  'supplemental-ui/css/vendor/collapsible.css': 'supplemental-ui/css/vendor/collapsible.css',
  'supplemental-ui/css/vendor/reading-time.css': 'supplemental-ui/css/vendor/reading-time.css',

  // Handlebars partials
  'supplemental-ui/partials/nav-tree.hbs': 'supplemental-ui/partials/nav-tree.hbs',
  'supplemental-ui/partials/head-styles.hbs': 'supplemental-ui/partials/head-styles.hbs',
  'supplemental-ui/partials/footer-scripts.hbs': 'supplemental-ui/partials/footer-scripts.hbs',
  'supplemental-ui/partials/header-content.hbs': 'supplemental-ui/partials/header-content.hbs',
};

/**
 * Get repository name from git remote
 */
function getRepositoryName() {
  try {
    const remoteUrl = execSync('git remote get-url origin', {
      cwd: TARGET_DIR,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();

    // Extract repo name from: https://github.com/RedHatQuickCourses/rhoai3-validate.git
    // or git@github.com:RedHatQuickCourses/rhoai3-validate.git
    const match = remoteUrl.match(/\/([^\/]+?)(\.git)?$/);
    return match ? match[1].replace('.git', '') : null;
  } catch (e) {
    return null;
  }
}

/**
 * Replace repository name placeholder in content
 */
function replaceRepoPlaceholder(content, repoName) {
  return content.replace(/REPLACEREPONAME/g, repoName || 'REPLACEREPONAME');
}

/**
 * Ensure a directory exists
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Copy a file from source to destination
 * If it's header-content.hbs and repoName is provided, replace REPLACEREPONAME placeholder
 */
function copyFile(srcRelative, destRelative, repoName) {
  const src = path.join(SETUP_DIR, srcRelative);
  const dest = path.join(TARGET_DIR, destRelative);

  if (!fs.existsSync(src)) {
    console.warn(`⚠️  Source file not found: ${srcRelative}`);
    return false;
  }

  // Ensure destination directory exists
  ensureDir(path.dirname(dest));

  // Special handling for header-content.hbs: replace repository placeholder
  if (destRelative.includes('header-content.hbs') && repoName) {
    const content = fs.readFileSync(src, 'utf8');
    const processed = replaceRepoPlaceholder(content, repoName);
    fs.writeFileSync(dest, processed, 'utf8');
    console.log(`✅ Copied and processed: ${destRelative} (repo: ${repoName})`);
  } else {
    // Regular file copy
    fs.copyFileSync(src, dest);
    console.log(`✅ Copied: ${destRelative}`);
  }

  return true;
}

/**
 * Update antora-playbook.yml to include supplemental_files
 */
function updatePlaybook() {
  const playbookPath = path.join(TARGET_DIR, 'antora-playbook.yml');

  if (!fs.existsSync(playbookPath)) {
    console.warn('⚠️  antora-playbook.yml not found.');
    return;
  }

  let content = fs.readFileSync(playbookPath, 'utf8');
  let modified = false;

  // 1. Ensure supplemental_files is set
  if (!content.includes('supplemental_files:')) {
    content = content.replace(/ui:/, 'ui:\n    supplemental_files: ./supplemental-ui');
    modified = true;
    console.log('✅ Added supplemental_files to ui configuration');
  }

  // 2. Alert/Fix for site.url which is critical for GH Pages URL generation
  if (!content.includes('url:')) {
    console.warn('❗ CRITICAL: "site.url" is missing in antora-playbook.yml.');
    console.warn('   For GitHub Pages, this should be: https://redhatquickcourses.github.io/repo-name');
  }

  if (modified) {
    fs.writeFileSync(playbookPath, content);
  }
}

/**
 * Main installation process
 */
function install() {
  // Detect repository name from git remote
  const repoName = getRepositoryName();
  if (repoName) {
    console.log(`📦 Detected repository: ${repoName}\n`);
  } else {
    console.warn('⚠️  Could not detect repository name from git remote');
    console.warn('    The "Report Issues" link will need manual configuration\n');
  }

  console.log('📁 Copying progress tracker files...\n');

  let successCount = 0;
  let failCount = 0;

  // Copy all files (with repository name replacement for header-content.hbs)
  Object.entries(FILE_MAPPINGS).forEach(([src, dest]) => {
    if (copyFile(src, dest, repoName)) {
      successCount++;
    } else {
      failCount++;
    }
  });

  console.log(`\n📝 Updating configuration...\n`);
  updatePlaybook();

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Installation complete!`);
  console.log(`   ${successCount} files copied successfully`);
  if (failCount > 0) {
    console.log(`   ⚠️  ${failCount} files failed to copy`);
  }
  console.log('='.repeat(60));

  console.log('\n📋 Next steps:');
  console.log('   1. Rebuild your Antora site: npm run build');
  console.log('   2. Serve locally to test: npm run serve');
  console.log('   3. Navigate through pages to see progress checkmarks (✓)');
  console.log('   4. Progress is saved in browser localStorage');
  console.log('\n💡 To reset progress, run in browser console:');
  console.log('   clearCourseProgress()');
  console.log('');
}

// Run installation
try {
  install();
} catch (error) {
  console.error('❌ Installation failed:', error.message);
  process.exit(1);
}
