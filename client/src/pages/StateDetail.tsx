import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Utensils, Calendar, BookOpen, ArrowRight, Landmark } from 'lucide-react';
import { COUNTRIES_DATA } from '../data/countries';

export const StateDetail: React.FC = () => {
  const { countryId, stateId } = useParams<{ countryId: string; stateId: string }>();

  const country = COUNTRIES_DATA.find(c => c.id === countryId);
  const state = country?.states.find(s => s.id === stateId);

  if (!country || !state) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-serif text-3xl font-bold uppercase text-black">REGIONAL STATE DOSSIER NOT FOUND</h1>
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
        <span className="text-black font-extrabold">{state.name}</span>
      </div>

      {/* State Header */}
      <div className="border-4 border-black bg-white p-6 sm:p-8 newsprint-texture space-y-4 hard-shadow-hover">
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <div>
            <span className="font-mono text-xs font-bold text-red-700 uppercase tracking-widest">
              PROVINCIAL REGION DOSSIER • {country.name.toUpperCase()}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-black uppercase text-black">
              {state.name}
            </h1>
          </div>
          <span className="text-4xl">{country.flag}</span>
        </div>

        <p className="drop-cap font-body text-sm text-neutral-800 leading-relaxed">
          {state.description}
        </p>
      </div>

      {/* Deep Dive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Main Content (8 cols) */}
        <div className="md:col-span-8 space-y-6">
          
          <div className="bg-white border-2 border-black p-6 space-y-3">
            <h2 className="font-serif text-2xl font-black uppercase text-black border-b border-black pb-2 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-black" /> REGIONAL HISTORY &amp; FOLKLORE
            </h2>
            <p className="font-body text-xs text-neutral-800 leading-relaxed">
              {state.history}
            </p>
          </div>

          <div className="bg-[#F5F5F0] border-2 border-black p-6 space-y-3">
            <h2 className="font-serif text-2xl font-black uppercase text-black border-b border-black pb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-black" /> CULTURAL IDENTITY
            </h2>
            <p className="font-body text-xs text-neutral-800 leading-relaxed">
              {state.culture}
            </p>
          </div>

          {/* Cities Section */}
          <div className="space-y-4 pt-4">
            <h2 className="font-serif text-3xl font-black uppercase border-b-2 border-black pb-2">
              CITIES IN {state.name.toUpperCase()} ({state.cities.length})
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {state.cities.map(city => (
                <div key={city.id} className="border-2 border-black bg-white p-5 space-y-3 hard-shadow-hover">
                  <div className="flex justify-between items-center border-b border-black pb-2">
                    <h3 className="font-serif text-2xl font-black uppercase text-black">
                      {city.name}
                    </h3>
                    <Link
                      to={`/city/${country.id}/${state.id}/${city.id}`}
                      className="px-3 py-1 bg-black text-white text-xs font-sans font-bold uppercase hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      EXPLORE CITY →
                    </Link>
                  </div>
                  <p className="font-body text-xs text-neutral-800">
                    {city.overview}
                  </p>
                  <div className="font-mono text-xs bg-neutral-100 p-2.5 border border-black flex flex-wrap gap-x-4 gap-y-1">
                    <span><strong>ATTRACTIONS:</strong> {city.attractions.slice(0, 3).join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Sidebar (4 cols) */}
        <div className="md:col-span-4 space-y-6">
          
          <div className="border-2 border-black bg-white p-5 space-y-3">
            <h3 className="font-serif text-lg font-bold uppercase text-black border-b border-black pb-1 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-red-700" /> FAMOUS REGIONAL FOOD
            </h3>
            <ul className="space-y-1.5 font-sans text-xs text-neutral-800">
              {state.famousFood.map((food, idx) => (
                <li key={idx} className="flex items-center gap-2 border-b border-neutral-200 pb-1">
                  <span className="font-mono font-bold text-red-700">•</span>
                  <span>{food}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-2 border-black bg-white p-5 space-y-3">
            <h3 className="font-serif text-lg font-bold uppercase text-black border-b border-black pb-1 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-black" /> KEY TOURIST SIGHTS
            </h3>
            <ul className="space-y-1.5 font-sans text-xs text-neutral-800">
              {state.touristPlaces.map((place, idx) => (
                <li key={idx} className="flex items-center gap-2 border-b border-neutral-200 pb-1">
                  <span className="font-mono font-bold text-black">✓</span>
                  <span>{place}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-2 border-black bg-[#F5F5F0] p-5 space-y-3">
            <h3 className="font-serif text-lg font-bold uppercase text-black border-b border-black pb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-700" /> REGIONAL FESTIVALS
            </h3>
            <ul className="space-y-1.5 font-sans text-xs text-neutral-800">
              {state.festivals.map((fest, idx) => (
                <li key={idx} className="border-b border-neutral-300 pb-1">
                  🎉 {fest}
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
