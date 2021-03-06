const BASEMAP = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
	  ATTRIBUTION = 'Map Data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors, Map Tiles &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';

var map,
	CartoDBTiles,
	fillColor,
	radius,
	checkCashingStyle,
	checkCashingInteraction,
	checkCashingCustomStuff,
	checkCashingLayer,
	legend;
	
// compute color for check caching amount classifications
fillColor = function(d) {
    return d > 500000 ? '#006d2c' :
           d > 250000 ? '#31a354' :
           d > 100000 ? '#74c476' :
           d > 50000  ? '#a1d99b' :
           d > 10000  ? '#c7e9c0' :
                        '#edf8e9';
}

// compute circle radius for number of customer classifications
radius = function(d) {
    return d > 9000 ? 20 :
           d > 7000 ? 12 :
           d > 5000 ? 8  :
           d > 3000 ? 6  :
           d > 1000 ? 4  :
                      2 ;
}

// create styled check cashing marker
checkCashingStyle = function (feature, latlng){
    var checkCashingMarker = L.circleMarker(latlng, {
        stroke: false,
        fillColor: fillColor(feature.properties.amount),
        fillOpacity: 1,
        radius: radius(feature.properties.customers)
    });

    return checkCashingMarker;

}

// define user interaction
checkCashingInteraction = function(feature,layer){
	var highlight = {
        stroke: true,
        color: '#ffffff', 
        weight: 3,
        opacity: 1,
    };

    var clickHighlight = {
        stroke: true,
        color: '#f0ff00', 
        weight: 3,
        opacity: 1,
    };

    var noHighlight = {
        stroke: false,
    };

	layer.on('mouseover', function(e) {
		layer.setStyle(highlight);
		if (!L.Browser.ie && !L.Browser.opera) {
			layer.bringToFront();
		}
	});

	layer.on('mouseout', function(e) {
		layer.setStyle(noHighlight); 
	});

	layer.on("click",function(e){
		layer.bindPopup(
			'<div class="popupStyle"><h3>' + 
			feature.properties.name + 
			'</h3><p>'+ 
			feature.properties.address + 
			'<br /><strong>Amount:</strong> $' +
			feature.properties.amount + 
			'<br /><strong>Customers:</strong> ' + 
			feature.properties.customers + 
			'</p></div>'
		).openPopup();
		layer.setStyle(clickHighlight); 
	});

}

addLegend = function(map) {
	var div = L.DomUtil.create('div', 'legend'),
	amounts = [0, 10000, 50000, 100000, 250000, 500000],
	customers = [0, 1000, 3000, 5000, 7000, 9000];
	div.innerHTML += '<p><strong>Amounts</strong></p>';
	
	// check cashing amount
	for (var i = 0; i < amounts.length; i++) {
		div.innerHTML +=
			'<i style="background:' + 
			fillColor(amounts[i] + 1) + 
			'"></i> ' +
			amounts[i] + 
			(amounts[i + 1] ? '&ndash;' + amounts[i + 1] + '<br />' : '+<br />');
	}
	
	// n customers
	div.innerHTML += '<p><strong>Customers</strong></p>';

	for (var i = 0; i < customers.length; i++) {
		var borderRadius = radius(customers[i] + 1);
		var widthHeight = borderRadius * 2;
		div.innerHTML +=
			'<i class="circle" style="width:' + 
			widthHeight + 
			'px; height:' + 
			widthHeight + 
			'px; -webkit-border-radius:' + 
			borderRadius + 
			'px; -moz-border-radius:' + 
			borderRadius + 
			'px; border-radius:' + 
			borderRadius + 
			'px;"></i> ' +
			customers[i] + 
			(customers[i + 1] ? '&ndash;' + customers[i + 1] + '<br />' : '+<br />'
		);
	}
	
	return div;
}


/************************ main *************************/

// get basemap layer
CartoDBTiles = L.tileLayer(BASEMAP,{ attribution: ATTRIBUTION });

// build data layer
checkCashingCustomStuff = L.geoJson(null, {
    pointToLayer: checkCashingStyle,
    onEachFeature: checkCashingInteraction
});
checkCashingLayer = omnivore.csv('CheckCashing.csv', null, checkCashingCustomStuff);

// build legend
legend = L.control({position: 'bottomright'});
legend.onAdd = addLegend;

// create map and add layers
map = L.map('mapid').setView([40.719190, -73.996589], 12);
map.addLayer(CartoDBTiles);
map.addLayer(checkCashingLayer);
legend.addTo(map);
