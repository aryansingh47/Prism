/* PRISM Journey Explorer: interactive maps on user action, no location tracking. */
(() => {
  'use strict';
  const journeys = window.PRISM_JOURNEYS || {};
  if (!Object.keys(journeys).length) return;
  const modal = document.getElementById('pwx-map-dialog');
  const mapElement = document.getElementById('pwx-itinerary-map');
  const mapTitle = document.getElementById('pwx-map-title');
  const mapStops = document.getElementById('pwx-map-stops');
  const linkOSM = document.getElementById('pwx-open-osm');
  const overviewElement = document.getElementById('pwx-overview-map');
  const overviewButton = document.getElementById('pwx-load-overview');
  const overviewResults = document.getElementById('pwx-map-results');
  const search = document.getElementById('pwx-map-search');
  const filter = document.getElementById('pwx-map-filter');
  let leafletPromise, detailMap, detailLayer, overviewMap, overviewLayer, activeJourney, originalFocus;
  let overviewActive = false;

  function loadLeaflet() {
    if (window.L) return Promise.resolve(window.L);
    if (leafletPromise) return leafletPromise;
    leafletPromise = new Promise((resolve, reject) => {
      const style = document.createElement('link');
      style.rel = 'stylesheet'; style.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      style.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      style.crossOrigin = 'anonymous';
      document.head.append(style);
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = 'anonymous';
      script.onload = () => window.L ? resolve(window.L) : reject(new Error('Map library not available'));
      script.onerror = () => reject(new Error('Map library could not be downloaded'));
      document.head.append(script);
    }).catch(error => { leafletPromise = null; throw error; });
    return leafletPromise;
  }
  function tileLayer(L) {
    // The OSM public tile service is only suitable for modest traffic; change to a contracted tile host for scale.
    return L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 17, minZoom: 4, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
      detectRetina: false, updateWhenIdle: true, keepBuffer: 2
    });
  }
  function icon(L, number, overview=false) {
    return L.divIcon({className: 'pwx-pin'+(overview?' pwx-pin--overview':''),
      html: '<span aria-hidden="true">'+number+'</span>', iconSize: [32,32], iconAnchor:[16,16]});
  }
  function locationURL(p) {
    const lat = encodeURIComponent(p.lat), lng = encodeURIComponent(p.lng);
    return `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`;
  }
  function showError(target, message, point) {
    target.replaceChildren();
    const box=document.createElement('div');box.className='pwx-map-placeholder';
    const title=document.createElement('strong');title.textContent='The interactive map is unavailable.';
    const para=document.createElement('p');para.textContent=message+' You can still open the location in Google Maps.';
    const anchor=document.createElement('a');anchor.href=point?locationURL(point):'https://www.openstreetmap.org/';
    anchor.target='_blank';anchor.rel='noopener noreferrer';anchor.textContent='Open in Google Maps ↗';
    box.append(title,para,anchor);target.append(box);
  }
  function setupMap(L, target, zoom=6) {
    const map=L.map(target,{scrollWheelZoom:false,zoomControl:true,preferCanvas:true}).setView([22.5,79],zoom);
    tileLayer(L).addTo(map);
    map.attributionControl.setPrefix(false);
    return map;
  }
  function fit(L, map, points) {
    const bounds=L.latLngBounds(points.map(p=>[p.lat,p.lng]));
    if (bounds.isValid()) map.fitBounds(bounds.pad(.26),{maxZoom:11,animate:!window.matchMedia('(prefers-reduced-motion: reduce)').matches});
  }
  function openDialogFallback() {
    if (typeof modal.showModal==='function') modal.showModal(); else modal.setAttribute('open','');
  }
  function closeDialog() {
    if (!modal) return;
    if (typeof modal.close==='function') modal.close(); else modal.removeAttribute('open');
    if (originalFocus?.isConnected) originalFocus.focus();
  }
  async function openJourney(id, opener) {
    const journey=journeys[id];
    if (!journey || !modal || !mapElement) return;
    originalFocus=opener || document.activeElement; activeJourney=id;
    mapTitle.textContent=journey.name;
    mapStops.replaceChildren();
    journey.points.forEach((pt,i)=>{
      const li=document.createElement('li');const button=document.createElement('button');button.type='button';
      const nr=document.createElement('b');nr.textContent=String(i+1);
      const label=document.createElement('span');label.textContent=pt.name;
      button.append(nr,label);button.addEventListener('click',()=>{
        if (!detailMap || !window.L) return;
        detailMap.setView([pt.lat,pt.lng],Math.max(10,detailMap.getZoom()),{animate:true});
        detailLayer?.eachLayer(layer=>{if(layer.getLatLng && Math.abs(layer.getLatLng().lat-pt.lat)<.0001 && Math.abs(layer.getLatLng().lng-pt.lng)<.0001) layer.openPopup();});
      });li.append(button);mapStops.append(li);
    });
    if (linkOSM) linkOSM.href=locationURL(journey.points[0]);
    if (!modal.open) openDialogFallback();
    mapElement.querySelector('.pwx-map-placeholder')?.remove();
    try {
      const L=await loadLeaflet();
      if (!modal.open || activeJourney!==id) return;
      if (!detailMap) detailMap=setupMap(L,mapElement);
      if (detailLayer) detailMap.removeLayer(detailLayer);
      detailLayer=L.featureGroup().addTo(detailMap);
      journey.points.forEach((pt,i)=> {
        const marker=L.marker([pt.lat,pt.lng],{icon:icon(L,i+1)}).addTo(detailLayer);
        marker.bindPopup(`<strong>${escapeHTML(pt.name)}</strong><br><small>Approximate area</small>`);
      });
      if (journey.points.length>1) L.polyline(journey.points.map(p=>[p.lat,p.lng]),{color:'#146d97',weight:2,opacity:.8,dashArray:'4 8'}).addTo(detailLayer);
      requestAnimationFrame(()=>{detailMap.invalidateSize();fit(L,detailMap,journey.points);});
    } catch(error) { showError(mapElement,error.message,journey.points[0]); }
  }
  function escapeHTML(value) {return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  document.querySelectorAll('[data-pwx-map]').forEach(button=>button.addEventListener('click',()=>openJourney(button.dataset.pwxMap,button)));
  modal?.querySelector('[data-pwx-close]')?.addEventListener('click',closeDialog);
  modal?.addEventListener('click',event=>{if(event.target===modal)closeDialog();});
  modal?.addEventListener('cancel',event=>{event.preventDefault();closeDialog();});
  document.getElementById('pwx-fit-route')?.addEventListener('click',()=>{
    if (detailMap && activeJourney && window.L) fit(window.L,detailMap,journeys[activeJourney].points);
  });
  function matchJourney(id) {
    const j=journeys[id];if(!j)return false;
    const text=(search?.value||'').toLocaleLowerCase('en-IN').trim();
    const type=filter?.value || 'all';
    if(type==='winter' && j.status==='regular') return false;
    if(type==='regular' && j.status!=='regular') return false;
    if(type==='priority' && j.status!=='priority')return false;
    return !text || (j.name+' '+j.region+' '+j.points.map(p=>p.name).join(' ')).toLocaleLowerCase('en-IN').includes(text);
  }
  function repaintOverview() {
    if (!overviewMap || !overviewLayer || !window.L) return;
    const L=window.L; overviewLayer.clearLayers();overviewResults?.replaceChildren();
    const visible=Object.keys(journeys).filter(matchJourney);
    const bounds=[];
    visible.forEach((id,i)=>{
      const j=journeys[id], pt=j.points[Math.floor(j.points.length/2)];bounds.push(pt);
      const marker=L.marker([pt.lat,pt.lng],{icon:icon(L,i+1,true),title:j.name}).addTo(overviewLayer);
      const regionByJourney = window.PRISM_JOURNEY_REGIONS || {};
      const base = document.body?.dataset?.prismRoot || '';
      const link = regionByJourney[id] ? `${base}packages/${regionByJourney[id]}.html#package-${encodeURIComponent(id)}` : `${base}packages.html`;
      marker.bindPopup(`<strong>${escapeHTML(j.name)}</strong><br><a href="${link}">View itinerary →</a>`);
      const btn=document.createElement('button');btn.type='button';btn.className='pwx-map-result';
      const title=document.createElement('strong');title.textContent=j.name;
      const sub=document.createElement('small');sub.textContent=j.region+' · '+(j.status==='request'?'On request':j.status==='regular'?'Classic itinerary':'Winter package');
      btn.append(title,sub);
      btn.addEventListener('click',()=>{
        overviewMap.setView([pt.lat,pt.lng],8);marker.openPopup();
        overviewResults?.querySelectorAll('.is-selected').forEach(el=>el.classList.remove('is-selected'));btn.classList.add('is-selected');
      });overviewResults?.append(btn);
    });
    if (bounds.length) fit(L,overviewMap,bounds);
    if (overviewResults && !visible.length){const p=document.createElement('p');p.textContent='No matching journeys. Try another location.';overviewResults.append(p);}
  }
  overviewButton?.addEventListener('click',async()=>{
    if(overviewActive) {overviewMap?.invalidateSize();return;}
    overviewButton.disabled=true;overviewButton.textContent='Loading map…';
    try {
      const L=await loadLeaflet();overviewElement.querySelector('.pwx-map-placeholder')?.remove();
      overviewMap=setupMap(L,overviewElement,5);overviewLayer=L.layerGroup().addTo(overviewMap);overviewActive=true;
      repaintOverview();overviewButton.textContent='Map ready — explore below';overviewButton.setAttribute('aria-disabled','true');
    }catch(error){showError(overviewElement,error.message);overviewButton.disabled=false;overviewButton.textContent='Retry interactive map';}
  });
  search?.addEventListener('input',()=>{if(overviewActive)repaintOverview();});
  filter?.addEventListener('change',()=>{if(overviewActive)repaintOverview();});
  // Region cards scroll to and expand their respective category; direct hash links also work.
  function openRegionFromHash(){
    const hash=location.hash;
    if(!hash.startsWith('#collection-'))return;
    const target=document.getElementById(hash.slice(1));
    if(target?.tagName==='DETAILS')target.open=true;
  }
  document.querySelectorAll('[data-pwx-region]').forEach(a=>a.addEventListener('click',()=>{
    const region=document.getElementById('collection-'+a.dataset.pwxRegion);if(region)region.open=true;
  }));
  window.addEventListener('hashchange',openRegionFromHash);
  openRegionFromHash();
})();
