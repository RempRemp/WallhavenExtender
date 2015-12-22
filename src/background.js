// chrome.downloads.onChanged.addListener(function(downloadDelta) {
// 	console.log(downloadDelta);

// 	if (downloadDelta.state.current === "interrupted" && downloadDelta.error.current === "SERVER_BAD_CONTENT") {
// 		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
// 			chrome.tabs.sendMessage(tabs[0].id, {filename: downloadDelta.filename.current}, function(response) {
// 				console.log(response.id);
// 			});
// 		});
// 	}
// })