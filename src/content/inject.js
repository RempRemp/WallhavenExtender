(function() {
	var insertThumbnailLinks = function() {
		$(wee.pageSelector).each(function(i) {
			var $this = $(this);

			// don't add the links to the same thumbnails more than once
			if ($this.data("wee-download-added") === true)
				return true;

			$this.find("figure.thumb").each(function(i) {
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
			// 	.tipsy({
			// 		delayIn: 500,
			// 		delayOut: 500,
			// 		fade: !0
			// 	})
			// 	.append("<i class='fa fa-download'></i>");

			// $this.children("header").eq(0).append(downloadAll);

			// mark this page so it isn't processed again
			$this.data("wee-download-added", true);
		})
	}

	window.addEventListener("message", function(event) {
		if (event.source != window || event.type != "message")
			return;

		if (event.data.type == "from_content") {
			if (event.data.id == "page_added") {
				insertThumbnailLinks();

				// fire this back so that we have a "page added" event that guarantees our thumbnail data to be set
				window.postMessage({ 
					type: "from_inject", 
					id: "page_added",
				}, "*");
			}
		}
	});

	insertThumbnailLinks();
})();