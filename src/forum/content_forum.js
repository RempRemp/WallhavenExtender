// $(document.body).append(
// 	"<script src='" + chrome.extension.getURL("src/util.js") + "'></script>" +
// 	"<script src='" + chrome.extension.getURL("src/inject_common.js") + "'></script>" +
// 	"<script src='" + chrome.extension.getURL("src/forum/inject_forum.js") + "'></script>" +
// 	"<script src='" + chrome.extension.getURL("src/inject_lightbox.js") + "'></script>"
// );

(function() {
	var injectScript = function(path) {
		var script = document.createElement("script");
		script.src = chrome.extension.getURL(path);
		// wait for everything to load before we start doing things in our injected scripts
		// otherwise they can load out of order and error when trying to call other parts that don't yet exist
		script.onload = function() { 
			window.weeLoadCount = (window.weeLoadCount || 0) + 1; 
			if (window.weeLoadCount === 4) { 
				window.postMessage({ 
					type: "from_content", 
					id: "inject_loaded"
				}, "*");
			}
		}
		document.body.appendChild(script);	
	}

	injectScript("src/util.js");
	injectScript("src/inject_common.js");
	injectScript("src/forum/inject_forum.js");
	injectScript("src/inject_lightbox.js");

	window.addEventListener("message", function(event) {
		if (event.source != window || event.type != "message")
			return;

		if (event.data.type == "from_inject") {
			if (event.data.id === "download_image") {
				chrome.runtime.sendMessage({
					id: "download_image", 
					url: weeUtil.buildWallpaperDirectUrl(event.data.wallId) + "." + (event.data.extension === "png" ? "png" : "jpg")
				});
			}
		}
	});
})();