let sidebarOpen = false; // Start with false since sidebar isn't open by default

// Toggle sidebar when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      // Send message to content script to toggle sidebar
      window.postMessage({ type: "TOGGLE_SIDEBAR" }, "*");
    }
  });
});

// Context menu to send selected text to sidebar
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "annotateWithLLM",
    title: "Annotate & Discuss",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "annotateWithLLM" && info.selectionText) {
    // First ensure sidebar is open
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (selectionText, pageUrl) => {
        // Open sidebar if not open
        window.postMessage({ type: "ENSURE_SIDEBAR_OPEN" }, "*");
        
        // Send the selection after a brief delay to ensure sidebar is loaded
        setTimeout(() => {
          window.postMessage({ 
            type: "NEW_SELECTION", 
            text: selectionText,
            url: pageUrl
          }, "*");
        }, 300);
      },
      args: [info.selectionText.trim(), info.pageUrl]
    });
  }
});

// Listen for messages from sidebar (e.g., to call LLM backend)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "callLLM") {
    // Replace with your actual backend URL
    fetch('http://localhost:3000/api/chat-with-llm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        snippet: request.snippet,
        prompt: request.prompt,
        pageUrl: request.pageUrl
      }),
    })
    .then(response => response.json())
    .then(data => sendResponse({ success: true, data: data }))
    .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Indicates that the response is sent asynchronously
  }
});