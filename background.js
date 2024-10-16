chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, {action: "toggleExtension"});
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "error") {
    console.error('Error in Responsive Design Checker:', request.error);
  }
  if (request.action === "getPageContent") {
    chrome.tabs.get(request.tabId, (tab) => {
      if (chrome.runtime.lastError) {
        sendResponse({error: "Tab not found"});
        return;
      }
      chrome.scripting.executeScript({
        target: {tabId: request.tabId},
        function: () => document.documentElement.outerHTML
      }, (result) => {
        if (chrome.runtime.lastError) {
          sendResponse({error: chrome.runtime.lastError.message});
        } else {
          sendResponse({content: result[0].result});
        }
      });
    });
    return true; // Indicates that the response is sent asynchronously
  }
});
