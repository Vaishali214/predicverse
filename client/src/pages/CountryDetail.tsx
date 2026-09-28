import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Bookmark, CheckCircle, MapPin, Utensils, Calendar, Shield, Sparkles, Compass, AlertCircle, ArrowRight } from 'lucide-react';
import { COUNTRIES_DATA } from '../data/countries';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { WorldMap } from '../components/WorldMap';
import { PredicVerseGazette } from '../components/PredicVerseGazette';
import { ClassifiedDestination } from '../components/ClassifiedDestination';

export const CountryDetail: React.FC = () => {
  const { countryId } = useParams<{ countryId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'gazette' | 'overview' | 'culture' | 'history' | 'states' | 'food' | 'festivals' | 'places' | 'tips'>('gazette');

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    addToPassport,
    removeFromPassport,
    isInPassport
  } = useApp();

  const { token } = useAuth();
  const country = COUNTRIES_DATA.find(c => c.id === countryId);

  const [weather, setWeather] = useState<any>(null);
  const [currency, setCurrency] = useState<any>(null);
  const [match, setMatch] = useState<any>(null);
  const [cultureInfo, setCultureInfo] = useState<any>(null);

  useEffect(() => {
    if (country) {
      api.getWeather(country.capital || country.name).then(setWeather);
      api.getCurrency(1000, 'USD').then(setCurrency);
      api.getRecommendationMatch(country.id, token || undefined).then(setMatch);
      api.getCultureInfo(country.id).then(setCultureInfo);
    }
  }, [country?.id, token]);

  if (!country) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-serif text-3xl font-bold uppercase text-black">COUNTRY DOSSIER NOT FOUND</h1>
        <p className="font-body text-sm text-neutral-600">The requested country code does not exist in our gazette catalog.</p>
        <Link to="/explore" className="inline-block px-4 py-2 bg-black text-white text-xs font-bold uppercase">
          RETURN TO DIRECTORY
        </Link>
      </div>
    );
  }

  const inWish = isInWishlist(country.id);
  const inPass = isInPassport(country.id);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Editorial Breadcrumb */}
      <div className="flex items-center gap-2 font-mono text-xs font-bold text-neutral-600 uppercase border-b border-black pb-2">
        <Link to="/" className="hover:text-black">HOME</Link>
        <span>/</span>
        <Link to="/explore" className="hover:text-black">DESTINATIONS</Link>
        <span>/</span>
        <span className="text-black font-extrabold">{country.name}</span>
      </div>

      {/* Hero Header Article Box */}
      <div className="border-4 border-black bg-white p-6 sm:p-8 newsprint-texture space-y-6 relative hard-shadow-hover">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-black pb-4">
          <div className="flex items-center gap-4">
            <span className="text-6xl sm:text-7xl">{country.flag}</span>
            <div>
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-red-700 uppercase tracking-widest">
                <span>OFFICIAL DOSSIER • {country.code}</span>
                {country.continent && <span className="px-1.5 py-0.5 bg-black text-white text-[9px]">{country.continent}</span>}
              </div>
              <h1 className="font-serif text-4xl sm:text-6xl font-black uppercase text-black leading-none tracking-tight">
                {country.name}
              </h1>
              <p className="font-serif text-sm italic text-neutral-600 mt-1">
                Capital of {country.capital} • {country.population} Citizens
              </p>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                if (inPass) removeFromPassport(country.id);
                else addToPassport({ destinationType: 'country', destinationId: country.id, destinationName: country.name });
              }}
              className={`px-3 py-2 border-2 border-black text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors ${
                inPass ? 'bg-green-800 text-white' : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              {inPass ? 'STAMPED IN PASSPORT' : 'STAMP AS VISITED'}
            </button>

            <button
              onClick={() => {
                if (inWish) removeFromWishlist(country.id);
                else addToWishlist({ destinationType: 'country', destinationId: country.id, destinationName: country.name });
              }}
              className={`px-3 py-2 border-2 border-black text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors ${
                inWish ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              {inWish ? 'WISHLISTED' : 'ADD TO WISHLIST'}
            </button>
          </div>
        </div>

        {/* Key Dossier Table */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 font-mono text-xs bg-[#F5F5F0] p-4 border border-black">
          <div><strong className="block text-[10px] text-neutral-500 uppercase">REGION</strong> {country.region || 'Global'}</div>
          <div><strong className="block text-[10px] text-neutral-500 uppercase">CURRENCY</strong> {country.currency}</div>
          <div><strong className="block text-[10px] text-neutral-500 uppercase">LANGUAGES</strong> {country.languages.join(', ')}</div>
          <div><strong className="block text-[10px] text-neutral-500 uppercase">GOVERNMENT</strong> {country.government}</div>
          <div><strong className="block text-[10px] text-neutral-500 uppercase">TIME ZONE</strong> {country.timeZone}</div>
          <div><strong className="block text-[10px] text-neutral-500 uppercase">DIALING CODE</strong> {country.callingCode}</div>
          {country.area && <div><strong className="block text-[10px] text-neutral-500 uppercase">TOTAL AREA</strong> {country.area}</div>}
          {country.nationalDay && <div><strong className="block text-[10px] text-neutral-500 uppercase">NATIONAL DAY</strong> {country.nationalDay}</div>}
          {country.avgBudgetPerDay && <div><strong className="block text-[10px] text-neutral-500 uppercase">AVG BUDGET</strong> {country.avgBudgetPerDay}</div>}
          {country.bestTimeToVisit && <div><strong className="block text-[10px] text-neutral-500 uppercase">BEST TIME TO VISIT</strong> {country.bestTimeToVisit}</div>}
        </div>

        {/* TRAVEL DNA MATCH & LIVE INTELLIGENCE ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs border-2 border-black p-4 bg-white">
          {/* Match Score */}
          <div className="space-y-2 border-b md:border-b-0 md:border-r border-black pb-3 md:pb-0 md:pr-3">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase">WHY THIS DESTINATION MATCHES YOU</span>
              <span className="px-2 py-0.5 bg-green-800 text-white font-bold text-xs">{match?.matchPercentage || 92}% MATCH</span>
            </div>
            <div className="space-y-1 font-sans text-xs text-neutral-800">
              {(match?.reasons || [
                '✓ Strong food culture matching your profile',
                '✓ High cultural exploration potential',
                '✓ Fits your preferred travel style'
              ]).map((reason: string, i: number) => (
                <div key={i} className="flex items-center gap-1.5 font-medium text-[11px]">
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Weather */}
          <div className="space-y-1 border-b md:border-b-0 md:border-r border-black pb-3 md:pb-0 md:pr-3 md:pl-1">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase">WEATHER • {country.capital}</span>
              <span className={`px-1.5 text-[9px] font-bold ${weather?.isLive ? 'bg-green-700 text-white' : 'bg-amber-700 text-white'}`}>
                {weather?.isLive ? '● LIVE (Open-Meteo)' : 'UNAVAILABLE'}
              </span>
            </div>
            <div className="font-serif text-2xl font-black text-black">
              {weather?.isLive
                ? `${weather.temperature}${weather.unit} (${weather.condition})`
                : 'Weather data unavailable'}
            </div>
            <div className="font-sans text-[11px] text-neutral-600">
              {weather?.isLive
                ? `Humidity: ${weather.humidity}% | Wind: ${weather.windSpeed} km/h`
                : 'Real-time weather API connection required'}
            </div>
          </div>

          {/* Currency Conversions */}
          <div className="space-y-1 md:pl-1">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase">EXCHANGE RATES ($1,000 USD)</span>
              <span className={`px-1.5 text-[9px] font-bold ${currency?.isLive ? 'bg-green-700 text-white' : 'bg-amber-700 text-white'}`}>
                {currency?.isLive ? '● LIVE (open.er-api.com)' : 'UNAVAILABLE'}
              </span>
            </div>
            <div className="font-sans font-bold text-xs text-black">
              {currency?.isLive
                ? `≈ ${currency?.conversions?.INR?.formatted || 'N/A'} | ${currency?.conversions?.EUR?.formatted || 'N/A'} | ${currency?.conversions?.JPY?.formatted || 'N/A'}`
                : 'Exchange rate data unavailable'}
            </div>
            <div className="font-sans text-[10px] text-neutral-500">
              {currency?.isLive
                ? `1 USD = ${currency?.rates?.INR} INR | ${currency?.rates?.EUR} EUR`
                : 'Real-time currency API connection required'}
            </div>
          </div>
        </div>

        {/* Travel Personality Badges */}
        {country.travelPersonality && country.travelPersonality.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black">
            <span className="font-mono text-[10px] font-bold uppercase text-neutral-500">TRAVEL ARCHETYPES:</span>
            {country.travelPersonality.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-red-700 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                {tag}
              </span>
            ))}
            {country.officialTourismSource && (
              <a
                href={country.officialTourismSource}
                target="_blank"
                rel="noreferrer"
                className="ml-auto font-mono text-[10px] font-bold uppercase underline text-black hover:text-red-700"
              >
                OFFICIAL TOURISM PORTAL ↗
              </a>
            )}
          </div>
        )}
      </div>

      {/* Interactive Tabs */}
      <div className="border-b-2 border-black flex items-center gap-1 font-sans text-xs font-bold uppercase overflow-x-auto">
        {[
          { id: 'gazette', label: '📰 PREDICVERSE GAZETTE' },
          { id: 'overview', label: 'OVERVIEW & MAP' },
          { id: 'culture', label: 'CULTURE & TRADITIONS' },
          { id: 'history', label: 'HISTORY' },
          { id: 'states', label: `REGIONS & CITIES (${country.states.length})` },
          { id: 'food', label: `GASTRONOMY (${country.foods.length})` },
          { id: 'festivals', label: `FESTIVALS (${country.festivals.length})` },
          { id: 'places', label: 'PLACES & NATURE' },
          { id: 'tips', label: 'TRAVEL TIPS & ADVISORIES' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 border-t-2 border-x-2 border-black -mb-[2px] transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-black text-white border-black font-black'
                : 'bg-white text-black hover:bg-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-[#F9F9F7] border-2 border-black p-6 sm:p-8 space-y-8">
        
        {/* GAZETTE TAB */}
        {activeTab === 'gazette' && (
          <PredicVerseGazette country={country} />
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-7 space-y-6">
                <div>
                  <h2 className="font-serif text-3xl font-black uppercase border-b-2 border-black pb-2">
                    HISTORICAL &amp; CULTURAL HERITAGE
                  </h2>
                  <p className="drop-cap font-body text-sm leading-relaxed text-neutral-900 justified mt-3">
                    {country.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-lg uppercase text-black">Historical Evolution</h4>
                  <p className="font-body text-xs text-neutral-800 leading-relaxed bg-[#F5F5F0] p-4 border border-black newsprint-texture">
                    {country.history}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-lg uppercase text-black">Cultural Identity &amp; Living Heritage</h4>
                  <p className="font-body text-xs text-neutral-800 leading-relaxed">
                    {country.culture}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs pt-2">
                    <div className="bg-neutral-100 p-3 border border-black">
                      <strong className="block text-[10px] text-neutral-500 uppercase">TRADITIONAL ATTIRE</strong>
                      {country.traditionalDress}
                    </div>
                    {country.traditionalMusic && (
                      <div className="bg-neutral-100 p-3 border border-black">
                        <strong className="block text-[10px] text-neutral-500 uppercase">TRADITIONAL MUSIC</strong>
                        {country.traditionalMusic}
                      </div>
                    )}
                    {country.traditionalDance && (
                      <div className="bg-neutral-100 p-3 border border-black">
                        <strong className="block text-[10px] text-neutral-500 uppercase">TRADITIONAL DANCE</strong>
                        {country.traditionalDance}
                      </div>
                    )}
                    {country.traditionalArt && country.traditionalArt.length > 0 && (
                      <div className="bg-neutral-100 p-3 border border-black">
                        <strong className="block text-[10px] text-neutral-500 uppercase">TRADITIONAL ARTS</strong>
                        {country.traditionalArt.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* UNESCO & Top Landmarks Section */}
                {(country.unescoSites || country.topLandmarks) && (
                  <div className="space-y-3 pt-2">
                    <h4 className="font-serif font-bold text-lg uppercase text-black border-b border-black pb-1">
                      MONUMENTS &amp; HERITAGE HIGHLIGHTS
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {country.unescoSites && (
                        <div className="p-4 border border-black bg-amber-50 space-y-2">
                          <h5 className="font-serif font-bold text-xs uppercase text-amber-900 flex items-center gap-1">
                            🏛 UNESCO HERITAGE SITES
                          </h5>
                          <ul className="font-body text-xs space-y-1 text-neutral-800">
                            {country.unescoSites.map((site, i) => (
                              <li key={i}>• {site}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {country.topLandmarks && (
                        <div className="p-4 border border-black bg-neutral-50 space-y-2">
                          <h5 className="font-serif font-bold text-xs uppercase text-black flex items-center gap-1">
                            📍 MUST-SEE LANDMARKS
                          </h5>
                          <ul className="font-body text-xs space-y-1 text-neutral-800">
                            {country.topLandmarks.map((lm, i) => (
                              <li key={i}>• {lm}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar: Fun Facts, Map & Quick Highlights */}
              <div className="md:col-span-5 space-y-6">
                <div className="p-4 border-2 border-black bg-[#F5F5F0] space-y-3">
                  <h3 className="font-serif text-xl font-bold uppercase text-black border-b border-black pb-1 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-red-700" /> GAZETTE FUN FACTS
                  </h3>
                  <ul className="space-y-2 font-body text-xs text-neutral-800">
                    {country.funFacts.map((fact, idx) => (
                      <li key={idx} className="flex items-start gap-2 border-b border-neutral-300 pb-1.5">
                        <span className="font-mono font-bold text-red-700">#0{idx+1}</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {country.localExperiences && (
                  <div className="p-4 border-2 border-black bg-black text-white space-y-3">
                    <h3 className="font-serif text-lg font-bold uppercase text-white border-b border-neutral-700 pb-1 flex items-center gap-2">
                      ⭐ SIGNATURE MUST-EXPERIENCES
                    </h3>
                    <ul className="space-y-1.5 font-body text-xs text-neutral-200">
                      {country.localExperiences.map((exp, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="text-red-400">✦</span> {exp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-serif font-bold text-sm uppercase text-black mb-2">GEOGRAPHIC CARTOGRAPHY</h4>
                  <WorldMap countries={[country]} center={country.coordinates} zoom={5} height="280px" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CULTURE & TRADITIONS TAB */}
        {activeTab === 'culture' && (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-black uppercase border-b-2 border-black pb-2">
              CULTURAL IDENTITY, TRADITIONAL ARTS &amp; LIVING HERITAGE
            </h2>
            <p className="font-body text-sm leading-relaxed text-neutral-900 bg-[#F5F5F0] p-5 border border-black newsprint-texture">
              {country.culture}
            </p>

            {country.indigenousCulture && (
              <div className="p-6 border-2 border-black bg-amber-50 space-y-3">
                <h3 className="font-serif font-bold text-xl uppercase text-amber-950 border-b border-amber-300 pb-1 flex items-center gap-2">
                  🌿 INDIGENOUS HERITAGE &amp; ANCESTRAL KNOWLEDGE
                </h3>
                <p className="font-body text-xs text-amber-950 leading-relaxed justified">
                  {country.indigenousCulture}
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 border-2 border-black space-y-3 bg-white">
                <h3 className="font-serif font-bold text-lg uppercase text-black border-b border-black pb-1">
                  TRADITIONAL ATTIRE &amp; PERFORMING ARTS
                </h3>
                <div className="space-y-2 font-mono text-xs">
                  <div><strong className="text-black uppercase block">TRADITIONAL ATTIRE:</strong> {country.traditionalDress}</div>
                  {country.traditionalMusic && <div><strong className="text-black uppercase block">TRADITIONAL MUSIC:</strong> {country.traditionalMusic}</div>}
                  {country.traditionalDance && <div><strong className="text-black uppercase block">TRADITIONAL DANCE:</strong> {country.traditionalDance}</div>}
                </div>
              </div>

              {country.traditionalArt && (
                <div className="p-5 border-2 border-black space-y-3 bg-white">
                  <h3 className="font-serif font-bold text-lg uppercase text-black border-b border-black pb-1">
                    ARTS, CRAFTS &amp; ARTISANAL TRADITIONS
                  </h3>
                  <ul className="space-y-1.5 font-body text-xs text-neutral-800">
                    {country.traditionalArt.map((art, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-red-700">✦</span> {art}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {country.famousSouvenirs && (
              <div className="p-5 border-2 border-black bg-[#F5F5F0] space-y-3">
                <h3 className="font-serif font-bold text-base uppercase text-black">AUTHENTIC HANDICRAFTS &amp; SOUVENIRS</h3>
                <div className="flex flex-wrap gap-2 font-mono text-xs">
                  {country.famousSouvenirs.map((item, i) => (
                    <span key={i} className="px-3 py-1 bg-white border border-black text-black">
                      🎁 {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-black uppercase border-b-2 border-black pb-2">
              HISTORICAL EVOLUTION &amp; ARCHAEOLOGICAL LEGACY
            </h2>
            <div className="p-6 border-2 border-black bg-white space-y-4 newsprint-texture">
              <p className="drop-cap font-body text-sm leading-relaxed text-neutral-900 justified">
                {country.history}
              </p>
            </div>

            {country.bestHistoricalPlaces && (
              <div className="p-5 border-2 border-black bg-[#F5F5F0] space-y-3">
                <h3 className="font-serif font-bold text-lg uppercase text-black border-b border-black pb-1">
                  HISTORICAL DESTINATIONS &amp; ANCIENT SITES
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-body text-xs">
                  {country.bestHistoricalPlaces.map((site, i) => (
                    <div key={i} className="p-3 border border-black bg-white flex items-center gap-2">
                      <span className="font-mono font-bold text-red-700">#{i+1}</span>
                      <span>{site}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PLACES & NATURE TAB */}
        {activeTab === 'places' && (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-black uppercase border-b-2 border-black pb-2">
              LANDMARKS, NATURE &amp; MONUMENTS OF {country.name.toUpperCase()}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {country.topLandmarks && (
                <div className="p-5 border-2 border-black bg-white space-y-3">
                  <h3 className="font-serif text-xl font-bold uppercase text-black border-b border-black pb-1">
                    📍 FAMOUS MONUMENTS &amp; LANDMARKS
                  </h3>
                  <ul className="space-y-2 font-body text-xs text-neutral-800">
                    {country.topLandmarks.map((lm, i) => (
                      <li key={i} className="flex items-center gap-2 border-b border-neutral-200 pb-1">
                        <span className="font-mono font-bold text-red-700">•</span>
                        <span>{lm}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {country.bestNatureSpots && (
                <div className="p-5 border-2 border-black bg-[#F5F5F0] space-y-3">
                  <h3 className="font-serif text-xl font-bold uppercase text-black border-b border-black pb-1">
                    🏞 NATURE, MOUNTAINS &amp; PARKS
                  </h3>
                  <ul className="space-y-2 font-body text-xs text-neutral-800">
                    {country.bestNatureSpots.map((spot, i) => (
                      <li key={i} className="flex items-center gap-2 border-b border-neutral-300 pb-1">
                        <span className="text-green-800">🌲</span>
                        <span>{spot}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {country.unescoSites && (
              <div className="p-5 border-2 border-black bg-amber-50 space-y-3">
                <h3 className="font-serif text-xl font-bold uppercase text-amber-950 border-b border-amber-300 pb-1 flex items-center gap-2">
                  🏛 UNESCO WORLD HERITAGE SITES
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-body text-xs text-amber-950">
                  {country.unescoSites.map((site, i) => (
                    <div key={i} className="p-2 border border-amber-300 bg-white">
                      🏛 {site}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(country.wildlife || country.marineLife) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {country.wildlife && (
                  <div className="p-5 border-2 border-black bg-green-50 space-y-3">
                    <h3 className="font-serif text-xl font-bold uppercase text-green-950 border-b border-green-300 pb-1 flex items-center gap-2">
                      🦘 NATIVE WILDLIFE &amp; FAUNA
                    </h3>
                    <div className="flex flex-wrap gap-2 font-mono text-xs text-green-950">
                      {country.wildlife.map((w, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white border border-green-800 font-bold">
                          🐾 {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {country.marineLife && (
                  <div className="p-5 border-2 border-black bg-cyan-50 space-y-3">
                    <h3 className="font-serif text-xl font-bold uppercase text-cyan-950 border-b border-cyan-300 pb-1 flex items-center gap-2">
                      🐠 MARINE LIFE &amp; CORAL REEFS
                    </h3>
                    <div className="flex flex-wrap gap-2 font-mono text-xs text-cyan-950">
                      {country.marineLife.map((m, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white border border-cyan-800 font-bold">
                          🌊 {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STATES & CITIES TAB */}
        {activeTab === 'states' && (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-black uppercase border-b-2 border-black pb-2">
              PROVINCES, STATES &amp; CITIES OF {country.name.toUpperCase()}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {country.states.map(state => (
                <div key={state.id} className="border-2 border-black p-5 bg-[#F9F9F7] space-y-3 hard-shadow-hover flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start border-b border-black pb-2">
                      <h3 className="font-serif text-2xl font-black uppercase text-black">
                        {state.name}
                      </h3>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 border border-black bg-black text-white">
                        {state.cities.length} CITIES
                      </span>
                    </div>

                    <p className="font-body text-xs text-neutral-700 mt-2 line-clamp-3">
                      {state.description}
                    </p>

                    <div className="mt-3 space-y-1 font-mono text-xs">
                      <div><strong className="text-black">TOP FOODS:</strong> {state.famousFood.join(', ')}</div>
                      <div><strong className="text-black">KEY SIGHTS:</strong> {state.touristPlaces.join(', ')}</div>
                    </div>
                  </div>

                  <Link
                    to={`/state/${country.id}/${state.id}`}
                    className="w-full text-center py-2 bg-black text-white font-sans text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors border border-black cursor-pointer block mt-4"
                  >
                    EXPLORE STATE DOSSIER →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FOOD TAB */}
        {activeTab === 'food' && (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-black uppercase border-b-2 border-black pb-2">
              GASTRONOMICAL GUIDE &amp; REGIONAL DELICACIES
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {country.foods.map((food, idx) => (
                <div key={idx} className="border-2 border-black p-5 bg-white space-y-2 newsprint-texture">
                  <div className="flex justify-between items-center border-b border-black pb-1">
                    <h3 className="font-serif text-xl font-bold uppercase text-black">
                      {food.name}
                    </h3>
                    <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 bg-black text-white">
                      {food.type}
                    </span>
                  </div>
                  <p className="font-body text-xs text-neutral-800">
                    {food.description}
                  </p>
                </div>
              ))}
            </div>

            {country.popularDrinks && country.popularDrinks.length > 0 && (
              <div className="p-4 border-2 border-black bg-[#F5F5F0] space-y-2">
                <h4 className="font-serif font-bold text-sm uppercase text-black">POPULAR TRADITIONAL BEVERAGES</h4>
                <div className="flex flex-wrap gap-2 font-mono text-xs">
                  {country.popularDrinks.map((drink, i) => (
                    <span key={i} className="px-3 py-1 bg-white border border-black text-black">
                      🍹 {drink}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FESTIVALS TAB */}
        {activeTab === 'festivals' && (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-black uppercase border-b-2 border-black pb-2">
              CELEBRATIONS &amp; CULTURAL FESTIVALS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {country.festivals.map((fest, idx) => (
                <div key={idx} className="border-2 border-black p-5 bg-[#F5F5F0] space-y-2">
                  <div className="flex justify-between items-center border-b border-black pb-1">
                    <h3 className="font-serif text-xl font-bold uppercase text-black">
                      {fest.name}
                    </h3>
                    <span className="font-mono text-xs font-bold text-red-700">
                      📅 {fest.month}
                    </span>
                  </div>
                  <p className="font-body text-xs text-neutral-800">
                    {fest.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRAVEL TIPS TAB */}
        {activeTab === 'tips' && (
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-black uppercase border-b-2 border-black pb-2">
              ESSENTIAL TRAVEL ADVISORIES, ETIQUETTE &amp; SAFETY
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* General Tips */}
              <div className="space-y-3 p-5 border-2 border-black bg-neutral-100">
                <h3 className="font-serif text-xl font-bold uppercase text-black flex items-center gap-2">
                  <Compass className="w-5 h-5 text-black" /> GENERAL TRAVEL ADVISORIES
                </h3>
                <ul className="space-y-2 font-body text-xs text-neutral-800">
                  {country.travelTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 border-b border-neutral-300 pb-1">
                      <span className="font-mono font-bold text-red-700">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
                {country.visaInfo && (
                  <div className="pt-2 border-t border-neutral-300 font-mono text-xs">
                    <strong className="text-black uppercase block">VISA INFORMATION:</strong>
                    {country.visaInfo}
                  </div>
                )}
              </div>

              {/* Safety & Emergency */}
              <div className="space-y-3 p-5 border-2 border-black bg-red-50 text-red-950">
                <h3 className="font-serif text-xl font-bold uppercase text-red-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-700" /> SAFETY &amp; HOTLINES
                </h3>
                {country.safetyInfo && (
                  <p className="font-body text-xs text-red-900 border-b border-red-200 pb-2">
                    {country.safetyInfo}
                  </p>
                )}
                <div className="space-y-2 font-mono text-xs pt-1">
                  <div className="flex justify-between border-b border-red-200 pb-1">
                    <span>POLICE HOTLINE:</span>
                    <strong className="text-red-700">{country.emergencyNumbers.police}</strong>
                  </div>
                  <div className="flex justify-between border-b border-red-200 pb-1">
                    <span>AMBULANCE &amp; MEDICAL:</span>
                    <strong className="text-red-700">{country.emergencyNumbers.ambulance}</strong>
                  </div>
                  <div className="flex justify-between border-b border-red-200 pb-1">
                    <span>FIRE DEPARTMENT:</span>
                    <strong className="text-red-700">{country.emergencyNumbers.fire}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Dos and Donts */}
            {country.dosAndDonts && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="p-5 border-2 border-green-800 bg-green-50 space-y-2">
                  <h4 className="font-serif font-bold text-base text-green-900 uppercase">
                    CULTURAL DO'S
                  </h4>
                  <ul className="space-y-1.5 font-body text-xs text-green-950">
                    {country.dosAndDonts.dos.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="font-bold text-green-700">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 border-2 border-red-800 bg-red-50 space-y-2">
                  <h4 className="font-serif font-bold text-base text-red-900 uppercase">
                    CULTURAL DON'TS
                  </h4>
                  <ul className="space-y-1.5 font-body text-xs text-red-950">
                    {country.dosAndDonts.donts.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="font-bold text-red-700">✗</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Souvenirs & Transport */}
            {(country.famousSouvenirs || country.transportation) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {country.famousSouvenirs && (
                  <div className="p-4 border border-black bg-neutral-50 space-y-2 font-mono text-xs">
                    <strong className="block text-black uppercase">POPULAR SOUVENIRS TO BUY:</strong>
                    <div className="flex flex-wrap gap-1.5">
                      {country.famousSouvenirs.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white border border-black">
                          🎁 {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {country.transportation && (
                  <div className="p-4 border border-black bg-neutral-50 space-y-2 font-mono text-xs">
                    <strong className="block text-black uppercase">GETTING AROUND:</strong>
                    <div className="flex flex-wrap gap-1.5">
                      {country.transportation.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white border border-black">
                          🚌 {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
