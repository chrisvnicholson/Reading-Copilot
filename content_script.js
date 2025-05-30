let sidebarIframe = null;

// Listen for messages from background script via window.postMessage
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  
  if (event.data.type === "TOGGLE_SIDEBAR") {
    toggleSidebar();
  } else if (event.data.type === "ENSURE_SIDEBAR_OPEN") {
    if (!sidebarIframe) {
      toggleSidebar();
    }
  } else if (event.data.type === "NEW_SELECTION") {
    // Forward selection to sidebar
    if (sidebarIframe) {
      sidebarIframe.contentWindow.postMessage({
        type: "DISPLAY_ANNOTATION",
        text: event.data.text,
        url: event.data.url
      }, "*");
    }
  }
});

// Also keep the chrome.runtime.onMessage listener for backwards compatibility
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleSidebar") {
    toggleSidebar();
  }
  if (request.action === "getSelectedText") {
    sendResponse({ text: window.getSelection().toString().trim() });
  }
});

function toggleSidebar() {
  if (sidebarIframe) {
    sidebarIframe.remove();
    sidebarIframe = null;
    return;
  }

  sidebarIframe = document.createElement('iframe');
  sidebarIframe.src = chrome.runtime.getURL('sidebar/sidebar.html');
  sidebarIframe.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 350px;
    height: 100%;
    border: 1px solid #ccc;
    z-index: 999999;
    background-color: white;
    box-shadow: -2px 0 5px rgba(0,0,0,0.1);
  `;
  
  // Ensure the iframe is added to the body
  if (document.body) {
    document.body.appendChild(sidebarIframe);
  } else {
    // If body doesn't exist yet, wait for it
    document.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(sidebarIframe);
    });
  }
}

// Send selected text to sidebar when text is selected (mouseup event)
document.addEventListener('mouseup', () => {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText && sidebarIframe) {
    sidebarIframe.contentWindow.postMessage({
      type: "DISPLAY_ANNOTATION",
      text: selectedText,
      url: window.location.href
    }, "*");
  }
});