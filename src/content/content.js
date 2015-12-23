$(document.body).append(
	"<script src='" + chrome.extension.getURL("src/content/inject_util.js") + "'></script>" +
	"<script src='" + chrome.extension.getURL("src/content/inject.js") + "'></script>"
);

$(function() {
	var scrollOffset = 0;

	window.addEventListener("message", function(event) {
		if (event.source != window || event.type != "message")
			return;

		if (event.data.type == "from_inject") {
			if (event.data.id == "page_loaded") {
				insertLightboxImages();
			} else if (event.data.id == "lightbox_image_validated") {
				if (lightbox.isOpen == false)
					return;
				
				lightbox.album[event.data.index].link = event.data.href;
			}
		} else if (event.data.type == "from_content") {
			if (event.data.id == "lightbox_opened") {
				var image = $("a[data-lightbox='wee-image'][href='" + event.data.href + "']").eq(0).parents("figure.thumb");

				// save the current scroll offset
				scrollOffset = $(window).scrollTop() - image.offset().top;				
			} else if (event.data.id == "lightbox_scrolled") {
				var image = $("a[data-lightbox='wee-image'][href='" + event.data.href + "']").eq(0).parents("figure.thumb");

				// // when the window isn't scrolled, don't allow upwards or downwards movement of the lightbox
				// if ($(window).scrollTop() !== 0 || (newIndex > oldIndex && image.offset().top > offsetHeight)) {
				// 	// move the lightbox down the page by the pixel difference (vertically) between the 2 images
				// 	// so that it doesn't get scrolled off the top (since it is static by default)
				//  	var oldImage = $("a[data-lightbox='wee-image'][href='" + lightbox.album[oldIndex].link + "']").eq(0).parents("figure.thumb"); 

				//  	$("#lightbox").css("top", "+=" + (image.offset().top - oldImage.offset().top)); 
				// }

				// scroll the page to be in line with the image we are showing in the lightbox
				$(window).scrollTop(image.offset().top + scrollOffset); 

				$("#lightbox").css("top", ($(window).scrollTop() + lightbox.options.positionFromTop) + "px");		
			}
		}
	});


	// push the images that have just ajax-loaded into the current slideshow
	insertLightboxImages = function() {
		if (lightbox.isOpen == false)
			return;

		var pages = $(".thumb-listing-page");

		// some pages don't show the thumbs as pages (e.g. http://alpha.wallhaven.cc/tag/61)
		if (!pages.length) {
			pages = $(".thumb-listing");
		}

		pages.each(function(i) {
			// only want the last page (the one that was just loaded)
			if (i < pages.length - 1)
				return;
			
			$(this).find("a[data-lightbox]").each(function(i) {
				lightbox.album.push({
					link: $(this).attr("href"),
			 		title: $(this).attr("data-title")
			    });
			})
		});
	}
});


