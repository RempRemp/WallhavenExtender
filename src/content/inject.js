function InsertDownloadLinks() {
	$(".thumb-listing-page").each(function(i) {
		// don't add the links to the same thumbnails more than once
		if ($(this).data("ewd-download-added") === true)
			return true;

		$(this).find(".thumb-info").each(function(i) {
			var id = $(this).parent("figure").data("wallpaper-id");

			$(this).append(
				$("<a class='download-link'></a>")
					.prop({
						"href":"http://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-" + id + ".jpg",
						"download":"wallhaven-" + id + ".jpg",
						"title":"Download"
					})
					.css({
						"right":"30px",
						"position":"absolute"
					})
					.click(function(e) {
						// if we have already checked file type, drop out and let the download continue as normal
						if (typeof $(this).data("ewd-has-type") !== "undefined") 
							return;

						e.preventDefault();

						var anchor = this;

						// check if the file exists as a jpg
						$.ajax({
							method: "HEAD",
							url: "http://alpha.wallhaven.cc/wallpapers/full/wallhaven-" + id + ".jpg",
							success: function() {
								// jpg
							},
							error: function() {
								// png
								$(anchor).prop("href", "http://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-" + id + ".png");
							},
							complete: function() {
								$(anchor).data("ewd-has-type", true);
								anchor.click();
							}
						});
					})
					.tipsy({delayIn:500,delayOut:500,fade:!0})
					.append("<i class='fa fa-download'></i>")
			);
		});

		var downloadAll = $("<a href='#'></a>")
			.prop({
				"title":"Download page"
			})
			.css({
				"margin-left":"10px"
			})
			.click(function(e) {
				$(this).parents(".thumb-listing-page").eq(0).find(".download-link").each(function() {
					this.click();
				});
				
				e.preventDefault();
			})
			.tipsy({delayIn:500,delayOut:500,fade:!0});

		downloadAll.append("<i class='fa fa-download'></i>");

		$(this).children("header").eq(0).append(downloadAll);

		$(this).data("ewd-download-added", true);
	})
}

InsertDownloadLinks();


$(document).ajaxComplete(function(event, xhr, settings) { 
	//console.log(event);
	//console.log(xhr);
	//console.log(settings);

	InsertDownloadLinks();
});