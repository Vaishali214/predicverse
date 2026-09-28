import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Search,
  MapPin,
  Locate,
  Globe,
  Layers,
  Plus,
  Minus,
  RotateCcw,
  X,
  ExternalLink,
  Navigation,
  Loader2,
  Sparkles,
  Building,
  Landmark,
  Compass,
  AlertCircle
} from 'lucide-react';
import { COUNTRIES_DATA } from '../data/countries';
import { PRESET_LOCATIONS, COUNTRY_BOUNDS, QuickLocation } from '../data/worldBoundaries';
import { Country, State, City } from '../types';

// Custom Pin Icons
const createCountryPinIcon = (flag: string, name: string) => {
  return L.divIcon({
    className: 'custom-country-pin',
    html: `
      <div style="
        background: #111111;
        color: #ffffff;
        padding: 4px 8px;
        font-family: 'Inter', sans-serif;
        font-size: 11px;
        font-weight: 800;
        border: 1px solid #ffffff;
        box-shadow: 3px 3px 0px 0px rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
        cursor: pointer;
        transform: translate(-50%, -100%);
      ">
        <span style="font-size: 14px;">${flag}</span>
        <span>${name.toUpperCase()}</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

const createCityPinIcon = (name: string, isCapital = false) => {
  return L.divIcon({
    className: 'custom-city-pin',
    html: `
      <div style="
        background: ${isCapital ? '#CC0000' : '#ffffff'};
        color: ${isCapital ? '#ffffff' : '#111111'};
        padding: 3px 6px;
        font-family: 'Inter', sans-serif;
        font-size: 10px;
        font-weight: 700;
        border: 1.5px solid #111111;
        box-shadow: 2px 2px 0px 0px rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        cursor: pointer;
        transform: translate(-50%, -100%);
      ">
        <span style="width: 6px; height: 6px; border-radius: 50%; background: ${isCapital ? '#ffffff' : '#CC0000'}; display: inline-block;"></span>
        <span>${name.toUpperCase()}</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

const createTargetPinIcon = (title: string, badge = 'TARGET') => {
  return L.divIcon({
    className: 'custom-target-pin',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); z-index: 1000;">
        <div style="
          background: #CC0000;
          color: #ffffff;
          padding: 4px 10px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 900;
          border: 2px solid #ffffff;
          box-shadow: 4px 4px 0px 0px #000000;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
        ">
          <span style="font-size: 12px;">📍</span>
          <span>${title.toUpperCase()}</span>
          <span style="background: #ffffff; color: #CC0000; font-size: 9px; padding: 1px 4px; font-weight: 900;">${badge}</span>
        </div>
        <div style="
          width: 0; 
          height: 0; 
          border-left: 7px solid transparent; 
          border-right: 7px solid transparent; 
          border-top: 9px solid #CC0000;
        "></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

// Map Tile Layers Configuration
const MAP_LAYERS = {
  positron: {
    name: 'Standard Cartography',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  dark: {
    name: 'Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    name: 'Satellite Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
  terrain: {
    name: 'Topographic Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
};

export interface SelectedMapLocation {
  name: string;
  type: 'country' | 'state' | 'city' | 'landmark' | 'address';
  country?: string;
  state?: string;
  coordinates: [number, number];
  zoom: number;
  countryId?: string;
  flag?: string;
  description?: string;
  addressDetails?: any;
  boundingPoly?: any;
}

interface WorldMapProps {
  countries?: Country[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onSelectLocation?: (loc: SelectedMapLocation) => void;
}

// Inner Controller component to execute map flying & event listeners
const MapController: React.FC<{
  targetCenter: [number, number] | null;
  targetZoom: number | null;
  targetBounds: L.LatLngBoundsExpression | null;
  onViewChange: (zoom: number, center: [number, number]) => void;
}> = ({ targetCenter, targetZoom, targetBounds, onViewChange }) => {
  const map = useMap();

  useEffect(() => {
    if (targetBounds) {
      map.flyToBounds(targetBounds, { padding: [40, 40], duration: 1.5 });
    } else if (targetCenter && targetZoom !== null) {
      map.flyTo(targetCenter, targetZoom, { duration: 1.5, animate: true });
    }
  }, [map, targetCenter, targetZoom, targetBounds]);

  useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      onViewChange(map.getZoom(), [center.lat, center.lng]);
    },
    zoomend: () => {
      const center = map.getCenter();
      onViewChange(map.getZoom(), [center.lat, center.lng]);
    },
  });

  return null;
};

export const WorldMap: React.FC<WorldMapProps> = ({
  countries = COUNTRIES_DATA,
  center = [20, 0],
  zoom = 2,
  height = '620px',
  onSelectLocation,
}) => {
  const navigate = useNavigate();

  // Map state
  const [activeLayer, setActiveLayer] = useState<keyof typeof MAP_LAYERS>('positron');
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [currentZoom, setCurrentZoom] = useState<number>(zoom);
  const [flyTarget, setFlyTarget] = useState<{ center: [number, number] | null; zoom: number | null; bounds: L.LatLngBoundsExpression | null }>({
    center: null,
    zoom: null,
    bounds: null,
  });

  // Selected location details panel state
  const [selectedLoc, setSelectedLoc] = useState<SelectedMapLocation | null>(null);
  const [selectedGeoJSON, setSelectedGeoJSON] = useState<any>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Geolocation state
  const [isLocating, setIsLocating] = useState(false);
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);

  // Layer control open state
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search using Nominatim API + local fallback
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);

      const q = searchQuery.toLowerCase().trim();

      // First check preset locations & countries data for instant local results
      const localMatches: any[] = [];

      // Check presets (e.g. Chandigarh, Punjab, India, etc.)
      PRESET_LOCATIONS.forEach((preset) => {
        if (
          preset.name.toLowerCase().includes(q) ||
          (preset.state && preset.state.toLowerCase().includes(q)) ||
          (preset.country && preset.country.toLowerCase().includes(q))
        ) {
          localMatches.push({
            display_name: `${preset.name}, ${preset.state ? preset.state + ', ' : ''}${preset.country}`,
            name: preset.name,
            type: preset.type,
            lat: preset.coordinates[0],
            lon: preset.coordinates[1],
            zoom: preset.zoom,
            countryId: preset.countryId,
            flag: preset.flag,
            description: preset.description,
            isLocal: true,
          });
        }
      });

      // Check main countries database
      countries.forEach((country) => {
        if (
          country.name.toLowerCase().includes(q) ||
          country.capital.toLowerCase().includes(q) ||
          (country.region && country.region.toLowerCase().includes(q))
        ) {
          localMatches.push({
            display_name: `${country.name} (Capital: ${country.capital})`,
            name: country.name,
            type: 'country',
            lat: country.coordinates[0],
            lon: country.coordinates[1],
            zoom: 5,
            countryId: country.id,
            flag: country.flag,
            description: country.description,
            isLocal: true,
          });
        }

        // Check states inside country
        if (country.states) {
          country.states.forEach((st: State) => {
            if (st.name.toLowerCase().includes(q)) {
              localMatches.push({
                display_name: `${st.name}, ${country.name}`,
                name: st.name,
                type: 'state',
                lat: country.coordinates[0], // approximate or search fallback
                lon: country.coordinates[1],
                zoom: 7,
                countryId: country.id,
                flag: country.flag,
                description: st.description,
                isLocal: true,
              });
            }

            // Check cities inside state
            if (st.cities) {
              st.cities.forEach((ct: City) => {
                if (ct.name.toLowerCase().includes(q)) {
                  localMatches.push({
                    display_name: `${ct.name}, ${st.name}, ${country.name}`,
                    name: ct.name,
                    type: 'city',
                    lat: country.coordinates[0],
                    lon: country.coordinates[1],
                    zoom: 11,
                    countryId: country.id,
                    flag: country.flag,
                    description: ct.overview,
                    isLocal: true,
                  });
                }
              });
            }
          });
        }
      });

      // Remote Nominatim Search
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&addressdetails=1&limit=6&polygon_geojson=1`,
          {
            headers: {
              'Accept-Language': 'en',
            },
          }
        );

        if (response.ok) {
          const apiData = await response.json();

          const formattedApiResults = apiData.map((item: any) => {
            let placeType: 'country' | 'state' | 'city' | 'landmark' | 'address' = 'landmark';
            if (item.type === 'administrative' || item.class === 'boundary') {
              if (item.address?.country && item.display_name.startsWith(item.address.country)) {
                placeType = 'country';
              } else if (item.address?.state) {
                placeType = 'state';
              } else {
                placeType = 'state';
              }
            } else if (['city', 'town', 'village', 'municipality'].includes(item.type)) {
              placeType = 'city';
            } else if (['country'].includes(item.type)) {
              placeType = 'country';
            }

            return {
              display_name: item.display_name,
              name: item.name || item.display_name.split(',')[0],
              type: placeType,
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
              zoom: placeType === 'country' ? 5 : placeType === 'state' ? 7 : placeType === 'city' ? 11 : 14,
              geojson: item.geojson,
              address: item.address,
              boundingbox: item.boundingbox,
              isLocal: false,
            };
          });

          // Combine local deduplicated matches with API results
          const combined = [...localMatches, ...formattedApiResults];
          // Unique by name/type combo
          const uniqueResults = combined.filter(
            (v, idx, a) => a.findIndex((t) => t.name.toLowerCase() === v.name.toLowerCase() && t.type === v.type) === idx
          );

          setSearchResults(uniqueResults.slice(0, 8));
          setShowSearchDropdown(true);
        } else {
          setSearchResults(localMatches);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.warn('Geocoding API network issue, falling back to local dataset', err);
        setSearchResults(localMatches);
        setShowSearchDropdown(true);
        if (localMatches.length === 0) {
          setSearchError('Offline / Network error. Try selecting preset locations.');
        }
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, countries]);

  // Handle Location Selection
  const handleSelectSearchResult = (result: any) => {
    const lat = typeof result.lat === 'string' ? parseFloat(result.lat) : result.lat;
    const lon = typeof result.lon === 'string' ? parseFloat(result.lon) : result.lon;
    const targetPos: [number, number] = [lat, lon];
    const targetZoom = result.zoom || (result.type === 'country' ? 5 : result.type === 'state' ? 7 : 12);

    // Compute bounding box if available
    let boundsExpression: L.LatLngBoundsExpression | null = null;
    if (result.boundingbox && result.boundingbox.length === 4) {
      const s = parseFloat(result.boundingbox[0]);
      const n = parseFloat(result.boundingbox[1]);
      const w = parseFloat(result.boundingbox[2]);
      const e = parseFloat(result.boundingbox[3]);
      boundsExpression = [[s, w], [n, e]];
    }

    setFlyTarget({
      center: targetPos,
      zoom: targetZoom,
      bounds: boundsExpression,
    });

    const locationDetail: SelectedMapLocation = {
      name: result.name,
      type: result.type,
      country: result.address?.country || result.country || (result.type === 'country' ? result.name : 'Global Location'),
      state: result.address?.state || result.state,
      coordinates: targetPos,
      zoom: targetZoom,
      countryId: result.countryId,
      flag: result.flag,
      description: result.description || `Verified geographic location: ${result.display_name}`,
      addressDetails: result.address,
    };

    setSelectedLoc(locationDetail);

    // GeoJSON Polygon Boundary Highlighting
    if (result.geojson && (result.geojson.type === 'Polygon' || result.geojson.type === 'MultiPolygon')) {
      setSelectedGeoJSON(result.geojson);
    } else {
      setSelectedGeoJSON(null);
    }

    setShowSearchDropdown(false);
    if (onSelectLocation) onSelectLocation(locationDetail);
  };

  // Reset World View
  const handleResetView = () => {
    setFlyTarget({
      center: [20, 0],
      zoom: 2,
      bounds: null,
    });
    setSelectedLoc(null);
    setSelectedGeoJSON(null);
    setSearchQuery('');
  };

  // Browser Geolocation ("My Location")
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLoc(userPos);
        setFlyTarget({
          center: userPos,
          zoom: 13,
          bounds: null,
        });

        const myLocDetail: SelectedMapLocation = {
          name: 'Your Current Location',
          type: 'landmark',
          coordinates: userPos,
          zoom: 13,
          description: `Accurate within ~${Math.round(pos.coords.accuracy)} meters.`,
        };
        setSelectedLoc(myLocDetail);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        let msg = 'Unable to retrieve your location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Geolocation access was denied. Please allow location permissions in your browser.';
        }
        alert(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Preset location handler
  const handleSelectPreset = (preset: QuickLocation) => {
    setSearchQuery(preset.name);
    handleSelectSearchResult({
      name: preset.name,
      type: preset.type,
      country: preset.country,
      state: preset.state,
      lat: preset.coordinates[0],
      lon: preset.coordinates[1],
      zoom: preset.zoom,
      countryId: preset.countryId,
      flag: preset.flag,
      description: preset.description,
      display_name: `${preset.name}, ${preset.country || ''}`,
    });
  };

  return (
    <div className="w-full border-2 border-black relative newsprint-texture flex flex-col overflow-hidden" style={{ height }}>
      {/* 1. TOP EDITORIAL HEADER BAR */}
      <div className="bg-black text-white px-4 py-2.5 font-mono text-xs flex flex-wrap justify-between items-center z-[1000] border-b-2 border-black gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
          <span className="font-bold tracking-widest uppercase text-white font-serif text-sm">
            ■ INTERACTIVE WORLD CARTOGRAPHY
          </span>
        </div>
        <div className="text-[11px] text-neutral-300 font-mono tracking-wider flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-red-500" />
          <span className="hidden sm:inline">SEARCH ANY COUNTRY, STATE OR CITY TO EXPLORE</span>
        </div>
      </div>

      {/* 2. SEARCH & CONTROLS TOOLBAR */}
      <div className="bg-[#F5F5F0] border-b-2 border-black p-2.5 flex flex-wrap items-center justify-between gap-2 z-[999] relative">
        {/* Search Input Container */}
        <div className="relative flex-1 min-w-[260px] max-w-xl" ref={searchContainerRef}>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-neutral-600 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowSearchDropdown(true);
              }}
              placeholder="Search country, state, city or location..."
              className="w-full pl-9 pr-8 py-1.5 bg-white border-2 border-black font-sans text-xs font-semibold text-black placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-black"
            />
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-red-600 animate-spin absolute right-3" />
            ) : searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowSearchDropdown(false);
                }}
                className="absolute right-2.5 text-neutral-500 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          {/* Search Dropdown Results */}
          {showSearchDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-[1001] max-h-80 overflow-y-auto divide-y divide-neutral-200">
              {searchResults.length === 0 ? (
                <div className="p-3 text-xs text-neutral-600 font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>No location found. Try searching for a country, state or city.</span>
                </div>
              ) : (
                searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSearchResult(item)}
                    className="p-2.5 hover:bg-neutral-100 cursor-pointer flex items-start gap-2.5 transition-colors"
                  >
                    <span className="mt-0.5 text-base">{item.flag || (item.type === 'country' ? '🌐' : item.type === 'state' ? '🗺️' : '📍')}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-xs uppercase text-black truncate">{item.name}</span>
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 uppercase border ${
                            item.type === 'country'
                              ? 'bg-black text-white border-black'
                              : item.type === 'state'
                              ? 'bg-amber-100 text-amber-900 border-amber-900'
                              : item.type === 'city'
                              ? 'bg-red-100 text-red-900 border-red-900'
                              : 'bg-neutral-200 text-neutral-800 border-neutral-800'
                          }`}
                        >
                          {item.type}
                        </span>
                      </div>
                      <p className="font-body text-[11px] text-neutral-600 truncate mt-0.5">{item.display_name}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Quick Location Preset Chips */}
        <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-[10px] font-mono font-bold uppercase text-neutral-600">Quick:</span>
          {PRESET_LOCATIONS.slice(0, 6).map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(preset)}
              className="px-2 py-0.5 bg-white border border-black hover:bg-black hover:text-white font-mono text-[10px] font-bold uppercase transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1"
            >
              <span>{preset.flag || '📍'}</span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>

        {/* Map Control Actions */}
        <div className="flex items-center gap-1">
          {/* Zoom In */}
          <button
            onClick={() => {
              setFlyTarget({
                center: mapCenter,
                zoom: Math.min(currentZoom + 1.5, 18),
                bounds: null,
              });
            }}
            title="Zoom In"
            className="p-1.5 bg-white border-2 border-black hover:bg-black hover:text-white font-mono text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => {
              setFlyTarget({
                center: mapCenter,
                zoom: Math.max(currentZoom - 1.5, 2),
                bounds: null,
              });
            }}
            title="Zoom Out"
            className="p-1.5 bg-white border-2 border-black hover:bg-black hover:text-white font-mono text-xs font-bold transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Reset View */}
          <button
            onClick={handleResetView}
            title="Reset to World View"
            className="p-1.5 bg-white border-2 border-black hover:bg-black hover:text-white font-mono text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline text-[10px] uppercase">Reset</span>
          </button>

          {/* My Location */}
          <button
            onClick={handleLocateUser}
            disabled={isLocating}
            title="My Current Location"
            className="p-1.5 bg-white border-2 border-black hover:bg-red-700 hover:text-white font-mono text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            {isLocating ? <Loader2 className="w-4 h-4 animate-spin text-red-600" /> : <Locate className="w-4 h-4 text-red-600" />}
            <span className="hidden sm:inline text-[10px] uppercase">My Location</span>
          </button>

          {/* Layer Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              title="Select Map Style / Layer"
              className="p-1.5 bg-white border-2 border-black hover:bg-black hover:text-white font-mono text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <Layers className="w-4 h-4 text-neutral-800" />
              <span className="hidden sm:inline text-[10px] uppercase">Layers</span>
            </button>

            {showLayerMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-[1002] w-48 py-1 divide-y divide-neutral-200">
                <div className="px-3 py-1 font-mono text-[10px] font-bold text-neutral-500 uppercase">Map Tiles</div>
                {Object.entries(MAP_LAYERS).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveLayer(key as keyof typeof MAP_LAYERS);
                      setShowLayerMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 font-mono text-xs flex items-center justify-between hover:bg-neutral-100 ${
                      activeLayer === key ? 'font-bold bg-neutral-200 text-black' : 'text-neutral-700'
                    }`}
                  >
                    <span>{config.name}</span>
                    {activeLayer === key && <span className="text-red-600 text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. LEAFLET MAP VIEW CONTAINER */}
      <div className="flex-1 relative w-full h-full">
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          className="w-full h-full grayscale-map z-0"
          style={{ background: '#F9F9F7' }}
        >
          {/* Active Map Tile Layer */}
          <TileLayer attribution={MAP_LAYERS[activeLayer].attribution} url={MAP_LAYERS[activeLayer].url} />

          {/* Map Event & FlyTo Controller */}
          <MapController
            targetCenter={flyTarget.center}
            targetZoom={flyTarget.zoom}
            targetBounds={flyTarget.bounds}
            onViewChange={(newZoom, newCenter) => {
              setCurrentZoom(newZoom);
              setMapCenter(newCenter);
            }}
          />

          {/* GeoJSON Boundary Polygon Layer */}
          {selectedGeoJSON && (
            <GeoJSON
              key={JSON.stringify(selectedGeoJSON)}
              data={selectedGeoJSON}
              style={{
                color: '#DC2626',
                weight: 2.5,
                opacity: 0.9,
                fillColor: '#DC2626',
                fillOpacity: 0.15,
              }}
            />
          )}

          {/* DYNAMIC MARKERS BASED ON ZOOM LEVEL */}

          {/* 1. Country Level Markers (Zoom 1-5) */}
          {currentZoom <= 6 &&
            countries.map((country) => (
              <Marker
                key={`country-${country.id}`}
                position={country.coordinates}
                icon={createCountryPinIcon(country.flag, country.name)}
                eventHandlers={{
                  click: () => {
                    handleSelectSearchResult({
                      name: country.name,
                      type: 'country',
                      country: country.name,
                      lat: country.coordinates[0],
                      lon: country.coordinates[1],
                      zoom: 5,
                      countryId: country.id,
                      flag: country.flag,
                      description: country.description,
                      boundingbox: COUNTRY_BOUNDS[country.code]
                        ? [
                            COUNTRY_BOUNDS[country.code][0][0],
                            COUNTRY_BOUNDS[country.code][1][0],
                            COUNTRY_BOUNDS[country.code][0][1],
                            COUNTRY_BOUNDS[country.code][1][1],
                          ]
                        : null,
                      display_name: `${country.name} (Capital: ${country.capital})`,
                    });
                  },
                }}
              />
            ))}

          {/* 2. Capital Cities & Major Regional Markers (Zoom 6+) */}
          {currentZoom >= 5 &&
            countries.map((country) => (
              <React.Fragment key={`cities-${country.id}`}>
                {/* Capital City Marker */}
                <Marker
                  position={country.coordinates}
                  icon={createCityPinIcon(country.capital, true)}
                  eventHandlers={{
                    click: () => {
                      handleSelectSearchResult({
                        name: country.capital,
                        type: 'city',
                        country: country.name,
                        lat: country.coordinates[0],
                        lon: country.coordinates[1],
                        zoom: 11,
                        countryId: country.id,
                        flag: country.flag,
                        description: `Capital city of ${country.name}.`,
                        display_name: `${country.capital}, ${country.name}`,
                      });
                    },
                  }}
                />

                {/* State/Region Cities when zoomed in */}
                {currentZoom >= 7 &&
                  country.states?.flatMap((state) =>
                    state.cities.map((city, idx) => (
                      <Marker
                        key={`city-${state.id}-${idx}`}
                        position={[
                          country.coordinates[0] + (Math.sin(idx + 1) * 0.4),
                          country.coordinates[1] + (Math.cos(idx + 1) * 0.4),
                        ]}
                        icon={createCityPinIcon(city.name, false)}
                        eventHandlers={{
                          click: () => {
                            handleSelectSearchResult({
                              name: city.name,
                              type: 'city',
                              country: country.name,
                              state: state.name,
                              lat: country.coordinates[0] + (Math.sin(idx + 1) * 0.4),
                              lon: country.coordinates[1] + (Math.cos(idx + 1) * 0.4),
                              zoom: 12,
                              countryId: country.id,
                              flag: country.flag,
                              description: city.overview,
                              display_name: `${city.name}, ${state.name}, ${country.name}`,
                            });
                          },
                        }}
                      />
                    ))
                  )}
              </React.Fragment>
            ))}

          {/* 3. User Current Position Marker */}
          {userLoc && (
            <Marker position={userLoc} icon={createTargetPinIcon('YOUR POSITION', 'GPS')} />
          )}

          {/* 4. Selected Location Target Pin Marker */}
          {selectedLoc && !userLoc && (
            <Marker
              position={selectedLoc.coordinates}
              icon={createTargetPinIcon(selectedLoc.name, selectedLoc.type.toUpperCase())}
            />
          )}
        </MapContainer>

        {/* 4. FLOATING LOCATION DETAILS GLASS PANEL */}
        {selectedLoc && (
          <div className="absolute right-4 bottom-8 z-[999] max-w-sm w-full map-glass-panel p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-start justify-between border-b-2 border-black pb-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedLoc.flag || '📍'}</span>
                <div>
                  <h3 className="font-serif font-black text-base uppercase text-black leading-tight">
                    {selectedLoc.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-black text-white">
                      {selectedLoc.type}
                    </span>
                    {selectedLoc.country && (
                      <span className="font-mono text-[10px] text-neutral-700 font-bold">
                        {selectedLoc.country}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedLoc(null)}
                className="text-neutral-500 hover:text-black p-1 cursor-pointer"
                title="Close Info Card"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="font-body text-xs text-neutral-800 line-clamp-3 mb-3 leading-relaxed">
              {selectedLoc.description}
            </p>

            <div className="grid grid-cols-2 gap-2 font-mono text-[10px] bg-neutral-100 p-2 border border-black mb-3">
              <div>
                <span className="text-neutral-500 block">LATITUDE</span>
                <span className="font-bold text-black">{selectedLoc.coordinates[0].toFixed(4)}° N</span>
              </div>
              <div>
                <span className="text-neutral-500 block">LONGITUDE</span>
                <span className="font-bold text-black">{selectedLoc.coordinates[1].toFixed(4)}° E</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedLoc.countryId && (
                <button
                  onClick={() => navigate(`/country/${selectedLoc.countryId}`)}
                  className="flex-1 py-1.5 bg-black text-white text-xs font-sans font-bold uppercase tracking-wider hover:bg-red-700 transition-colors border border-black cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>DISPATCH TO DOSSIER</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => {
                  setFlyTarget({
                    center: selectedLoc.coordinates,
                    zoom: Math.min(selectedLoc.zoom + 2, 16),
                    bounds: null,
                  });
                }}
                className="px-3 py-1.5 bg-white text-black hover:bg-black hover:text-white border border-black text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
              >
                ZOOM IN +
              </button>
            </div>
          </div>
        )}

        {/* 5. FOOTER STATUS BAR */}
        <div className="absolute left-3 bottom-3 z-[998] bg-black/90 text-white px-3 py-1 font-mono text-[10px] flex items-center gap-3 border border-white/40 shadow-md">
          <div>
            <span className="text-neutral-400">ZOOM:</span> <span className="text-red-400 font-bold">{currentZoom.toFixed(1)}</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-neutral-400">CENTER:</span> {mapCenter[0].toFixed(2)}°, {mapCenter[1].toFixed(2)}°
          </div>
          <div>
            <span className="text-neutral-400">TILE:</span> <span className="uppercase text-neutral-200">{activeLayer}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
