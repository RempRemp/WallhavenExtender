// $(document.body).append(
// 	"<script src='" + chrome.extension.getURL("src/util.js") + "'></script>" +
// 	"<script src='" + chrome.extension.getURL("src/inject_common.js") + "'></script>" +
// 	"<script src='" + chrome.extension.getURL("src/inject.js") + "'></script>" +
// 	"<script src='" + chrome.extension.getURL("src/inject_lightbox.js") + "'></script>"
// );

(function() {
	var injectScript = function(path) {
		var script = document.createElement("script");
		script.src = chrome.extension.getURL(path);
		// wait for everything to load before we start doing things in our injected scripts
		// otherwise they can load out of order and error when trying to call other parts that don't yet exist
		script.onload = function() { 
			window.weeLoadCount = (window.weeLoadCount || 0) + 1; 
			if (window.weeLoadCount === 4) { 
				window.postMessage({ 
					type: "from_content", 
					id: "inject_loaded"
				}, "*");
			}
		}
		document.body.appendChild(script);	
	}

	injectScript("src/util.js");
	injectScript("src/inject_common.js");
	injectScript("src/inject.js");
	injectScript("src/inject_lightbox.js");
})();

$(function() {
	var $body = $("body");
	var $window = $(window);
	var scrollOffset = 0;

	window.addEventListener("message", function(event) {
		if (event.source != window || event.type != "message")
			return;

		if (event.data.type == "from_inject") {
			if (event.data.id == "lightbox_image_validated") {
				lightboxImageValidated(event.data);
			} else if (event.data.id === "download_image") {
				chrome.runtime.sendMessage({
					id: "download_image", 
					url: weeUtil.buildWallpaperDirectUrl(event.data.wallId) + "." + (event.data.extension === "png" ? "png" : "jpg")
				});
			}
		} else if (event.data.type == "from_content") {
			if (event.data.id == "lightbox_opened") {
				lightboxOpened(event.data);
			} else if (event.data.id == "lightbox_scrolled") {
				lightboxScrolled(event.data);
			}
		}
	});

	var lightboxOpened = function(data) {
		var image = $("a[data-lightbox='wee-image'][href='" + data.href + "']").eq(0).parents("figure.thumb");

		if (!image.length)
			image = $("a[data-lightbox='wee-image'][href='" + weeUtil.swapFileType(data.href) + "']").eq(0).parents("figure.thumb");

		// save the current scroll offset
		scrollOffset = $(window).scrollTop() - image.offset().top;				
	}

	var lightboxScrolled = function(data) {
		var image = $("a[data-lightbox='wee-image'][href='" + data.href + "']").eq(0).parents("figure.thumb");

		if (!image.length)
			image = $("a[data-lightbox='wee-image'][href='" + weeUtil.swapFileType(data.href) + "']").eq(0).parents("figure.thumb");

		if (!image.length) {
			console.log("lightbox scroll cannot find image " + data.href);
			return;
		}

		// temporarily enable scrolling
		$body.removeClass("lb-disable-scrolling");

		// scroll the page to be in line with the image we are showing in the lightbox
		// this (handily) forces the page to load in new thumbnail pages as we scroll down
		$window.scrollTop(image.offset().top + scrollOffset); 

		$body.addClass("lb-disable-scrolling");

		// move the lightbox back to the correct central position in the window
		wee.$lightbox.css("top", ($window.scrollTop() + lightbox.options.positionFromTop) + "px");			
	}

	// this is done in the content scripts becuse injected scripts don't have access to the lightbox global object
	var lightboxImageValidated = function(data) {
		if (lightbox.isOpen === false)
			return;

		// update the lightbox image url now that the file type has been validated
		// if it has been validated as jpg don't do anything (since that is the default)
		if (data.correctType === "png") {					
			var i = wee.albumIndexOf(data.href);

			if (i !== -1)
				lightbox.album[i].link = data.href;
			else
				console.log("could not find " + data.href + " in album");
		}
	}
});


