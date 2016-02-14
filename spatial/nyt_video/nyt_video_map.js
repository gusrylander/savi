(function(){
	
	const BASEMAP_URL		= "http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png";
	const DATA_URL			= "https://savi.cartodb.com/u/rylander/api/v2/viz/f02cf620-d05a-11e5-b8f0-0ecd1babdde5/viz.json";
	const ATTRIBUTION		= "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>\
	 							contributors, &copy; <a href=\"http://cartodb.com/attributions\">CartoDB</a>";
	//const MAIN_QUERY		= "SELECT * FROM video_locations WHERE published_on >= '2008-01-01' AND published_on <= '2008-12-31'";
	const MAIN_QUERY		= "SELECT * FROM video_locations";
	const TEMP_QUERY		= "INSERT INTO selected_video_locations";
	const SQL_API_BASE_URL	= "https://rylander.cartodb.com/api/v2/sql"
	const API_KEY			= "c85f144b590aebe39929ef9ce6fbc5a5c468e3a2"


	function handleFeatureOver(e, latlng, pos, data) {
		//console.log("Hey! You're hovering over " + data.google_place_name + " (" + data.cartodb_id + ")");
	}
	
	function revealHiddenFeatures(data) {
		var	nFeatures = data.rows.length;
		console.log("n features: " + nFeatures);
		/* this sql block finds all the rows that have the same location (I used google_place_id) as the
		   selected one.  it creates a new result set containing the metadata for all those rows, but it
		   offsets the locations (the_geom_webmercator) so that the displayed point symbols don't overlap.
		*/
		cartodb.createLayer(map, {
			type: 'cartodb',
			sublayers: [{
				sql: 
					"WITH " +
					"q AS (SELECT cartodb_id,the_geom_webmercator FROM rylander.videos WHERE google_place_id='" + data.rows[0].google_place_id + "')," +
					"m AS (SELECT count(*) n,array_agg(cartodb_id) id_list,the_geom_webmercator FROM q GROUP BY the_geom_webmercator)," +
					"g AS (SELECT n,generate_series(1,array_length(id_list,1)) p,unnest(id_list) cartodb_id,the_geom_webmercator FROM m) " +
					"SELECT " +
						"ST_SetSRID(" +
							"ST_MakePoint(" +
								"ST_X(g.the_geom_webmercator)+g.p*180*cos(g.p*radians(301*ceil(g.n/20.0))/g.n)," +
								"ST_Y(g.the_geom_webmercator)+g.p*180*sin(g.p*radians(301*ceil(g.n/20.0))/g.n)" +
							"),3857) the_geom_webmercator," +
						"g.the_geom_webmercator," +
						"g.p," +
						"g.n," +
						"g.cartodb_id," +
						"v.headline," +
						"v.byline," +
						"v.google_geo_term," +
						"v.summary," +
						"v.video_file_url " +
					"FROM g,rylander.videos v " +
					"WHERE g.cartodb_id=v.cartodb_id",
				cartocss: 'Map {buffer-size: 512} #table_name {marker-fill: #0F3B82; marker-width: 25; marker-line-color: #FFF; marker-line-width: 1.5; marker-allow-overlap: true; [zoom<7] {marker-allow-overlap: false;}}',
				interactivity: 'cartodb_id, headline, byline, google_geo_term, video_file_url'
			}]
		})
		.addTo(map)
		.done(function(layer) {
			layer.getSubLayer(0).setInteraction(true);
			console.log("done creating sublayer");
			cartodb.vis.Vis.addInfowindow(map, layer.getSubLayer(0), ['headline','byline', 'google_geo_term']);
		});
	}
	
	function getScatteredPoints(data) {
		console.log("getScatteredPoints:");
		console.log(data);
	}
	
	function handleFeatureClick(e, latlng, pos, data) {
		sql = MAIN_QUERY + " WHERE google_place_id='" +  data.google_place_id + "' ORDER BY published_on";
		uri = SQL_API_BASE_URL + "?q=" + sql + "&api_key=" + API_KEY;
		console.log("location: " + data.google_place_name);
		$.getJSON(uri, revealHiddenFeatures);
	}
	
	function handleLayerError() {
		console.log("error creating data layer");
	}
	
	function handleLayerDone(layer) {
		dataSubLayer = layer.getSubLayer(0);
		dataSubLayer.set(subLayerOptions);
		dataSubLayer.on('featureOver', handleFeatureOver);
		dataSubLayer.on('featureClick', handleFeatureClick);
	}


	// create new leaflet map in cartodb-map element
	var map = new L.Map('cartodb-map', { 
		center: [0,0],
		zoom: 2
	});
		
	// create and add basemap layer to leaflet map
	var baseMapLayer = L.tileLayer( 
		BASEMAP_URL, 
		{attribution: ATTRIBUTION}
	);
	map.addLayer(baseMapLayer);
	
	// prepare data sublayer parameters
	var dataSubLayer = null;
	var subLayerOptions = {
		sql: MAIN_QUERY
	}
	
	// create data layer add it to leaflet map
	cartodb.createLayer(map, DATA_URL)
		.addTo(map)
		.on('done', handleLayerDone)
		.on('error', handleLayerError);
	
}());