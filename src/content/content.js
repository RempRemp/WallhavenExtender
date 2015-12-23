$(document.body).append("<script src='" + chrome.extension.getURL("src/content/inject.js") + "'></script>");

// chrome.runtime.onMessage.addListener(
// 	function(request, sender, sendResponse) {
// 		//console.log(sender.tab ?
// 		//	"from a content script:" + sender.tab.url :
// 		//	"from the extension");

// 		sendResponse({id: request.filename});
// });
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
      		scrollOffset = $("html, body").scrollTop() - image.offset().top;
      	} else {
       	 	var oldImage = $("a[data-lightbox='wee-image'][href='" + lightbox.album[oldIndex].link + "']").eq(0).parents("figure.thumb"); 
       	 	
      	 	$("#lightbox").css("top", "+=" + (image.offset().top - oldImage.offset().top));   	  		
      	}

      	$("html, body").scrollTop(image.offset().top + scrollOffset); 
      }
    })

	// window.postMessage({ 
	// 	type: 'from_content',
	// 	id: "lightbox"
	// }, '*');
});


function InsertLightboxImages() {
	if (lightbox.album.length == 0)
		return;

	var pages = $(".thumb-listing-page");

	// some pages don't show the thumbs as pages (e.g. http://alpha.wallhaven.cc/tag/61)
	if (!pages.length) {
		pages = $(".thumb-listing");
	}

	pages.each(function(i) {
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