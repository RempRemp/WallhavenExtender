window.addEventListener("message", function(event) {
	if (event.source != window || event.type != "message")
		return;

	if (event.data.type == "from_content") {
		if (event.data.id == "inject_loaded") {
			// insertThumbnailLinks
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
	}
});