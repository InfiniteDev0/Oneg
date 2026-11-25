"use client";

// The search page's provider tabs — Doctors, Hospitals, Pharmacies, Clinics,
// Nursing care — and Library.
// Each provider tab filters by what it's for: a doctor's specialty, or the
// services a place offers; when they're available; how close; and the area
// (a country — Kenya to start, our launch market — and maybe one of its
// regions; the map flies there); then the order.
// Results will show in the list and on the map as providers join Oneg (with
// their hours, services, doctors and policies); until then the list says so,
// and Lara looks for you — on Oneg and on the web — with your filters and where
// you are. Library is the Milo education library, coming later.

import { useState } from "react";
import { ArrowDownUp, BookOpen, Check, ChevronDown, ChevronLeft, Clock, Globe, MapPin, Navigation, Stethoscope } from "lucide-react";
import { MorphPopover, MorphPopoverContent, MorphPopoverTrigger } from "@/components/motion/popover-morph";
import { COUNTRIES, DEFAULT_COUNTRY, countryByCode } from "@/lib/areas";
import { cn } from "@/lib/utils";

const KM = [2, 5, 10, 25];

// For each tab: what "what" filters by (specialty or services), and its choices
export const PROVIDER_TABS = {
  doctors: {
    what: "specialty",
    whatOptions: ["general", "paediatrics", "obgyn", "internal", "surgery", "dermatology", "psychiatry", "dentistry", "cardiology", "ent", "eyes", "orthopaedics"],
    when: ["today", "video", "weekend"],
  },
  hospitals: {
    what: "services",
    whatOptions: ["emergency", "maternity", "surgery", "lab", "imaging", "dialysis", "icu", "outpatient"],
    when: ["now", "h24"],
  },
  pharmacies: {
    what: "services",
    whatOptions: ["prescriptions", "delivery", "otc", "vaccines"],
    when: ["now", "h24"],
  },
  clinics: {
    what: "services",
    whatOptions: ["dental", "eyes", "mch", "hivtb", "familyPlanning", "physio", "mental"],
    when: ["now", "today"],
  },
  nursing: {
    what: "services",
    whatOptions: ["homeNursing", "elderly", "palliative", "postSurgery"],
    when: ["today", "h24"],
  },
};

export const isProviderTab = (tab) => tab in PROVIDER_TABS;
export const emptyFilters = () => ({ what: null, when: null, km: null, area: null, sort: "nearest" });

const CHIP =
  "flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border px-2.5 text-[0.8125rem] text-foreground/85 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring aria-expanded:bg-muted [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-muted-foreground";
const ON = "border-foreground/25 bg-foreground/10 text-foreground";
const ROW =
  "flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-start text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted";

// One filter: a chip showing what's picked, opening its choices
function FilterChip({ icon: Icon, label, value, options, onPick, anyLabel, keepOpenLabel }) {
  const [open, setOpen] = useState(false);
  const picked = options.find((o) => o.value === value);
  return (
    <MorphPopover open={open} onOpenChange={setOpen}>
      <MorphPopoverTrigger>
        <button type="button" className={cn(CHIP, picked && !keepOpenLabel && ON)}>
          <Icon />
          <span className="max-w-40 truncate">{picked ? picked.label : label}</span>
          <ChevronDown />
        </button>
      </MorphPopoverTrigger>
      <MorphPopoverContent side="bottom" align="start" sideOffset={6} radius={12} className="flex max-h-80 w-56 flex-col gap-0.5 overflow-y-auto border-0 p-1">
        {anyLabel && (
          <button
            type="button"
            onClick={() => {
              onPick(null);
              setOpen(false);
            }}
            className={cn(ROW, value == null && "bg-muted")}
          >
            <span className="flex-1">{anyLabel}</span>
            {value == null && <Check className="size-3.5" />}
          </button>
        )}
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => {
              onPick(o.value);
              setOpen(false);
            }}
            className={cn(ROW, value === o.value && "bg-muted")}
          >
            <span className="flex-1 truncate">{o.label}</span>
            {value === o.value && <Check className="size-3.5" />}
          </button>
        ))}
      </MorphPopoverContent>
    </MorphPopover>
  );
}

/** "All of Kenya", or "Nairobi, Kenya" */
export function areaLabel(area, p) {
  const country = countryByCode(area?.country ?? DEFAULT_COUNTRY);
  return area?.region ? `${area.region}, ${country.name}` : p.allOf.replace("{country}", country.name);
}

// Where: the regions of the country you're in, with Change country at the top
function AreaChip({ value, onPick, p }) {
  const [open, setOpen] = useState(false);
  const [countries, setCountries] = useState(false);
  const country = countryByCode(value?.country ?? DEFAULT_COUNTRY);
  const moved = value && (value.region || value.country !== DEFAULT_COUNTRY);
  const pick = (next) => {
    onPick(next);
    setOpen(false);
  };
  return (
    <MorphPopover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setCountries(false);
      }}
    >
      <MorphPopoverTrigger>
        <button type="button" className={cn(CHIP, moved && ON)}>
          <MapPin />
          <span className="max-w-44 truncate">{areaLabel(value, p)}</span>
          <ChevronDown />
        </button>
      </MorphPopoverTrigger>
      <MorphPopoverContent side="bottom" align="start" sideOffset={6} radius={12} className="flex max-h-96 w-64 flex-col gap-0.5 overflow-y-auto border-0 p-1">
        {countries ? (
          <>
            <button type="button" onClick={() => setCountries(false)} className={cn(ROW, "text-muted-foreground")}>
              <ChevronLeft className="size-4 rtl:rotate-180" />
              <span className="flex-1">{p.countries}</span>
            </button>
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  // a new country: all of it, and its regions next time
                  pick({ country: c.code, region: null });
                  setCountries(false);
                }}
                className={cn(ROW, c.code === country.code && "bg-muted")}
              >
                <span className="flex-1">{c.name}</span>
                {c.code === country.code && <Check className="size-3.5" />}
              </button>
            ))}
          </>
        ) : (
          <>
            <button type="button" onClick={() => setCountries(true)} className={cn(ROW, "justify-between text-action")}>
              <Globe className="size-4" />
              <span className="flex-1">{p.changeCountry}</span>
              <span className="text-xs text-muted-foreground">{country.name}</span>
            </button>
            <span className="mx-2 my-0.5 h-px bg-border" />
            <button type="button" onClick={() => pick(country.code === DEFAULT_COUNTRY ? null : { country: country.code, region: null })} className={cn(ROW, !value?.region && "bg-muted")}>
              <span className="flex-1">{p.allOf.replace("{country}", country.name)}</span>
              {!value?.region && <Check className="size-3.5" />}
            </button>
            {country.regions.map((r) => (
              <button key={r.name} type="button" onClick={() => pick({ country: country.code, region: r.name })} className={cn(ROW, value?.region === r.name && "bg-muted")}>
                <span className="flex-1 truncate">{r.name}</span>
                {value?.region === r.name && <Check className="size-3.5" />}
              </button>
            ))}
          </>
        )}
      </MorphPopoverContent>
    </MorphPopover>
  );
}

/** The chips for a provider tab: what, when, how close, where, and the order. */
export function ProviderFilters({ tab, filters, onChange, s }) {
  const p = s.providers;
  const conf = PROVIDER_TABS[tab];
  const set = (key) => (value) => onChange({ ...filters, [key]: value });
  const whatLabels = conf.what === "specialty" ? p.specialties : p.services[tab];
  const active = filters.what || filters.when || filters.km || filters.area;
  return (
    <>
      <FilterChip
        icon={Stethoscope}
        label={conf.what === "specialty" ? p.specialty : p.servicesLabel}
        anyLabel={p.any}
        value={filters.what}
        options={conf.whatOptions.map((value) => ({ value, label: whatLabels[value] }))}
        onPick={set("what")}
      />
      <FilterChip
        icon={Clock}
        label={p.availability}
        anyLabel={p.anyTime}
        value={filters.when}
        options={conf.when.map((value) => ({ value, label: p.when[value] }))}
        onPick={set("when")}
      />
      <FilterChip
        icon={Navigation}
        label={p.distance}
        anyLabel={p.anyDistance}
        value={filters.km}
        options={KM.map((km) => ({ value: km, label: p.within.replace("{n}", km) }))}
        onPick={set("km")}
      />
      <AreaChip value={filters.area} onPick={set("area")} p={p} />
      <span aria-hidden className="mx-1.5 h-5 w-px shrink-0 bg-border" />
      <FilterChip
        icon={ArrowDownUp}
        label={p.sort}
        keepOpenLabel
        value={filters.sort}
        options={[
          { value: "nearest", label: p.nearest },
          { value: "az", label: p.az },
        ]}
        onPick={(value) => onChange({ ...filters, sort: value ?? "nearest" })}
      />
      {active && (
        <button type="button" onClick={() => onChange(emptyFilters())} className="h-7 shrink-0 cursor-pointer rounded-full px-2.5 text-[0.8125rem] text-action transition-colors hover:bg-action/10">
          {p.clear}
        </button>
      )}
    </>
  );
}

/** What you've asked for, in words, for Lara: "Paediatrics, available today, within 5 km". */
export function describeFilters(tab, filters, s) {
  const p = s.providers;
  const conf = PROVIDER_TABS[tab];
  if (!conf) return "";
  const whatLabels = conf.what === "specialty" ? p.specialties : p.services[tab];
  return [
    filters.what && whatLabels[filters.what],
    filters.when && p.when[filters.when],
    filters.km && p.within.replace("{n}", filters.km),
    filters.area && areaLabel(filters.area, p),
  ]
    .filter(Boolean)
    .join(", ");
}

/** The list until providers are on Oneg (and the Library until it comes). */
export function ProviderEmpty({ tab, icon, s, onAsk }) {
  const e = s.providers.empty[tab];
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-muted [&_svg]:size-5">{icon ?? <BookOpen />}</span>
      <p className="font-semibold">{e.title}</p>
      <p className="max-w-xs text-sm text-muted-foreground">{e.body}</p>
      <button type="button" onClick={onAsk} className="oneg-lara-pill mt-1 h-9 cursor-pointer">
        <span className="flex h-full items-center gap-2 px-4 text-sm font-medium">
          {e.ask}
          <span className="oneg-lara-face size-[1.1rem] rounded-[5px]" aria-hidden="true">
            <span className="flex gap-[2px]">
              <span className="h-[5px] w-[3px] rounded-full bg-white" />
              <span className="h-[5px] w-[3px] rounded-full bg-white" />
            </span>
          </span>
        </span>
      </button>
    </div>
  );
}
