// this only runs on alpha.wallhaven.cc/settings/browsing
// so update our local "mark as seen" data whenever this page is accessed
(function() {
	if ($("#mark_seen_wallpapers").prop("checked")) {
		chrome.storage.local.set({
			"mark-as-seen": true
		});
	} else {
		chrome.storage.local.set({
			"mark-as-seen": false
		});
	}
})();