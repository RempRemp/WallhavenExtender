// this is loaded into every page (content and injected)
// serves as a global utility source

var wexUtil = (function() {
	var isSecure = document.location.protocol === "https:";
	var isLoggedIn = !!document.querySelector("#userpanel.logged-in");
	var isForum = !!document.querySelector("#forums");

	var tipsySettings = {				
		delayIn: 500,
		delayOut: 500,
		fade: true
	}

	//var tipsyString = `onmouseenter='$(this).tipsy(${JSON.stringify(tipsySettings)});this.onmouseenter="";return true;'`;

	// some pages don't show the thumbs as pages (e.g. http://alpha.wallhaven.cc/tag/61) so have a slightly different html structure
	var pageSelector = ".thumb-listing-page";

	if (!document.querySelector(pageSelector))
		pageSelector = ".thumb-listing";

	// wrap the window messaging to make it a little easier to manage these messages
	var eventCallbacks = {};

	window.addEventListener("message", function(event) {
		if (event.source != window || event.type != "message")
			return;
		
		var messageId = event.data.type + "." + event.data.id;

		if (eventCallbacks[messageId]) {
			eventCallbacks[messageId].forEach(callback => {
				callback(event.data);
			});
		}
	});

	// register a callback for when a given message is received
	var onMessage = function(messageId, callback) {
		if (eventCallbacks[messageId])
			eventCallbacks[messageId].push(callback);
		else
			eventCallbacks[messageId] = [callback];
	};

	var postMessage = function(messageId, data) {
		var parts = messageId.split(".");

		data = data || {};
		data.type = parts[0];
		data.id = parts[1];

		window.postMessage(data, "*");
	};

	var getProtocol = function() {
		return isSecure ? "https" : "http";
	};

	// http://w.wallhaven.cc/full/v9/wallhaven-v9r8ze.jpg
	var buildWallpaperDirectUrl = function(id) {
		var bucket = id.slice(0, 2);

		return getProtocol() + "://w.wallhaven.cc/full/" + bucket + "/wallhaven-" + id;
	};

	var buildWallpaperViewUrl = function(id) {
		return getProtocol() + "://wallhaven.cc/w/" + id;
	};

	//http://wallpapers.wallhaven.cc/wallpapers/full/XX/wallhaven-123456.jpg -> 123456
	var idFromUrl = function(url) {
		var filename = url.substring(url.lastIndexOf('/'));

		return filename.substring(11).slice(0, -4);
	};

	var getExtension = function(figure) {
		return figure.querySelector(".thumb-info .png") ? "png" : "jpg";
	};

	var createElement = function(elementString) {
		var fragment = document.createRange().createContextualFragment(elementString);
        return fragment.firstChild;
	};

	var getFigure = function(id) {
		return document.querySelector(".thumb[data-wallpaper-id='" + id + "']");
	};

	//https://github.com/Olical/binary-search/blob/master/src/binarySearch.js
	var binarySearch = function(list, item) {
		var min = 0;
		var max = list.length - 1;
		var guess;

		var bitwise = (max <= 2147483647) ? true : false;
		if (bitwise) {
			while (min <= max) {
				guess = (min + max) >> 1;
				if (list[guess] === item) { return [guess]; }
				else {
					if (list[guess] < item) { min = guess + 1; }
					else { max = guess - 1; }
				}
			}
		} else {
			while (min <= max) {
				guess = Math.floor((min + max) / 2);
				if (list[guess] === item) { return [guess]; }
				else {
					if (list[guess] < item) { min = guess + 1; }
					else { max = guess - 1; }
				}
			}
		}

		return [undefined, min];
	};

	var isSimilarOverlayOpen = function() {
		return !!document.querySelector("#overlay .thumb-listing");
	}

	return {
		isLoggedIn: isLoggedIn,
		isForum: isForum,
		pageSelector: pageSelector,
		onMessage: onMessage,
		postMessage: postMessage,
		buildWallpaperDirectUrl: buildWallpaperDirectUrl,
		buildWallpaperViewUrl: buildWallpaperViewUrl,
		getExtension: getExtension,
		getProtocol: getProtocol,
		createElement: createElement,
		idFromUrl: idFromUrl,
		getFigure: getFigure,
		binarySearch: binarySearch,
		tipsySettings: tipsySettings,
		//tipsyString: tipsyString
		isSimilarOverlayOpen: isSimilarOverlayOpen
	};
})();