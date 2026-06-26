const fs = require('fs');
const path = require('path');
const geojsonPath = path.join(__dirname, 'data', 'clubs.geojson');
const geojsonRaw = fs.readFileSync(geojsonPath, 'utf8');
const geojson = JSON.parse(geojsonRaw);

const pageClubs = ["Anacortes Yacht Club","Astoria Yacht Club","Bellevue Yacht Club","Bellingham Yacht Club","Birch Bay Village Yacht Club","Cathlamet Yacht Club","Channel Islands Yacht Club","Corinthian Yacht Club of Bellingham","Corinthian Yacht Club of Tacoma","Crescent Beach Yacht Club","Dagmars Yacht Club","Day Island Yacht Club","Deep Cove Yacht Club","Deer Harbor Yacht Club","Des Moines Yacht Club","False Creek Yacht Club","Fidalgo Yacht Club","Fircrest Yacht Club","Flounder Bay Yacht Club","Hidden Harbor Yacht Club","Hood River Yacht Club","Juneau Yacht Club","Kingston Cove Yacht Club","La Conner Yacht Club","Ladysmith Yacht Club","Lahaina Yacht Club","Longview Yacht Club","Maple Bay Yacht Club","Milltown Sailing Association","Multnomah Channel Yacht Club","Nanaimo Yacht Club","Navy Yacht Club - Everett","Oak Harbor Yacht Club","Oakland Yacht Club","Olympia Yacht Club","Orcas Island Yacht Club","Oro Bay Yacht Club","Point Roberts Marina Resort","Point Roberts Yacht Club","Port Angeles Yacht Club","Port Ludlow Yacht Club","Port Madison Yacht Club","Port Townsend Yacht Club","Portland Yacht Club","Quartermaster Yacht Club","Roche Harbor Yacht Club","Rose City Yacht Club","Royal City Yacht Club","Royal New Zealand Yacht Squadron","Royal Vancouver Yacht Club - Coal Harbour","Royal Vancouver Yacht Club - Jericho","Sauvie Island Yacht Club","Schooner Cove Yacht Club","Semiahmoo Yacht Club","Sequim Bay Yacht Club","Shelter Bay Yacht Club","Shelton Yacht Club","Silva Bay Yacht Club","Sinclair Inlet Yacht Club","South Whidbey Yacht Club","Swinomish Yacht Club","Three Tree Point Yacht Club","Totem Yacht Club","Vancouver Rowing Club","Ventura Yacht Club","Walla Walla Yacht Club","West Sound Corinthian Yacht Club","Willamette Sailing Club"];

const geojsonClubs = geojson.features.map(f => f.properties.name);

// Find clubs in GeoJSON but not on page
const inGeoJsonNotPage = geojsonClubs.filter(c => !pageClubs.includes(c));

// Find clubs on page but not in GeoJSON
const inPageNotGeojson = pageClubs.filter(c => !geojsonClubs.includes(c));

console.log('=== VALIDATION REPORT ===');
console.log(`\nPage has: ${pageClubs.length} clubs`);
console.log(`GeoJSON has: ${geojsonClubs.length} clubs`);

if (inGeoJsonNotPage.length > 0) {
  console.log(`\n❌ IN GEOJSON BUT NOT ON PAGE (${inGeoJsonNotPage.length}):`);
  inGeoJsonNotPage.forEach(c => console.log('  - ' + c));
}

if (inPageNotGeojson.length > 0) {
  console.log(`\n❌ ON PAGE BUT NOT IN GEOJSON (${inPageNotGeojson.length}):`);
  inPageNotGeojson.forEach(c => console.log('  - ' + c));
}

if (inGeoJsonNotPage.length === 0 && inPageNotGeojson.length === 0) {
  console.log('\n✅ All clubs match between GeoJSON and page!');
}

// Also show club count breakdown
console.log(`\nClubs in GeoJSON with coordinates: ${geojson.features.filter(f => !(f.geometry.coordinates[0] === 0 && f.geometry.coordinates[1] === 0)).length}`);
console.log(`Clubs in GeoJSON with website info: ${geojson.features.filter(f => f.properties.website !== null).length}`);
