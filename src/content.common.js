var wexCommon = (function() {
    var markAsSeenEnabled = false;

    var lightbox = new SimpleLightbox({
        elements: ".wex-popout-link",
        elementClass: "wex-lightbox",
        bindToItems: true,
        captionAttribute: "data-caption",
        allowGrouping: !wexUtil.isForum,
        afterShow: function(url) {
            wexUtil.postMessage("content.lightboxOpened", {url: url});
            document.body.classList.add("noscroll");
        },
        afterSetContent: function(content, lightbox) {
            wexUtil.postMessage("content.lightboxUpdated", {
                url: lightbox.items[lightbox.currentPosition],
                markSeen: markAsSeenEnabled
            });
        },
        beforeClose: function(lightbox) {
            document.body.classList.remove("noscroll");
        }
    });

    wexUtil.onMessage("inject.thumbsProcessed", function(data) {
        lightbox.reloadElements();
    });

    // determine if the user has "mark as seen" enabled in their wallhaven settings
    chrome.storage.local.get("mark-as-seen", function(items) {
        if (chrome.runtime.lastError)
            return;

        // guests default to not saving seen wallpapers
        if (!wexUtil.isLoggedIn)
            return;

        // first time loading the extension, need to find out what this is set as in the user settings
        if (items["mark-as-seen"] === undefined) {
            var request = new XMLHttpRequest();
            request.open("GET", wexUtil.getProtocol() + "://wallhaven.cc/settings/browsing", true);

            request.onload = function(evt) {
                if (request.status >= 200 && request.status < 400) {
                    var doc = document.implementation.createHTMLDocument();
                    doc.body.innerHTML = request.responseText;

                    if (doc.body.querySelector("#mark-seen-wallpapers").checked === true) {
                        markAsSeenEnabled = true;
                    } 
                }
            };

            // request.onerror = function(evt) {
            //     console.log(evt);
            // };

            request.onloadend = function() {
                if (markAsSeenEnabled) {
                    chrome.storage.local.set({"mark-as-seen": true})
                    //console.log("settings -> mark as seen: true");
                } else {
                    chrome.storage.local.set({"mark-as-seen": false})
                    //console.log("settings -> mark as seen: false");
                }
            }

            request.send();
        } else {
            markAsSeenEnabled = items["mark-as-seen"];
        }
    }); 

    // page of thumbnails has been loaded into the current page
	var pageAdded = function(page) {
        // tell the injected script so it can inject our links into the thumbnails
        wexUtil.postMessage("content.pageAdded");
	};

	var pageRemoved = function(page) {
        lightbox.reloadElements();
	};

    // watch for changes in the thumbnail page list (e.g. adding/removing pages)
	var pageContainer = document.querySelector(wexUtil.pageSelector);

	if (pageContainer && pageContainer.parentElement) {
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if (mutation.type === "childList") {
					// pages are loaded in as you scroll down the site
					if (mutation.addedNodes.length > 0) {
						for (var i = 0; i < mutation.addedNodes.length; i++) {
							var node = mutation.addedNodes[i];

							if (node.classList.contains("thumb-listing-page"))
								pageAdded(node);
						}
						 console.log("added " + mutation.addedNodes.length + ": ", mutation.addedNodes);
					}

					// pages are removed (for performance) once too many are loaded in
					// usually at this point a page (the earliest page, excluding page 1) is removed every time a new one is loaded on to the bottom
					if (mutation.removedNodes.length > 0) {
						for (var i = 0; i < mutation.removedNodes.length; i++) {
							var node = mutation.removedNodes[i];

							if (node.classList.contains("thumb-listing-page"))
								pageRemoved(node);
						}

						console.log("removed " + mutation.removedNodes.length + ": ", mutation.removedNodes);
					}
				}
			});    
		});

		observer.observe(pageContainer.parentElement, { 
			childList: true, 
			attributes: false, 
			characterData: false, 
			subtree: false 
		});
    };
    
	var similarOverlayCreated = function(div) {
        wexUtil.postMessage("content.similarOverlayCreated");
	};

    // watch for the creation of the "similar images" window
	if (document.querySelector("#showcase-sidebar")) {
		var searchSimilarLink = document.querySelector(".link[data-href*='wallhaven.cc/wallpaper/similar/'");
		var overlayInner = document.querySelector("section.overlay-inner");
        console.log(searchSimilarLink);
		// don't strictly need to check both (one implies the other), but let's do it anyway
		if (searchSimilarLink && overlayInner) {
			var observer = new MutationObserver(function(mutations) {
				mutations.forEach(function(mutation) {
					if (mutation.type === "childList") {
						if (mutation.addedNodes.length > 0) {
							for (var i = 0; i < mutation.addedNodes.length; i++) {
								var node = mutation.addedNodes[i];

								if (node.classList.contains("overlay-content"))
									similarOverlayCreated(node);
							}
						}
					}
				});    
			});

			observer.observe(overlayInner, { 
				childList: true, 
				attributes: false, 
				characterData: false, 
				subtree: false 
			});				
		}
	};  

    return {
        ready: function(callback) {
            if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
                callback();
            } else {
                document.addEventListener("DOMContentLoaded", callback);
            }
        },
        injectScripts: function(paths, callback) {
            var total = paths.length;
            var count = 0;

            // wait for everything to load before we start doing things in our injected scripts
            // otherwise they can load out of order and error when trying to call other parts that don't yet exist
            var loadCallback = function() {
                count++;

                if (count === total) {
                    callback();
                }
            }

            paths.forEach(path => {
                var script = document.createElement("script");
                script.src = chrome.extension.getURL(path);
                script.async = false;
                script.onload = loadCallback;
                
                document.body.appendChild(script);
            });
        }      
    };
})();

wexCommon.ready(function() {

});