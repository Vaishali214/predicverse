import React, { useState } from 'react';
import { Lock, Mail, User, CheckCircle2, ShieldCheck, Globe, Compass, BookOpen, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginGateway: React.FC = () => {
  const { login, register, authError, clearAuthError } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    clearAuthError();
    setLoading(true);

    if (mode === 'login') {
      const ok = await login(email, password);
      if (ok) {
        setSuccess('Passport verified! Opening PredicVerse...');
      }
      // Error is surfaced via authError from context
    } else {
      if (!name.trim()) {
        setError('Please enter your full name.');
        setLoading(false);
        return;
      }
      const ok = await register(name, email, password);
      if (ok) {
        setSuccess('Account created successfully! Opening PredicVerse...');
      }
      // Error is surfaced via authError from context
    }
    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setError('');
    clearAuthError();
    setEmail('traveler@predicverse.com');
    setPassword('demo_password_2026');
    setLoading(true);
    const ok = await login('traveler@predicverse.com', 'demo_password_2026');
    if (ok) {
      setSuccess('Welcome, Demo Explorer! Opening PredicVerse...');
    }
    // If demo account doesn't exist yet, auto-register it
    if (!ok) {
      clearAuthError();
      const regOk = await register('Demo Explorer', 'traveler@predicverse.com', 'demo_password_2026');
      if (regOk) {
        setSuccess('Demo account created! Opening PredicVerse...');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] text-[#111111] flex flex-col font-body selection:bg-black selection:text-white newsprint-texture">
      
      {/* Top Gazette Line */}
      <div className="border-b border-black text-xs font-mono px-4 py-2 flex flex-wrap justify-between items-center bg-[#F5F5F0]">
        <div className="flex items-center gap-4 text-neutral-700">
          <span>VOL. CXXVI... No. 42,910</span>
          <span>|</span>
          <span>{currentDate}</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-700 font-bold uppercase tracking-wider text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-red-700" />
          IMMIGRATION CONTROL — PASSPORT REQUIRED
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 flex flex-col justify-center items-center">
        
        {/* Newspaper Masthead */}
        <div className="text-center mb-8 border-b-2 border-black pb-6 w-full max-w-3xl">
          <h1 className="font-serif text-5xl sm:text-7xl font-black tracking-tight uppercase border-b-4 border-black pb-2 inline-block text-black">
            PREDICVERSE
          </h1>
          <p className="font-sans text-xs font-extrabold tracking-[0.35em] uppercase text-neutral-800 mt-3">
            THE WORLD TRAVEL &amp; CULTURE CHRONICLE
          </p>
        </div>

        {/* Lock Screen Gateway Card */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 border-4 border-black hard-shadow bg-white overflow-hidden">
          
          {/* Left Column: Feature Dispatch */}
          <div className="md:col-span-5 bg-black text-white p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-black">
            <div className="space-y-6">
              <div className="inline-block px-2.5 py-1 bg-red-700 text-white font-mono text-[10px] font-bold uppercase tracking-widest">
                IMMIGRATION GATEWAY
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-black leading-tight uppercase">
                PLEASE SIGN IN TO UNLOCK THE GAZETTE
              </h2>
              <p className="font-body text-xs text-neutral-300 leading-relaxed">
                PredicVerse is an exclusive editorial travel chronicle. Verify your traveler passport to access world destinations, custom trip planners, and cultural dispatches.
              </p>

              <div className="space-y-3 pt-4 border-t border-neutral-800">
                <div className="flex items-center gap-3 text-xs">
                  <Globe className="w-4 h-4 text-red-500 shrink-0" />
                  <span><strong>37 Global Destinations</strong> with full state &amp; city guides</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <Sparkles className="w-4 h-4 text-red-500 shrink-0" />
                  <span><strong>AI Itinerary Planner</strong> tailored to your budget</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <Compass className="w-4 h-4 text-red-500 shrink-0" />
                  <span><strong>Country Comparison Matrix</strong> &amp; Travel Quiz</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <BookOpen className="w-4 h-4 text-red-500 shrink-0" />
                  <span><strong>Personal Travel Passport</strong> &amp; Wishlist</span>
                </div>
              </div>
            </div>

            <div className="pt-8 text-[10px] font-mono text-neutral-500 border-t border-neutral-800 mt-6">
              PREDICVERSE SECURITY DISPATCH • OFFICIAL AUTHORIZATION
            </div>
          </div>

          {/* Right Column: Auth Form */}
          <div className="md:col-span-7 p-6 sm:p-8 bg-[#F9F9F7] flex flex-col justify-between">
            <div>
              {/* Tab Selector */}
              <div className="grid grid-cols-2 border-2 border-black font-sans text-xs font-bold uppercase mb-6">
                <button
                  onClick={() => { setMode('login'); setError(''); }}
                  className={`py-3 text-center cursor-pointer transition-colors ${
                    mode === 'login'
                      ? 'bg-black text-white font-extrabold'
                      : 'bg-[#E5E5E0] text-neutral-700 hover:text-black'
                  }`}
                >
                  SIGN IN (LOGIN)
                </button>
                <button
                  onClick={() => { setMode('register'); setError(''); }}
                  className={`py-3 text-center cursor-pointer transition-colors ${
                    mode === 'register'
                      ? 'bg-black text-white font-extrabold'
                      : 'bg-[#E5E5E0] text-neutral-700 hover:text-black'
                  }`}
                >
                  CREATE ACCOUNT
                </button>
              </div>

              {(error || authError) && (
                <div className="mb-4 p-3 bg-red-100 border-2 border-red-700 text-red-900 text-xs font-mono font-bold">
                  ⚠️ {error || authError}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-100 border-2 border-green-700 text-green-900 text-xs font-mono font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 font-sans">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Amelia Earhart"
                        className="w-full pl-9 pr-3 py-2.5 border-2 border-black bg-white text-xs font-body focus:outline-none focus:bg-amber-50"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="traveler@predicverse.com"
                      className="w-full pl-9 pr-3 py-2.5 border-2 border-black bg-white text-xs font-body focus:outline-none focus:bg-amber-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 border-2 border-black bg-white text-xs font-body focus:outline-none focus:bg-amber-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-widest border-2 border-black hover:bg-red-700 transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2 shadow-xs"
                >
                  {loading ? 'VERIFYING PASSPORT...' : mode === 'login' ? 'STAMP PASSPORT & ENTER' : 'CREATE PASSPORT ACCOUNT'}
                </button>
              </form>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-dashed border-neutral-300"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-mono bg-[#F9F9F7] px-2 text-neutral-600 font-bold">
                  OR QUICK 1-CLICK ACCESS
                </div>
              </div>

              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-3 bg-white text-black text-xs font-mono font-extrabold uppercase border-2 border-black hover:bg-amber-100 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                🔑 STAMP DEMO PASSPORT &amp; ENTER GAZETTE
              </button>
            </div>

            <div className="mt-6 text-center font-mono text-[10px] text-neutral-500">
              By logging in, you accept the PredicVerse Editorial Travel Guidelines.
            </div>
          </div>

        </div>

      </div>

      {/* Footer Line */}
      <footer className="border-t border-black py-4 px-4 text-center font-mono text-xs text-neutral-600 bg-[#F5F5F0]">
        © 2026 PredicVerse Publishing Inc. All rights reserved. • Content protected by Passport Authentication.
      </footer>
    </div>
  );
};
