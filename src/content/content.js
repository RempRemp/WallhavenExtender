$(document.body).append(
	"<script src='" + chrome.extension.getURL("src/content/inject_util.js") + "'></script>" +
	"<script src='" + chrome.extension.getURL("src/content/inject.js") + "'></script>"
);

$(function() {
	var $body = $("body");
	var $window = $(window);
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

				//console.log("validated " + event.data.href + " (from " + lightbox.album[event.data.index].link + ")");

				lightbox.album[event.data.index].link = event.data.href;
			}
		} else if (event.data.type == "from_content") {
			if (event.data.id == "lightbox_opened") {
				var image = $("a[data-lightbox='wee-image'][href='" + event.data.href + "']").eq(0).parents("figure.thumb");

				// save the current scroll offset
				scrollOffset = $(window).scrollTop() - image.offset().top;				
			} else if (event.data.id == "lightbox_scrolled") {
				var image = $("a[data-lightbox='wee-image'][href='" + event.data.href + "']").eq(0).parents("figure.thumb");

				// temporarily enable scrolling
				$body.removeClass("lb-disable-scrolling");

				// scroll the page to be in line with the image we are showing in the lightbox
				$window.scrollTop(image.offset().top + scrollOffset); 

				$body.addClass("lb-disable-scrolling");

				//console.log("top: " + image.offset().top + " + " + scrollOffset + " + " + lightbox.options.positionFromTop + " = " + (image.offset().top + scrollOffset + lightbox.options.positionFromTop) + " (" + $window.scrollTop() + ")");
				$("#lightbox").css("top", (image.offset().top + scrollOffset + lightbox.options.positionFromTop) + "px");	
			}
		}
	});

	// push the images that have just ajax-loaded into the current slideshow
	insertLightboxImages = function() {
		if (lightbox.isOpen == false)
			return;

		$(wee.pageSelector).each(function(i) {
			// only want the last page (the one that was just loaded)
			if (i < $(wee.pageSelector).length - 1)
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


