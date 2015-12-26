var wee = (function() {
	// some pages don't show the thumbs as pages (e.g. http://alpha.wallhaven.cc/tag/61) so have a slightly different html structure
	var pageSelector = ".thumb-listing-page";

	if (!$(pageSelector).length)
		pageSelector = ".thumb-listing";

	lightbox.option({
		disableScrolling: true
	});
	
	$("#lightbox").on("scrolled.lightbox", function(event, newIndex, oldIndex) {
		if (oldIndex === undefined) {
			window.postMessage({ 
				type: "from_content", 
				id: "lightbox_opened",
				newIndex: newIndex,
				href: lightbox.album[newIndex].link
			}, "*");
		} else {
			window.postMessage({ 
				type: "from_content", 
				id: "lightbox_scrolled",
				newIndex: newIndex,
				oldIndex: oldIndex,
				href: lightbox.album[newIndex].link
			}, "*");
		}
	}).on("closed.lightbox", function(event, currentIndex) {
		window.postMessage({
			type: "from_content",
			id: "lightbox_closed",
			currentIndex: currentIndex,
			href: lightbox.album[currentIndex].link
		}, "*");
	});


	return {
		pageSelector: pageSelector
	}
})();