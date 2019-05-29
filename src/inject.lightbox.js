(function() {
	var getLightbox = function() {
		return document.querySelector(".wex-lightbox");
	}

	var lightboxHasLinks = function() {
		return !!getLightbox().querySelector('.wex-lightbox-links');
	}

	// insert various links into the lightbox description area
	var insertLightboxLinks = function() {
		if (lightboxHasLinks())
			return;

		// add the "download" button
		var aDownload = wexUtil.createElement("<a class='wex-lightbox-download wex-lightbox-link'><i class='fa fa-fw fa-download'></i></a>");
		aDownload.title = "Download";
		aDownload.addEventListener("click", function() {
			event.stopPropagation();
			event.preventDefault();

			// validation at this point is assumed, so just take the extension from the url
			var wallId = wexUtil.idFromUrl(this.href);

			wexUtil.postMessage("inject.downloadImage", {
				wallId: wallId,
				extension: this.href.endsWith("png") ? "png" : "jpg"
			});	
		});
		if (window.jQuery)
            $(aDownload).tipsy(wexUtil.tipsySettings);

		// add the "view wallpaper" button that loads the wallpaper info page in a new tab
		var aView = wexUtil.createElement("<a class='wex-lightbox-view wex-lightbox-link'><i class='fa fa-fw fa-image'></i></a>");
		aView.title = "View Wallpaper";
		aView.target = "_blank";
		aView.addEventListener("click", function() {
			event.stopPropagation();
		});
		if (window.jQuery)
            $(aView).tipsy(wexUtil.tipsySettings);

		// add the "add to favorites"/"remove from favorites" button
		var aFavourite = wexUtil.createElement("<a class='thumb-btn-fav wex-lightbox-fav wex-lightbox-link wex-lightbox-fav-toggle'><i class='fa fa-fw fa-star'></i></a>");
		aFavourite.addEventListener("click", function() {
			event.stopPropagation();
			event.preventDefault();

			// we have to disable this on the similar walls window due to some zindex funkyness with the favourites window
			// could probably work around it but i don't think it's worth the effort
			if (wexUtil.isSimilarOverlayOpen())
				return;

			// we can't really route to/replicate whatever js this button actually does behind the scenes,
			// so just fake a click on the original "add to/remove from favorites" button
			var original = wexUtil.getFigure(this.dataset.wallpaperId);

			if (original.querySelector(".thumb-btn-unfav"))
				original.querySelector(".thumb-btn-unfav").click();
			else
				original.querySelector(".thumb-btn-fav").click();
		});
		if (window.jQuery)
            $(aFavourite).tipsy(wexUtil.tipsySettings);

		var container = wexUtil.createElement("<div class='wex-lightbox-links'></div>");
		container.append(aDownload);
		container.append(aView);
		container.append("-"); // the number of favorites
		container.append(aFavourite);
		
		getLightbox().querySelector(".slbCaption").prepend(container);
	};

	// update the links we added to the lightbox description area to point to a new wallpaper
	var updateLightboxLinks = function(url) {
		if (!lightboxHasLinks()) {
			insertLightboxLinks();
		}
		
		var id = wexUtil.idFromUrl(url);
 		var figure = wexUtil.getFigure(id);
		
		var aDownload = document.querySelector(".wex-lightbox-links .wex-lightbox-download");
		aDownload.href = url;

		var aView = document.querySelector(".wex-lightbox-links .wex-lightbox-view");
		aView.href = wexUtil.buildWallpaperViewUrl(id);

		var isFaved = !!figure.querySelector(".thumb-btn-unfav");
		var favClass = isFaved ? "unfav" : "fav";

		var aFav = document.querySelector(".wex-lightbox-links .wex-lightbox-fav-toggle");
		aFav.title = isFaved ? "Remove from favorites" : "Add to favorites";
		aFav.classList.remove("wex-lightbox-fav", "wex-lightbox-unfav");
		aFav.classList.add("wex-lightbox-" + favClass);
		aFav.dataset.wallpaperId = id;

		var favs = figure.querySelector(".thumb-info .wall-favs").childNodes[0].nodeValue;
		var favsText = Array.from(document.querySelector(".wex-lightbox-links").childNodes).filter(node => node.nodeType === Node.TEXT_NODE)[0];

		if (favsText) {
			favsText.nodeValue = favs;
		}

		var caption = Array.from(document.querySelector(".slbCaption").childNodes).filter(node => node.nodeType === Node.TEXT_NODE)[0];
		var resolution = figure.querySelector(".thumb-info .wall-res").childNodes[0].nodeValue;
		caption.nodeValue = resolution;
	};

	wexUtil.onMessage("content.lightboxUpdated", function(data) {
		updateLightboxLinks(data.url);
		//insertLightboxLinks(data.url);

		if (data.markSeen)
			markAsSeen(wexUtil.idFromUrl(data.url));

		// if we are using the "similar images" window
		if (wexUtil.isSimilarOverlayOpen()) {
			document.querySelector(".wex-lightbox-fav-toggle").classList.add("disabled");
		}			
	});

	wexUtil.onMessage("content.lightboxOpened", function(data) {
		var aboveOverlay = wexUtil.isSimilarOverlayOpen();

		document.querySelectorAll(".slbOverlay, .slbWrapOuter, .slbContentOuter").forEach(e => {
			if (aboveOverlay)
				e.classList.add("above-overlay");
			else
				e.classList.remove("above-overlay");
		});
	});

	// mark the given wallpaper id as "seen" in local storage
	var markAsSeen = function(id) {		
		//id = Number(id);	
		var seen = localStorage.getItem("wallhaven.seen-wallpapers");

		seen = !seen ? [] : JSON.parse(seen);

		var result = wexUtil.binarySearch(seen, id);

		// already exists, don't need to save
		if (result.length === 1) {
			return;
		}

		seen.splice(result[1], 0, id);

		localStorage.setItem("wallhaven.seen-wallpapers", JSON.stringify(seen));
		wexUtil.getFigure(id).classList.add("thumb-seen");	
	}

	var scrollIgnored = false;

	// let using the scrollwheel inside the lightbox scroll the image
	window.addEventListener("wheel", function(event) {
		if (scrollIgnored)
			return;

		if (event.deltaY == 0)
			return;

		var arrowElement = document.querySelector(event.deltaY > 0 ? "button.next.slbArrow" : "button.prev.slbArrow");

		if (arrowElement) {
			scrollIgnored = true;
			arrowElement.click();
			// don't let lots of simultaneous wheel events through
			setTimeout(function() { scrollIgnored = false; }, 200);
		}
	});

	window.addEventListener("keyup", function(event) {
		var lightbox = getLightbox();
		
		if (!lightbox)
			return;

		// down arrow pressed, download the current image
		if (event.keyCode == 40) {
			lightbox.querySelector(".wex-lightbox-download").click();
			event.preventDefault();
			event.stopPropagation();
		// up arrow, close the slideshow
		} else if (event.keyCode == 38) {
			lightbox.querySelector(".slbCloseBtn").click();
		// f, favourites the wallpaper
		} else if (event.keyCode == 70) {
			lightbox.querySelector(".wex-lightbox-fav-toggle").click();
			event.preventDefault();
			event.stopPropagation();
		}
	});
})();