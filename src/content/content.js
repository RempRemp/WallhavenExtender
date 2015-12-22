$(document.body).append("<script src='" + chrome.extension.getURL("src/content/inject.js") + "'></script>");

// chrome.runtime.onMessage.addListener(
// 	function(request, sender, sendResponse) {
// 		//console.log(sender.tab ?
// 		//	"from a content script:" + sender.tab.url :
// 		//	"from the extension");

// 		sendResponse({id: request.filename});
// });