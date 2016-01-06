var wee = (function() {
	// some pages don't show the thumbs as pages (e.g. http://alpha.wallhaven.cc/tag/61) so have a slightly different html structure
	var pageSelector = ".thumb-listing-page";

	if (!$(pageSelector).length)
		pageSelector = ".thumb-listing";

	var $lightbox = $("#lightbox");
	var waitingPages = [];

	lightbox.option({
		disableScrolling: true
	});


	var markAsSeenEnabled = false;

	chrome.storage.sync.get("mark-as-seen", function(items) {
		if (chrome.runtime.lastError) {
			return;
		}

		var loggedIn = $("#userpanel.logged-in").length;

		// guests default to not saving seen wallpapers
		if (!loggedIn) {
			return;
		}

		// first time loading the extension, need to find out what this is set as in the user settings
		if (items["mark-as-seen"] === undefined) {
			console.log("not set");

			$.ajax({
				url: "http://alpha.wallhaven.cc/settings/browsing",
				dataType: "html",
				success: function(data, status, xhr) {
					var page = $.parseHTML(data);

					if ($(page).find("#mark_seen_wallpapers").prop("checked"))
						markAsSeenEnabled = true;
				},
				error: function(xhr, status, error) {
					//console.log("error " + status);
				},
				complete: function(xhr, status) {
					if (markAsSeenEnabled) {
						chrome.storage.sync.set({"mark-as-seen": true})
						//console.log("settings -> mark true");
					} else {
						chrome.storage.sync.set({"mark-as-seen": false})
						//console.log("settings -> mark false");
					}
				}
			});
		} else {
			markAsSeenEnabled = items["mark-as-seen"];
		}
	});

	$lightbox.on("scrolled.lightbox", function(event, newIndex, oldIndex) {
		if (oldIndex === undefined) {
			window.postMessage({ 
				type: "from_content", 
				id: "lightbox_opened",
				newIndex: newIndex,
				href: lightbox.album[newIndex].link,
				markSeen: markAsSeenEnabled
			}, "*");
		} else {
			window.postMessage({ 
				type: "from_content", 
				id: "lightbox_scrolled",
				newIndex: newIndex,
				oldIndex: oldIndex,
				href: lightbox.album[newIndex].link,
				markSeen: markAsSeenEnabled
			}, "*");
		}
	}).on("closed.lightbox", function(event, currentIndex) {
		window.postMessage({
			type: "from_content",
			id: "lightbox_closed",
			currentIndex: currentIndex,
			href: lightbox.album[currentIndex].link
		}, "*");
	});


	window.addEventListener("message", function(event) {
		if (event.source != window || event.type != "message")
			return;

		if (event.data.type == "from_inject") {
			if (event.data.id == "page_added") {
				// this has to be delayed until after the injected scripts have pushed our data into the dom
				// if it is inside pageAdded() the required data (i.e. the href attr) does not yet exist in the dom
				if (lightbox.isOpen === true) {
					// insert the newly loaded thumbnails into the lightbox
					for (var i = 0; i < waitingPages.length; i++) {
						waitingPages[i].find("a[data-lightbox]").each(function(i) {
							lightbox.album.push({
								link: $(this).attr("href"),
						 		title: $(this).attr("data-title")
						    });
						});
					}

					waitingPages = [];
				}				
			}
		} else if (event.data.type == "from_content") {
			if (event.data.id == "lightbox_closed") {
				waitingPages = [];
			}
		}
	});

	// page of thumbnails has been loaded into the current page
	pageAdded = function(page) {
		if (lightbox.isOpen === true)
			waitingPages.push(page);

		window.postMessage({ 
			type: "from_content", 
			id: "page_added"
		}, "*");
	}

	pageRemoved = function(page) {
		if (lightbox.isOpen === true) {
			var removed = 0;

			// delete all the thumbnails on the removed page from the lightbox album
			page.find("li").each(function(index) {
				var url = $(this).find(".wee-download-link").attr("href");

				if (typeof url !== "string")
					return true;

				var i = albumIndexOf(url);

				if (i !== -1) {
					lightbox.album.splice(i, 1);
					removed++;
				}
			});

			lightbox.currentImageIndex -= removed;

			// re-adjust the lightbox position since removing the page shrunk the site height
			$lightbox.css("top", ($(window).scrollTop() + lightbox.options.positionFromTop) + "px");	
		}

		window.postMessage({ 
			type: "from_content", 
			id: "page_removed"
		}, "*");
	}

	// custom array.indexOf that filters by url in the lightbox album list
	albumIndexOf = function(url) {
		for (var i = 0; i < lightbox.album.length; i++) {
			// strip the file type so that we match regardless of extension
			if (lightbox.album[i].link.indexOf(url.slice(0, -3)) >= 0) {
				return i;
			}
		}

		return -1;
	}

	swapFileType = function(url) {
		return url.slice(0, -3) + (url.substr(-3) === "jpg" ? "png" : "jpg");
	}


	// watch for changes in the thumbnail page list (e.g. adding/removing pages)
	var pageContainer = $(pageSelector).parent();

	if (pageContainer.length) {
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if (mutation.type === "childList") {
					// pages are loaded in as you scroll down the site
					if (mutation.addedNodes.length > 0) {
						for (var i = 0; i < mutation.addedNodes.length; i++) {
							var node = $(mutation.addedNodes[i]);

							if (node.hasClass("thumb-listing-page"))
								pageAdded(node);
						}
						//console.log("added " + mutation.addedNodes.length + ": ", mutation.addedNodes);
					}

					// pages are removed (for performance) once too many are loaded in
					// usually at this point a page (the earliest page, excluding page 1) is removed every time a new one is loaded on to the bottom
					if (mutation.removedNodes.length > 0) {
						for (var i = 0; i < mutation.removedNodes.length; i++) {
							var node = $(mutation.removedNodes[i]);

							if (node.hasClass("thumb-listing-page"))
								pageRemoved(node);
						}

						//console.log("removed " + mutation.removedNodes.length + ": ", mutation.removedNodes);
					}
				}
			});    
		});

		observer.observe(pageContainer[0], { 
			childList: true, 
			attributes: false, 
			characterData: false, 
			subtree: false 
		});
	}

	return {
		$lightbox: $lightbox,
		albumIndexOf: albumIndexOf,
		swapFileType: swapFileType
	}
})();