// Where you can search: East Africa first (Kenya is our launch market), each
// country with its main regions (counties in Kenya). Each has a rough centre and
// zoom, so the map can fly there when you pick it. Names are as people write
// them locally; more countries and regions join as Oneg does.

export const DEFAULT_COUNTRY = "KE";

export const COUNTRIES = [
  {
    code: "KE",
    name: "Kenya",
    center: [0.2, 37.9],
    zoom: 6,
    regions: [
      { name: "Nairobi", center: [-1.286, 36.817] },
      { name: "Mombasa", center: [-4.043, 39.668] },
      { name: "Kisumu", center: [-0.092, 34.768] },
      { name: "Nakuru", center: [-0.303, 36.08] },
      { name: "Kiambu", center: [-1.171, 36.835] },
      { name: "Machakos", center: [-1.517, 37.263] },
      { name: "Kajiado", center: [-1.852, 36.776] },
      { name: "Uasin Gishu", center: [0.514, 35.27] },
      { name: "Nyeri", center: [-0.42, 36.947] },
      { name: "Meru", center: [0.047, 37.649] },
      { name: "Kakamega", center: [0.282, 34.752] },
      { name: "Kilifi", center: [-3.631, 39.849] },
      { name: "Garissa", center: [-0.453, 39.646] },
      { name: "Wajir", center: [1.747, 40.057] },
      { name: "Mandera", center: [3.937, 41.856] },
    ],
  },
  {
    code: "SO",
    name: "Somalia",
    center: [5.2, 46.2],
    zoom: 5,
    regions: [
      { name: "Banaadir (Mogadishu)", center: [2.046, 45.318] },
      { name: "Woqooyi Galbeed (Hargeisa)", center: [9.56, 44.065] },
      { name: "Bari (Bosaso)", center: [11.284, 49.182] },
      { name: "Nugaal (Garowe)", center: [8.406, 48.482] },
      { name: "Mudug (Galkayo)", center: [6.769, 47.431] },
      { name: "Lower Juba (Kismayo)", center: [-0.358, 42.545] },
      { name: "Bay (Baidoa)", center: [3.114, 43.65] },
      { name: "Hiiraan (Beledweyne)", center: [4.736, 45.204] },
      { name: "Togdheer (Burao)", center: [9.522, 45.534] },
      { name: "Awdal (Borama)", center: [9.936, 43.183] },
    ],
  },
  {
    code: "TZ",
    name: "Tanzania",
    center: [-6.4, 34.9],
    zoom: 5,
    regions: [
      { name: "Dar es Salaam", center: [-6.792, 39.208] },
      { name: "Arusha", center: [-3.387, 36.683] },
      { name: "Mwanza", center: [-2.516, 32.917] },
      { name: "Dodoma", center: [-6.163, 35.752] },
      { name: "Zanzibar", center: [-6.165, 39.202] },
      { name: "Mbeya", center: [-8.9, 33.46] },
      { name: "Kilimanjaro", center: [-3.335, 37.34] },
    ],
  },
  {
    code: "UG",
    name: "Uganda",
    center: [1.4, 32.3],
    zoom: 6,
    regions: [
      { name: "Kampala", center: [0.348, 32.582] },
      { name: "Wakiso", center: [0.404, 32.459] },
      { name: "Jinja", center: [0.425, 33.204] },
      { name: "Gulu", center: [2.777, 32.299] },
      { name: "Mbarara", center: [-0.607, 30.654] },
      { name: "Mbale", center: [1.082, 34.175] },
    ],
  },
  {
    code: "ET",
    name: "Ethiopia",
    center: [9.1, 40.5],
    zoom: 5,
    regions: [
      { name: "Addis Ababa", center: [9.03, 38.74] },
      { name: "Dire Dawa", center: [9.593, 41.866] },
      { name: "Amhara (Bahir Dar)", center: [11.594, 37.39] },
      { name: "Sidama (Hawassa)", center: [7.062, 38.476] },
      { name: "Somali (Jijiga)", center: [9.35, 42.8] },
      { name: "Tigray (Mekelle)", center: [13.497, 39.475] },
    ],
  },
  {
    code: "RW",
    name: "Rwanda",
    center: [-1.94, 29.87],
    zoom: 8,
    regions: [
      { name: "Kigali", center: [-1.95, 30.059] },
      { name: "Northern (Musanze)", center: [-1.5, 29.633] },
      { name: "Southern (Huye)", center: [-2.597, 29.739] },
      { name: "Western (Rubavu)", center: [-1.68, 29.26] },
      { name: "Eastern (Rwamagana)", center: [-1.949, 30.435] },
    ],
  },
];

export const countryByCode = (code) => COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];

/** Where the map should look for an area ({ country, region }). */
export function areaView(area) {
  const country = countryByCode(area?.country ?? DEFAULT_COUNTRY);
  const region = area?.region && country.regions.find((r) => r.name === area.region);
  return region ? { center: region.center, zoom: 11 } : { center: country.center, zoom: country.zoom };
}
