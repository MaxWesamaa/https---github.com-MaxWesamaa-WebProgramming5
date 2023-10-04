
async function getData(url) {
    const res2 = await fetch(url);
    return await res2.json();
}

const fetchData = async () => {
    const url = "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326"
    const res = await fetch(url)
    const data = await res.json()
    
    const posMigrationData = await getData("https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f")
    const negMigrationData  = await getData("https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e")

    console.log(posMigrationData)
    console.log(negMigrationData)

    for(let idx = 0; idx < data.features.length; idx++) {
        data.features[idx].properties.posData = posMigrationData.dataset.value[idx+1];
        data.features[idx].properties.negData = negMigrationData.dataset.value[idx+1];
    }
    console.log(data.features)
    initMap(data)
};

const getFeature = (feature, layer) => {
    if (!feature.properties.name) return;
    const name = feature.properties.name;
    const positive = feature.properties.posData;
    const negative = feature.properties.negData;
    layer.bindPopup(`
    <ul>
      <li>Name: ${name}</li>
      <li>Positive migration: ${positive}</li>
      <li>Negative migration: ${negative}</li>
    </ul>
    `)
    layer.bindTooltip(name);
}

const getStyle = (feature) => {
    const positive = feature.properties.posData;
    const negative = feature.properties.negData;
    let clr = (Math.pow(positive/negative, 3)*60 < 120) ? Math.pow(positive/negative, 3)*60 : 120;
    return {
        color: `hsl(${clr},75%,50%)`
    }
}

const initMap = (data) => {
    let map = L.map('map', {
        minZoom: -3
    })

    let geoJson = L.geoJSON(data, {
        onEachFeature: getFeature,
        style: getStyle
    }).addTo(map)

    let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    map.fitBounds(geoJson.getBounds());

}
 
fetchData();
