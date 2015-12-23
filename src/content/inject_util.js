var wee = (function() {
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
			.click(function(e) {
				// stop the click if we need to validate the file type
				if (!validateFileType($(this), wallID)) {
					e.preventDefault();
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
			.click(function(e) {
				// if we need to validate the file type then block the click event
				if (!validateFileType($(this), wallID)) {
					e.preventDefault();
				}
			})
			.tipsy({delayIn:500,delayOut:500,fade:!0})
			.append("<i class='fa fa-expand'></i>")
		);
	}

	var validateFileType = function(anchor, id) {
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
				// simulate a real click (not a jquery click)
				anchor[0].click();
			}
		});	

		return false;
	}

	var buildWallpaperUrl = function(id) {
		return "http://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-" + id;
	}

	return {
		addDownloadLink: addDownloadLink,
		addPopoutLink: addPopoutLink,
		validateFileType: validateFileType,
		buildWallpaperUrl: buildWallpaperUrl
	}
})();