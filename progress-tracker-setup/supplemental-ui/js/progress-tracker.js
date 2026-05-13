;(function () {
  'use strict'

  var STORAGE_KEY = 'antora-course-progress'

  function normalizeUrl(url) {
    // Remove hash, query params, trailing slashes
    return url.split('#')[0].split('?')[0].replace(/\/$/, '')
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
    document.querySelectorAll('[data-progress-path]').forEach(function (link) {
      // Extract pathname from the actual href to match what we store
      var linkUrl
      try {
        // Convert relative href to absolute URL, then extract pathname
        var absoluteUrl = new URL(link.href, window.location.origin)
        linkUrl = normalizeUrl(absoluteUrl.pathname)
      } catch (e) {
        // Fallback to data-progress-path if URL parsing fails
        linkUrl = normalizeUrl(link.getAttribute('data-progress-path'))
      }
      var mark = link.querySelector('.nav-progress-mark')
      if (mark && progress.indexOf(linkUrl) !== -1) {
        mark.style.display = 'inline'
      }
    })
  }

  function init() {
    markCurrentPageVisited()
    updateNavigationMarks()
  }

  // Global reset function for users
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