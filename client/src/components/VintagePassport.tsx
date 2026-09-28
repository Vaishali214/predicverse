import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { TravelDNA } from './TravelDNA';
import { COUNTRIES_DATA } from '../data/countries';
import { CheckCircle, Award, Compass, Plus, Trash2, Shield, Bookmark, Sparkles, MapPin } from 'lucide-react';

export const VintagePassport: React.FC = () => {
  const { user } = useAuth();
  const { passport, addToPassport, removeFromPassport } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState(COUNTRIES_DATA[0]?.id || 'india');
  const [visitedDate, setVisitedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddStamp = (e: React.FormEvent) => {
    e.preventDefault();
    const country = COUNTRIES_DATA.find(c => c.id === selectedCountryId);
    if (country) {
      addToPassport({
        destinationType: 'country',
        destinationId: country.id,
        destinationName: country.name,
      });
      setShowAddModal(false);
    }
  };

  // Generate deterministic vintage stamp style based on destination ID
  const getStampStyle = (id: string, index: number) => {
    const rotations = ['rotate-[-6deg]', 'rotate-[4deg]', 'rotate-[-3deg]', 'rotate-[8deg]', 'rotate-[-8deg]'];
    const colors = [
      'border-red-800 text-red-800 bg-red-50/50',
      'border-blue-900 text-blue-900 bg-blue-50/50',
      'border-emerald-800 text-emerald-800 bg-emerald-50/50',
      'border-amber-900 text-amber-900 bg-amber-50/50',
      'border-purple-900 text-purple-900 bg-purple-50/50',
    ];
    return {
      rotation: rotations[index % rotations.length],
      color: colors[index % colors.length],
    };
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#F5F5F0] border-4 border-black p-4 newsprint-texture gap-4">
        <div>
          <div className="font-mono text-xs font-bold text-red-700 uppercase tracking-widest">
            GLOBAL TRAVELER IDENTIFICATION
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black uppercase text-black">
            THE OFFICIAL PREDICVERSE PASSPORT
          </h1>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-black text-white font-mono text-xs font-bold uppercase tracking-wider border-2 border-black hover:bg-red-700 transition-colors flex items-center gap-2 cursor-pointer hard-shadow-hover"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>STAMP NEW DESTINATION</span>
        </button>
      </div>

      {/* Physical Leather Booklet Container */}
      <div className="bg-[#2D1E18] p-4 sm:p-8 rounded-lg shadow-2xl border-4 border-[#1A100C] space-y-6">
        
        {/* Passport Booklet Header Foil */}
        <div className="text-center py-4 border-b border-amber-900/40 text-amber-300 font-serif">
          <div className="text-2xl font-bold uppercase tracking-[0.3em] text-amber-200">
            ★ PREDICVERSE PASSPORT ★
          </div>
          <div className="font-mono text-[10px] text-amber-400/80 uppercase tracking-widest mt-1">
            REPUBLIC OF GLOBAL EXPLORERS • OFFICIAL TRAVELER DOSSIER
          </div>
        </div>

        {/* Open Booklet Pages: Left Page (ID) & Right Page (Stamps) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#F7F4EB] border-2 border-amber-950 p-4 sm:p-8 rounded shadow-inner text-[#111111] newsprint-texture">
          
          {/* LEFT PAGE: PASSPORT HOLDER BIODATA */}
          <div className="lg:col-span-5 space-y-6 border-b lg:border-b-0 lg:border-r-2 border-dashed border-amber-900/40 pb-6 lg:pb-0 lg:pr-6">
            
            <div className="text-center space-y-2 border-b border-black pb-4">
              <div className="w-20 h-20 mx-auto bg-black text-white font-serif font-black text-3xl flex items-center justify-center border-4 border-amber-800 shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
              </div>
              <h2 className="font-serif text-2xl font-black uppercase text-black tracking-tight">
                {user?.name || 'EXPLORER PASSPORT'}
              </h2>
              <div className="font-mono text-xs text-red-700 font-bold">
                PASSPORT NO: PV-{user?.id ? user.id.toUpperCase().slice(0, 8) : '2026-GLOBE'}
              </div>
            </div>

            {/* Official Credentials Grid */}
            <div className="space-y-2 font-mono text-xs bg-white p-4 border border-black shadow-xs">
              <div className="flex justify-between border-b border-neutral-200 pb-1">
                <span className="text-neutral-500 uppercase">NATIONALITY</span>
                <strong className="text-black uppercase">GLOBAL CITIZEN</strong>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-1">
                <span className="text-neutral-500 uppercase">ISSUED BY</span>
                <strong className="text-black uppercase">PREDICVERSE GAZETTE</strong>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-1">
                <span className="text-neutral-500 uppercase">ISSUE DATE</span>
                <strong className="text-black">2026-01-01</strong>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-1">
                <span className="text-neutral-500 uppercase">STAMPS COLLECTED</span>
                <strong className="text-red-700 font-bold">{passport.length} DESTINATIONS</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 uppercase">STATUS</span>
                <span className="text-emerald-800 font-extrabold uppercase">ACTIVE UNLIMITED</span>
              </div>
            </div>

            {/* Passport Stamp Seal Graphic */}
            <div className="p-4 border-2 border-black bg-amber-50 text-center space-y-1 rotate-[-2deg]">
              <div className="font-mono text-[9px] font-black uppercase tracking-widest text-red-800">
                ★ OFFICIAL DIPLOMATIC SEAL ★
              </div>
              <div className="font-serif text-xs font-bold uppercase text-black">
                AUTHORIZED FOR WORLD TRAVEL
              </div>
            </div>

          </div>

          {/* RIGHT PAGE: PASSPORT STAMPS GRID */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex justify-between items-center border-b-2 border-black pb-2">
              <h3 className="font-serif text-xl font-black uppercase text-black flex items-center gap-2">
                <Award className="w-5 h-5 text-red-700" />
                <span>OFFICIAL VISITED STAMPS</span>
              </h3>
              <span className="font-mono text-xs font-bold bg-black text-white px-2 py-0.5">
                PAGE 1 OF 12
              </span>
            </div>

            {passport.length === 0 ? (
              <div className="py-12 px-4 text-center border-2 border-dashed border-black bg-white space-y-3">
                <Compass className="w-10 h-10 mx-auto text-neutral-400 animate-spin" />
                <h4 className="font-serif text-lg font-bold uppercase">NO STAMPS RECORDED YET</h4>
                <p className="font-body text-xs text-neutral-600 max-w-sm mx-auto">
                  Explore destinations across PredicVerse and click "STAMP AS VISITED" to build your physical travel passport log!
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-black text-white text-xs font-mono font-bold uppercase border border-black cursor-pointer"
                >
                  STAMP YOUR FIRST DESTINATION
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {passport.map((item, idx) => {
                  const stampStyle = getStampStyle(item.destinationId, idx);
                  const countryData = COUNTRIES_DATA.find(c => c.id === item.destinationId);
                  const flag = countryData?.flag || '✈️';
                  const dateStr = item.visitedAt ? new Date(item.visitedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '2026';

                  return (
                    <div
                      key={item.id}
                      className={`p-4 border-4 rounded-full aspect-square flex flex-col justify-center items-center text-center space-y-1 relative group hover:scale-[1.03] transition-transform ${stampStyle.rotation} ${stampStyle.color} shadow-sm`}
                    >
                      {/* Delete stamp button on hover */}
                      <button
                        onClick={() => removeFromPassport(item.destinationId)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 bg-red-700 text-white rounded-full transition-opacity cursor-pointer"
                        title="Remove Stamp"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>

                      <div className="font-mono text-[9px] font-black uppercase tracking-wider">
                        ENTRY PERMIT
                      </div>

                      <div className="text-2xl">{flag}</div>

                      <div className="font-serif font-black text-sm uppercase leading-tight px-2">
                        {item.destinationName}
                      </div>

                      <div className="font-mono text-[9px] font-bold tracking-widest border-t border-b border-current py-0.5 px-2">
                        {dateStr}
                      </div>

                      <div className="font-mono text-[8px] font-bold uppercase opacity-80">
                        VERIFIED ENTRY ★
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* TRAVEL DNA INTEGRATION BELOW PASSPORT */}
      <TravelDNA />

      {/* STAMP NEW DESTINATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-[#FAF9F5] border-4 border-black p-6 newsprint-texture shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-5">
            <div className="flex justify-between items-center border-b-2 border-black pb-3">
              <h3 className="font-serif text-xl font-black uppercase text-black">
                STAMP NEW DESTINATION
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="font-mono text-xs px-2 py-1 bg-black text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStamp} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                  SELECT COUNTRY TO STAMP:
                </label>
                <select
                  value={selectedCountryId}
                  onChange={(e) => setSelectedCountryId(e.target.value)}
                  className="w-full p-2.5 bg-white border-2 border-black font-sans font-bold text-sm cursor-pointer"
                >
                  {COUNTRIES_DATA.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.flag} {c.name} ({c.capital})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-600 uppercase mb-1">
                  VISITED DATE:
                </label>
                <input
                  type="date"
                  value={visitedDate}
                  onChange={(e) => setVisitedDate(e.target.value)}
                  className="w-full p-2.5 bg-white border-2 border-black font-sans text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-black">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-neutral-200 text-black font-bold uppercase border border-black cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black text-white font-bold uppercase border-2 border-black hover:bg-red-700 cursor-pointer"
                >
                  IMPRINT STAMP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
