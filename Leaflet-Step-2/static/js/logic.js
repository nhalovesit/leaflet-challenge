var api_key = "input key here";

// Create the tile layer that will be the background of our map
var light_map = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.light",
  accessToken: api_key
}), satellite_map = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets-satellite",
  accessToken: api_key
}), outdoor_map = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.outdoors",
  accessToken: api_key
});

// create a map object and link to the index.html mapid
// center the map to Atlanta, GA, and set the zoom level at 4
/* var layers = {
  LIGHT_MAP: new L.LayerGroup(),
  SATELLITE: new L.LayerGroup(),
  OUTDOOR_MAP: new L.LayerGroup()
}; */

var map = L.map("mapid", {
  center: [
    33.7, -84.4
  ],
  zoom: 4,
  layers: [
    light_map, 
    satellite_map, 
    outdoor_map]
});

// Add the default lightmap tile layer
light_map.addTo(map);

// Create the earthquakes and tectonic_plates layers
var tectonic_plates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

// Define base map to allow all visible map options, one can be shown at a time
var base_map = {
  "Satellite View": satellite_map,
  "Grayscale View": light_map,
  "Outdoors View": outdoor_map
};

// Define the overlay layers, tectonic plates and earthquakes
var overlays = {
  "Tectonic Plates": tectonic_plates,
  "Earthquakes": earthquakes
};

// Define the controls for the user to select the map and overlay layers
L
  .control
  .layers(base_map, overlays)
  .addTo(map);

// AJAX call to pull the earthquake geoJSON data
// set the opacity, call color function to get the color, mag assign to radius of the circle
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function(data) {
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: get_color(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // Returns the color based on the magnitude value passed to function
  function get_color(magnitude) {
    if (magnitude > 5){
      return "#D9000F";
    }
    else if (magnitude > 4) {
      return "#D26E00";
    }
    else if (magnitude > 3){
      return "#CEAA00";
    }
    else if (magnitude > 2){
      return "#71C600";
    }
    else if (magnitude > 1){
      return "#35C200";
    }
    else {
      return "#00BF05";
    }
  }
  
 // Returns 5 times the magniture passed
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 5;
  }

  // Add GeoJSON to the data after the file loads
  L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    // Call  circleMarker the set the style
    style: styleInfo,
    // Create a popup for each marker 
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
    // Add the data to the earthquake layer instead of directly to the map
  }).addTo(earthquakes);

  // Add the earthquake layer 
  earthquakes.addTo(map);

  // Create a legend control
  var legend = L.control({
    position: "bottomleft"
  });

  legend.onAdd = function() {
    var div = L
      .DomUtil
      .create("div", "info legend");

    var intensity_scale = [0, 1, 2, 3, 4, 5];
    var colors = ["#00BF05","#98ee00","#71C600","#CEAA00","#D26E00","#D9000F"];

    // Loop through our intervals and generate a label with a colored square for each interval.
    for (var i = 0; i < intensity_scale.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
        intensity_scale[i] + (intensity_scale[i + 1] ? "&ndash;" + intensity_scale[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // Add legend to the map
  legend.addTo(map);

});
