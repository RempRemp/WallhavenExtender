$(document.body).append(
	"<script src='" + chrome.extension.getURL("src/content/inject_common.js") + "'></script>" +
	"<script src='" + chrome.extension.getURL("src/content/forum/inject_forum.js") + "'></script>" +
	"<script src='" + chrome.extension.getURL("src/content/inject_lightbox.js") + "'></script>"
);