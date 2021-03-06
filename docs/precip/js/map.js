var Map = function() {
	
	var CARTODB = {
			"USER": "korin",
			"URL": "https://korin.cartodb.com/api/v2/sql?",
			"QUERY": "SELECT * FROM all_sites_all_years",
			"DATE_QUERY": "SELECT MIN(date),MAX(date) FROM all_sites_all_years",
			"ENTERO_QUERY": "SELECT MIN(enterococcus),MAX(enterococcus) FROM all_sites_all_years"
		},
		BASEMAP_URL = 'http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
		ATTRIBUTION =
			" Landsat Data: <a href=http://landsat.gsfc.nasa.gov/>NASA/USGS</a>" +
			" | Precipitation Data: <a href=http://www.noaa.gov/>NOAA</a>" +
			" | Water Quality Site Samples: <a href=http://www.nyc.gov/html/dep/html/home/home.shtml>NYCDEP</a>/<a href=http://www.nycwatertrail.org/>NYCWTA</a>" +
			" | Basemaps: <a href=https://carto.com/>Carto</a>" +
			" | Landsat Map Tiling:  <a href=https://www.mapbox.com/>Mapbox</a>" +
			" | Design and Coding: Korin Tangtrakul (<a href=http://openseweratlas.tumblr.com/>OSA</a>), <a href=https://www.gusrylander.com/>Gus Rylander</a>",
		leafletMap,
		dataLayer,
		landsat8,
		landsat8Layer,
		util;

	// given start and end dates, return WHERE clause for carto sql query
	var getUrlParams = function(dates) {

		var params = {
			q: CARTODB["QUERY"],
			format: "GeoJSON"
		};

		if (dates !== null) {
			params.q = params.q + " WHERE date >= '" + dates[0] + "' AND date <= '" + dates[1] + "'";
		}

		return params;
	}

	// initialize map with no data
	var initialize = function() {

		util = Util();

		// NYC-centered map
		leafletMap = L.map('map', {
			zoomControl: false
		}).setView([40.731649, -73.977814], 10);

		// baselayer
		L.tileLayer(BASEMAP_URL, {
			attribution: ATTRIBUTION,
			maxZoom: 18
		}).addTo(leafletMap);

		landsat8 = Landsat8();
		landsat8Layer = L.tileLayer("");
						
		//mapzen geocoder
		/*
		L.control.geocoder('search-xBMCfMW', {
			position: 'topright'
		}).addTo(leafletMap);
		*/

		new L.Control.Zoom({
			position: 'topright'
		}).addTo(leafletMap);

	}

	// get date range from carto
	var getDateRange = function() {

	    return new Promise( function(resolve, reject) {

			sql = new cartodb.SQL({ user: CARTODB["USER"]});

			sql.execute(CARTODB["DATE_QUERY"])
			.done(function(data) {
				data.rows.forEach(function(d){
					var minDate = d3.timeYear.floor(new Date(d.min)),
						maxDate = d3.timeDay.offset(d3.timeYear.ceil(new Date(d.max)), -1);
					resolve([minDate, maxDate]);
				})
			})
			.error(function(errors) {
				reject("errors:" + errors)
			});
			
		});

	}

	// get enterococcus range from carto
	var getEnteroRange = function() {

	    return new Promise( function(resolve, reject) {

			sql = new cartodb.SQL({ user: CARTODB["USER"]});

			sql.execute(CARTODB["ENTERO_QUERY"])
			.done(function(data) {
				data.rows.forEach(function(e){
					resolve({min: e.min, max: e.max});
				})
			})
			.error(function(errors) {
				reject("errors:" + errors)
			});
			
		});

	}

	var updateLandsat8Layer = function(url) {
		if (! leafletMap.hasLayer(landsat8Layer)) {
			leafletMap.addLayer(landsat8Layer);
		}
		if (url) {
			landsat8Layer.setUrl(url);
			landsat8Layer.setOpacity(1);
			$("#without_data").hide()
			$("#with_data").show();
		} else {
			landsat8Layer.setOpacity(0);
			$("#with_data").hide();
			$("#without_data").show();
		}
	}

	// render map
	var render = function(dates) {

		var landsat8Url;

		if (typeof dates === "undefined") {
			return;
		}

		landsat8Url = landsat8.getTileWithin(dates[0], dates[1]);
		updateLandsat8Layer(landsat8Url);

		dates = dates.map(function(d){return util.formattedDate(d, '-')});
		
		var url = CARTODB["URL"] + $.param( getUrlParams(dates) );

		$.getJSON(url)
		.done(function(data) {

			if (dataLayer) {
				leafletMap.removeLayer(dataLayer);
			}
			
			dataLayer = L.geoJson(data, {

				pointToLayer: function(feature, latlng) {
					return L.circleMarker(latlng);
				},

				onEachFeature: function(feature, layer) {
					// mustache template for pop up
					layer.on('click', function() {
						var template = $('#template').html();
						var output = Mustache.render(template, feature.properties);
						layer.bindPopup(output).openPopup();
					});
				},

				style: function(feature) {
					var style = {
						fillColor: '#1a9641',
						fillOpacity: 1,
						opacity: 1,
						radius: 5,
						stroke: true,
						color: 'black',
						weight: 2
					};
					//conditional to outline based on source
					if (feature.properties.sampler == 'NYCWTA') {
						style.color = 'white';
						style.radius = 6;
					}

					//conditional to color points based on enterococcus counts
					if (feature.properties.enterococcus > 34) {
						style.fillColor = '#fdae61';
					}

					if (feature.properties.enterococcus > 104) {
						style.fillColor = '#d7191c';
					}

					return style;
				},

			}).addTo(leafletMap);

		});
	}

    return {
    	initialize: initialize,
    	getDateRange: getDateRange,
    	getEnteroRange: getEnteroRange,
    	updateLandsat8Layer: updateLandsat8Layer,
    	render: render
    }

};