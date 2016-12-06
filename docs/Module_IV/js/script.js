var w = 500,
	h = 300,
	projection,
	path,
	color,
	svg,
	paths;

// define projection
projection = 
	d3.geo.albersUsa()
	.translate([w/2, h/2])
	.scale([500]);

// define projection path
path = 
	d3.geo.path()
	.projection(projection);

// define color range
color = 
	d3.scale.quantize()
	.range([
		"rgb(237,248,233)",
		"rgb(186,228,179)",
		"rgb(116,196,118)",
		"rgb(49,163,84)",
		"rgb(0,109,44)"
	]);

// add sv containg
svg = 
	d3.select("#myMap")
	.append("svg")
	.attr("width", w)
	.attr("height", h);

// get agricultural data
d3.csv("data/us-ag-productivity-2004.csv", function(data) {

	// get color domain ... range was already defined above
    color.domain([
        d3.min(data, function(d) { return d.value; }), 
        d3.max(data, function(d) { return d.value; })
    ]);

    // get us states data
	d3.json("data/us-states.json", function(json) {

		// join states and agricultural data
		for (var i = 0; i < data.length; i++) {
			var dataState,
				dataValue;
			dataState = data[i].state;
			dataValue = parseFloat(data[i].value);  
			for (var j = 0; j < json.features.length; j++) {
				var jsonState;
				jsonState = json.features[j].properties.name;
				if (dataState == jsonState) {
					json.features[j].properties.value = dataValue;
					break;
	            }
	        }       
	    }

	    // plot paths from states data
		paths = 
			svg.selectAll("path")
			.data(json.features)
			.enter()
			.append("path")
			.attr("d", path)
			.style("fill", function(d) {
				var value = d.properties.value;
				if (value) {
					return color(value);
				} else {
					return "#ccc";
				}
			});

		// plot cities
		d3.csv("data/us-cities.csv", function(data) {
			svg.selectAll("circle")
			.data(data)
			.enter()
			.append("circle")
			.attr("cx", function(d) {
				return projection([d.lon, d.lat])[0];
			})
			.attr("cy", function(d) {
				return projection([d.lon, d.lat])[1];
			})
			.attr("r", function(d) {
				return Math.sqrt(parseInt(d.population) * 0.00004);
			})
			.style("fill", "grey")
			.style("stroke", "white")
			.style("opacity", 0.75);
		});
    });
});


