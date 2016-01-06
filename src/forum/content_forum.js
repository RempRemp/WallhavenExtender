$(document.body).append(
	"<script src='" + chrome.extension.getURL("src/util.js") + "'></script>" +
	"<script src='" + chrome.extension.getURL("src/inject_common.js") + "'></script>" +
	"<script src='" + chrome.extension.getURL("src/forum/inject_forum.js") + "'></script>" +
	"<script src='" + chrome.extension.getURL("src/inject_lightbox.js") + "'></script>"
);