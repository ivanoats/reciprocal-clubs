const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const geojsonPath = path.join(dataDir, 'clubs.geojson');
const kmlPath = path.join(dataDir, 'clubs.kml');
const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Start building KML
let kml = '<?xml version="1.0" encoding="UTF-8"?>\n';
kml += '<kml xmlns="http://www.opengis.net/kml/2.2">\n';
kml += '  <Document>\n';
kml += '    <name>Sloop Tavern Yacht Club - Reciprocal Clubs</name>\n';
kml += '    <description>68 active reciprocal yacht clubs</description>\n';

// Group clubs by region
const regions = {};
geojson.features.forEach(feature => {
  const region = feature.properties.region || 'Other';
  if (!regions[region]) {
    regions[region] = [];
  }
  regions[region].push(feature);
});

// Create a folder for each region
Object.keys(regions).sort().forEach(region => {
  kml += '    <Folder>\n';
  kml += '      <name>' + escapeXml(region) + '</name>\n';
  
  regions[region].forEach(feature => {
    const props = feature.properties;
    const coords = feature.geometry.coordinates;
    const lat = coords[1];
    const lng = coords[0];
    
    // Build description with available info
    let description = '';
    if (props.distance_nm) {
      description += 'Distance: ' + props.distance_nm + ' nm\n';
    }
    if (props.website) {
      description += 'Website: ' + props.website + '\n';
    }
    if (props.address) {
      description += 'Address: ' + props.address + '\n';
    }
    if (props.phone) {
      description += 'Phone: ' + props.phone + '\n';
    }
    
    kml += '      <Placemark>\n';
    kml += '        <name>' + escapeXml(props.name) + '</name>\n';
    if (description) {
      kml += '        <description>' + escapeXml(description) + '</description>\n';
    }
    kml += '        <Point>\n';
    kml += '          <coordinates>' + lng + ',' + lat + ',0</coordinates>\n';
    kml += '        </Point>\n';
    kml += '      </Placemark>\n';
  });
  
  kml += '    </Folder>\n';
});

kml += '  </Document>\n';
kml += '</kml>\n';

fs.writeFileSync(kmlPath, kml);
console.log('✅ KML file created: data/clubs.kml');
console.log('   Clubs: ' + geojson.features.length);
console.log('   Regions: ' + Object.keys(regions).length);
