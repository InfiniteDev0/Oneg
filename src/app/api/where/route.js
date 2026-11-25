// GET /api/where?lat=…&lon=…&lang=en — the name of the place you're at
// ("Westlands, Nairobi"), for the search page's location, as Bolt shows it.
//
// The position comes from your browser (only once you've allowed it) and is
// rounded to about 100 m before it leaves this server. The name comes from
// OpenStreetMap's Nominatim, which asks apps to say who they are and not to
// ask too often: each rounded spot is looked up at most once a day.

const LANGS = new Set(["en", "sw", "so", "ar"]);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return Response.json({ error: "bad position" }, { status: 400 });
  }
  const lang = LANGS.has(searchParams.get("lang")) ? searchParams.get("lang") : "en";

  const params = new URLSearchParams({
    format: "jsonv2",
    lat: lat.toFixed(3),
    lon: lon.toFixed(3),
    zoom: "14",
    "accept-language": lang,
  });
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
      headers: { "user-agent": "Oneg health app (search location)" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    const a = data.address ?? {};
    // the neighbourhood, then the town it's in
    const near = a.suburb || a.neighbourhood || a.quarter || a.city_district || a.village || a.hamlet;
    const town = a.city || a.town || a.municipality || a.county || a.state;
    const parts = [near, town].filter(Boolean).filter((v, i, all) => all.indexOf(v) === i);
    if (!parts.length && !a.country) throw new Error("no name");
    return Response.json(
      { label: parts.length ? parts.join(", ") : a.country, country: a.country ?? null },
      { headers: { "cache-control": "private, max-age=3600" } }
    );
  } catch (error) {
    console.warn("[where]", error?.message ?? error);
    return Response.json({ error: "unavailable" }, { status: 502 });
  }
}
