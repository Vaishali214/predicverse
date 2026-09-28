import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dices, Sparkles, X, Compass, ArrowRight, Calendar, Award } from 'lucide-react';
import { COUNTRIES_DATA } from '../data/countries';
import { Country } from '../types';

interface SurpriseMeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SurpriseMeModal: React.FC<SurpriseMeModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  if (!isOpen) return null;

  const pickDestination = () => {
    setIsSpinning(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * COUNTRIES_DATA.length);
      setSelectedCountry(COUNTRIES_DATA[randomIndex]);
      setIsSpinning(false);
    }, 600);
  };

  // Initial pick if none selected yet
  if (!selectedCountry && !isSpinning) {
    pickDestination();
  }

  const dest = selectedCountry || COUNTRIES_DATA[0];

  const handleExplore = () => {
    onClose();
    navigate(`/country/${dest.id}`);
  };

  const handlePlan = () => {
    onClose();
    navigate(`/planner?destination=${encodeURIComponent(dest.name)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#FAF9F5] border-4 border-black p-6 sm:p-8 newsprint-texture shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-[#111111] space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-black text-white hover:bg-red-700 transition-colors border border-black cursor-pointer"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Masthead */}
        <div className="text-center border-b-2 border-black pb-4">
          <div className="inline-flex items-center gap-2 font-mono text-xs font-black uppercase text-red-700 tracking-widest bg-red-50 border border-red-200 px-3 py-1 mb-2">
            <Dices className="w-4 h-4" />
            <span>PREDICVERSE SERENDIPITY ENGINE</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-black uppercase tracking-tight text-black">
            "THE GAZETTE HAS CHOSEN YOUR NEXT ADVENTURE."
          </h2>
        </div>

        {/* Content Box with Spinning / Reveal State */}
        {isSpinning ? (
          <div className="py-16 text-center space-y-4 bg-white border-2 border-black">
            <Dices className="w-12 h-12 mx-auto text-red-700 animate-spin" />
            <div className="font-serif text-xl font-bold uppercase animate-pulse">
              CONSULTING GAZETTE ARCHIVES &amp; DESTINATION MAPS...
            </div>
            <div className="font-mono text-xs text-neutral-500">
              Filtering by culture, gastronomy, and secrets...
            </div>
          </div>
        ) : (
          <div className="border-2 border-black bg-white p-6 space-y-5 relative newsprint-texture">
            
            {/* Header / Flag */}
            <div className="flex items-center justify-between border-b border-neutral-300 pb-3">
              <div className="flex items-center gap-4">
                <span className="text-5xl sm:text-6xl">{dest.flag}</span>
                <div>
                  <div className="font-mono text-[10px] font-bold uppercase text-red-700 tracking-wider">
                    DESTINATION SELECTED • {dest.continent || 'WORLD'}
                  </div>
                  <h3 className="font-serif text-3xl sm:text-4xl font-black uppercase text-black">
                    {dest.name}
                  </h3>
                  <div className="font-sans text-xs text-neutral-600 italic">
                    Capital: {dest.capital} • Currency: {dest.currency}
                  </div>
                </div>
              </div>

              <div className="hidden sm:block text-right">
                <span className="inline-block px-2.5 py-1 bg-black text-white font-mono text-[10px] font-bold uppercase tracking-widest">
                  98% MATCH
                </span>
              </div>
            </div>

            {/* Why it matches */}
            <div className="space-y-3 font-sans text-xs">
              <div className="p-3 bg-amber-50 border-l-4 border-amber-600 space-y-1">
                <div className="font-mono font-bold uppercase text-[11px] text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  WHY THE GAZETTE CHOSE THIS FOR YOU:
                </div>
                <p className="text-amber-950 leading-relaxed font-serif italic text-sm">
                  "{dest.description}"
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-[#F9F9F7] border border-neutral-300">
                  <div className="font-mono text-[10px] font-bold text-neutral-500 uppercase">SUGGESTED EXPERIENCE</div>
                  <div className="font-sans font-bold text-xs text-neutral-900 mt-1">
                    {dest.localExperiences ? dest.localExperiences[0] : 'Explore ancient cultural heritage & local street gastronomy.'}
                  </div>
                </div>

                <div className="p-3 bg-[#F9F9F7] border border-neutral-300">
                  <div className="font-mono text-[10px] font-bold text-neutral-500 uppercase">RECOMMENDED TRAVEL STYLE</div>
                  <div className="font-sans font-bold text-xs text-neutral-900 mt-1">
                    {dest.travelPersonality ? dest.travelPersonality.join(' • ') : 'Cultural Explorer'}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-black">
              <button
                onClick={handleExplore}
                className="flex-1 py-3 px-4 bg-black text-white font-mono text-xs font-bold uppercase tracking-wider border-2 border-black hover:bg-red-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <Compass className="w-4 h-4" />
                <span>[ EXPLORE GAZETTE EDITION ]</span>
              </button>

              <button
                onClick={handlePlan}
                className="flex-1 py-3 px-4 bg-white text-black font-mono text-xs font-bold uppercase tracking-wider border-2 border-black hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <Calendar className="w-4 h-4" />
                <span>[ PLAN TRIP TO {dest.name.toUpperCase()} ]</span>
              </button>

              <button
                onClick={pickDestination}
                className="py-3 px-4 bg-[#F5F5F0] text-black font-mono text-xs font-bold uppercase border-2 border-black hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="Spin for another destination"
              >
                <Dices className="w-4 h-4" />
                <span>AGAIN 🎲</span>
              </button>
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="text-center font-mono text-[10px] text-neutral-500 uppercase border-t border-black pt-3">
          PREDICVERSE RANDOMIZED GAZETTE DISCOVERY • NO FARE RESERVATION REQUIRED
        </div>

      </div>
    </div>
  );
};
