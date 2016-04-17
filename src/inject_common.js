var wee = (function() {
	// basic download link on the rollover menu for each thumbnail
	var addDownloadLink = function(figure) {
		var wallID = figure.data("wallpaper-id");

		figure.find(".thumb-info").append($("<a class='wee-download-link wee-link'><i class='fa fa-fw fa-download'></i></a>")
			.prop({
				href: weeUtil.buildWallpaperDirectUrl(wallID) + ".jpg",
				//download: "wallhaven-" + wallID + ".jpg",
				download: "",
				title: "Download"
			})
			.click(function(event) {
				// stop the click if we need to validate the file type
				if (!validateFileType($(this), wallID, true)) {
					event.preventDefault();
					event.stopPropagation();
				}
			})
			.tipsy(weeUtil.tipsySettings)
		);
	}

	// link to load the image into a slideshow on the rollover menu for each thumbnail
	var addPopoutLink = function(figure, group) {
		var thumbInfo = figure.find(".thumb-info").eq(0);
		var wallID = figure.data("wallpaper-id");
		var lightboxTitle = "wee-image";

		if (!group)
			lightboxTitle = "wee-image-" + wallID;

		thumbInfo.append($("<a class='wee-popout-link wee-link'><i class='fa fa-fw fa-expand'></i></a>")
			.prop({
				href: weeUtil.buildWallpaperDirectUrl(wallID) + ".jpg",
				title: "Popout",
			})
			.attr({
				"data-lightbox": lightboxTitle,
				"data-title": thumbInfo.children(".wall-res").eq(0).text()
			})
			.click(function(event) {
				// if we need to validate the file type then block the click event
				if (!validateFileType($(this), wallID, true)) {
					event.preventDefault();
					event.stopPropagation();
				}
			})
			.tipsy(weeUtil.tipsySettings)
		);
	}

	// add a download link to the sidebar on the image info page (e.g. the one reached by clicking a thumbnail)
	var addSidebarDownloadLink = function() {
		var wall = $("#wallpaper[data-wallpaper-id]").eq(0);
		var protocol = weeUtil.isSecure ? "https" : "http";
		var listItem = $("<li><a href='" + protocol + ":" + wall.attr("src") + "' download><i class='fa fa-fw fa-download'></i> Download</a></li>");

		$("#showcase-sidebar").find(".showcase-tools").append(listItem);
	}

	// check which file type this image has (most are jpg (default), but a few are png)
	var validateFileType = function(anchor, id, doClick, completion) {
		// don't check more than once
		if (anchor.data("wee-has-type") === true) 
			return true;

		// check if the file exists as a jpg
		$.ajax({
			method: "HEAD",
			// use alpha. instead of wallpapers. to avoid any cross-origin business
			url: weeUtil.buildWallpaperDirectUrl(id, true) + ".jpg",
			success: function() {
				// jpg
			},
			error: function() {
				// png
				anchor.prop("href", weeUtil.buildWallpaperDirectUrl(id) + ".png");
			},
			complete: function(xhr, status) {
				anchor.data("wee-has-type", true);

				if (doClick == true)
					// simulate a real click (not a jquery click)
					anchor[0].click();

				if (typeof completion === "function") {
					var correctedType = status === "error" ? "png" : "jpg";
					completion(anchor, correctedType);
				}
			}
		});	

		return false;
	}

	var nextThumbnail = function(figure) {
		return adjacentThumbnail(figure, true);
	}

	var prevThumbnail = function(figure) {
		return adjacentThumbnail(figure, false);
	}

	var adjacentThumbnail = function(figure, getNext) {
		var adjacent = getNext ? figure.parent().next("li") : figure.parent().prev("li");

		if (adjacent.length)
			return adjacent.children("figure[data-wallpaper-id]").eq(0);

		// no image adjacent, check the adjacent page
		var adjacentPage = getNext ? figure.parents(weeUtil.pageSelector).next(weeUtil.pageSelector) : figure.parents(weeUtil.pageSelector).prev(weeUtil.pageSelector);

		if (adjacentPage.length) {
			var adjacentListItem = getNext ? adjacentPage.find("li").eq(0) : adjacentPage.find("li").last();

			if (adjacentListItem.length)
				return adjacentListItem.children("figure[data-wallpaper-id]").eq(0);
		}

		return undefined;
	}	

	// only some pages have the sidebar
	if ($("#showcase-sidebar").length) {
		addSidebarDownloadLink();	
	}

	return {
		addDownloadLink: addDownloadLink,
		addPopoutLink: addPopoutLink,
		validateFileType: validateFileType,
		nextThumbnail: nextThumbnail,
		prevThumbnail: prevThumbnail,
	}
})();