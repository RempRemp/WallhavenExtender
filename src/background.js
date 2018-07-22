chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.id == "download_image") {
			chrome.downloads.download({
				url: request.url
			});
		}
	}
);