# Weather radar

Standalone, automatically playing radar slide for Madison Township and South Charleston in Clark County, Ohio. The supplied GeoJSON files provide the actual red outlines and translucent red shading. The red areas have no overlay name labels; Clark County retains its cyan label.

Clark County has a cyan outline with no fill, and the map fits the entire county. ClarkCounty.geojson is bundled from the Ohio OGRIP County Boundaries service (CNTY_FIPS 023, exported in EPSG:4326): https://maps.ohio.gov/arcgis/rest/services/OGRIP/OhioCounties/MapServer/1 . Keep all three GeoJSON files with the application when hosting.

The loop uses NOAA/NWS MRMS base reflectivity imagery. Every minute it queries the CONUS image catalog, selects available frames from the newest two-hour window, and requests each exact raster by its catalog ID. Times shown are NOAA frame timestamps. There is no artificial processing delay. The public image service is documented as updating every five minutes; its actual availability varies, and the catalog may offer less than two hours. This is not a guaranteed two-minute feed.

Already loaded images are reused while new frames load, keeping the loop playing during updates. Failed frames are skipped. If an update fails, the previous loop remains visible with a warning and retries within a minute. The header shows the newest loaded frame age; a warning appears when a successful update contains imagery more than 15 minutes old.

Playback starts automatically and pauses while the page is hidden. This is a display-only kiosk with no playback controls or map interaction. A passive progress bar shows the current position in the loop. Red boundary shading stays above the radar imagery.

## Hosting and preview

Copy this folder's contents into a GitHub Pages repository root and enable Pages for the main branch. No build step is required. The department's CARTO Basemaps key is configured in radar.js for this radar application's basemap requests. Keep both GeoJSON files beside index.html. Serve through HTTP for local preview; opening index.html directly from disk will prevent boundary loading in most browsers.

Leaflet 1.9.4 and its license are bundled in assets/. Internet access is required for CARTO/OpenStreetMap basemap tiles and NOAA/NWS radar images. Source attribution is visible on the page. Nothing has been published or deployed.

Radar service documentation: https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity_time/ImageServer
