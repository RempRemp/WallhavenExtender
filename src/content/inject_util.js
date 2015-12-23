var wee = (function() {
	// some pages don't show the thumbs as pages (e.g. http://alpha.wallhaven.cc/tag/61) so have a slightly different html structure
	var pageSelector = ".thumb-listing-page";

	if (!$(pageSelector).length)
		pageSelector = ".thumb-listing";


	var addDownloadLink = function(figure) {
		var thumbInfo = figure.find(".thumb-info").eq(0);
		var wallID = figure.data("wallpaper-id");

		thumbInfo.append($("<a class='wee-download-link'></a>")
			.prop({
				href: buildWallpaperUrl(wallID) + ".jpg",
				download: "wallhaven-" + wallID + ".jpg",
				title: "Download"
			})
			.css({
				right: "30px",
				position: "absolute"
			})
			.click(function(event) {
				// stop the click if we need to validate the file type
				if (!validateFileType($(this), wallID, true)) {
					event.preventDefault();
					event.stopPropagation();
				}
			})
			.tipsy({delayIn:500,delayOut:500,fade:!0})
			.append("<i class='fa fa-download'></i>")
		);
	}

	var addPopoutLink = function(figure) {
		var thumbInfo = figure.find(".thumb-info").eq(0);
		var wallID = figure.data("wallpaper-id");
		var wallRes = thumbInfo.children(".wall-res").eq(0).text();
		var wallFavs = thumbInfo.children(".wall-favs").eq(0).text();

		thumbInfo.append($("<a></a>")
			.prop({
				href: buildWallpaperUrl(wallID) + ".jpg",
				title: "Popout",
			})
			.attr({
				"data-lightbox": "wee-image",
				"data-title": wallRes + " - Favorites: " + wallFavs
			})
			.css({
				right: "50px",
				position: "absolute"
			})
			.click(function(event) {
				// if we need to validate the file type then block the click event
				if (!validateFileType($(this), wallID, true)) {
					event.preventDefault();
					event.stopPropagation();
				}
			})
			.tipsy({delayIn:500,delayOut:500,fade:!0})
			.append("<i class='fa fa-expand'></i>")
		);
	}

	var validateFileType = function(anchor, id, doClick, completion) {
		// don't check more than once
		if (typeof anchor.data("wee-has-type") !== "undefined") 
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
				anchor.prop("href", buildWallpaperUrl(id) + ".png");
			},
			complete: function() {
				anchor.data("wee-has-type", true);

				if (doClick == true)
					// simulate a real click (not a jquery click)
					anchor[0].click();

				if (typeof completion === "function")
					completion(anchor);
			}
		});	

		return false;
	}

	var buildWallpaperUrl = function(id) {
		return "http://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-" + id;
	}

	//http://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-123456.jpg -> 123456
	var idFromUrl = function(url) {
		var filename = url.substring(url.lastIndexOf('/'));

		return filename.substring(11).slice(0, -4);
	}

	// insert a download link into the lightbox description area
	var insertLightboxDownload = function(url) {
		if (lightboxHasDownloadLink())
			return;

		$("#lightbox").find('.lb-details').prepend($("<a class='wee-lb-download'></a>")
			.css({
				display: "inline",
				marginRight: "10px"
			})
			.prop({
				href: url,
				download: "wallhaven-" + wee.idFromUrl(url) + ".jpg",
				title: "Download"
			})
			.click(function(event) {
				event.stopPropagation();
			})
			.tipsy({delayIn:500,delayOut:500,fade:!0})
			.append("<i class='fa fa-download'></i>")
		);
	}

	// update the download link url every time the lightbox changes image
	var updateLightboxDownload = function(url) {
		if (!lightboxHasDownloadLink())
			return;

		$("#lightbox").find('.lb-details .wee-lb-download').prop({
			href: url,
			download: "wallhaven-" + wee.idFromUrl(url) + ".jpg",
		});
	}

	var lightboxHasDownloadLink = function() {
		return $("#lightbox").find('.lb-details .wee-lb-download').length > 0;
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

	// forcibly validate the images on either side (2 in both directions) of the given image
	var validateSurroundingImages = function(figure, startIndex, onlyButOne) {
		var surrounding = [];
		var prev = previousThumbnail(figure);

		if (typeof prev !== "undefined") {
			if (!onlyButOne)
				surrounding.push({thumb: prev, index: startIndex - 1});

			var prevButOne = previousThumbnail(prev);

			if (typeof prevButOne !== "undefined")
				surrounding.push({thumb: prevButOne, index: startIndex - 2});
		}

		var next = nextThumbnail(figure);

		if (typeof next !== "undefined") {
			if (!onlyButOne)
				surrounding.push({thumb: next, index: startIndex + 1});

			var nextButOne = nextThumbnail(next);

			if (typeof nextButOne !== "undefined")
				surrounding.push({thumb: nextButOne, index: startIndex + 2});
		}

		for (var i = 0; i < surrounding.length; i++) {
			var a = surrounding[i].thumb.find("a[data-lightbox]")
			// temp the index data in the dom because it will be lost in the closure
			a.data("wee-validate-id", surrounding[i].index);

			validateFileType(a, surrounding[i].thumb.data("wallpaper-id"), false, function(anchor) {

				window.postMessage({ 
					type: "from_inject", 
					id: "lightbox_image_validated",
					index: anchor.data("wee-validate-id"),
					href: anchor.prop("href")
				}, '*');
			});
		}
	}



	window.addEventListener("message", function(event) {
		if (event.source != window || event.type != "message" || event.data.type == "from_inject")
			return;

		if (event.data.type == "from_content") {
			if (event.data.id == "lightbox_opened") {
				if (lightboxHasDownloadLink())
					updateLightboxDownload(event.data.href);
				else
					insertLightboxDownload(event.data.href);

				// force validate the surrounding images so that they don't 404
				validateSurroundingImages($("figure[data-wallpaper-id='" + idFromUrl(event.data.href) + "']"), event.data.newIndex, false);
			} else if (event.data.id == "lightbox_scrolled") {
				updateLightboxDownload(event.data.href);

				// only update the edges (e.g. [-2, -1, 0, 1, 2] - validate -2 and 2 but not the immediate neighbours)
				// because the immediate neighbours would have been validated by the previous scroll (or the opening)
				validateSurroundingImages($("figure[data-wallpaper-id='" + idFromUrl(event.data.href) + "']"), event.data.newIndex, true);
			}
		}
	});	

	return {
		pageSelector: pageSelector,
		addDownloadLink: addDownloadLink,
		addPopoutLink: addPopoutLink,
		validateFileType: validateFileType,
		buildWallpaperUrl: buildWallpaperUrl,
		idFromUrl: idFromUrl
	}
})();