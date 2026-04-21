"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import {
  Ship, Plane, AlertTriangle, AlertCircle, Info,
  ChevronDown, ChevronUp, CheckCircle2, Zap, Scale,
  Clock, DollarSign, BarChart2, RotateCcw, MapPin,
} from "lucide-react";
import RouteService from "@/services/route.service";
import { cn } from "@/lib/cn";
import type {
  RouteEvaluationRequest,
  RouteEvaluationResponse,
  RouteOptions,
  RouteResult,
} from "@/types/routes";

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const TAG_META = {
  cheapest: { label: "Cheapest",       icon: DollarSign, color: "text-emerald-600 dark:text-emerald-400",  bg: "bg-emerald-50  dark:bg-emerald-950/40  border-emerald-200  dark:border-emerald-800" },
  fastest:  { label: "Fastest",        icon: Zap,        color: "text-amber-600  dark:text-amber-400",     bg: "bg-amber-50    dark:bg-amber-950/40    border-amber-200    dark:border-amber-800"   },
  balanced: { label: "Best Balance",   icon: Scale,      color: "text-violet-600 dark:text-violet-400",    bg: "bg-violet-50   dark:bg-violet-950/40   border-violet-200   dark:border-violet-800"  },
} as const;

const ALERT_ICONS = {
  info:     <Info      size={13} className="text-blue-500   flex-shrink-0 mt-0.5" />,
  warning:  <AlertTriangle size={13} className="text-amber-500  flex-shrink-0 mt-0.5" />,
  critical: <AlertCircle  size={13} className="text-red-500    flex-shrink-0 mt-0.5" />,
};

const ROUTE_COORDINATES: Record<string, [number, number]> = {
  PKKHI: [24.8615, 67.0099],
  KHI:   [24.9061, 67.1605],
  LHE:   [31.5216, 74.4036],
  ISB:   [33.5593, 72.8258],
  SKT:   [32.5353, 74.3639],
  LKCMB: [6.9271, 79.8612],
  AEJEA: [25.0555, 55.0537],
  SGSIN: [1.2644, 103.8222],
  MYPKG: [2.9734, 101.4094],
  DXB:   [25.2532, 55.3657],
  DOH:   [25.2736, 51.6080],
  IST:   [41.2762, 28.7519],
  JFK:   [40.6413, -73.7781],
  ORD:   [41.9742, -87.9073],
  LAX:   [33.9416, -118.4085],
  MIA:   [25.7959, -80.2870],
  USLAX: [33.7405, -118.2775],
  USLGB: [33.7500, -118.2167],
  USNYC: [40.6782, -73.9442],
  USSAV: [32.0809, -81.0912],
  USBAL: [39.2904, -76.6122],
  USMIA: [25.7959, -80.2870],
  USCHI: [41.8781, -87.6298],
  USSEA: [47.6062, -122.3321],
  "Suez Canal": [30.5495, 32.3137],
  "Panama Canal": [9.0800, -79.6800],
  "Karachi": [24.8607, 67.0011],
  "Lahore": [31.5204, 74.3587],
  "Faisalabad": [31.4504, 73.1350],
  "Sialkot": [32.4945, 74.5229],
  "Islamabad": [33.6844, 73.0479],
  "Peshawar": [34.0151, 71.5249],
  "Multan": [30.1575, 71.5249],
  "Los Angeles": [34.0522, -118.2437],
  "New York": [40.7128, -74.0060],
  "Chicago": [41.8781, -87.6298],
  "Miami": [25.7617, -80.1918],
  "Savannah": [32.0809, -81.0912],
  "Seattle": [47.6062, -122.3321],
};

function getLocationCoordinates(location: string): [number, number] | null {
  const trimmed = location.trim();
  const codeMatch = trimmed.match(/\(([A-Z0-9']+)\)/);
  if (codeMatch) {
    const code = codeMatch[1];
    if (ROUTE_COORDINATES[code]) return ROUTE_COORDINATES[code];
  }
  if (ROUTE_COORDINATES[trimmed]) {
    return ROUTE_COORDINATES[trimmed];
  }
  const fallback = trimmed.split(",")[0].trim();
  if (ROUTE_COORDINATES[fallback]) {
    return ROUTE_COORDINATES[fallback];
  }
  return null;
}

function getRoutePath(route: RouteResult, destinationCity: string) {
  const destination = route.destination_ports.find(port => port.includes(destinationCity))
    ?? route.destination_ports[0];

  const stops = [route.origin_port, ...route.hubs, destination];
  return stops
    .map(getLocationCoordinates)
    .filter((coord): coord is [number, number] => coord !== null);
}

function getRouteName(route: RouteResult) {
  return `${route.id} · ${route.name}`;
}

// ── Score bar ──────────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round((1 - score) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-zinc-400 w-7 text-right">{pct}%</span>
    </div>
  );
}

// ── Reliability dots ───────────────────────────────────────────────────────────

function ReliabilityDots({ score }: { score: number }) {
  const filled = Math.round(score * 5);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            i < filled ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"
          )}
        />
      ))}
    </div>
  );
}

// ── Cost vs Time scatter plot ──────────────────────────────────────────────────

function ScatterPlot({ routes }: { routes: RouteResult[] }) {
  if (!routes.length) return null;

  const costs = routes.map(r => (r.cost.total_min + r.cost.total_max) / 2);
  const times = routes.map(r => (r.transit.total_min + r.transit.total_max) / 2);

  const minCost = Math.min(...costs), maxCost = Math.max(...costs);
  const minTime = Math.min(...times), maxTime = Math.max(...times);
  const costRange = maxCost - minCost || 1;
  const timeRange = maxTime - minTime || 1;

  const W = 340, H = 200, PAD = 36;

  const x = (c: number) => PAD + ((c - minCost) / costRange) * (W - PAD * 2);
  const y = (t: number) => H - PAD - ((t - minTime) / timeRange) * (H - PAD * 2);

  return (
    <div className="overflow-x-auto">
      <svg width={W} height={H} className="mx-auto">
        {/* Axes */}
        <line x1={PAD} y1={H - PAD} x2={W - PAD / 2} y2={H - PAD} stroke="currentColor" strokeOpacity={0.15} />
        <line x1={PAD} y1={PAD / 2}  x2={PAD}          y2={H - PAD}  stroke="currentColor" strokeOpacity={0.15} />
        <text x={W / 2}  y={H - 4}   textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.4}>Cost (USD mid-estimate)</text>
        <text x={8}      y={H / 2}   textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.4} transform={`rotate(-90, 8, ${H / 2})`}>Days</text>

        {routes.map((r, i) => {
          const cx_ = x(costs[i]);
          const cy_ = y(times[i]);
          const tagColor =
            r.tag === "cheapest" ? "#10b981" :
            r.tag === "fastest"  ? "#f59e0b" :
            r.tag === "balanced" ? "#7c3aed" : "#94a3b8";
          return (
            <g key={r.id}>
              <circle cx={cx_} cy={cy_} r={7} fill={tagColor} fillOpacity={0.18} stroke={tagColor} strokeWidth={1.5} />
              <text x={cx_} y={cy_ - 10} textAnchor="middle" fontSize={8} fill={tagColor} fontWeight={600}>
                {r.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Route card ─────────────────────────────────────────────────────────────────

function RouteCard({ route }: { route: RouteResult }) {
  const [expanded, setExpanded] = useState(false);
  const tagMeta = route.tag ? TAG_META[route.tag as keyof typeof TAG_META] : null;
  const TagIcon = tagMeta?.icon;

  return (
    <div
      className={cn(
        "rounded-xl border bg-white dark:bg-zinc-900 transition-shadow",
        tagMeta ? `${tagMeta.bg} shadow-md` : "border-zinc-200 dark:border-zinc-800 shadow-sm"
      )}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Mode icon */}
            <div className={cn(
              "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0",
              route.mode === "AIR"
                ? "bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400"
                : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
            )}>
              {route.mode === "AIR" ? <Plane size={16} /> : <Ship size={16} />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 leading-snug">
                  {route.name}
                </span>
                {tagMeta && TagIcon && (
                  <span className={cn(
                    "inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                    tagMeta.color,
                    "bg-white/70 dark:bg-zinc-900/70 border",
                    tagMeta.bg
                  )}>
                    <TagIcon size={10} />
                    {tagMeta.label}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {route.hubs.join(" → ")}
              </p>
            </div>
          </div>

          {/* Score */}
          <div className="flex-shrink-0 text-right">
            <div className="text-xs text-zinc-400 mb-1">Match score</div>
            <ScoreBar score={route.score} />
          </div>
        </div>

        {/* Key metrics */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 p-2.5">
            <div className="flex items-center gap-1 text-zinc-400 mb-1">
              <DollarSign size={11} />
              <span className="text-[10px] font-medium uppercase tracking-wide">Cost range</span>
            </div>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
              {fmt(route.cost.total_min)}
            </p>
            <p className="text-[10px] text-zinc-400">— {fmt(route.cost.total_max)}</p>
          </div>

          <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 p-2.5">
            <div className="flex items-center gap-1 text-zinc-400 mb-1">
              <Clock size={11} />
              <span className="text-[10px] font-medium uppercase tracking-wide">Transit</span>
            </div>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
              {route.transit.total_min}d
            </p>
            <p className="text-[10px] text-zinc-400">— {route.transit.total_max} days</p>
          </div>

          <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 p-2.5">
            <div className="flex items-center gap-1 text-zinc-400 mb-1">
              <BarChart2 size={11} />
              <span className="text-[10px] font-medium uppercase tracking-wide">Reliability</span>
            </div>
            <ReliabilityDots score={route.reliability_score} />
            <p className="text-[10px] text-zinc-400 mt-1">{Math.round(route.reliability_score * 100)}%</p>
          </div>
        </div>

        {/* Alerts */}
        {route.alerts.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {route.alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-xs rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2">
                {ALERT_ICONS[a.level]}
                <span className="text-amber-800 dark:text-amber-300 leading-relaxed">{a.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? "Hide details" : "View cost breakdown"}
        </button>
      </div>

      {/* Expanded breakdown */}
      {expanded && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 pb-4 pt-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
            <CostRow label="Inland haulage"        value={route.cost.inland_haulage}        />
            <CostRow label="Origin THC"            value={route.cost.origin_thc}            />
            <CostRow label="Ocean/air freight (min)" value={route.cost.ocean_air_freight_min} />
            <CostRow label="Ocean/air freight (max)" value={route.cost.ocean_air_freight_max} />
            <CostRow label="Transshipment THC"     value={route.cost.transshipment_thc}     />
            <CostRow label="Fixed charges"         value={route.cost.fixed_charges}         />
            <CostRow label="Destination THC"       value={route.cost.destination_thc}       />
            <CostRow label="Customs broker"        value={route.cost.customs_broker}        />
            <CostRow label="Drayage"               value={route.cost.drayage}               />
            <CostRow label="Harbor Maintenance Fee" value={route.cost.hmf}                  />
            <CostRow label="Merchandise Proc. Fee" value={route.cost.mpf}                   />
            <CostRow label="Import duty"           value={route.cost.import_duty}           highlight />
          </div>
          <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between text-xs font-semibold text-zinc-800 dark:text-zinc-100">
            <span>Total estimate</span>
            <span>{fmt(route.cost.total_min)} – {fmt(route.cost.total_max)}</span>
          </div>
          <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            <p className="font-medium mb-1">Carriers</p>
            <p>{route.carriers.join(", ")}</p>
          </div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            <p className="font-medium mb-1">Destination ports</p>
            <p>{route.destination_ports.join(", ")}</p>
          </div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            <p className="font-medium mb-1">Frequency</p>
            <p>{route.frequency_per_week}× per week</p>
          </div>
        </div>
      )}
    </div>
  );
}

function CostRow({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <>
      <span className={cn("text-zinc-500 dark:text-zinc-400", highlight && "font-medium text-zinc-700 dark:text-zinc-300")}>
        {label}
      </span>
      <span className={cn("text-right tabular-nums", highlight ? "font-semibold text-zinc-900 dark:text-zinc-100" : "text-zinc-700 dark:text-zinc-300")}>
        {fmt(value)}
      </span>
    </>
  );
}

// ── Form ───────────────────────────────────────────────────────────────────────

const INIT_FORM: RouteEvaluationRequest = {
  origin_city:      "Karachi",
  destination_city: "Los Angeles",
  cargo_type:       "FCL_40HC",
  cargo_value_usd:  50000,
  hs_code:          "",
  cargo_volume_cbm: undefined,
  cargo_weight_kg:  undefined,
  cost_weight:      0.5,
};

// ── Page ───────────────────────────────────────────────────────────────────────

export default function RoutesPage() {
  const [options,  setOptions]  = useState<RouteOptions | null>(null);
  const [form,     setForm]     = useState<RouteEvaluationRequest>(INIT_FORM);
  const [result,   setResult]   = useState<RouteEvaluationResponse | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  // Load select options
  useEffect(() => {
    RouteService.getOptions()
      .then(setOptions)
      .catch(() => {/* silently ignore — use hardcoded fallback */});
  }, []);

  const set = <K extends keyof RouteEvaluationRequest>(k: K, v: RouteEvaluationRequest[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const body: RouteEvaluationRequest = {
        ...form,
        hs_code: form.hs_code || undefined,
      };
      const res = await RouteService.evaluate(body);
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to evaluate routes.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const originCities      = options?.origin_cities      ?? ["Karachi","Lahore","Faisalabad","Sialkot","Islamabad","Multan","Peshawar"];
  const destinationCities = options?.destination_cities ?? ["Los Angeles","New York","Chicago","Miami","Savannah","Seattle"];
  const cargoTypes        = options?.cargo_types        ?? [
    { value: "FCL_20",   label: "FCL 20'" },
    { value: "FCL_40",   label: "FCL 40'" },
    { value: "FCL_40HC", label: "FCL 40' HC" },
    { value: "LCL",      label: "LCL" },
    { value: "AIR",      label: "Air Freight" },
  ];

  const isAir = form.cargo_type === "AIR";
  const isLcl = form.cargo_type === "LCL";

  const topRoutes = result
    ? ["cheapest", "fastest", "balanced"].map(tag =>
        result.routes.find(r => r.id === result.recommended[tag as keyof typeof result.recommended])
      ).filter((r): r is RouteResult => Boolean(r) && Boolean(r.tag))
        .filter((r, i, arr) => arr.findIndex(x => x.id === r.id) === i)
    : [];

  const otherRoutes = result
    ? result.routes.filter(r => !topRoutes.some(t => t.id === r.id))
    : [];

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  const routeLineData = useMemo(() => {
    if (!result) return [];
    return result.routes.map(route => ({
      route,
      points: getRoutePath(route, result.destination_city),
      isOptimized: route.id === result.routes[0]?.id,
    })).filter(item => item.points.length >= 2);
  }, [result]);

  useEffect(() => {
    if (!result || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstanceRef.current);
      routeLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;
    const layerGroup = routeLayerRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    const allCoordinates: [number, number][] = [];

    routeLineData.forEach(({ route, points, isOptimized }) => {
      const routeLine = L.polyline(points, {
        color: isOptimized ? "#7c3aed" : "#38bdf8",
        weight: isOptimized ? 4 : 2,
        opacity: isOptimized ? 0.95 : 0.45,
        dashArray: route.mode === "AIR" ? "6 8" : undefined,
      }).addTo(layerGroup);

      routeLine.bindTooltip(getRouteName(route), { sticky: true, direction: "auto" });
      points.forEach((coord, idx) => {
        const isEndpoint = idx === 0 || idx === points.length - 1;
        const circle = L.circleMarker(coord, {
          radius: isEndpoint ? 5 : 4,
          fillColor: isEndpoint ? "#7c3aed" : "#ffffff",
          color: isEndpoint ? "#7c3aed" : "#1d4ed8",
          weight: 2,
          fillOpacity: isEndpoint ? 1 : 0.9,
        }).addTo(layerGroup);
        if (isEndpoint) {
          circle.bindTooltip(idx === 0 ? "Origin" : "Destination", { permanent: false, direction: "top" });
        }
      });
      allCoordinates.push(...points);
    });

    if (allCoordinates.length > 0) {
      map.fitBounds(L.latLngBounds(allCoordinates), { padding: [40, 40] });
    }
  }, [result, routeLineData]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Ship size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Route Evaluator</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Pakistan → USA optimized shipping routes</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-5"
          >
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-4">Shipment Details</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <SelectField
                label="Origin City"
                value={form.origin_city}
                onChange={v => set("origin_city", v)}
                options={originCities.map(c => ({ value: c, label: c }))}
              />
              <SelectField
                label="Destination City"
                value={form.destination_city}
                onChange={v => set("destination_city", v)}
                options={destinationCities.map(c => ({ value: c, label: c }))}
              />
              <SelectField
                label="Cargo Type"
                value={form.cargo_type}
                onChange={v => set("cargo_type", v)}
                options={cargoTypes}
              />
              <NumberField
                label="Cargo Value (USD)"
                value={form.cargo_value_usd}
                onChange={v => set("cargo_value_usd", v)}
                min={1}
                placeholder="50000"
              />
              <InputField
                label="HS Code (optional)"
                value={form.hs_code ?? ""}
                onChange={v => set("hs_code", v)}
                placeholder="e.g. 6109"
              />
              {isLcl && (
                <NumberField
                  label="Volume (CBM)"
                  value={form.cargo_volume_cbm ?? ""}
                  onChange={v => set("cargo_volume_cbm", v || undefined)}
                  min={0.01}
                  placeholder="5.0"
                />
              )}
              {isAir && (
                <NumberField
                  label="Weight (kg)"
                  value={form.cargo_weight_kg ?? ""}
                  onChange={v => set("cargo_weight_kg", v || undefined)}
                  min={0.1}
                  placeholder="500"
                />
              )}
            </div>

            {/* Cost vs time slider */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Optimization preference
                </label>
                <span className="text-xs text-zinc-400">
                  {form.cost_weight <= 0.3 ? "Prioritize speed" : form.cost_weight >= 0.7 ? "Prioritize cost" : "Balanced"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-400 w-12">Fastest</span>
                <input
                  type="range" min={0} max={1} step={0.05}
                  value={form.cost_weight}
                  onChange={e => set("cost_weight", parseFloat(e.target.value))}
                  className="flex-1 accent-violet-600"
                />
                <span className="text-[10px] text-zinc-400 w-12 text-right">Cheapest</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "h-9 px-5 rounded-lg text-sm font-semibold transition-all",
                  "bg-gradient-to-r from-violet-600 to-indigo-600",
                  "text-white hover:from-violet-500 hover:to-indigo-500",
                  "focus:outline-none focus:ring-2 focus:ring-violet-400/60 focus:ring-offset-2",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  "flex items-center gap-2"
                )}
              >
                {loading
                  ? <><RotateCcw size={14} className="animate-spin" /> Evaluating…</>
                  : <><BarChart2 size={14} /> Evaluate Routes</>
                }
              </button>
            </div>
          </form>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* Summary bar */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                      {result.origin_city} → {result.destination_city}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {result.routes.length} routes found · Cargo value {fmt(result.cargo_value_usd)} · Duty rate {result.duty_rate_pct}%
                      {result.hs_code && ` (HS ${result.hs_code})`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {topRoutes.map(r => {
                      const meta = TAG_META[r.tag as keyof typeof TAG_META];
                      const Icon = meta.icon;
                      return (
                        <div key={r.id} className={cn("text-[10px] px-2.5 py-1 rounded-full border font-semibold flex items-center gap-1", meta.color, meta.bg)}>
                          <Icon size={10} /> {meta.label}: {r.id}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Route map */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm px-5 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={16} className="text-violet-500" />
                  <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Route map</h2>
                </div>
                <div ref={mapContainerRef} className="h-[420px] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800" />
                <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                    All routes
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                    Optimized route
                  </div>
                </div>
              </div>

              {/* Scatter plot */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm px-5 py-4">
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide mb-3">Cost vs. Transit Time</p>
                <ScatterPlot routes={result.routes} />
                <p className="text-[10px] text-zinc-400 text-center mt-2">Each dot represents a route. Lower-left = fast & cheap.</p>
              </div>

              {/* Top 3 recommended */}
              {topRoutes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={14} className="text-violet-500" />
                    <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Recommended Routes</h2>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {topRoutes.map(r => <RouteCard key={r.id} route={r} />)}
                  </div>
                </div>
              )}

              {/* All other routes */}
              {otherRoutes.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3">All Routes</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {otherRoutes.map(r => <RouteCard key={r.id} route={r} />)}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-[10px] text-zinc-400 dark:text-zinc-600 text-center px-4">
                ⚠ {result.disclaimer}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Small form field components ────────────────────────────────────────────────

function SelectField({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={cn(
          "w-full h-9 px-3 rounded-lg border text-sm",
          "border-zinc-200 dark:border-zinc-700",
          "bg-white dark:bg-zinc-800",
          "text-zinc-900 dark:text-zinc-100",
          "focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400"
        )}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function NumberField({
  label, value, onChange, min, placeholder,
}: {
  label: string;
  value: number | string;
  onChange: (v: number) => void;
  min?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">{label}</label>
      <input
        type="number"
        min={min}
        step="any"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(parseFloat(e.target.value))}
        className={cn(
          "w-full h-9 px-3 rounded-lg border text-sm",
          "border-zinc-200 dark:border-zinc-700",
          "bg-white dark:bg-zinc-800",
          "text-zinc-900 dark:text-zinc-100",
          "focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400"
        )}
      />
    </div>
  );
}

function InputField({
  label, value, onChange, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className={cn(
          "w-full h-9 px-3 rounded-lg border text-sm",
          "border-zinc-200 dark:border-zinc-700",
          "bg-white dark:bg-zinc-800",
          "text-zinc-900 dark:text-zinc-100",
          "focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400"
        )}
      />
    </div>
  );
}
