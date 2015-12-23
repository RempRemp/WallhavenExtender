$(function() {
	$("#lightbox").on("scrolled.lightbox", function(event, newIndex, oldIndex) {
		if (typeof oldIndex === "undefined") {
			window.postMessage({ 
				type: "from_content", 
				id: "lightbox_opened",
				newIndex: newIndex,
				href: lightbox.album[newIndex].link
			}, '*');
		} else {
			window.postMessage({ 
				type: "from_content", 
				id: "lightbox_scrolled",
				newIndex: newIndex,
				oldIndex: oldIndex,
				href: lightbox.album[newIndex].link
			}, '*');
		}
	});
});