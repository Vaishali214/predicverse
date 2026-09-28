import React, { useState, useEffect } from 'react';
import { TripPlan } from '../types';
import { Clock, Calendar, CheckSquare, Square, Sparkles, MapPin, Compass, AlertCircle } from 'lucide-react';
import { COUNTRIES_DATA } from '../data/countries';

interface TripCountdownProps {
  trip?: TripPlan;
  onPlanTripClick?: () => void;
}

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export const TripCountdown: React.FC<TripCountdownProps> = ({ trip, onPlanTripClick }) => {
  // Demo target departure date (default 17 days from now if not specified)
  const defaultDeparture = new Date(Date.now() + 17 * 24 * 60 * 60 * 1000);
  
  const targetDate = defaultDeparture;

  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 17,
    hours: 8,
    minutes: 42,
    seconds: 15,
  });

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', label: 'Passport validity checked (> 6 months remaining)', completed: true },
    { id: '2', label: 'Visa requirements & entry permits confirmed', completed: true },
    { id: '3', label: 'Travel insurance policy activated', completed: false },
    { id: '4', label: 'Local currency exchanged & travel cards set', completed: false },
    { id: '5', label: 'Luggage packed & essential medications stored', completed: false },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const toggleCheck = (id: string) => {
    setChecklist(prev =>
      prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
    );
  };

  const destName = trip?.destination || 'Kyoto, Japan';
  const matchingCountry = COUNTRIES_DATA.find(c => c.name.toLowerCase().includes(destName.toLowerCase()) || destName.toLowerCase().includes(c.name.toLowerCase()));
  const flag = matchingCountry?.flag || '🎌';

  return (
    <div className="border-4 border-black bg-white p-6 sm:p-8 newsprint-texture shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-black pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-black text-white">
            <Clock className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="font-mono text-xs font-bold text-red-700 uppercase tracking-widest">
              EXPEDITION COUNTDOWN &amp; PREPARATION
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-black uppercase text-black tracking-tight">
              YOUR NEXT ADVENTURE
            </h2>
          </div>
        </div>

        <div className="font-mono text-xs bg-[#F5F5F0] border border-black px-3 py-1.5 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-neutral-700" />
          <span>DEPARTURE DATE: {targetDate.toLocaleDateString()}</span>
        </div>
      </div>

      {/* Main Countdown Display Box */}
      <div className="border-2 border-black bg-[#FAF9F5] p-6 text-center space-y-6 relative overflow-hidden newsprint-texture">
        
        <div className="flex justify-center items-center gap-3 font-serif font-black text-2xl sm:text-3xl uppercase text-black">
          <span className="text-4xl sm:text-5xl">{flag}</span>
          <span>{destName}</span>
        </div>

        {/* Big Digits Display */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto font-mono">
          <div className="p-4 bg-white border-2 border-black space-y-1 shadow-sm">
            <div className="font-serif text-4xl sm:text-5xl font-black text-red-700">
              {timeLeft.days}
            </div>
            <div className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
              DAYS
            </div>
          </div>

          <div className="p-4 bg-white border-2 border-black space-y-1 shadow-sm">
            <div className="font-serif text-4xl sm:text-5xl font-black text-black">
              {timeLeft.hours}
            </div>
            <div className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
              HOURS
            </div>
          </div>

          <div className="p-4 bg-white border-2 border-black space-y-1 shadow-sm">
            <div className="font-serif text-4xl sm:text-5xl font-black text-black">
              {timeLeft.minutes}
            </div>
            <div className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
              MINUTES
            </div>
          </div>

          <div className="p-4 bg-white border-2 border-black space-y-1 shadow-sm">
            <div className="font-serif text-4xl sm:text-5xl font-black text-red-700">
              {timeLeft.seconds}
            </div>
            <div className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
              SECONDS
            </div>
          </div>
        </div>

        <div className="font-serif italic text-base text-neutral-700">
          "UNTIL DEPARTURE TO {destName.toUpperCase()}"
        </div>
      </div>

      {/* Preparation Checklist */}
      <div className="space-y-3 pt-2">
        <div className="font-mono text-xs font-black uppercase text-black border-b border-black pb-1 flex justify-between items-center">
          <span className="flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-red-700" />
            <span>EXPEDITION PREPARATION CHECKLIST</span>
          </span>
          <span className="text-neutral-500">
            {checklist.filter(i => i.completed).length} OF {checklist.length} READY
          </span>
        </div>

        <div className="space-y-2 font-sans text-xs">
          {checklist.map(item => (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-3 border border-black flex items-center justify-between cursor-pointer transition-colors ${
                item.completed ? 'bg-emerald-50/70 text-emerald-950 border-emerald-800' : 'bg-white text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.completed ? (
                  <CheckSquare className="w-4 h-4 text-emerald-800 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-neutral-400 shrink-0" />
                )}
                <span className={item.completed ? 'line-through opacity-80 font-medium' : 'font-bold'}>
                  {item.label}
                </span>
              </div>

              {item.completed && (
                <span className="font-mono text-[9px] font-black uppercase px-2 py-0.5 bg-emerald-800 text-white">
                  VERIFIED
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
