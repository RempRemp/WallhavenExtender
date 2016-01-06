var wee = (function() {
	// some pages don't show the thumbs as pages (e.g. http://alpha.wallhaven.cc/tag/61) so have a slightly different html structure
	var pageSelector = ".thumb-listing-page";

	if (!$(pageSelector).length)
		pageSelector = ".thumb-listing";

	var tipsySettings = {				
		delayIn: 500,
		delayOut: 500,
		fade: true
	}


	// basic download link on the rollover menu for each thumbnail
	var addDownloadLink = function(figure) {
		var thumbInfo = figure.find(".thumb-info").eq(0);
		var wallID = figure.data("wallpaper-id");

		thumbInfo.append($("<a class='wee-download-link wee-link'><i class='fa fa-fw fa-download'></i></a>")
			.prop({
				href: buildWallpaperDirectUrl(wallID) + ".jpg",
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
			.tipsy(tipsySettings)
		);
	}

	// link to load the image into a slideshow on the rollover menu for each thumbnail
	var addPopoutLink = function(figure, group) {
		var thumbInfo = figure.find(".thumb-info").eq(0);
		var wallID = figure.data("wallpaper-id");
		var lightboxTitle = "wee-image";

		if (group == false)
			lightboxTitle = "wee-image-" + wallID;

		thumbInfo.append($("<a class='wee-popout-link wee-link'><i class='fa fa-fw fa-expand'></i></a>")
			.prop({
				href: buildWallpaperDirectUrl(wallID) + ".jpg",
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
			.tipsy(tipsySettings)
		);
	}

	// add a download link to the sidebar on the image info page (e.g. the one reached by clicking a thumbnail)
	var addSidebarDownloadLink = function() {
		var wall = $("#wallpaper[data-wallpaper-id]").eq(0);
		var listItem = $("<li><a href='http:" + wall.attr("src") + "' download><i class='fa fa-fw fa-download'></i> Download</a></li>");

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
			url: "http://alpha.wallhaven.cc/wallpapers/full/wallhaven-" + id + ".jpg",
			success: function() {
				// jpg
			},
			error: function() {
				// png
				anchor.prop("href", buildWallpaperDirectUrl(id) + ".png");
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

	var buildWallpaperDirectUrl = function(id) {
		return "http://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-" + id;
	}

	var buildWallpaperViewUrl = function(id) {
		return "http://alpha.wallhaven.cc/wallpaper/" + id;
	}

	//http://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-123456.jpg -> 123456
	var idFromUrl = function(url) {
		var filename = url.substring(url.lastIndexOf('/'));

		return filename.substring(11).slice(0, -4);
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
		var adjacentPage = getNext ? figure.parents(pageSelector).next(pageSelector) : figure.parents(pageSelector).prev(pageSelector);

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
		pageSelector: pageSelector,
		addDownloadLink: addDownloadLink,
		addPopoutLink: addPopoutLink,
		validateFileType: validateFileType,
		buildWallpaperDirectUrl: buildWallpaperDirectUrl,
		buildWallpaperViewUrl: buildWallpaperViewUrl,
		idFromUrl: idFromUrl,
		nextThumbnail: nextThumbnail,
		prevThumbnail: prevThumbnail,
		tipsySettings: tipsySettings
	}
})();