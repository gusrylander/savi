"use strict";

var sliderControl = null;
var myMap = null;
var testLayer = null;

myMap = L.map("map").setView([40.719190, -73.996589], 10);

// basemap
L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
    attribution: "&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
}).addTo(myMap);

testLayer = L.geoJson(utilitySteamMain,{
	filter: function(feature) {return Array.isArray(feature.geometry.coordinates)},
	onEachFeature: function(feature, layer) {
		layer.bindPopup(feature.properties.time);
	}
});

sliderControl = L.control.sliderControl({
	position: "topright",
	layer: testLayer,
	timeAttribute: "time"
});

myMap.addControl(sliderControl);
sliderControl.startSlider();
