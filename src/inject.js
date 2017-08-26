(function() {
	var insertPageThumbnailLinks = function() {
		$(weeUtil.pageSelector).each(function(i) {
			insertThumbnailLinks($(this));
		})
	}

	var insertThumbnailLinks = function(parent) {
		// don't add the links to the same thumbnails more than once
		if (parent.data("wee-download-added") === true)
			return true;

		parent.find("figure.thumb").each(function(i) {
			wee.addDownloadLink($(this));
			wee.addPopoutLink($(this), true);
		});

		// add a button to mass download all the images on this thumbnail page
		// var downloadAll = $("<a href='#'></a>")
		// 	.prop({
		// 		title: "Download page"
		// 	})
		// 	.css({
		// 		marginLeft: "10px"
		// 	})
		// 	.click(function(e) {
		// 		// find each individual download link that we created and click them
		// 		$(this).parents(".thumb-listing-page").eq(0).find(".wee-download-link").each(function() {
		// 			this.click();
		// 		});
				
		// 		e.preventDefault();
		// 	})
		// 	.tipsy(wee.tipsySettings)
		// 	.append("<i class='fa fa-download'></i>");

		// parent.children("header").eq(0).append(downloadAll);

		// mark this parent so it isn't processed again
		parent.data("wee-download-added", true);
	}

	window.addEventListener("message", function(event) {
		if (event.source != window || event.type != "message")
			return;

		if (event.data.type == "from_content") {
			if (event.data.id == "page_added") {
				insertPageThumbnailLinks();

				// fire this back so that we have a "page added" event that guarantees our thumbnail data to be set
				window.postMessage({ 
					type: "from_inject", 
					id: "page_added",
				}, "*");
			} else if (event.data.id == "similar_overlay_created") {
				insertThumbnailLinks($(".overlay-content"));	
			}
		}
	});

	insertPageThumbnailLinks();
})();