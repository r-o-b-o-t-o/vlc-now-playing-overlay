let prevTitle;

const isOverflowing = (element) => {
	// https://stackoverflow.com/a/41988106
	return element.offsetWidth < element.scrollWidth;
};

const refresh = () => {
	$.getJSON("/data", (data) => {
		if (!data) {
			return;
		}
		if (data.title === prevTitle) {
			return;
		}

		const $title = $("#title");
		const $artist = $("#artist");

		$title.text(data.title ?? "");
		if (data.album === data.artist) {
			// Don't display self-titled album names
			data.album = "";
		}
		$artist.text([data.artist, data.album].filter(s => s !== "").join(" • "));
		$("#artwork").attr("src", data.artwork ? `data:image/jpg;base64, ${data.artwork}` : "");

		setTimeout(() => {
			if (isOverflowing($title[0])) {
				const txt = $title.text();
				$title.empty();
				$title.append(`<div class="marquee">${txt}</div>`);
			}
	
			if (isOverflowing($artist[0])) {
				const txt = $artist.text();
				$artist.empty();
				$artist.append(`<div class="marquee">${txt}</div>`);
			}
		}, 100);

		if (data.title === "" && data.artist === "" && data.album === "") {
			$("#main").addClass("empty");
		} else {
			$("#main").removeClass("empty");
		}

		prevTitle = data.title;
	});
};

$(document).ready(() => {
	setInterval(refresh, 2500);
});
