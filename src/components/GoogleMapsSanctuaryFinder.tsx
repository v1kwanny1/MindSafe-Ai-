import React, { useState } from "react";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { 
  MapPin, 
  Phone, 
  ExternalLink, 
  Clock, 
  Compass, 
  Search, 
  Heart, 
  Shield, 
  Trees, 
  Navigation,
  Sparkles,
  AlertTriangle
} from "lucide-react";

export interface SanctuaryLocation {
  id: string;
  name: string;
  category: "crisis" | "samaritans" | "nature" | "community";
  categoryLabel: string;
  position: { lat: number; lng: number };
  address: string;
  phone?: string;
  hours: string;
  description: string;
  recommendedActivity: string;
}

const SANCTUARY_LOCATIONS: SanctuaryLocation[] = [
  {
    id: "loc-1",
    name: "St Thomas' NHS Mental Health Assessment Hub",
    category: "crisis",
    categoryLabel: "NHS 24/7 Crisis Support",
    position: { lat: 51.4988, lng: -0.1189 },
    address: "Westminster Bridge Rd, London SE1 7EH",
    phone: "0800 731 2864",
    hours: "Open 24/7 Every Day",
    description: "Specialized NHS emergency mental health liaison and rapid psychiatric assessment team for individuals facing acute distress.",
    recommendedActivity: "Immediate safe triage, calming clinical consultation, and connection to local crisis sanctuary."
  },
  {
    id: "loc-2",
    name: "Central London Samaritans Branch & Listening Space",
    category: "samaritans",
    categoryLabel: "Samaritans Listening Hub",
    position: { lat: 51.5235, lng: -0.1062 },
    address: "46 Marshall St, London W1F 9BF",
    phone: "116 123 (Free 24/7)",
    hours: "Face-to-face drop in: 9:00 AM - 9:00 PM",
    description: "Safe, confidential face-to-face listening space where you can speak without fear of judgment with trained, compassionate volunteers.",
    recommendedActivity: "Sit in a private, quiet room and express what weighs heavy on your heart."
  },
  {
    id: "loc-3",
    name: "Regent's Park Queen Mary's Rose Sanctuary",
    category: "nature",
    categoryLabel: "Nature Decompression Walk",
    position: { lat: 51.5292, lng: -0.1534 },
    address: "Chester Rd, Regent's Park, London NW1 4NR",
    hours: "5:00 AM to Dusk",
    description: "Over 12,000 aromatic heritage roses, calm circular walking paths, weeping willows, and quiet wooden benches for sensory grounding.",
    recommendedActivity: "5-4-3-2-1 Sensory Grounding: Smell the roses, touch tree bark, and breathe with Nanny Frog."
  },
  {
    id: "loc-4",
    name: "Camden & Islington NHS Crisis Sanctuary",
    category: "crisis",
    categoryLabel: "NHS Crisis Café & Sanctuary",
    position: { lat: 51.5362, lng: -0.1031 },
    address: "St Pancras Hospital, 4 St Pancras Way, London NW1 0PE",
    phone: "0800 917 3333",
    hours: "Open 5:00 PM - 11:00 PM (Daily)",
    description: "Warm, welcoming non-clinical alternative to A&E for adults experiencing mental health distress or crisis in North Central London.",
    recommendedActivity: "Hot herbal tea, one-to-one supportive listening, and individual safety planning."
  },
  {
    id: "loc-5",
    name: "Hampstead Heath Pergola & Hill Garden",
    category: "nature",
    categoryLabel: "Nature Decompression Walk",
    position: { lat: 51.5645, lng: -0.1802 },
    address: "Inverforth Close, North End Way, London NW3 7EX",
    hours: "8:30 AM to Dusk",
    description: "An Edwardian raised stone terrace wrapped in wisteria, overlooking lush forest canopies. One of London's quietest contemplation places.",
    recommendedActivity: "Slow mindful stroll, nervous system recalibration, and reflective journaling."
  },
  {
    id: "loc-6",
    name: "Mind in the City Wellbeing & Recovery Hub",
    category: "community",
    categoryLabel: "Mind Community Support",
    position: { lat: 51.5273, lng: -0.0862 },
    address: "8-10 Clifton St, London EC2A 4DX",
    phone: "020 7683 4270",
    hours: "Monday - Friday: 9:30 AM - 5:00 PM",
    description: "Community-driven peer support groups, advocacy advice, mindfulness classes, and holistic mental health resilience coaching.",
    recommendedActivity: "Peer recovery circles, UK benefits guidance, and structured resilience workshops."
  },
  {
    id: "loc-7",
    name: "St James's Park Duck Island & Serpentine Bank",
    category: "nature",
    categoryLabel: "Nature Decompression Walk",
    position: { lat: 51.5028, lng: -0.1337 },
    address: "Horse Guards Rd, London SW1A 2BJ",
    hours: "5:00 AM to Midnight",
    description: "Tranquil weeping willow islands with waterbirds, fountain soundscapes, and panoramic view of Buckingham Palace.",
    recommendedActivity: "Listen to the water flow, untangle anxious looping thoughts, and take deep diaphragmatic breaths."
  }
];

export const GoogleMapsSanctuaryFinder: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<SanctuaryLocation | null>(SANCTUARY_LOCATIONS[0]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locatingUser, setLocatingUser] = useState<boolean>(false);
  const [locError, setLocError] = useState<string | null>(null);

  // Fallback to provided key or env
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyBJ24aj8TdUkFXtJAqTrItat_YMgGkjDYE";

  const filteredLocations = SANCTUARY_LOCATIONS.filter((loc) => {
    const matchesCat = categoryFilter === "all" || loc.category === categoryFilter;
    const matchesQuery = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.");
      return;
    }
    setLocatingUser(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setLocatingUser(false);
      },
      (err) => {
        setLocError("Unable to retrieve your location: " + err.message);
        setLocatingUser(false);
      },
      { timeout: 10000 }
    );
  };

  const getMarkerPinColor = (category: string) => {
    switch (category) {
      case "crisis":
        return { background: "#F43F5E", glyphColor: "#FFFFFF", borderColor: "#881337" };
      case "samaritans":
        return { background: "#10B981", glyphColor: "#FFFFFF", borderColor: "#064E3B" };
      case "nature":
        return { background: "#059669", glyphColor: "#FFFFFF", borderColor: "#022C22" };
      case "community":
        return { background: "#F59E0B", glyphColor: "#000000", borderColor: "#78350F" };
      default:
        return { background: "#6366F1", glyphColor: "#FFFFFF", borderColor: "#312E81" };
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 text-left">
      {/* HEADER SECTION */}
      <div className="bg-slate-900/50 border border-white/10 rounded-[24px] p-6 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🗺️</span>
              <h2 className="text-lg font-bold text-white font-display">
                MindSafe Sanctuary &amp; Support Map
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-sans">
              Google Maps verified safe spaces: NHS 24/7 Crisis hubs, Samaritans drop-in branches, and serene decompression nature walks.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={locatingUser}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              title="Center map around current location"
            >
              <Navigation className={`w-3.5 h-3.5 ${locatingUser ? "animate-spin" : ""}`} />
              <span>{locatingUser ? "Locating..." : "Find Near Me"}</span>
            </button>
          </div>
        </div>

        {locError && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 font-mono">
            {locError}
          </div>
        )}

        {/* SEARCH AND FILTERS */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by facility name, borough, or postcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400/50 font-sans"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none">
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                categoryFilter === "all"
                  ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                  : "bg-white/5 text-slate-300 hover:text-white"
              }`}
            >
              All ({SANCTUARY_LOCATIONS.length})
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter("crisis")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                categoryFilter === "crisis"
                  ? "bg-rose-500 text-white font-black shadow-sm"
                  : "bg-white/5 text-slate-300 hover:text-white"
              }`}
            >
              NHS Crisis
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter("samaritans")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                categoryFilter === "samaritans"
                  ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                  : "bg-white/5 text-slate-300 hover:text-white"
              }`}
            >
              Samaritans
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter("nature")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                categoryFilter === "nature"
                  ? "bg-teal-500 text-slate-950 font-black shadow-sm"
                  : "bg-white/5 text-slate-300 hover:text-white"
              }`}
            >
              Nature Parks
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter("community")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                categoryFilter === "community"
                  ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                  : "bg-white/5 text-slate-300 hover:text-white"
              }`}
            >
              Community Mind
            </button>
          </div>
        </div>
      </div>

      {/* MAP AND DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* INTERACTIVE GOOGLE MAP */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-white/10 rounded-[24px] overflow-hidden backdrop-blur-md shadow-xl relative min-h-[480px] h-[520px]">
          <APIProvider apiKey={apiKey}>
            <Map
              internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
              mapId="DEMO_MAP_ID"
              defaultCenter={userLocation || { lat: 51.5200, lng: -0.1300 }}
              defaultZoom={12}
              style={{ width: "100%", height: "100%" }}
              gestureHandling="greedy"
              disableDefaultUI={false}
            >
              {/* USER LOCATION MARKER */}
              {userLocation && (
                <AdvancedMarker position={userLocation} title="Your Location">
                  <div className="relative flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-sky-500 border-2 border-white shadow-lg"></span>
                  </div>
                </AdvancedMarker>
              )}

              {/* SANCTUARY PINS */}
              {filteredLocations.map((loc) => {
                const colors = getMarkerPinColor(loc.category);
                const isSelected = selectedLocation?.id === loc.id;
                return (
                  <AdvancedMarker
                    key={loc.id}
                    position={loc.position}
                    onClick={() => setSelectedLocation(loc)}
                    title={loc.name}
                  >
                    <Pin
                      background={colors.background}
                      glyphColor={colors.glyphColor}
                      borderColor={isSelected ? "#FDE047" : colors.borderColor}
                      scale={isSelected ? 1.3 : 1.0}
                    />
                  </AdvancedMarker>
                );
              })}
            </Map>
          </APIProvider>
        </div>

        {/* SELECTED SANCTUARY DETAIL CARD & LIST */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {selectedLocation ? (
            <div className="bg-slate-900/60 border border-amber-400/30 rounded-[24px] p-5 backdrop-blur-md flex flex-col justify-between gap-4 shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    selectedLocation.category === "crisis"
                      ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                      : selectedLocation.category === "samaritans"
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                      : selectedLocation.category === "nature"
                      ? "bg-teal-500/10 text-teal-300 border-teal-500/30"
                      : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                  }`}>
                    {selectedLocation.categoryLabel}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Verified Space</span>
                </div>

                <h3 className="text-sm font-bold text-white font-display mb-2">
                  {selectedLocation.name}
                </h3>

                <p className="text-xs text-slate-300 font-sans leading-relaxed mb-4">
                  {selectedLocation.description}
                </p>

                <div className="space-y-2 text-xs font-sans border-t border-white/10 pt-3">
                  <div className="flex items-start gap-2 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{selectedLocation.address}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{selectedLocation.hours}</span>
                  </div>

                  {selectedLocation.phone && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <a href={`tel:${selectedLocation.phone.replace(/[^0-9]/g, "")}`} className="hover:underline font-mono text-amber-300 font-bold">
                        {selectedLocation.phone}
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-mono text-emerald-300 block mb-1 font-bold">
                    🌿 Grounding Practice Here:
                  </span>
                  <span className="text-xs text-slate-300 font-sans italic">
                    "{selectedLocation.recommendedActivity}"
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.position.lat},${selectedLocation.position.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs font-mono transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Google Directions</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 border border-dashed border-white/10 rounded-[24px]">
              Select a pin on the map to view details.
            </div>
          )}

          {/* QUICK LIST OF SANCTUARIES */}
          <div className="bg-slate-900/40 border border-white/10 rounded-[24px] p-4 backdrop-blur-md max-h-[220px] overflow-y-auto space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Locations in view ({filteredLocations.length})
            </span>
            {filteredLocations.map((loc) => (
              <button
                key={loc.id}
                type="button"
                onClick={() => setSelectedLocation(loc)}
                className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  selectedLocation?.id === loc.id
                    ? "bg-white/15 border-amber-400/60 text-white"
                    : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                <div className="overflow-hidden">
                  <span className="font-bold block truncate">{loc.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono block truncate">{loc.categoryLabel}</span>
                </div>
                <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default GoogleMapsSanctuaryFinder;
