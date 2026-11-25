"use client";

// Where you are, as a place name ("Westlands, Nairobi"), for the search page:
// the browser's position (it asks you first), named by /api/where. The last
// place found is kept in this browser so it shows straight away next time,
// then refreshed. status: idle | finding | found | denied | unavailable.

import { useCallback, useEffect, useState } from "react";

const KEY = "oneg.location";

export function useLocation(lang, active) {
  const [place, setPlace] = useState(null);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
      if (saved?.label) setPlace(saved);
    } catch {
      // storage blocked
    }
  }, []);

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) return setStatus("unavailable");
    setStatus("finding");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(`/api/where?lat=${coords.latitude}&lon=${coords.longitude}&lang=${lang}`);
          if (!res.ok) throw new Error(String(res.status));
          const data = await res.json();
          // the position too, rounded to about 100 m, for the map
          const next = { label: data.label, country: data.country, lat: +coords.latitude.toFixed(3), lon: +coords.longitude.toFixed(3), at: Date.now() };
          setPlace(next);
          setStatus("found");
          try {
            localStorage.setItem(KEY, JSON.stringify(next));
          } catch {
            // not remembered
          }
        } catch {
          setStatus("unavailable");
        }
      },
      (error) => setStatus(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  }, [lang]);

  // looked for once the search page opens, as Bolt does
  useEffect(() => {
    if (active && status === "idle") locate();
  }, [active, status, locate]);

  return { place, status, locate };
}
