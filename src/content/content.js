$(document.body).append(
	"<script src='" + chrome.extension.getURL("src/content/inject_util.js") + "'></script>" +
	"<script src='" + chrome.extension.getURL("src/content/inject.js") + "'></script>"
);


$(function() {
	window.addEventListener("message", function(event) {
		if (event.source != window || event.type != "message")
			return;

		console.log("content.js got message: ", event);

		// check event.type and event.data
		if (event.data.type == "from_inject") {
			if (event.data.id == "page_loaded") {
				//console.log(lightbox.album);
				InsertLightboxImages();
			}
		}
	});

	var scrollOffset = 0;

	lightbox.option({
      //disableScrolling: true,
      scrolled: function(newIndex, oldIndex) {
        var image = $("a[data-lightbox='wee-image'][href='" + lightbox.album[newIndex].link + "']").eq(0).parents("figure.thumb");
        
        // first image
      	if (typeof oldIndex === "undefined" || oldIndex === 0) {
      		// save the current scroll offset
      		scrollOffset = $(window).scrollTop() - image.offset().top;
      		console.log("offset: " + $(window).scrollTop() + " - " + image.offset().top + " = " + scrollOffset);
      	} else {
      		// move the lightbox down the page by the pixel difference (vertically) between the 2 images
      		// so that it doesn't get scrolled off the top
       	 	var oldImage = $("a[data-lightbox='wee-image'][href='" + lightbox.album[oldIndex].link + "']").eq(0).parents("figure.thumb"); 
       	 	
      	 	$("#lightbox").css("top", "+=" + (image.offset().top - oldImage.offset().top));   	  		
      	}

      	// scroll the page to be in line with the image we are showing in the lightbox
      	$(window).scrollTop(image.offset().top + scrollOffset); 
      }
    })

	function InsertLightboxImages() {
		if (lightbox.album.length == 0)
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


