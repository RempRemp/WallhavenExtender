// this only runs on alpha.wallhaven.cc/settings/browsing
// so update our local "mark as seen" data whenever this page is accessed
(function() {
	if ($("#mark_seen_wallpapers").prop("checked")) {
		console.log("mark them as seen");
		chrome.storage.sync.set({
			"mark-as-seen": true
		});
	} else {
		console.log("don't mark them as seen");
		chrome.storage.sync.set({
			"mark-as-seen": false
		});
	}
})();