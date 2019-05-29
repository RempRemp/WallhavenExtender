(function() {
	var insertThumbnailLinksForAllPages = function() {
		document.querySelectorAll(wexUtil.pageSelector).forEach(page => {
			insertThumbnailLinks(page);
		});

		wexUtil.postMessage("inject.thumbsProcessed");
	};

	// a "page" in this context means an element that contains a list of thumbnails
	var insertThumbnailLinks = function(page) {
		// don't add the links to the same thumbnails more than once
		if (page.dataset.wexDownloadAdded)
			return;

		//console.log("added to page " + page.dataset.wexDownloadAdded);
		//console.log(page);
		page.querySelectorAll("figure.thumb").forEach(thumb => {
			wexInject.addDownloadLinkToFigure(thumb);
			wexInject.addPopoutLinkToFigure(thumb, true);
		});

		// mark this page so it isn't processed again
		page.dataset.wexDownloadAdded = true;
	};

	wexUtil.onMessage("content.injectLoaded", function(data) {
		if (wexUtil.isForum) {
			// there is no "page" in the forum, so just process each thumbnail individually
			document.querySelectorAll("figure.thumb").forEach(figure => {
				if (figure.dataset.wexDownloadAdded)
					return;

				wexInject.addDownloadLinkToFigure(figure);
				wexInject.addPopoutLinkToFigure(figure, false);

				figure.dataset.wexDownloadAdded = true;
			});

			wexUtil.postMessage("inject.thumbsProcessed");
		} else {
			insertThumbnailLinksForAllPages();
		}
	});

	wexUtil.onMessage("content.pageAdded", function(data) {
		insertThumbnailLinksForAllPages();
	});

	wexUtil.onMessage("content.similarOverlayCreated", function(data) {
		if (wexUtil.isForum)
			return;

		var page = document.querySelector(".overlay-content");

		if (page) {
			insertThumbnailLinks(page);
			wexUtil.postMessage("inject.thumbsProcessed");
		}
	});
})();