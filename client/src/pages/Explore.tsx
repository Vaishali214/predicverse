import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Globe, ArrowRight, Utensils, MapPin, Bookmark, Sparkles, Compass } from 'lucide-react';
import { COUNTRIES_DATA } from '../data/countries';
import { useApp } from '../context/AppContext';

export const Explore: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('all');
  const [selectedArchetype, setSelectedArchetype] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'capital' | 'popular'>('name');
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist } = useApp();

  const filteredCountries = useMemo(() => {
    return COUNTRIES_DATA.filter(country => {
      const q = searchTerm.toLowerCase();

      // Search match across multiple fields
      const matchesSearch =
        !q ||
        country.name.toLowerCase().includes(q) ||
        country.capital.toLowerCase().includes(q) ||
        country.code.toLowerCase().includes(q) ||
        country.description.toLowerCase().includes(q) ||
        country.culture.toLowerCase().includes(q) ||
        (country.region && country.region.toLowerCase().includes(q)) ||
        (country.continent && country.continent.toLowerCase().includes(q)) ||
        (country.foods && country.foods.some(f => f.name.toLowerCase().includes(q))) ||
        (country.festivals && country.festivals.some(f => f.name.toLowerCase().includes(q))) ||
        (country.topLandmarks && country.topLandmarks.some(l => l.toLowerCase().includes(q))) ||
        (country.bestCities && country.bestCities.some(c => c.toLowerCase().includes(q))) ||
        (country.travelPersonality && country.travelPersonality.some(p => p.toLowerCase().includes(q)));

      // Continent match
      const matchesContinent =
        selectedContinent === 'all' ||
        (country.continent && country.continent.toLowerCase() === selectedContinent.toLowerCase());

      // Archetype sub-filter match
      const matchesArchetype =
        selectedArchetype === 'all' ||
        (country.categoryTags && country.categoryTags.some(t => t.toLowerCase() === selectedArchetype.toLowerCase())) ||
        (country.travelPersonality && country.travelPersonality.some(t => t.toLowerCase().includes(selectedArchetype.toLowerCase())));

      return matchesSearch && matchesContinent && matchesArchetype;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'capital') return a.capital.localeCompare(b.capital);
      return a.name.localeCompare(b.name);
    });
  }, [searchTerm, selectedContinent, selectedArchetype, sortBy]);

  const continentTabs = [
    { id: 'all', label: 'ALL CONTINENTS' },
    { id: 'Asia', label: 'ASIA' },
    { id: 'Europe', label: 'EUROPE' },
    { id: 'Africa', label: 'AFRICA' },
    { id: 'North America', label: 'NORTH AMERICA' },
    { id: 'South America', label: 'SOUTH AMERICA' },
    { id: 'Oceania', label: 'OCEANIA' },
  ];

  const archetypeOptions = [
    { id: 'all', label: 'ALL INTERESTS' },
    { id: 'food', label: 'GASTRONOMY & FOOD' },
    { id: 'history', label: 'ANCIENT HISTORY' },
    { id: 'culture', label: 'CULTURE & HERITAGE' },
    { id: 'indigenous culture', label: 'INDIGENOUS HERITAGE' },
    { id: 'nature', label: 'NATURE & SCENERY' },
    { id: 'wildlife', label: 'SAFARI & WILDLIFE' },
    { id: 'adventure', label: 'ADVENTURE' },
    { id: 'beaches', label: 'BEACHES & COAST' },
    { id: 'islands', label: 'TROPICAL ISLANDS' },
    { id: 'festivals', label: 'FESTIVALS & EVENTS' },
    { id: 'romance', label: 'ROMANCE' },
    { id: 'luxury', label: 'LUXURY' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="border-b-4 border-black pb-6 space-y-2">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-red-700 uppercase tracking-widest">
          <span>GAZETTE WORLD DIRECTORY • EDITION 2026</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-black uppercase text-black leading-none">
          GLOBAL CULTURE &amp; TRAVEL CATALOG
        </h1>
        <p className="font-body text-sm text-neutral-700 max-w-3xl">
          Explore our verified editorial dossier of 20+ nations across Asia, Europe, Africa, North America, and South America — detailing capital cities, traditional arts, signature dishes, local festivals, and travel advisories.
        </p>
      </div>

      {/* Continent Tab Selector */}
      <div className="border-b-2 border-black flex items-center gap-1 font-sans text-xs font-bold uppercase overflow-x-auto pb-1">
        {continentTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedContinent(tab.id)}
            className={`px-4 py-2.5 border-2 border-black transition-colors cursor-pointer whitespace-nowrap ${
              selectedContinent === tab.id
                ? 'bg-black text-white font-black'
                : 'bg-white text-black hover:bg-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Control Bar: Search & Sub-filters */}
      <div className="p-4 bg-[#F5F5F0] border-2 border-black space-y-4 font-sans newsprint-texture">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search country, capital, food, landmark, city, festival..."
              className="w-full pl-9 pr-3 py-2 border border-black bg-white text-xs font-body focus:outline-none focus:border-red-700"
            />
          </div>

          {/* Filter Interest / Archetype */}
          <div className="md:col-span-4">
            <select
              value={selectedArchetype}
              onChange={(e) => setSelectedArchetype(e.target.value)}
              className="w-full px-3 py-2 border border-black bg-white text-xs font-sans font-bold uppercase focus:outline-none cursor-pointer"
            >
              {archetypeOptions.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-black bg-white text-xs font-sans font-bold uppercase focus:outline-none cursor-pointer"
            >
              <option value="name">SORT BY NAME (A-Z)</option>
              <option value="capital">SORT BY CAPITAL</option>
              <option value="popular">MOST POPULAR</option>
            </select>
          </div>

        </div>

        {/* Results Counter */}
        <div className="flex justify-between items-center pt-1 border-t border-neutral-300 font-mono text-xs text-neutral-600">
          <span>SHOWING {filteredCountries.length} OF {COUNTRIES_DATA.length} COUNTRY DOSSIERS</span>
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(''); setSelectedContinent('all'); setSelectedArchetype('all'); }}
              className="text-red-700 font-bold uppercase underline cursor-pointer"
            >
              CLEAR FILTERS ×
            </button>
          )}
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCountries.map(country => {
          const inWish = isInWishlist(country.id);
          return (
            <article
              key={country.id}
              className="border-2 border-black bg-white p-5 space-y-4 hard-shadow-hover flex flex-col justify-between relative"
            >
              {/* Wishlist Bookmark Button */}
              <button
                onClick={() => {
                  if (inWish) {
                    removeFromWishlist(country.id);
                  } else {
                    addToWishlist({
                      destinationType: 'country',
                      destinationId: country.id,
                      destinationName: country.name,
                    });
                  }
                }}
                className={`absolute top-4 right-4 p-1.5 border border-black cursor-pointer transition-colors ${
                  inWish ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-200'
                }`}
                title={inWish ? 'Remove from Passport Wishlist' : 'Save to Passport Wishlist'}
              >
                <Bookmark className="w-4 h-4" />
              </button>

              <div className="space-y-3">
                <div className="flex items-center gap-3 border-b border-black pb-2 pr-10">
                  <span className="text-4xl">{country.flag}</span>
                  <div>
                    <h3 className="font-serif text-2xl font-black uppercase text-black leading-none">
                      {country.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="font-mono text-[10px] font-bold text-neutral-600 uppercase">
                        {country.code}
                      </span>
                      {country.continent && (
                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 bg-red-700 text-white uppercase">
                          {country.continent}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="font-mono text-xs space-y-1 bg-neutral-100 p-2.5 border border-black">
                  <div><strong className="text-black">CAPITAL:</strong> {country.capital}</div>
                  <div><strong className="text-black">CURRENCY:</strong> {country.currency}</div>
                  <div><strong className="text-black">LANGUAGES:</strong> {country.languages.join(', ')}</div>
                </div>

                <p className="font-body text-xs text-neutral-800 line-clamp-3">
                  {country.description}
                </p>

                {/* Cultural Food Highlights */}
                {country.foods && country.foods.length > 0 && (
                  <div className="bg-[#F5F5F0] p-2.5 border border-black text-xs font-sans">
                    <div className="font-bold font-mono text-[10px] text-neutral-500 uppercase flex items-center gap-1">
                      <Utensils className="w-3 h-3 text-red-700" /> FAMOUS FOOD:
                    </div>
                    <div className="font-body text-xs font-bold text-black truncate">
                      {country.foods.map(f => f.name).join(', ')}
                    </div>
                  </div>
                )}

                {/* Travel Personality Badges */}
                {country.travelPersonality && country.travelPersonality.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {country.travelPersonality.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="font-mono text-[9px] font-bold uppercase px-1.5 py-0.5 border border-black bg-neutral-100 text-black">
                        ✦ {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Verification Badge */}
                {country.lastVerified && (
                  <div className="font-mono text-[9px] text-neutral-500 uppercase flex items-center gap-1 border-t border-dashed border-neutral-300 pt-1.5">
                    <span className="text-green-700">✓</span> {country.lastVerified}
                  </div>
                )}
              </div>

              <Link
                to={`/country/${country.id}`}
                className="w-full text-center py-2.5 bg-black text-white font-sans text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors border border-black cursor-pointer block mt-3"
              >
                EXPLORE COUNTRY →
              </Link>
            </article>
          );
        })}
      </div>

    </div>
  );
};


