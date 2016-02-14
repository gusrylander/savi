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
.addTo(map2)
.done(function(layer) {
	layer.getSubLayer(0).setInteraction(true);
	console.log("done creating sublayer");
	//cdb.vis.Vis.addInfowindow(map2, layer.getSubLayer(0), ['name','passage', 'source']);
});