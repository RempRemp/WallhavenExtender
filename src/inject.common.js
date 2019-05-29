var wexInject = (function() {
    // basic download link on the rollover menu for each thumbnail
    addDownloadLinkToFigure = function(figure) {
        var wallId = figure.dataset.wallpaperId;
        var extension = wexUtil.getExtension(figure);

        var a = wexUtil.createElement("<a class='wex-download-link wex-link'><i class='fa fa-fw fa-download'></i></a>");
        a.href = wexUtil.buildWallpaperDirectUrl(wallId) + "." + extension;
        a.title = "Download";
        a.addEventListener("click", function() {
            event.preventDefault();
            event.stopPropagation();

            wexUtil.postMessage("inject.downloadImage", {
                wallId: wallId,
                extension: extension
            });
        });
        if (window.jQuery)
            $(a).tipsy(wexUtil.tipsySettings);

        figure.querySelector(".thumb-info").appendChild(a);
    };

    // link to load the image into a slideshow on the rollover menu for each thumbnail
    addPopoutLinkToFigure = function(figure, group) {
        var wallId = figure.dataset.wallpaperId;
        var extension = wexUtil.getExtension(figure);
        //var thumbInfo = figure.find(".thumb-info").eq(0);
        //var lightboxTitle = "wee-image";

        //if (!group)
        //    lightboxTitle = "wee-image-" + wallID;

        var a = wexUtil.createElement("<a class='wex-popout-link wex-link'" + wexUtil.tipsyString + "><i class='fa fa-fw fa-expand-alt'></i></a>");
        a.href = wexUtil.buildWallpaperDirectUrl(wallId) + "." + extension;
        a.title = "Popout";
        a.dataset.caption = "-";
        if (window.jQuery)
            $(a).tipsy(wexUtil.tipsySettings);

        // "data-lightbox": lightboxTitle,
        // "data-title": thumbInfo.children(".wall-res").eq(0).text(),
        // "data-extension": "jpg"

        figure.querySelector(".thumb-info").appendChild(a);
    };

    // add a download link to the sidebar on the image info page (e.g. the one reached by clicking a thumbnail)
    addSidebarDownloadLink = function() {
        var wallpaper = document.querySelector("#wallpaper[data-wallpaper-id]");
        var extension = wallpaper.src.endsWith("png") ? "png" : "jpg";
        
        var a = wexUtil.createElement("<a href='" + wexUtil.buildWallpaperDirectUrl(wallpaper.dataset.wallpaperId) + "." + extension + "'><i class='fas fa-fw fa-download'></i>Download</a>");
        a.dataset.extension = extension;
        a.addEventListener("click", function() {
            event.preventDefault();
            event.stopPropagation();

            wexUtil.postMessage("inject.downloadImage", {
                wallId: wallpaper.dataset.wallpaperId,
                extension: this.dataset.extension
            });
        });

        var list = document.createElement("li");
        list.appendChild(a);

        document.querySelector("#showcase-sidebar .showcase-tools").appendChild(list);
    };

    wexUtil.onMessage("content.injectLoaded", function() {
		// only some pages have the sidebar
		if (document.querySelector("#showcase-sidebar")) {
			addSidebarDownloadLink();	
		}
    });

    return {   
        addDownloadLinkToFigure: addDownloadLinkToFigure,
        addPopoutLinkToFigure: addPopoutLinkToFigure     
    }
})();