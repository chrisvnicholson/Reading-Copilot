const currentAnnotationTextDiv = document.getElementById('current-annotation-text');
const currentAnnotationUrlDiv = document.getElementById('current-annotation-url');
const chatHistoryDiv = document.getElementById('chat-history');
const chatInput = document.getElementById('chat-input');
const sendChatButton = document.getElementById('send-chat-button');

let currentSnippet = "";
let currentPageUrl = "";

// Listen for messages from the content script via window.postMessage
window.addEventListener('message', (event) => {
  if (event.data.type === "DISPLAY_ANNOTATION") {
    currentSnippet = event.data.text;
    currentPageUrl = event.data.url;
    currentAnnotationTextDiv.textContent = currentSnippet || "Select text on the page...";
    currentAnnotationUrlDiv.textContent = currentPageUrl ? `Source: ${currentPageUrl}` : "";
    // Save the annotation
    saveAnnotation(currentSnippet, currentPageUrl);
    // Clear previous chat history for new annotation
    chatHistoryDiv.innerHTML = '';
  }
});

// Also keep the chrome.runtime.onMessage listener for backwards compatibility
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "displayAnnotation") {
    currentSnippet = request.text;
    currentPageUrl = request.url;
    currentAnnotationTextDiv.textContent = currentSnippet || "Select text on the page...";
    currentAnnotationUrlDiv.textContent = currentPageUrl ? `Source: ${currentPageUrl}` : "";
    saveAnnotation(currentSnippet, currentPageUrl);
    chatHistoryDiv.innerHTML = '';
  }
});

sendChatButton.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Prevent new line
        sendChatMessage();
    }
});

function sendChatMessage() {
  const userPrompt = chatInput.value.trim();
  if (!userPrompt || !currentSnippet) {
    alert("Please select text on the page to annotate and then type your question.");
    return;
  }

  appendMessage(userPrompt, 'user-message');
  chatInput.value = ''; // Clear input

  // Send to background script to call LLM
  chrome.runtime.sendMessage(
    {
      action: "callLLM",
      snippet: currentSnippet,
      prompt: userPrompt,
      pageUrl: currentPageUrl
    },
    (response) => {
      if (chrome.runtime.lastError) {
        appendMessage(`Error: ${chrome.runtime.lastError.message}`, 'llm-message');
        return;
      }
      if (response && response.success) {
        // Assuming response.data.reply is where the LLM text is
        appendMessage(response.data.reply || "No response from LLM.", 'llm-message');
      } else {
        appendMessage(`LLM Error: ${response.error || 'Unknown error'}`, 'llm-message');
      }
    }
  );
}

function appendMessage(text, className) {
  const messageDiv = document.createElement('div');
  if (className === 'llm-message') {
    messageDiv.innerHTML = text; // <--- Use innerHTML to render HTML from LLM
  } else {
    messageDiv.textContent = text; // User messages are plain text
  }
  messageDiv.className = className;
  chatHistoryDiv.appendChild(messageDiv);
  chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight; // Scroll to bottom
}

function saveAnnotation(text, url) {
  if (!text || !url) return;
  const annotation = { text, url, timestamp: new Date().toISOString() };
  chrome.storage.local.get({ annotations: [] }, (result) => {
    const annotations = result.annotations;
    annotations.push(annotation);
    chrome.storage.local.set({ annotations }, () => {
      console.log("Annotation saved:", annotation);
    });
  });
}
