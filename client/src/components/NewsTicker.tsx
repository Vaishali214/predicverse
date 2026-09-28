import React from 'react';
import { Sparkles, Globe, Compass, BookOpen } from 'lucide-react';

export const NewsTicker: React.FC = () => {
  const tickerItems = [
    { icon: <Globe className="w-3.5 h-3.5 inline mr-1" />, text: "GAZETTE DISPATCH: Explore 50+ Cultural Destinations Across 5 Continents" },
    { icon: <Sparkles className="w-3.5 h-3.5 inline mr-1 text-red-600" />, text: "EDITORIAL FEATURE: The Art of Slow Travel in Modern Metropolitan Cities" },
    { icon: <Compass className="w-3.5 h-3.5 inline mr-1" />, text: "WEATHER & CLIMATE: Spring Cherry Blossom Blooming Patterns for Kyoto & Tokyo" },
    { icon: <BookOpen className="w-3.5 h-3.5 inline mr-1" />, text: "CULTURE DISCOVERY: Secrets of Ancient Stepwells in Rajasthan, India" },
    { icon: <Globe className="w-3.5 h-3.5 inline mr-1" />, text: "EDITORIAL DISPATCH: Top Street Food Capitals of the World" }
  ];

  return (
    <div className="bg-black text-white text-xs font-mono py-1.5 border-b border-black overflow-hidden relative flex items-center">
      <div className="bg-red-700 text-white font-black px-3 py-0.5 uppercase tracking-widest text-[10px] z-10 flex items-center shrink-0 ml-2">
        GAZETTE DISPATCH
      </div>
      <div className="overflow-hidden whitespace-nowrap flex-1 relative">
        <div className="inline-block animate-[ticker-scroll_35s_linear_infinite] hover:[animation-play-state:paused]">
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <span key={idx} className="mx-6 text-neutral-300 tracking-wide font-mono">
              {item.icon}
              <span className="hover:text-white transition-colors">{item.text}</span>
              <span className="ml-6 text-red-500">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
