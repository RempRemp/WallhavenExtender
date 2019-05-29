// this only runs on wallhaven.cc/settings/browsing
// so update our local "mark as seen" data whenever this page is accessed
(function() {
	if (document.querySelector("#mark-seen-wallpapers").checked === true) {
		chrome.storage.local.set({
			"mark-as-seen": true
		});
	} else {
		chrome.storage.local.set({
			"mark-as-seen": false
		});
	}
})();