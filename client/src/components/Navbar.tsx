import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Home, MapPin, Calendar, Scale, HelpCircle, BookOpen, User, LogOut, Dices, Plane } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { SurpriseMeModal } from './SurpriseMeModal';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { wishlist, passport, setIsSearchOpen, setIsAuthOpen } = useApp();
  const [isSurpriseOpen, setIsSurpriseOpen] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isActive = (path: string) => location.pathname === path;
  const passportBadge = wishlist.length + passport.length;

  const navItems = [
    { path: '/', label: 'FRONT PAGE', icon: Home },
    { path: '/explore', label: 'DESTINATIONS', icon: MapPin },
    { path: '/planner', label: 'TRIP PLANNER', icon: Calendar },
    { path: '/travel', label: 'FLIGHTS & HOTELS', icon: Plane },
    { path: '/compare', label: 'COMPARE', icon: Scale },
    { path: '/quiz', label: 'TRAVEL QUIZ', icon: HelpCircle },
    { path: '/passport', label: 'MY PASSPORT', icon: BookOpen, badge: passportBadge },
  ];

  return (
    <>
      <header className="w-full bg-[#F9F9F7] border-b-4 border-black selection:bg-black selection:text-white">
        {/* Top Gazette Bar */}
        <div className="border-b border-black text-xs font-mono px-4 py-1.5 flex flex-wrap justify-between items-center bg-[#F5F5F0]">
          <div className="flex items-center gap-4 text-neutral-700">
            <span>VOL. CXXVI... No. 42,910</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">{currentDate}</span>
          </div>
          <div className="flex items-center gap-3 text-neutral-700 font-medium">
            <span className="hidden md:inline">EDITION: GLOBAL INTERNATIONAL</span>

            {/* Prominent SURPRISE ME Button */}
            <button
              onClick={() => setIsSurpriseOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-red-700 text-white font-sans text-xs font-black uppercase tracking-wider hover:bg-black transition-colors border border-black cursor-pointer shadow-xs"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>🎲 SURPRISE ME</span>
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 px-2 py-1 border border-black bg-white hover:bg-black hover:text-white transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="font-sans text-[11px] font-bold">SEARCH (CTRL+K)</span>
            </button>
          </div>
        </div>

        {/* Main Newspaper Masthead */}
        <div className="py-6 px-4 text-center border-b border-black relative newsprint-texture">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="hidden md:block text-left font-serif text-xs max-w-[200px] border-r border-black pr-4 italic text-neutral-600">
              "The world is a book, and those who do not travel read only one page."
            </div>

            <Link to="/" className="group inline-block text-center">
              <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase border-b-2 border-black pb-1 inline-block text-black group-hover:text-red-700 transition-colors">
                PREDICVERSE
              </h1>
              <p className="font-sans text-[11px] font-bold tracking-[0.3em] uppercase text-neutral-800 mt-2">
                THE WORLD TRAVEL &amp; CULTURE CHRONICLE
              </p>
            </Link>

            <div className="flex items-center gap-3 text-left">
              {isAuthenticated ? (
                <div className="flex items-center gap-3 border border-black p-2 bg-white">
                  <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-serif font-bold text-sm">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left text-xs">
                    <div className="font-bold font-sans text-black">{user?.name}</div>
                    <div className="font-mono text-[10px] text-neutral-500">{user?.email}</div>
                  </div>
                  <button
                    onClick={logout}
                    title="Logout"
                    className="p-1.5 hover:bg-neutral-200 border border-transparent hover:border-black text-neutral-700 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="px-4 py-2 bg-black text-white text-xs font-bold font-sans tracking-wider uppercase hover:bg-red-700 transition-colors border border-black hard-shadow-hover flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  PASSPORT LOGIN
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Editorial Luxury Navigation Bar */}
        <nav className="py-4 px-4 bg-[#F9F9F7] newsprint-texture border-b border-black">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white border-2 border-black rounded-2xl p-1.5 flex items-center justify-between overflow-x-auto no-scrollbar shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
              {navItems.map((item, index) => {
                const active = isActive(item.path);
                const Icon = item.icon;

                return (
                  <React.Fragment key={item.path}>
                    <Link
                      to={item.path}
                      className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all duration-200 group shrink-0 hover:scale-[1.01] ${
                        active
                          ? 'bg-red-50/80 text-red-700 font-extrabold border border-red-200/80 shadow-2xs'
                          : 'text-neutral-800 hover:text-red-700 hover:bg-neutral-100/70 border border-transparent'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 transition-all duration-200 ease-out group-hover:-translate-y-0.5 ${
                          active ? 'text-red-700' : 'text-neutral-700 group-hover:text-red-700'
                        }`}
                      />
                      <span className="whitespace-nowrap transition-colors duration-200">
                        {item.label}
                      </span>

                      {item.badge !== undefined && item.badge > 0 && (
                        <span
                          className={`ml-0.5 text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded-full transition-colors ${
                            active
                              ? 'bg-red-700 text-white'
                              : 'bg-black text-white group-hover:bg-red-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Active & Hover Underline Accent */}
                      <span
                        className={`absolute bottom-0.5 left-3.5 right-3.5 h-[2px] rounded-full transition-all duration-200 ${
                          active
                            ? 'bg-red-700 scale-x-100'
                            : 'bg-red-700 scale-x-0 group-hover:scale-x-100 origin-center'
                        }`}
                      />
                    </Link>

                    {/* Subtle Vertical Separator */}
                    {index < navItems.length - 1 && (
                      <div className="h-5 w-[1px] bg-neutral-300/80 shrink-0 mx-0.5 hidden sm:block" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </nav>
      </header>

      {/* Global Surprise Me Modal */}
      <SurpriseMeModal isOpen={isSurpriseOpen} onClose={() => setIsSurpriseOpen(false)} />
    </>
  );
};
