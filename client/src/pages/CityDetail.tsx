import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Utensils, Coffee, ShoppingBag, Sparkles, Shield, Compass, Moon, Camera, Newspaper } from 'lucide-react';
import { COUNTRIES_DATA } from '../data/countries';
import { PredicVerseGazette } from '../components/PredicVerseGazette';

export const CityDetail: React.FC = () => {
  const { countryId, stateId, cityId } = useParams<{ countryId: string; stateId: string; cityId: string }>();
  const [viewMode, setViewMode] = useState<'gazette' | 'guide'>('gazette');

  const country = COUNTRIES_DATA.find(c => c.id === countryId);
  const state = country?.states.find(s => s.id === stateId);
  const city = state?.cities.find(c => c.id === cityId);

  if (!country || !state || !city) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-serif text-3xl font-bold uppercase text-black">CITY GUIDE NOT FOUND</h1>
        <Link to="/explore" className="inline-block px-4 py-2 bg-black text-white text-xs font-bold uppercase">
          RETURN TO DIRECTORY
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-mono text-xs font-bold text-neutral-600 uppercase border-b border-black pb-2">
        <Link to="/" className="hover:text-black">HOME</Link>
        <span>/</span>
        <Link to={`/country/${country.id}`} className="hover:text-black">{country.name}</Link>
        <span>/</span>
        <Link to={`/state/${country.id}/${state.id}`} className="hover:text-black">{state.name}</Link>
        <span>/</span>
        <span className="text-black font-extrabold">{city.name}</span>
      </div>

      {/* View Toggle */}
      <div className="flex justify-end gap-2 font-mono text-xs">
        <button
          onClick={() => setViewMode('gazette')}
          className={`px-4 py-2 border-2 border-black font-bold uppercase cursor-pointer flex items-center gap-2 ${
            viewMode === 'gazette' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>PREDICVERSE GAZETTE EDITION</span>
        </button>

        <button
          onClick={() => setViewMode('guide')}
          className={`px-4 py-2 border-2 border-black font-bold uppercase cursor-pointer flex items-center gap-2 ${
            viewMode === 'guide' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>URBAN DIRECTORY GUIDE</span>
        </button>
      </div>

      {viewMode === 'gazette' ? (
        <PredicVerseGazette country={country} state={state} city={city} />
      ) : (
        <>
          {/* City Hero Banner */}
          <div className="border-4 border-black bg-white p-6 sm:p-8 newsprint-texture space-y-4 hard-shadow-hover">
            <div className="flex justify-between items-start border-b-2 border-black pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-red-700 uppercase tracking-widest">
                  URBAN GAZETTE DOSSIER • {state.name.toUpperCase()}, {country.name.toUpperCase()}
                </span>
                <h1 className="font-serif text-4xl sm:text-6xl font-black uppercase text-black leading-none">
                  {city.name}
                </h1>
              </div>
              <span className="text-5xl">{country.flag}</span>
            </div>
            <p className="drop-cap font-body text-sm text-neutral-900 leading-relaxed">
              {city.overview}
            </p>
          </div>
        </>
      )}

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Key Attractions */}
        <div className="border-2 border-black bg-white p-6 space-y-3 hard-shadow-hover">
          <h2 className="font-serif text-2xl font-black uppercase text-black border-b border-black pb-2 flex items-center gap-2">
            <Camera className="w-5 h-5 text-black" /> ICONIC ATTRACTIONS &amp; LANDMARKS
          </h2>
          <ul className="space-y-2 font-sans text-xs text-neutral-800">
            {city.attractions.map((attraction, idx) => (
              <li key={idx} className="flex items-center gap-2 border-b border-neutral-200 pb-1.5">
                <span className="font-mono font-bold text-red-700">#0{idx+1}</span>
                <span className="font-bold">{attraction}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Hidden Gems */}
        <div className="border-2 border-black bg-[#F5F5F0] p-6 space-y-3 hard-shadow-hover">
          <h2 className="font-serif text-2xl font-black uppercase text-black border-b border-black pb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" /> EDITORIAL HIDDEN GEMS
          </h2>
          <ul className="space-y-2 font-sans text-xs text-neutral-800">
            {city.hiddenGems.map((gem, idx) => (
              <li key={idx} className="flex items-center gap-2 border-b border-neutral-300 pb-1.5">
                <span className="font-mono font-bold text-black">💎</span>
                <span>{gem}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Restaurants & Dining */}
        <div className="border-2 border-black bg-white p-6 space-y-3">
          <h2 className="font-serif text-xl font-bold uppercase text-black border-b border-black pb-2 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-red-700" /> RECOMMENDED RESTAURANTS
          </h2>
          <ul className="space-y-2 font-sans text-xs text-neutral-800">
            {city.restaurants.map((rest, idx) => (
              <li key={idx} className="border-b border-neutral-200 pb-1.5">
                🍽️ <strong className="text-black">{rest}</strong>
              </li>
            ))}
          </ul>
        </div>

        {/* Cafes & Coffee */}
        <div className="border-2 border-black bg-white p-6 space-y-3">
          <h2 className="font-serif text-xl font-bold uppercase text-black border-b border-black pb-2 flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-800" /> ESSENTIAL CAFES &amp; ROASTERS
          </h2>
          <ul className="space-y-2 font-sans text-xs text-neutral-800">
            {city.cafes.map((cafe, idx) => (
              <li key={idx} className="border-b border-neutral-200 pb-1.5">
                ☕ <strong className="text-black">{cafe}</strong>
              </li>
            ))}
          </ul>
        </div>

        {/* Shopping & Local Markets */}
        <div className="border-2 border-black bg-[#F5F5F0] p-6 space-y-3">
          <h2 className="font-serif text-xl font-bold uppercase text-black border-b border-black pb-2 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-black" /> MARKETS &amp; BAZAARS
          </h2>
          <div className="space-y-2 font-sans text-xs text-neutral-800">
            <div><strong>MARKETS:</strong> {city.markets.join(', ')}</div>
            <div><strong>SHOPPING AREAS:</strong> {city.shoppingAreas.join(', ')}</div>
          </div>
        </div>

        {/* Nightlife & Adventures */}
        <div className="border-2 border-black bg-white p-6 space-y-3">
          <h2 className="font-serif text-xl font-bold uppercase text-black border-b border-black pb-2 flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-700" /> NIGHTLIFE &amp; EXCURSIONS
          </h2>
          <div className="space-y-2 font-sans text-xs text-neutral-800">
            <div><strong>NIGHTLIFE:</strong> {city.nightlife.join(', ')}</div>
            <div><strong>ADVENTURES:</strong> {city.adventures.join(', ')}</div>
          </div>
        </div>

      </div>

      {/* Local Travel Tips */}
      <div className="border-2 border-black bg-black text-white p-6 space-y-3">
        <h2 className="font-serif text-xl font-bold uppercase text-white border-b border-neutral-700 pb-2 flex items-center gap-2">
          <Compass className="w-5 h-5 text-red-500" /> INSIDER CITY TRAVEL TIPS
        </h2>
        <ul className="space-y-2 font-body text-xs text-neutral-300">
          {city.travelTips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="font-mono font-bold text-red-400">✓</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};
