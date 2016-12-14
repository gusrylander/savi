var Landsat8 = function() {

	var BASE_URL = "https://api.mapbox.com/v4/",
		TILE_PATH = "/{z}/{x}/{y}.png",
		ACCESS_TOKEN_QUERY = "?access_token=pk.eyJ1IjoiZ3VzcnlsYW5kZXIiLCJhIjoiY2lwbHE3NmtiMDJlbnRsbWRyNDk4N253aSJ9.yfEtZyLIva5HE-yhUnAY9w",
		getUrl,
		tileIds = {
			"2015-01-14": "gusrylander.1jayexs8",
			"2015-01-30": "gusrylander.401k7s4h",
			"2015-02-15": "gusrylander.4u8tmpa8",
			"2015-03-19": "gusrylander.as6le17y",
			"2015-04-04": "gusrylander.3hjtcods",
			"2015-04-20": "gusrylander.29x3ovlt",
			"2015-05-06": "gusrylander.4dobtkz2",
			"2015-05-22": "gusrylander.8jcmrsl4",
			"2015-06-07": "gusrylander.2uaxearj",
			"2015-06-23": "gusrylander.dqx9tlw6",
			"2015-07-09": "gusrylander.5057n0vm",
			"2015-07-25": "gusrylander.7szdqtld",
			"2015-08-10": "gusrylander.58570i9v",
			"2015-08-26": "gusrylander.1rt63w6a",
			"2015-09-11": "gusrylander.dnitiz6h",
			"2015-09-27": "gusrylander.26axomsa",
			"2015-10-13": "gusrylander.br0kpnaq",
			"2015-10-29": "gusrylander.7t4n7zed",
			"2015-11-14": "gusrylander.31t7mxba",
			"2015-11-30": "gusrylander.bdrhc3zo",
			"2015-12-16": "gusrylander.9b5rvhd7"
		};

	var getUrl = function(tileId) {
		return typeof tileId !== "undefined" ? (BASE_URL + tileId + TILE_PATH + ACCESS_TOKEN_QUERY) : null;
	}

	var getTileWithin = function(minDate, maxDate) {

		var result = null;

		for (date in tileIds) {
			var currDate = new Date(date + "T12:00:00");
			if (currDate > minDate && currDate < maxDate) {
				result = getUrl(tileIds[date]);
				break;
			}
		}

		return result;
	}

	return {
		getTileWithin: getTileWithin,
	}
}


