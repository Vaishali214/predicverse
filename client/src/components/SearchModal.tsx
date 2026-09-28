import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, MapPin, Utensils, Calendar, Globe, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COUNTRIES_DATA } from '../data/countries';
import { SearchResult } from '../types';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen } = useApp();
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const navigate = useNavigate();

  // Listen for Ctrl+K or Escape keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  // Aggregate index of all searchable items
  const allResults = useMemo(() => {
    const results: SearchResult[] = [];

    COUNTRIES_DATA.forEach(country => {
      // Country
      results.push({
        type: 'country',
        id: country.id,
        name: country.name,
        description: `${country.flag} ${country.capital} • ${country.description}`,
        link: `/country/${country.id}`,
      });

      // Foods
      country.foods.forEach(food => {
        results.push({
          type: 'food',
          id: `${country.id}-food-${food.name}`,
          name: food.name,
          parentName: country.name,
          description: `${food.type.toUpperCase()} • ${food.description}`,
          link: `/country/${country.id}`,
        });
      });

      // Festivals
      country.festivals.forEach(fest => {
        results.push({
          type: 'festival',
          id: `${country.id}-fest-${fest.name}`,
          name: fest.name,
          parentName: country.name,
          description: `${fest.month} • ${fest.description}`,
          link: `/country/${country.id}`,
        });
      });

      // States
      country.states.forEach(state => {
        results.push({
          type: 'state',
          id: state.id,
          name: state.name,
          parentName: country.name,
          description: state.description,
          link: `/state/${country.id}/${state.id}`,
        });

        // Cities
        state.cities.forEach(city => {
          results.push({
            type: 'city',
            id: city.id,
            name: city.name,
            parentName: `${state.name}, ${country.name}`,
            description: city.overview,
            link: `/city/${country.id}/${state.id}/${city.id}`,
          });
        });
      });
    });

    return results;
  }, []);

  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allResults.filter(item => {
      const matchType = selectedType === 'all' || item.type === selectedType;
      const matchQuery =
        item.name.toLowerCase().includes(q) ||
        (item.parentName && item.parentName.toLowerCase().includes(q)) ||
        item.description.toLowerCase().includes(q);
      return matchType && matchQuery;
    });
  }, [allResults, query, selectedType]);

  if (!isSearchOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'country': return <Globe className="w-4 h-4 text-black" />;
      case 'state': return <MapPin className="w-4 h-4 text-black" />;
      case 'city': return <MapPin className="w-4 h-4 text-red-600" />;
      case 'food': return <Utensils className="w-4 h-4 text-amber-700" />;
      case 'festival': return <Calendar className="w-4 h-4 text-purple-700" />;
      default: return <Search className="w-4 h-4 text-black" />;
    }
  };

  const handleSelect = (link: string) => {
    setIsSearchOpen(false);
    setQuery('');
    navigate(link);
  };

  return (
    <div className="fixed inset-0 z-[5000] bg-black/70 backdrop-blur-xs flex items-start justify-center pt-16 px-4">
      <div className="bg-[#F9F9F7] w-full max-w-2xl border-4 border-black hard-shadow-hover overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Search Header */}
        <div className="p-4 border-b-2 border-black flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-black shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search countries, states, cities, food, festivals..."
            autoFocus
            className="w-full text-base font-serif font-bold text-black placeholder-neutral-400 focus:outline-none"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 hover:bg-black hover:text-white border border-black transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 border-b border-black bg-[#F5F5F0] flex items-center gap-2 text-xs font-mono overflow-x-auto">
          <span className="font-bold text-neutral-600 mr-1">FILTER:</span>
          {['all', 'country', 'state', 'city', 'food', 'festival'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-2.5 py-1 border border-black uppercase text-[11px] font-bold cursor-pointer ${
                selectedType === type ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search Results */}
        <div className="overflow-y-auto p-4 flex-1 divide-y divide-neutral-300">
          {query.trim() === '' ? (
            <div className="text-center py-10 text-neutral-500 font-mono text-xs">
              <p className="font-serif text-base font-bold text-black mb-1">GLOBAL DISPATCH SEARCH</p>
              <p>Type keywords to search across countries, cities, regional cuisine &amp; festivals.</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 font-mono text-xs">
              NO MATCHING DISPATCHES FOUND FOR "{query.toUpperCase()}"
            </div>
          ) : (
            filteredResults.map(result => (
              <div
                key={result.id}
                onClick={() => handleSelect(result.link)}
                className="py-3 px-2 hover:bg-white hover:border-l-4 hover:border-black transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 border border-black bg-neutral-100 group-hover:bg-black group-hover:text-white transition-colors">
                    {getIcon(result.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-sm text-black group-hover:text-red-700">
                        {result.name}
                      </h4>
                      <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 border border-black bg-neutral-200 text-black">
                        {result.type}
                      </span>
                    </div>
                    {result.parentName && (
                      <p className="font-mono text-[11px] text-neutral-600 font-bold">
                        LOCATION: {result.parentName}
                      </p>
                    )}
                    <p className="font-body text-xs text-neutral-700 line-clamp-1 mt-0.5">
                      {result.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-black group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-black bg-white text-[11px] font-mono text-neutral-600 flex justify-between items-center">
          <span>{filteredResults.length} RESULTS FOUND</span>
          <span>ESC TO CLOSE</span>
        </div>

      </div>
    </div>
  );
};
