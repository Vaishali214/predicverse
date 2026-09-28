import React, { useState } from 'react';
import { Eye, ShieldAlert, Lock, Sparkles, MapPin, Users, DollarSign, Star } from 'lucide-react';
import { Country, State, City } from '../types';

interface ClassifiedDestinationProps {
  country?: Country;
  state?: State;
  city?: City;
}

interface HiddenGemDetail {
  name: string;
  location: string;
  crowdLevel: string;
  approxCost: string;
  rating: string;
  description: string;
  secretTip: string;
}

export const ClassifiedDestination: React.FC<ClassifiedDestinationProps> = ({ country, state, city }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  // Derive or generate classified entry based on passed props
  const getGemDetails = (): HiddenGemDetail => {
    if (city && city.hiddenGems && city.hiddenGems.length > 0) {
      return {
        name: city.hiddenGems[0],
        location: `${city.name}, ${state?.name || country?.name || 'Local District'}`,
        crowdLevel: 'Very Low (10-15% Tourists)',
        approxCost: 'Budget friendly ($10–25/day)',
        rating: 'Curated Hidden Legend',
        description: `Tucked away from main tourist thoroughfares in ${city.name}, this secluded spot remains an untouched local secret.`,
        secretTip: 'Visit early at dawn or right before dusk for the most peaceful experience and secret local vantage points.',
      };
    }

    if (country && country.hiddenGems && country.hiddenGems.length > 0) {
      return {
        name: country.hiddenGems[0],
        location: `${country.name}`,
        crowdLevel: 'Low (15-20% Tourists)',
        approxCost: 'Moderate ($20–45/day)',
        rating: 'Editor’s Secret Choice',
        description: `While most travelers stay on the beaten trail in ${country.name}, this sanctuary offers authentic culture away from tour buses.`,
        secretTip: 'Ask local elder artisans for directions rather than relying strictly on standard digital navigation.',
      };
    }

    // Default curated fallback for any location
    const destName = city?.name || state?.name || country?.name || 'Kyoto';
    return {
      name: `The Whispering Pass of ${destName}`,
      location: `Outer Precincts, ${destName}`,
      crowdLevel: 'Minimal (Under 10% Visitor Footprint)',
      approxCost: 'Budget / Low Cost',
      rating: 'Secret Archive Selection',
      description: `A guarded local secret tucked behind historic stone alleys where travelers experience authentic atmosphere untouched by mass tourism.`,
      secretTip: 'Bring local cash and respect traditional quiet hours observed by resident guardians.',
    };
  };

  const gem = getGemDetails();

  return (
    <div className="my-8 border-4 border-black bg-[#FAF9F5] p-6 sm:p-8 newsprint-texture shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
      {/* Background Vintage Watermark */}
      <div className="absolute top-2 right-4 pointer-events-none opacity-10 select-none font-serif text-8xl font-black tracking-tighter">
        SECRET
      </div>

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-black pb-4 mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black text-white font-mono text-xs font-black uppercase flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>CLASSIFIED DESTINATION</span>
          </div>
          <span className="font-mono text-xs font-bold text-red-700 tracking-wider">
            DOSSIER #PV-882-X
          </span>
        </div>
        <div className="font-mono text-[11px] font-bold px-2 py-1 bg-amber-100 border border-black uppercase text-amber-900 flex items-center gap-1">
          <Lock className="w-3 h-3" />
          <span>ACCESS LEVEL: SECRET</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="font-serif italic text-lg sm:text-xl text-neutral-800 border-l-4 border-black pl-4 py-1">
          "There's somewhere most tourists miss."
        </div>

        {/* Classified Card Box */}
        <div className="border-2 border-black bg-white p-5 space-y-4 relative">
          {/* Declassified Stamp visual when revealed */}
          {isRevealed && (
            <div className="absolute top-4 right-4 z-20 animate-bounce transition-transform transform rotate-[-12deg] pointer-events-none">
              <div className="border-4 border-red-700 text-red-700 px-3 py-1 font-mono font-black text-sm uppercase tracking-widest bg-white/90 shadow-md">
                ★ DECLASSIFIED ★
              </div>
            </div>
          )}

          {/* Redacted vs Revealed Location Title */}
          <div>
            <div className="font-mono text-xs text-neutral-500 uppercase font-bold tracking-wider mb-1">
              📍 DESTINATION CODENAME
            </div>
            {isRevealed ? (
              <h3 className="font-serif text-2xl sm:text-3xl font-black text-black tracking-tight underline decoration-red-700 decoration-2">
                {gem.name}
              </h3>
            ) : (
              <div className="inline-block bg-black text-black select-none font-mono text-xl sm:text-2xl px-4 py-1 tracking-widest rounded-sm shadow-inner cursor-pointer hover:bg-neutral-900 transition-colors"
                   onClick={() => setIsRevealed(true)}
                   title="Click to reveal classified destination">
                ██████████████████████
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="p-3 border border-neutral-300 bg-[#F9F9F7]">
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-500 font-bold uppercase">
                <MapPin className="w-3.5 h-3.5 text-neutral-700" />
                <span>LOCATION</span>
              </div>
              <div className="font-sans font-bold text-xs text-neutral-900 mt-1">
                {isRevealed ? gem.location : '████████, ██████'}
              </div>
            </div>

            <div className="p-3 border border-neutral-300 bg-[#F9F9F7]">
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-500 font-bold uppercase">
                <Users className="w-3.5 h-3.5 text-neutral-700" />
                <span>CROWD LEVEL</span>
              </div>
              <div className="font-sans font-bold text-xs text-neutral-900 mt-1">
                {gem.crowdLevel}
              </div>
            </div>

            <div className="p-3 border border-neutral-300 bg-[#F9F9F7]">
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-500 font-bold uppercase">
                <DollarSign className="w-3.5 h-3.5 text-neutral-700" />
                <span>APPROX COST</span>
              </div>
              <div className="font-sans font-bold text-xs text-neutral-900 mt-1">
                {gem.approxCost}
              </div>
            </div>

            <div className="p-3 border border-neutral-300 bg-[#F9F9F7]">
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-500 font-bold uppercase">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>EDITORIAL CLASSIFICATION</span>
              </div>
              <div className="font-sans font-bold text-xs text-neutral-900 mt-1">
                {gem.rating}
              </div>
            </div>
          </div>

          {/* Description & Tip when revealed */}
          {isRevealed && (
            <div className="space-y-3 pt-3 border-t border-dashed border-neutral-300 animate-fadeIn">
              <p className="font-serif text-sm leading-relaxed text-neutral-800">
                {gem.description}
              </p>
              <div className="p-3 bg-amber-50 border-l-4 border-amber-600 font-sans text-xs text-amber-950 italic">
                <strong className="font-bold font-mono text-[11px] uppercase not-italic block mb-0.5 text-amber-900">
                  SECRET TRAVELER BRIEFING:
                </strong>
                {gem.secretTip}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          {!isRevealed ? (
            <button
              onClick={() => setIsRevealed(true)}
              className="px-6 py-3 bg-black text-white font-mono text-xs font-bold uppercase tracking-wider border-2 border-black hover:bg-red-700 transition-all flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none cursor-pointer"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              [ REVEAL CLASSIFIED LOCATION ]
            </button>
          ) : (
            <button
              onClick={() => setIsRevealed(false)}
              className="px-4 py-2 bg-neutral-200 text-neutral-800 font-mono text-[11px] font-bold uppercase border border-black hover:bg-neutral-300 transition-colors cursor-pointer"
            >
              [ RE-SEAL DOSSIER ]
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
