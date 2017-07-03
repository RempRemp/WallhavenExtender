(function() {
	var $lightbox = $("#lightbox");
	var lightboxOpen = false;

	// insert a download link into the lightbox description area
	var insertLightboxLinks = function(url) {
		if (lightboxHasLinks())
			return;

		var id = weeUtil.idFromUrl(url);
		var figure = weeUtil.getFigure(id);

		// add the "add to favorites"/"remove from favorites" button
		var isFaved = figure.find(".thumb-btn-unfav").length > 0;
		var favClass = isFaved ? "unfav" : "fav";
		var favs = figure.find(".thumb-info").children(".wall-favs").eq(0).text();

		var favButton = $("<a class='thumb-btn-" + favClass + " wee-lb-" + favClass + " wee-lb-desc'><i class='fa fa-fw fa-star'></i></a>")
			.prop({
				href: weeUtil.buildWallpaperDirectUrl(id) + ".jpg",
				title: isFaved ? "Remove from favorites" : "Add to favorites"
			})
			.click(function(event) {
				event.stopPropagation();
				event.preventDefault();

				// we can't really route to/replicate whatever js this button actually does behind the scenes,
				// so just fake a click on the original "add to/remove from favorites" button
				var _id = weeUtil.idFromUrl($(this).prop("href"));
				var original = weeUtil.getFigure(_id);

				if (original.find(".thumb-btn-unfav").length > 0)
					original.children(".thumb-btn-unfav")[0].click();
				else
					original.children(".thumb-btn-fav")[0].click();
			})
			.tipsy(weeUtil.tipsySettings)


		$lightbox.find(".lb-details").prepend(favButton).prepend(favs)
		// add the "view wallpaper" button that loads the wallpaper info page in a new tab
		.prepend($("<a class='wee-lb-view wee-lb-desc'><i class='fa fa-fw fa-picture-o'></i></a>")
			.prop({
				href: weeUtil.buildWallpaperViewUrl(id),
				title: "View Wallpaper",
				target: "_blank"
			})
			.click(function(event) {
				event.stopPropagation();
			})
			.tipsy(weeUtil.tipsySettings)
		// add the "download" button
		).prepend($("<a class='wee-lb-download wee-lb-desc'><i class='fa fa-fw fa-download'></i></a>")
			.prop({
				href: url,
				//download: "wallhaven-" + wee.idFromUrl(url) + ".jpg",
				download: "",
				title: "Download"
			})
			.click(function(event) {
				event.stopPropagation();
			})
			.tipsy(weeUtil.tipsySettings)
		);
	}

	// update the download link url every time the lightbox changes image (scrolls left/right, opens)
	var updateLightboxLinks = function(url) {
		if (!lightboxHasLinks())
			return;

		var id = weeUtil.idFromUrl(url);
		var figure = weeUtil.getFigure(id);

		$lightbox.find(".lb-details .wee-lb-download, .lb-details .wee-lb-fav, .lb-details .wee-lb-unfav").prop({
			href: url,
			//download: "wallhaven-" + wee.idFromUrl(url) + ".jpg",
		});

		$lightbox.find(".lb-details .wee-lb-view").prop({
			href: weeUtil.buildWallpaperViewUrl(id)
		});

		var favs = figure.find(".thumb-info").children(".wall-favs").eq(0).text()
		// https://stackoverflow.com/questions/3442394/jquery-using-text-to-retrieve-only-text-not-nested-in-child-tags
		var favsText = $(".lb-details").contents().filter(function(){ return this.nodeType == 3; });

		if (favsText.length) {
			favsText[0].nodeValue = favs;
		}
	}

	var lightboxHasLinks = function() {
		return $lightbox.find('.lb-details .wee-lb-download').length > 0;
	}

	// forcibly validate the images on either side (up to 2 in both directions) of the given image
	var validateSurroundingImages = function(figure, startIndex, targetIndexes) {
		var surrounding = [];

		if (targetIndexes === undefined)
			targetIndexes = [-2, -1, 1, 2];

		// check previous 2 images
		if (targetIndexes.indexOf(-1) !== -1 || targetIndexes.indexOf(-2) !== -1) {
			var prev = wee.prevThumbnail(figure);

			if (prev !== undefined) {
				if (targetIndexes.indexOf(-1) !== -1)
					surrounding.push({thumb: prev, index: startIndex - 1});

				var prevButOne = wee.prevThumbnail(prev);

				if (prevButOne !== undefined && targetIndexes.indexOf(-2) !== -1)
					surrounding.push({thumb: prevButOne, index: startIndex - 2});
			}
		}

		// next 2 images
		if (targetIndexes.indexOf(1) !== -1 || targetIndexes.indexOf(2) !== -1) {
			var next = wee.nextThumbnail(figure);

			if (next !== undefined) {
				if (targetIndexes.indexOf(1) !== -1)
					surrounding.push({thumb: next, index: startIndex + 1});

				var nextButOne = wee.nextThumbnail(next);

				if (nextButOne !== undefined && targetIndexes.indexOf(2) !== -1)
					surrounding.push({thumb: nextButOne, index: startIndex + 2});
			}
		}

		for (var i = 0; i < surrounding.length; i++) {
			var a = surrounding[i].thumb.find("a[data-lightbox]")
			// temp the index data in the dom because it will be lost in the closure
			a.data("wee-validate-id", surrounding[i].index);

			wee.validateFileType(a, surrounding[i].thumb.data("wallpaper-id"), false, function(anchor, correctType) {
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

	// mark the given wallpaper id as "seen" in local storage
	// this needs to be in an injected script so that it can access addSortedUnique
	var markAsSeen = function(id) {				
		var seen = localStorage.getItem("wallhaven.seen-wallpapers");

		seen = !seen ? [] : JSON.parse(seen);

		var len = seen.length;

		seen.addSortedUnique(new Number(id));

		// don't bother saving if we didn't add anything
		if (seen.length > len) {
			localStorage.setItem("wallhaven.seen-wallpapers", JSON.stringify(seen));
			weeUtil.getFigure(id).addClass("thumb-seen");
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
				validateSurroundingImages(weeUtil.getFigure(weeUtil.idFromUrl(event.data.href)), event.data.newIndex, [-2, -1, 1, 2]);

				if (event.data.markSeen)	
					markAsSeen(weeUtil.idFromUrl(event.data.href));
			} else if (event.data.id == "lightbox_scrolled") {
				updateLightboxLinks(event.data.href);

				// only update the edges (e.g. [-2, -1, 0, 1, 2] - validate -2 and 2 but not the immediate neighbours)
				// because the immediate neighbours would have been validated by the previous scroll (or the opening)
				var neighbours = [];

				if (event.data.newIndex > event.data.oldIndex)
					neighbours = [2];
				else if (event.data.oldIndex > event.data.newIndex)
					neighbours = [-2];

				// the slideshow will automatically preload the next image, so we have to ensure that the filetype is correct when it does
				validateSurroundingImages(weeUtil.getFigure(weeUtil.idFromUrl(event.data.href)), event.data.newIndex, neighbours);

				if (event.data.markSeen)	
					markAsSeen(weeUtil.idFromUrl(event.data.href));
			} else if (event.data.id == "lightbox_closed") {
				lightboxOpen = false;
			}
		}
	});	

	$(document).on("keyup.keyboard", function(event) {
		if (lightboxOpen === false)
			return;

		// down arrow pressed, download the current image
		if (event.keyCode == 40) {
			$lightbox.find(".lb-details .wee-lb-download").eq(0)[0].click();
			event.preventDefault();
			event.stopPropagation();
		// up arrow, close the slideshow
		} else if (event.keyCode == 38) {
			$(".lb-close")[0].click();
		// f, favourites the wallpaper
		} else if (event.keyCode == 70) {
			var fav = $lightbox.find(".lb-details .wee-lb-fav");

			if (!fav.length)
				fav = $lightbox.find(".lb-details .wee-lb-unfav");

			if (!fav.length)
				return;
			
			fav.eq(0)[0].click();

			event.preventDefault();
			event.stopPropagation();
		}
	});

	var scrollIgnored = false;

	$(window).on("wheel", function(event) {
		if (lightboxOpen === false || scrollIgnored === true)
			return;

		var arrowElement = event.originalEvent.deltaY > 0 ? $("a.lb-next") : $("a.lb-prev");

		// should probably export a proper function from the slideshow to go left/right
		if (arrowElement.css("display") !== "none") {
			scrollIgnored = true;
			arrowElement[0].click();
			// don't let lots of simultaneous wheel events through
			setTimeout(function() { scrollIgnored = false; }, 200);
		}
	});
})();