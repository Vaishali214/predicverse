import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Mail, Shield, BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#111111] text-[#F9F9F7] border-t-4 border-black pt-12 pb-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-neutral-800">
        
        {/* Col 1: About */}
        <div className="space-y-3">
          <h3 className="font-serif text-2xl font-black tracking-tight text-white uppercase border-b border-neutral-700 pb-2">
            PREDICVERSE
          </h3>
          <p className="font-body text-xs text-neutral-400 leading-relaxed">
            The premier editorial gazette dedicated to world travel, cultural heritage, regional gastronomy, and independent exploration across all seven continents.
          </p>
          <div className="font-mono text-[11px] text-neutral-500 pt-2">
            © 2026 PredicVerse Publishing Inc. All rights reserved.
          </div>
        </div>

        {/* Col 2: Navigation */}
        <div className="space-y-3">
          <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-neutral-300 border-b border-neutral-800 pb-2">
            Gazette Sections
          </h4>
          <ul className="space-y-2 font-sans text-xs text-neutral-400">
            <li>
              <Link to="/explore" className="hover:text-white transition-colors">World Destinations Catalog</Link>
            </li>
            <li>
              <Link to="/planner" className="hover:text-white transition-colors">AI & Custom Itinerary Planner</Link>
            </li>
            <li>
              <Link to="/travel" className="hover:text-white transition-colors">Flight & Hotel Live Search</Link>
            </li>
            <li>
              <Link to="/compare" className="hover:text-white transition-colors">Country Comparison Matrix</Link>
            </li>
            <li>
              <Link to="/quiz" className="hover:text-white transition-colors">Travel Personality Diagnostic</Link>
            </li>
            <li>
              <Link to="/passport" className="hover:text-white transition-colors">Personal Passport & Wishlist</Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Popular Destinations */}
        <div className="space-y-3">
          <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-neutral-300 border-b border-neutral-800 pb-2">
            Featured Countries
          </h4>
          <ul className="space-y-2 font-sans text-xs text-neutral-400">
            <li>
              <Link to="/country/india" className="hover:text-white transition-colors">🇮🇳 India — Heritage & Spices</Link>
            </li>
            <li>
              <Link to="/country/japan" className="hover:text-white transition-colors">🇯🇵 Japan — Traditions & Tech</Link>
            </li>
            <li>
              <Link to="/country/france" className="hover:text-white transition-colors">🇫🇷 France — Art & Gastronomy</Link>
            </li>
            <li>
              <Link to="/country/italy" className="hover:text-white transition-colors">🇮🇹 Italy — Ancient Empire & Pizza</Link>
            </li>
            <li>
              <Link to="/country/usa" className="hover:text-white transition-colors">🇺🇸 USA — National Parks & Skylines</Link>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> Global Dispatch</span>
          <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Verified Data</span>
          <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> Editorial Integrity</span>
        </div>
        <div className="mt-4 sm:mt-0 text-neutral-400 italic font-serif">
          PredicVerse Gazette — Published with pride for global wanderers.
        </div>
      </div>
    </footer>
  );
};
