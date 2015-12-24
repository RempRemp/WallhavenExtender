(function() {
	function insertThumbnailLinks() {
		$("figure.thumb").each(function(i) {
			var $this = $(this);

			// don't add the links to the same thumbnails more than once
			if ($this.data("wee-download-added") === true)
				return true;

			wee.addDownloadLink($this);

			wee.addPopoutLink($this, false);

			// mark this thumb so it isn't processed again
			$this.data("wee-download-added", true);
		});
	}

	insertThumbnailLinks();
})();