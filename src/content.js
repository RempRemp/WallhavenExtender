(function() {
	wexCommon.injectScripts(["src/util.js", "src/inject.common.js", "src/inject.js", "src/inject.lightbox.js"], function() {
		wexUtil.postMessage("content.injectLoaded");
	});
})();

wexCommon.ready(function() {
	var scrollOffset = 0;

	wexUtil.onMessage("inject.downloadImage", function(data) {
		chrome.runtime.sendMessage({
			id: "download_image", 
			url: wexUtil.buildWallpaperDirectUrl(data.wallId) + "." + (data.extension === "png" ? "png" : "jpg")
		});
	});

	wexUtil.onMessage("content.lightboxOpened", function(data) {
		// save the current page scroll offset (from the selected thumbnail) so we can maintain it as we auto-scroll down the page
		var figure = document.querySelector("a.wex-download-link[href='" + data.url + "']").closest("figure.thumb");

		var rect = figure.getBoundingClientRect();

		// {
		// top: rect.top + document.body.scrollTop,
		// left: rect.left + document.body.scrollLeft
		// }
		//scrollOffset = $(window).scrollTop() - image.offset().top;	
		scrollOffset = window.scrollY - rect.top;
	});

	wexUtil.onMessage("content.lightboxUpdated", function(data) {
		if (wexUtil.isForum)
			return;

		// each time the lightbox is changed (prev/next) we want to scroll the page to keep the currently visible thumbnail in our viewport
		var figure = document.querySelector("a.wex-download-link[href='" + data.url + "']").closest("figure.thumb");

		if (!figure) {
			console.log("lightbox scroll update cannot find image (" + data.url + ")");
			return;
		}

		// temporarily enable scrolling
		document.body.classList.remove("noscroll");

		//console.log("scrolled to: " + scrollOffset + " + " + (figure.getBoundingClientRect().top + window.scrollY) + " [" + figure.dataset.wallpaperId + "]");	
		// scroll the page to be in line with the image we are showing in the lightbox
		// this (handily) forces the page to load in new thumbnail pages as we scroll down
		window.scroll(0, (figure.getBoundingClientRect().top + window.scrollY) + scrollOffset); 
		
		document.body.classList.add("noscroll");

		// move the lightbox back to the correct central position in the window
		//wee.$lightbox.css("top", ($window.scrollTop() + lightbox.options.positionFromTop) + "px");			
	});
})