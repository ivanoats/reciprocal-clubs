# Reciprocal Clubs Data

Comprehensive dataset of **68 active reciprocal yacht clubs** for Sloop Tavern
Yacht Club, with GPS coordinates, contact information, websites, and regional
organization.

## Overview

This repository contains extracted data from the Sloop Tavern Yacht Club
reciprocal mooring pages at
[yachtdestinations.org](https://yachtdestinations.org). The data includes:

- 68 active reciprocal clubs
- GPS coordinates (latitude/longitude)
- Regional organization
- Contact information (addresses, phone numbers)
- Website URLs
- Distance in nautical miles from Seattle

## Data Sources

**Details Page** (68 clubs with full information):
[Details Page](https://yachtdestinations.org/ClubPages/clubpage.php?page=dt&club=63)

This page contains the authoritative list of active reciprocal mooring partners
with contact details and websites.

## Available Formats

| Format | File | Purpose |
| --- | --- | --- |
| GeoJSON | `clubs.geojson` | Modern GIS format for mapping |
| KML | `clubs.kml` | Google Earth, Google Maps |
| JSON | `clubs.json` | Structured data for applications |
| CSV | `clubs.csv` | Spreadsheet import (Excel, Sheets) |

## Data Schema

### GeoJSON Features

Each feature in `clubs.geojson` contains:

```json
{
  "type": "Feature",
  "properties": {
    "name": "Club Name",
    "region": "Region Name",
    "distance_nm": 58,
    "website": "http://example.com",
    "address": "Street Address, City, State ZIP",
    "phone": "+1 206-123-4567"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [-122.6050, 48.5125]
  }
}
```

## Geographic Distribution

Clubs are organized by 16 regions:

- BC Islands (British Columbia)
- British Columbia (mainland)
- Columbia River (Washington/Oregon)
- Hawaii
- Inside Passage Alaska
- Mexico
- New Zealand
- Northern California
- Northern Inland Waters (Washington)
- Olympic & Hood Canal (Washington)
- Portland Area (Oregon)
- Puget Sound North (Washington)
- Puget Sound South (Washington)
- Seattle Area (Washington)
- Southern California
- Vancouver Area (British Columbia)
- Whidbey & Everett (Washington)

## Extraction Methods

### Details Page Data

Data was extracted from HTML table using Playwright:

1. Parsed table rows for club information
2. Extracted: name, city, region, distance, website
3. Cross-referenced with KML for address and phone data
4. Verified all 68 clubs present on the page

### Coordinate Data

GPS coordinates sourced from:

- Map page JavaScript (initial extraction)
- Details page region/website linking (validation)
- Existing KML file (reference data)

## Files in This Repository

- `clubs.geojson` - GeoJSON FeatureCollection (68 clubs)
- `clubs.kml` - KML file with regional folders (68 clubs)
- `clubs.json` - JSON with structured data
- `clubs.csv` - CSV export for spreadsheets
- `README.md` - This file
- `.gitignore` - Git ignore rules
- `validate.js` - Validation script
- `geojson-to-kml.js` - GeoJSON to KML converter

## Usage

### Import to Google Earth

1. Download `clubs.kml`
2. Open Google Earth
3. File → Import → Select `clubs.kml`
4. Clubs appear organized by region

### Import to Google Maps

1. Create a new map at [maps.google.com](https://maps.google.com)
2. Click menu → Import → Upload `clubs.kml`
3. View all 68 reciprocal clubs with information

### Use in Applications

Load `clubs.geojson` into any GIS or mapping library:

```javascript
const clubs = require('./clubs.geojson');
clubs.features.forEach(club => {
  console.log(club.properties.name);
});
```

## Data Quality

- **Last Updated**: June 16, 2026
- **Validation**: All 68 clubs verified against live website
- **Coordinate Coverage**: 68/68 clubs with valid coordinates (100%)
- **Contact Info**: 68/68 clubs with full details (100%)
- **Websites**: 68/68 clubs with active websites (100%)

## License

Data extracted from yachtdestinations.org. Subject to the website's terms of use.
