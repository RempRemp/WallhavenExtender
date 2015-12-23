(function() {
	function InsertLinks() {
		var pages = $(".thumb-listing-page");

		// some pages don't show the thumbs as pages (e.g. http://alpha.wallhaven.cc/tag/61) so have a slightly different html structure
		if (!pages.length) {
			pages = $(".thumb-listing");
		}

		pages.each(function(i) {
			// don't add the links to the same thumbnails more than once
			if ($(this).data("wee-download-added") === true)
				return true;

			$(this).find("figure.thumb").each(function(i) {
				wee.addDownloadLink($(this));
				wee.addPopoutLink($(this));
			});

			var downloadAll = $("<a href='#'></a>")
				.prop({
					title: "Download page"
				})
				.css({
					marginLeft: "10px"
				})
				.click(function(e) {
					// find each individual download link that we created and click them
					$(this).parents(".thumb-listing-page").eq(0).find(".wee-download-link").each(function() {
						this.click();
					});
					
					e.preventDefault();
				})
				.tipsy({delayIn:500,delayOut:500,fade:!0})
				.append("<i class='fa fa-download'></i>");

			$(this).children("header").eq(0).append(downloadAll);

			// mark this page so it isn't processed again
			$(this).data("wee-download-added", true);
		})
	}

	$(document).ajaxComplete(function(event, xhr, settings) { 
		//console.log(event);
		//console.log(xhr);
		//console.log(settings);

		if (!settings.url.startsWith("http://alpha.wallhaven.cc/search"))
			return;

		window.postMessage({ 
			type: "from_inject", 
			id: "page_loaded",
		}, '*');

		InsertLinks();
	});

	InsertLinks();

	window.addEventListener("message", function(event) {
		if (event.source != window || event.type != "message" || event.data.type == "from_inject")
			return;

		console.log("inject.js got message: ", event);
		
		if (event.data.type == "from_content") {
			if (event.data.id == "lightbox") {
				console.log(event.data.data);
			}
		}
	});
})();