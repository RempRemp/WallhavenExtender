(function() {
	function InsertLinks() {
		$("figure.thumb").each(function(i) {
			// don't add the links to the same thumbnails more than once
			if ($(this).data("wee-download-added") === true)
				return true;

			wee.addDownloadLink($(this));

			wee.addPopoutLink($(this));

			// mark this thumb so it isn't processed again
			$(this).data("wee-download-added", true);
		});
	}

	InsertLinks();
})();