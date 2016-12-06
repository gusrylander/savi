"use strict";

var sliderControl;
var myMap;

sliderControl = null;
myMap = L.map("map").setView([52.06, 7.40], 10);

// basemap
L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
    attribution: "&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
}).addTo(myMap);


$.getJSON("points.json", function (json) {
    var testlayer = L.geoJson(json);
    sliderControl = L.control.sliderControl({
        position: "topright",
        layer: testlayer
    });

    myMap.addControl(sliderControl);
    sliderControl.startSlider();
});
