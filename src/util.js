var weeUtil = (function() {
	// some pages don't show the thumbs as pages (e.g. http://alpha.wallhaven.cc/tag/61) so have a slightly different html structure
	var pageSelector = ".thumb-listing-page";

	if (!$(pageSelector).length)
		pageSelector = ".thumb-listing";

	var tipsySettings = {				
		delayIn: 500,
		delayOut: 500,
		fade: true
	}

	var loggedIn = $("#userpanel.logged-in").length;


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

	var swapFileType = function(url) {
		return url.slice(0, -3) + (url.substr(-3) === "jpg" ? "png" : "jpg");
	}


	return {
		pageSelector: pageSelector,
		tipsySettings: tipsySettings,
		isLoggedIn: loggedIn,
		buildWallpaperDirectUrl: buildWallpaperDirectUrl,
		buildWallpaperViewUrl: buildWallpaperViewUrl,
		idFromUrl: idFromUrl,
		swapFileType: swapFileType
	}
})();