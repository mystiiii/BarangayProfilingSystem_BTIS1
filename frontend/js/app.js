/**
 * Global Frontend Helper Script
 * Barangay Profiling System
 */

document.addEventListener('DOMContentLoaded', () => {
  highlightActiveMenu();
});

// Configure backend API endpoint based on environment or fallback
const API_BASE_URL = 'http://localhost:3000';

/**
 * Automatically sets the 'active' class on the sidebar links
 * matching the current page's URL path.
 */
function highlightActiveMenu() {
  const currentPath = window.location.pathname;
  const menuItems = document.querySelectorAll('.sidebar-item');

  menuItems.forEach(item => {
    const link = item.querySelector('a');
    if (link) {
      const href = link.getAttribute('href');
      // Matches pathnames e.g. "dashboard.html" or "/dashboard.html"
      if (currentPath.endsWith(href) || (currentPath === '/' && href === 'dashboard.html')) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    }
  });
}

/**
 * Reusable API request wrapper
 * @param {string} endpoint - API path (e.g., '/residents')
 * @param {object} options - Fetch options
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Request to ${url} failed:`, error);
    throw error;
  }
}
