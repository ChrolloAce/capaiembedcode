// This file would be bundled with a tool like webpack, rollup, or parcel
// For demonstration purposes, this is a simplified version

import AccessCodeWidget from './AccessCodeWidget.js';

// Export to window for direct script tag usage
window.AccessCodeWidget = AccessCodeWidget;

// Auto-initialize all widgets on the page
document.addEventListener('DOMContentLoaded', () => {
  // The widget is already defined by this point
  console.log('Access code widget loaded and ready to use!');
}); 