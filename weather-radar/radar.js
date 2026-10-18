/* Standalone display. All times are stored in UTC and displayed in Eastern time. */
(() => {
  'use strict';
  const radarService = 'https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity_time/ImageServer';
  const $ = id => document.getElementById(id);
  const clock = new Intl.DateTimeFormat('en-US', {timeZone:'America/New_York',hour:'numeric',minute:'2-digit'});
  const message = text => { $('notice').textContent = text; $('notice').hidden = !text; };
  if (!window.L) { message('The map library could not load. Check the internet connection and reload.'); $('status').textContent = 'Map unavailable'; return; }
  const map = L.map('map', {zoomControl:false, dragging:false, touchZoom:false, scrollWheelZoom:false,
    doubleClickZoom:false, boxZoom:false, keyboard:false, zoomSnap:0.1, minZoom:6, maxZoom:12}).setView([39.825,-83.64],9);
  map.createPane('radar'); map.getPane('radar').style.zIndex = 350;
  map.createPane('boundaries'); map.getPane('boundaries').style.zIndex = 450;
  map.createPane('county'); map.getPane('county').style.zIndex = 425;
  const basemap = L.tileLayer('https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png?key=cb1_4o58_1_b5b8cf1631d9b18fcc15865a', {
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> &copy; <a href="https://carto.com/attributions">CARTO</a>', maxZoom:19
  }).addTo(map);
  map.attributionControl.addAttribution('<a href="https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity_time/ImageServer">NOAA / NWS MRMS</a>');
  basemap.on('tileerror', () => message('Some background map tiles could not load. Check the internet connection.'));
  let localBounds, frames = [], current = -1, timer, generation = 0, busy = false;
  let boundaryError = false, lastComplete = 0;
  function show(index) {
    if (!frames[index]?.loaded) return;
    frames.forEach((frame,i) => frame.layer.setOpacity(i === index ? .75 : 0));
    current = index;
    $('frame-time').textContent = clock.format(frames[index].time);
  }
  function schedule() {
    clearTimeout(timer);
    if (!frames.length || document.hidden) return;
    timer = setTimeout(() => {
      const next = frames.findIndex((f,i) => i > current && f.loaded);
      show(next < 0 ? frames.findIndex(f => f.loaded) : next);
      schedule();
    }, current === frames.length - 1 ? 1800 : 650);
  }
  function imageURL(id, bounds, size) {
    const sw = L.CRS.EPSG3857.project(bounds.getSouthWest());
    const ne = L.CRS.EPSG3857.project(bounds.getNorthEast());
    const scale = Math.min(1,1600/size.x,1000/size.y);
    const params = new URLSearchParams({bbox:[sw.x,sw.y,ne.x,ne.y].join(','),bboxSR:'3857',imageSR:'3857',
      size:[Math.round(size.x*scale),Math.round(size.y*scale)].join(','),format:'png32',transparent:'true',f:'image',
      mosaicRule:JSON.stringify({mosaicMethod:'esriMosaicLockRaster',lockRasterIds:[id],ascending:false})});
    return radarService + '/exportImage?' + params;
  }
  async function availableFrames() {
    const params = new URLSearchParams({where:"idp_subset = 'CONUS'",outFields:'objectid,idp_validtime',
      returnGeometry:'false',orderByFields:'idp_validtime DESC',f:'json',_ : String(Date.now())});
    const response = await fetch(radarService+'/query?'+params,{signal:AbortSignal.timeout(15000)});
    if (!response.ok) throw Error('Radar catalog unavailable');
    const data = await response.json();
    if (data.error || data.exceededTransferLimit) throw Error('Incomplete radar catalog');
    const sorted = (data.features || []).map(f=>({id:f.attributes.objectid,time:f.attributes.idp_validtime}))
      .filter(f=>Number.isFinite(f.id)&&Number.isFinite(f.time)&&f.time<=Date.now()+60000)
      .sort((a,b)=>a.time-b.time);
    if (!sorted.length) throw Error('No radar frames available');
    const latest = sorted.at(-1).time;
    return sorted.filter((f,i)=>f.time>=latest-2*60*60000 && (!i || f.time!==sorted[i-1].time));
  }
  function loadFrame(frame, token) {
    return new Promise(resolve => {
      let done = false;
      const finish = success => {
        if (done) return; done = true; clearTimeout(timeout);
        frame.loaded = success && token === generation;
        if (!frame.loaded) map.removeLayer(frame.layer);
        resolve(frame.loaded);
      };
      const timeout = setTimeout(() => finish(false),15000);
      frame.layer.once('load',() => finish(true)).once('error',() => finish(false)).addTo(map);
    });
  }
  async function refresh() {
    if (busy) return;
    busy = true;
    const token = ++generation;
    const pending = [];
    try {
      if (!frames.length) $('status').textContent = 'Loading NOAA radar…';
      const catalog = await availableFrames();
      const bounds = map.getBounds(), size = map.getSize();
      const next = catalog.map(item => {
        const url = imageURL(item.id,bounds,size);
        const cached = frames.find(f=>f.url===url && f.loaded);
        if (cached) return cached;
        const frame = {...item,url,loaded:false,layer:L.imageOverlay(url,bounds,{pane:'radar',opacity:0,interactive:false})};
        pending.push(frame); return frame;
      });
      // Only fetch newly published images; keep the existing loop playing during updates.
      for (let i=pending.length-1;i>=0;i--) await loadFrame(pending[i],token);
      const available = next.filter(f=>f.loaded);
      if (!available.length) throw Error('Radar images unavailable');
      frames.filter(f=>!available.includes(f)).forEach(f=>map.removeLayer(f.layer));
      frames = available;
      lastComplete = Date.now();
      const age = Math.max(0,Math.round((Date.now()-frames.at(-1).time)/60000));
      $('status').textContent = frames.length+' frames · latest '+age+' min ago';
      message(boundaryError ? 'Local boundaries could not load. Reload to retry.' : age>15 ? 'NOAA radar is delayed · latest frame '+age+' minutes old.' : available.length<next.length ? 'Some radar frames are unavailable; playback skips them.' : '');
      show(frames.length-1);
    } catch(error) {
      pending.filter(f=>!frames.includes(f)).forEach(f=>map.removeLayer(f.layer));
      $('status').textContent = frames.length ? 'Update failed · showing previous loop' : 'Radar unavailable';
      message('NOAA radar could not update. Retrying automatically within one minute.');
    } finally { busy=false; schedule(); }
  }
  async function loadBoundaries() {
    try {
      const definitions = [['ClarkCounty.geojson','Clark','Clark County',0],['TownshipBoundries.geojson','Madison','Madison Township',.10],['MunicipalBoundary.geojson','SOUTH CHARLESTON','South Charleston',.22]];
      const layers = await Promise.all(definitions.map(async ([file,name,label,fillOpacity]) => {
        const response = await fetch(file); if(!response.ok) throw Error('Boundary request failed');
        const data = await response.json();
        const feature = data.features.find(f => f.properties.NAME === name);
        if(!feature) throw Error('Boundary missing');
        // These supplied files use CRS84 longitude/latitude, as expected by Leaflet GeoJSON.
        const county = name === 'Clark';
        return L.geoJSON(feature,{pane:county ? 'county' : 'boundaries',interactive:false,
          style:{color:county ? '#45d9ef' : '#ff424e',weight:3,fillColor:'#ff3545',fillOpacity},
          onEachFeature:(_,layer) => {
            if (county) layer.bindTooltip(label,{permanent:true,direction:'center',
              offset:[0,15],className:'area-label county-label'});
          }}).addTo(map);
      }));
      localBounds = L.featureGroup(layers).getBounds();
      map.fitBounds(localBounds.pad(.18),{animate:false});
    } catch(error) { boundaryError = true; message('Local boundaries could not load. Reload to retry.'); }
  }
  let moveTimer;
  loadBoundaries().then(() => {
    refresh();
    map.on('moveend',() => {clearTimeout(moveTimer); moveTimer=setTimeout(refresh,600);});
  });
  setInterval(() => { if(!document.hidden && !busy) refresh(); },60000);
  document.addEventListener('visibilitychange',() => {if(document.hidden) clearTimeout(timer); else if(Date.now()-lastComplete>60000) refresh(); else schedule();});
  window.addEventListener('online',() => refresh());
})();
