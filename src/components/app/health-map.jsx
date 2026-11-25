"use client";

// The search page's map: Esri's Dark Gray Canvas (Light Gray with the light
// theme), made a touch darker still, with its place names on top, through
// Leaflet. No key needed (CARTO's tiles now want one). It follows the theme as
// it changes (Themes: Light, Dark, Auto), swapping its tiles in place. It looks where it's told (`view`: your area
// filter, or you) and flies there when that changes; you're the pulsing blue
// dot. It keeps its size as the drag line moves. Providers will show on it as
// they join Oneg.

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas";
const TILES = {
  dark: { base: `${ESRI}/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`, names: `${ESRI}/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}` },
  light: { base: `${ESRI}/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`, names: `${ESRI}/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}` },
};
const ATTRIBUTION = "Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors";

export function HealthMap({ view, me, meLabel }) {
  const box = useRef(null);
  const map = useRef(null);
  const L = useRef(null);
  const meMarker = useRef(null);
  // where to look, as of now (the map is made after a moment, and may miss a change)
  const latest = useRef(view);
  latest.current = view;
  const [ready, setReady] = useState(false);

  // made once, after the page is in the browser (Leaflet needs the window)
  useEffect(() => {
    let gone = false;
    let watch;
    let themeWatch;
    import("leaflet").then((mod) => {
      if (gone || !box.current) return;
      const leaflet = mod.default ?? mod;
      L.current = leaflet;
      const m = leaflet.map(box.current, { zoomControl: false, attributionControl: true, worldCopyJump: true });
      m.attributionControl.setPrefix(false);
      m.setView(latest.current.center, latest.current.zoom);
      // the tiles for the theme; again whenever the theme changes
      let layers = [];
      let shownDark = null;
      const paint = () => {
        const dark = document.documentElement.classList.contains("dark");
        if (dark === shownDark) return;
        shownDark = dark;
        layers.forEach((layer) => layer.remove());
        const tiles = TILES[dark ? "dark" : "light"];
        const base = leaflet.tileLayer(tiles.base, { attribution: ATTRIBUTION, maxZoom: 16 }).addTo(m);
        // Esri's dark grey, nearer black; the names on top stay bright
        if (dark) base.getContainer().style.filter = "brightness(0.55) contrast(1.15)";
        layers = [base, leaflet.tileLayer(tiles.names, { maxZoom: 16, pane: "overlayPane" }).addTo(m)];
      };
      paint();
      themeWatch = new MutationObserver(paint);
      themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      leaflet.control.zoom({ position: "bottomright" }).addTo(m);
      map.current = m;
      setReady(true);
      // the drag line changes its width
      watch = new ResizeObserver(() => m.invalidateSize());
      watch.observe(box.current);
    });
    return () => {
      gone = true;
      watch?.disconnect();
      themeWatch?.disconnect();
      map.current?.remove();
      map.current = null;
      meMarker.current = null;
    };
  }, []);

  // somewhere new to look: fly there
  const key = `${view.center[0]},${view.center[1]},${view.zoom}`;
  useEffect(() => {
    map.current?.flyTo(view.center, view.zoom, { duration: 0.8 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ready]);

  // you, as a pulsing dot
  const meKey = me ? `${me[0]},${me[1]}` : "";
  useEffect(() => {
    const leaflet = L.current;
    const m = map.current;
    if (!leaflet || !m) return;
    meMarker.current?.remove();
    meMarker.current = null;
    if (!me) return;
    const icon = leaflet.divIcon({ className: "oneg-me", html: '<span class="oneg-me-pulse"></span><span class="oneg-me-dot"></span>', iconSize: [18, 18] });
    meMarker.current = leaflet.marker(me, { icon, title: meLabel ?? "" }).addTo(m);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meKey, meLabel, ready]);

  return <div ref={box} className="oneg-map relative z-0 min-h-0 flex-1" />;
}
