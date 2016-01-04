var wee = (function() {
	// some pages don't show the thumbs as pages (e.g. http://alpha.wallhaven.cc/tag/61) so have a slightly different html structure
	var pageSelector = ".thumb-listing-page";

	if (!$(pageSelector).length)
		pageSelector = ".thumb-listing";

	var lightboxOpen = false;
	var $lightbox = $("#lightbox");


	var addDownloadLink = function(figure) {
		var thumbInfo = figure.find(".thumb-info").eq(0);
		var wallID = figure.data("wallpaper-id");

		thumbInfo.append($("<a class='wee-download-link wee-link'></a>")
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
			.tipsy({
				delayIn: 500,
				delayOut: 500,
				fade: !0
			})
			.append("<i class='fa fa-fw fa-download'></i>")
		);
	}

	var addPopoutLink = function(figure, group) {
		var thumbInfo = figure.find(".thumb-info").eq(0);
		var wallID = figure.data("wallpaper-id");
		var lightboxTitle = "wee-image";

		if (group == false)
			lightboxTitle = "wee-image-" + wallID;

		thumbInfo.append($("<a class='wee-popout-link wee-link'></a>")
			.prop({
				href: buildWallpaperDirectUrl(wallID) + ".jpg",
				title: "Popout",
			})
			.attr({
				"data-lightbox": lightboxTitle,
				"data-title": thumbInfo.children(".wall-res").eq(0).text() + " - Favorites: " + thumbInfo.children(".wall-favs").eq(0).text()
			})
			.click(function(event) {
				// if we need to validate the file type then block the click event
				if (!validateFileType($(this), wallID, true)) {
					event.preventDefault();
					event.stopPropagation();
				}
			})
			.tipsy({
				delayIn: 500,
				delayOut: 500,
				fade: !0
			})
			.append("<i class='fa fa-fw fa-expand'></i>")
		);
	}

	var addSidebarDownloadLink = function() {
		var wall = $("#wallpaper[data-wallpaper-id]").eq(0);
		var listItem = $("<li><a href='http:" + wall.attr("src") + "' download><i class='fa fa-fw fa-download'></i> Download</a></li>");

		$("#showcase-sidebar").find(".showcase-tools").append(listItem);
	}

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

	// insert a download link into the lightbox description area
	var insertLightboxLinks = function(url) {
		if (lightboxHasLinks())
			return;

		var id = idFromUrl(url);

		$lightbox.find(".lb-details").prepend($("<a class='wee-lb-view wee-lb-desc'></a>")
			.prop({
				href: buildWallpaperViewUrl(id),
				title: "View Wallpaper",
				target: "_blank"
			})
			.click(function(event) {
				event.stopPropagation();
			})
			.tipsy({
				delayIn: 500,
				delayOut: 500,
				fade: !0
			})
			.append("<i class='fa fa-fw fa-picture-o'></i>")
		).prepend($("<a class='wee-lb-download wee-lb-desc'></a>")
			.prop({
				href: url,
				//download: "wallhaven-" + wee.idFromUrl(url) + ".jpg",
				download: "",
				title: "Download"
			})
			.click(function(event) {
				event.stopPropagation();
			})
			.tipsy({delayIn:500,delayOut:500,fade:!0})
			.append("<i class='fa fa-fw fa-download'></i>")
		);
	}

	// update the download link url every time the lightbox changes image
	var updateLightboxLinks = function(url) {
		if (!lightboxHasLinks())
			return;

		var id = idFromUrl(url);

		$lightbox.find(".lb-details .wee-lb-download").prop({
			href: url,
			//download: "wallhaven-" + wee.idFromUrl(url) + ".jpg",
		});

		$lightbox.find(".lb-details .wee-lb-view").prop({
			href: buildWallpaperViewUrl(id)
		});
	}

	var lightboxHasLinks = function() {
		return $lightbox.find('.lb-details .wee-lb-download').length > 0;
	}

	// get the next thumbnail on the page after the given one
	var nextThumbnail = function(figure) {
		var next = figure.parent().next("li");

		if (next.length)
			return next.children("figure[data-wallpaper-id]").eq(0);

		// there is no image following this one, so check to see if there is another page
		var nextPage = figure.parents(pageSelector).next(pageSelector);

		if (nextPage.length) {
			var nextListItem = nextPage.find("li").eq(0);

			if (nextListItem.length)
				return nextListItem.children("figure[data-wallpaper-id]").eq(0);
		}

		return undefined;
	}

	var previousThumbnail = function(figure) {
		var prev = figure.parent().prev("li");

		if (prev.length)
			return prev.children("figure[data-wallpaper-id]").eq(0);

		var prevPage = figure.parents(pageSelector).prev(pageSelector);

		if (prevPage.length) {
			var prevListItem = prevPage.find("li").last();

			if (prevListItem.length)
				return prevListItem.children("figure[data-wallpaper-id]").eq(0);
		}

		return undefined;
	}

	// forcibly validate the images on either side (up to 2 in both directions) of the given image
	var validateSurroundingImages = function(figure, startIndex, targetIndexes) {
		var surrounding = [];

		if (targetIndexes === undefined)
			targetIndexes = [-2, -1, 1, 2];

		if (targetIndexes.indexOf(-1) !== -1 || targetIndexes.indexOf(-2) !== -1) {
			var prev = previousThumbnail(figure);

			if (prev !== undefined) {
				if (targetIndexes.indexOf(-1) !== -1)
					surrounding.push({thumb: prev, index: startIndex - 1});

				var prevButOne = previousThumbnail(prev);

				if (prevButOne !== undefined && targetIndexes.indexOf(-2) !== -1)
					surrounding.push({thumb: prevButOne, index: startIndex - 2});
			}
		}

		if (targetIndexes.indexOf(1) !== -1 || targetIndexes.indexOf(2) !== -1) {
			var next = nextThumbnail(figure);

			if (next !== undefined) {
				if (targetIndexes.indexOf(1) !== -1)
					surrounding.push({thumb: next, index: startIndex + 1});

				var nextButOne = nextThumbnail(next);

				if (nextButOne !== undefined && targetIndexes.indexOf(2) !== -1)
					surrounding.push({thumb: nextButOne, index: startIndex + 2});
			}
		}

		for (var i = 0; i < surrounding.length; i++) {
			var a = surrounding[i].thumb.find("a[data-lightbox]")
			// temp the index data in the dom because it will be lost in the closure
			a.data("wee-validate-id", surrounding[i].index);

			validateFileType(a, surrounding[i].thumb.data("wallpaper-id"), false, function(anchor, correctType) {
				window.postMessage({ 
					type: "from_inject", 
					id: "lightbox_image_validated",
					index: anchor.data("wee-validate-id"),
					href: anchor.prop("href"),
					correctType: correctType
				}, "*");
			});
		}
	}


	window.addEventListener("message", function(event) {
		if (event.source != window || event.type != "message" || event.data.type == "from_inject")
			return;

		if (event.data.type == "from_content") {
			if (event.data.id == "lightbox_opened") {
				lightboxOpen = true;

				if (lightboxHasLinks())
					updateLightboxLinks(event.data.href);
				else
					insertLightboxLinks(event.data.href);

				// force validate the surrounding images so that they don't 404
				validateSurroundingImages($("figure[data-wallpaper-id='" + idFromUrl(event.data.href) + "']"), event.data.newIndex, [-2, -1, 1, 2]);
			} else if (event.data.id == "lightbox_scrolled") {
				updateLightboxLinks(event.data.href);

				// only update the edges (e.g. [-2, -1, 0, 1, 2] - validate -2 and 2 but not the immediate neighbours)
				// because the immediate neighbours would have been validated by the previous scroll (or the opening)
				var neighbours = [];

				if (event.data.newIndex > event.data.oldIndex)
					neighbours = [2];
				else if (event.data.oldIndex > event.data.newIndex)
					neighbours = [-2];

				validateSurroundingImages($("figure[data-wallpaper-id='" + idFromUrl(event.data.href) + "']"), event.data.newIndex, neighbours);
			} else if (event.data.id == "lightbox_closed") {
				lightboxOpen = false;
			}
		}
	});	

	$(document).on('keyup.keyboard', function(event) {
		if (lightboxOpen == false)
			return;

		// down arrow pressed, download the current image
		if (event.keyCode == 40) {
			$lightbox.find('.lb-details .wee-lb-download').eq(0)[0].click();
			event.preventDefault();
			event.stopPropagation();
		}
	});

	if ($("#showcase-sidebar").length) {
		addSidebarDownloadLink();	
	}

	return {
		pageSelector: pageSelector,
		addDownloadLink: addDownloadLink,
		addPopoutLink: addPopoutLink,
		validateFileType: validateFileType,
		buildWallpaperDirectUrl: buildWallpaperDirectUrl,
		idFromUrl: idFromUrl
	}
})();