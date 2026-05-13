;(function () {
  'use strict'

  // Improved course detection for "Double Repo" GH Pages (e.g., /repo-name/repo-name/)
  // We filter out empty strings and look for the unique course identifier
  var pathSegments = window.location.pathname.split('/').filter(Boolean);
  
  // Logic: If the first and second segments are identical (Double Repo), use that. 
  // Otherwise, use the first segment (Local/Standard).
  var courseSlug = (pathSegments[0] === pathSegments[1]) ? pathSegments[0] : (pathSegments[0] || 'default');
  var STORAGE_KEY = 'antora-course-progress-' + courseSlug;

  function normalizeUrl(url) {
    if (!url) return '';
    // 1. Convert to absolute path if it's a full URL
    var path = url;
    try {
      if (url.indexOf('://') > -1) {
        path = new URL(url).pathname;
      }
    } catch (e) {}

    // 2. Remove hash, query params, and trailing slashes
    var normalized = path.split('#')[0].split('?')[0].replace(/\/$/, '');

    // 3. GitHub Pages Fix: If the path starts with the courseSlug twice, 
    // we normalize it to match Antora's internal relative paths.
    var doublePrefix = '/' + courseSlug + '/' + courseSlug;
    if (normalized.startsWith(doublePrefix)) {
      normalized = normalized.replace('/' + courseSlug, '');
    }
    
    return normalized;
  }

  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch (e) {
      return []
    }
  }

  function markCurrentPageVisited() {
    var currentUrl = normalizeUrl(window.location.pathname)
    var progress = getProgress()
    if (progress.indexOf(currentUrl) === -1) {
      progress.push(currentUrl)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    }
  }

  function updateNavigationMarks() {
    var progress = getProgress()
    // Select all links with the progress-path attribute defined in nav-tree.hbs
    document.querySelectorAll('[data-progress-path]').forEach(function (link) {
      var linkUrl = normalizeUrl(link.getAttribute('data-progress-path'));
      var mark = link.querySelector('.nav-progress-mark');
      
      if (mark && progress.indexOf(linkUrl) !== -1) {
        mark.style.display = 'inline';
      }
    });
  }

  function init() {
    markCurrentPageVisited()
    updateNavigationMarks()
  }

  window.clearCourseProgress = function() {
    localStorage.removeItem(STORAGE_KEY)
    location.reload()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()