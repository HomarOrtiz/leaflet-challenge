const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";
const esriAttribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

function chooseColor(depth) {
    if (depth < 10) return "#FFFF00";  // Light Yellow
    else if (depth < 30) return "#FFD700";  // Gold
    else if (depth < 50) return "#FFA500";  // Orange
    else if (depth < 70) return "#FF6347";  // Tomato
    else if (depth < 90) return "#FF0000";  // Red
    else return "#8B0000";  // Dark Red
}

function markerSize(magnitude) {
    return magnitude * 30000;
}

function createMap(earthquakes) {
    const esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: esriAttribution
    });

    const myMap = L.map("map", {
        center: [-11.46, 130.85],
        zoom: 4,
        layers: [esri, earthquakes]
    });

    const legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
        const div = L.DomUtil.create("div", "info legend");
        const depth = [-10, 10, 30, 50, 70, 90];

        for (let i = 0; i < depth.length - 1; i++) {
            const colorSquare = L.DomUtil.create("div", "color-square");
            colorSquare.style.backgroundColor = chooseColor(depth[i] + 1);
            colorSquare.innerHTML = depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] : '+');
            div.appendChild(colorSquare);
        }

        div.style.backgroundColor = 'white';
        div.style.width = '100px';  
        div.style.height = '150px';  
        div.style.padding = '10px';  

        return div;
    };

    const legendContainer = legend.addTo(myMap).getContainer();
    legendContainer.style.fontSize = '20px';
}


function createFeatures(earthquakeData) {
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }

    const earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            const markers = {
                radius: markerSize(feature.properties.mag),
                fillColor: chooseColor(feature.geometry.coordinates[2]),
                fillOpacity: 0.7,
                color: "black",
                stroke: true,
                weight: 0.5
            };
            return L.circle(latlng, markers);
        }
    });

    createMap(earthquakes);
}

d3.json(url).then(function (data) {
    console.log(data);
    createFeatures(data.features);
});