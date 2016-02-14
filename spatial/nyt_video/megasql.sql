"WITH " +
	"q AS ( " +
		"SELECT " +
			"cartodb_id, " +
			"the_geom_webmercator " +
		"FROM rylander.videos " +
		"WHERE google_place_id = 'ChIJufI-cg9EXj4RCBGXQZMuzMc' " +
	"), " +
	"m AS ( " +
		"SELECT " +
			"count(*) n, " +
			"array_agg( cartodb_id ) id_list, " +
			"the_geom_webmercator " +
		"FROM q " +
		"GROUP BY the_geom_webmercator " +
	"), " +
	"f AS ( " +
		"SELECT " +
			"n, " +
			"generate_series( 1, array_length( id_list,1 ) ) p, " +
			"unnest( id_list ) cartodb_id, " +
			"the_geom_webmercator " +
		"FROM m " +
	") " +
"SELECT " +
	"ST_SetSRID( " +
		"ST_MakePoint( " +
			"ST_X( " +
				"f.the_geom_webmercator ) + " +
				"f.p * 180 * cos( f.p * radians( 301 * ceil( f.n / 20.0 ) ) / f.n " +
			"), " +
			"ST_Y( " +
				"f.the_geom_webmercator ) + " +
				"f.p * 180 * sin( f.p * radians( 301*ceil( f.n / 20.0 ) ) / f.n " +
			") " +
		"), " +
		"3857 " +
	") the_geom_webmercator, " +
	"f.cartodb_id, " +
	"v.headline, " +
	"v.byline, " +
	"v.google_geo_term, " +
	"v.summary, " +
	"v.video_file_url " +
"FROM " +
	"f, " +
	"rylander.videos v " +
"WHERE f.cartodb_id = v.cartodb_id"
