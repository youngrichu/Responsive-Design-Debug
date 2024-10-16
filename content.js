// This file can be left empty or removed from the manifest.json
// as we're no longer injecting content into the page

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "getPageContent") {
        sendResponse({content: document.documentElement.outerHTML});
    }
});
