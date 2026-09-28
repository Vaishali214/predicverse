import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Printer, Bookmark, Calendar, DollarSign, Users, Compass, CheckCircle2, ArrowRight, Plane, Building2, FileDown, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { TripPlan } from '../types';
import { COUNTRIES_DATA } from '../data/countries';
import { TripCountdown } from '../components/TripCountdown';
import { ShareTripModal } from '../components/ShareTripModal';

export const TripPlanner: React.FC = () => {
  const { saveTripPlan, tripPlans } = useApp();

  const [destination, setDestination] = useState<string>('India');
  const [budget, setBudget] = useState<number>(1200);
  const [days, setDays] = useState<number>(5);
  const [travelers, setTravelers] = useState<number>(2);
  const [interests, setInterests] = useState<string[]>([
    'Culture & History',
    'Culinary & Food',
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedPlan, setGeneratedPlan] = useState<TripPlan | null>(null);
  const [pdfExporting, setPdfExporting] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const [weather, setWeather] = useState<any>(null);
  const [currency, setCurrency] = useState<any>(null);
  const [culture, setCulture] = useState<any>(null);
  const [match, setMatch] = useState<any>(null);

  const fetchIntelligenceData = async (destName: string, tripBudget: number) => {
    try {
      const [w, c, cult, m] = await Promise.all([
        api.getWeather(destName),
        api.getCurrency(tripBudget, 'USD'),
        api.getCultureInfo(destName),
        api.getRecommendationMatch(destName),
      ]);
      setWeather(w);
      setCurrency(c);
      setCulture(cult);
      setMatch(m);
    } catch {
      // Fallback handled internally
    }
  };

  const interestOptions = [
    'Culture & History',
    'Culinary & Food',
    'Hidden Gems',
    'Architecture',
    'Nature & Parks',
    'Shopping & Markets',
    'Nightlife & Music',
  ];

  const handleInterestToggle = (item: string) => {
    if (interests.includes(item)) {
      setInterests(interests.filter(i => i !== item));
    } else {
      setInterests([...interests, item]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const plan = await api.generateTripPlan({
        destination,
        budget,
        days,
        travelers,
        interests,
      });
      setGeneratedPlan(plan);
      saveTripPlan(plan);
      await fetchIntelligenceData(destination, budget);
    } catch {
      // Fallback handles errors internally
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadGuidebook = async () => {
    if (!generatedPlan) return;
    setPdfExporting(true);
    setPdfError(null);
    try {
      await api.downloadGuidebookPdf({
        tripId: generatedPlan.id,
        destination: generatedPlan.destination,
        budget: generatedPlan.budget,
        days: generatedPlan.days,
        travelers: generatedPlan.travelers,
        interests: generatedPlan.interests,
        itinerary: generatedPlan.itinerary,
        structuredAI: generatedPlan.structuredAI,
      });
    } catch (err: any) {
      setPdfError(err.message || 'Unable to generate the guidebook. Please try again.');
    } finally {
      setPdfExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      
      {/* Header */}
      <div className="border-b-4 border-black pb-6 space-y-2">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-red-700 uppercase tracking-widest">
          <Sparkles className="w-4 h-4 text-red-700" />
          <span>AUTOMATED ITINERARY DISPATCHER</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-black uppercase text-black">
          TRIP &amp; ITINERARY PLANNER
        </h1>
        <p className="font-body text-sm text-neutral-700 max-w-2xl">
          Craft a custom, day-by-day travel agenda complete with estimated budget allocations, culinary recommendations, and sight-seeing itineraries.
        </p>
      </div>

      {/* Trip Departure Countdown & Preparation Feature */}
      <TripCountdown trip={tripPlans[0]} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Column (5 cols) */}
        <div className="lg:col-span-5 border-4 border-black bg-white p-6 newsprint-texture space-y-6 hard-shadow-hover">
          <h2 className="font-serif text-2xl font-black uppercase text-black border-b-2 border-black pb-2">
            CONFIG DISPATCH PARAMETERS
          </h2>

          <form onSubmit={handleGenerate} className="space-y-4 font-sans text-xs">
            
            {/* Destination Selector */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-black mb-1">
                Select Destination Country / City
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black bg-white text-xs font-bold uppercase focus:outline-none focus:bg-amber-50 cursor-pointer"
              >
                {COUNTRIES_DATA.map(c => (
                  <option key={c.id} value={c.name}>{c.flag} {c.name} ({c.capital})</option>
                ))}
                <option value="Kyoto, Japan">🇯🇵 Kyoto, Japan</option>
                <option value="Mumbai, India">🇮🇳 Mumbai, India</option>
                <option value="Paris, France">🇫🇷 Paris, France</option>
                <option value="Rome, Italy">🇮🇹 Rome, Italy</option>
                <option value="New York City, USA">🇺🇸 New York City, USA</option>
              </select>
            </div>

            {/* Budget & Days Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase tracking-wider text-black mb-1">
                  Budget (USD $)
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
                  <input
                    type="number"
                    min="200"
                    max="20000"
                    step="100"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full pl-8 pr-2 py-2 border-2 border-black bg-white font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-black mb-1">
                  Duration (Days)
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full pl-8 pr-2 py-2 border-2 border-black bg-white font-mono font-bold text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Travelers Count */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-black mb-1">
                Number of Travelers
              </label>
              <div className="relative">
                <Users className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="w-full pl-8 pr-2 py-2 border-2 border-black bg-white font-mono font-bold text-xs"
                />
              </div>
            </div>

            {/* Interests Checkboxes */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-black mb-2">
                Travel Style &amp; Focus Interests
              </label>
              <div className="grid grid-cols-2 gap-2">
                {interestOptions.map(option => (
                  <label
                    key={option}
                    onClick={() => handleInterestToggle(option)}
                    className={`px-2 py-1.5 border border-black cursor-pointer font-bold text-[11px] flex items-center gap-1.5 transition-colors ${
                      interests.includes(option)
                        ? 'bg-black text-white'
                        : 'bg-neutral-100 text-black hover:bg-neutral-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={interests.includes(option)}
                      onChange={() => {}}
                      className="hidden"
                    />
                    <span>{interests.includes(option) ? '✓' : '+'}</span>
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-black text-white font-sans text-xs font-black uppercase tracking-widest border-2 border-black hover:bg-red-700 transition-colors cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <span>DISPATCHING AI GENERATOR...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-red-400" />
                  GENERATE ITINERARY DISPATCH
                </>
              )}
            </button>

          </form>
        </div>

        {/* Output Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {generatedPlan ? (
            <div className="border-4 border-black bg-white p-6 sm:p-8 newsprint-texture space-y-6 print:border-none print:p-0">
              
              {/* Output Header */}
              <div className="flex justify-between items-start border-b-2 border-black pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-red-700 uppercase tracking-widest">
                      PROPOSED ITINERARY DISPATCH • #{generatedPlan.id}
                    </span>
                    {generatedPlan.aiGenerated ? (
                      <span className="px-2 py-0.5 bg-blue-900 text-white font-mono text-[10px] font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        AI GENERATED (Gemini 1.5 Flash)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-900 text-white font-mono text-[10px] font-bold">
                        🏛️ GAZETTE FALLBACK ENGINE
                      </span>
                    )}
                    {match && (
                      <span className="px-2 py-0.5 bg-green-800 text-white font-mono text-[10px] font-bold" title="Calculated from user Travel DNA and destination attributes">
                        MATCH: {match.matchPercentage}%
                      </span>
                    )}
                  </div>
                  <h2 className="font-serif text-3xl font-black uppercase text-black">
                    {generatedPlan.destination} ({generatedPlan.days} DAYS)
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2 print:hidden">
                  <Link
                    to={`/travel?tab=flights&dest=${encodeURIComponent(generatedPlan.destination)}&travelers=${generatedPlan.travelers}`}
                    className="px-3 py-1.5 border border-black bg-[#F5F5F0] hover:bg-black hover:text-white transition-colors text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plane className="w-4 h-4 text-red-700" /> SEARCH FLIGHTS
                  </Link>
                  <Link
                    to={`/travel?tab=hotels&dest=${encodeURIComponent(generatedPlan.destination)}&travelers=${generatedPlan.travelers}`}
                    className="px-3 py-1.5 border border-black bg-[#F5F5F0] hover:bg-black hover:text-white transition-colors text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-red-700" /> SEARCH HOTELS
                  </Link>
                  <button
                    onClick={handleDownloadGuidebook}
                    disabled={pdfExporting}
                    className="px-3.5 py-1.5 border-2 border-black bg-red-700 text-white hover:bg-black transition-colors text-xs font-black font-sans tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <FileDown className={`w-4 h-4 ${pdfExporting ? 'animate-bounce' : ''}`} />
                    <span>{pdfExporting ? 'GENERATING GUIDEBOOK...' : 'DOWNLOAD VINTAGE GUIDEBOOK'}</span>
                  </button>
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="px-3.5 py-1.5 border-2 border-black bg-black text-white hover:bg-red-700 transition-colors text-xs font-black font-sans tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Share2 className="w-4 h-4 text-amber-300" />
                    <span>SHARE GAZETTE</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 border border-black bg-neutral-100 hover:bg-black hover:text-white transition-colors text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" /> PRINT DISPATCH
                  </button>
                </div>
              </div>

              {pdfError && (
                <div className="p-3 border-2 border-red-800 bg-red-50 text-red-900 font-mono text-xs font-bold print:hidden">
                  ⚠️ {pdfError}
                </div>
              )}

              {/* LIVE INTELLIGENCE SUMMARY BAR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#F5F5F0] border-2 border-black font-mono text-xs print:hidden">
                {/* Weather */}
                <div className="space-y-1 sm:border-r border-black pr-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-neutral-500 uppercase">
                    <span>WEATHER DATA</span>
                    <span className={`px-1 text-[9px] ${weather?.isLive ? 'bg-green-700 text-white' : 'bg-amber-700 text-white'}`}>
                      {weather?.isLive ? '● LIVE (Open-Meteo)' : 'UNAVAILABLE'}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-black">
                    {weather?.isLive
                      ? `${weather.temperature}${weather.unit} • ${weather.condition}`
                      : 'Live weather data currently unavailable'}
                  </div>
                  <div className="text-[10px] text-neutral-600">
                    {weather?.isLive
                      ? `Humidity: ${weather.humidity}% | Wind: ${weather.windSpeed} km/h`
                      : 'Real-time weather API connection required'}
                  </div>
                </div>

                {/* Currency */}
                <div className="space-y-1 pl-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-neutral-500 uppercase">
                    <span>EXCHANGE RATES</span>
                    <span className={`px-1 text-[9px] ${currency?.isLive ? 'bg-green-700 text-white' : 'bg-amber-700 text-white'}`}>
                      {currency?.isLive ? '● LIVE (open.er-api.com)' : 'UNAVAILABLE'}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-black truncate">
                    {currency?.isLive
                      ? `$${generatedPlan.budget} USD ≈ ${currency?.conversions?.INR?.formatted || 'N/A'} ≈ ${currency?.conversions?.EUR?.formatted || 'N/A'}`
                      : 'Live exchange rates currently unavailable'}
                  </div>
                  <div className="text-[10px] text-neutral-600">
                    {currency?.isLive
                      ? `Rate: 1 USD = ${currency?.rates?.INR} INR | ${currency?.rates?.EUR} EUR`
                      : 'Real-time currency API connection required'}
                  </div>
                </div>
              </div>

              {/* Cultural Intelligence Alert Box */}
              {culture && (
                <div className="border border-black bg-amber-50 p-3 space-y-1.5 font-sans text-xs">
                  <div className="font-serif font-bold text-sm uppercase text-amber-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-800" />
                    CULTURAL ETIQUETTE BRIEFING ({culture.country})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-amber-900">
                    <div>
                      <strong>Etiquette:</strong> {culture.etiquette[0] || 'Respect local shrines and places of worship.'}
                    </div>
                    <div>
                      <strong>Tipping:</strong> {culture.tippingCustoms || 'Check local tipping customs.'}
                    </div>
                  </div>
                </div>
              )}

              {/* Itinerary Body rendered cleanly */}
              <div className="font-body text-xs leading-relaxed space-y-4 text-neutral-900">
                {generatedPlan.itinerary.split('\n\n').map((block, idx) => {
                  if (block.startsWith('###')) {
                    return (
                      <h3 key={idx} className="font-serif text-xl font-bold uppercase text-black border-b border-black pb-1 pt-2">
                        {block.replace('###', '').trim()}
                      </h3>
                    );
                  }
                  if (block.startsWith('####')) {
                    return (
                      <h4 key={idx} className="font-serif text-base font-bold uppercase text-red-800 pt-2 border-l-2 border-red-700 pl-2">
                        {block.replace('####', '').trim()}
                      </h4>
                    );
                  }
                  return (
                    <div key={idx} className="whitespace-pre-line bg-neutral-50 p-3 border border-neutral-300 font-sans text-xs">
                      {block}
                    </div>
                  );
                })}
              </div>

              <div className="font-mono text-[10px] text-neutral-500 pt-4 border-t border-black text-right">
                GENERATED ON {new Date(generatedPlan.createdAt).toLocaleString()} • PREDICVERSE ITINERARY ENGINE
              </div>

            </div>
          ) : (
            <div className="border-2 border-black bg-[#F5F5F0] p-10 text-center space-y-4">
              <Compass className="w-12 h-12 text-neutral-400 mx-auto" />
              <h3 className="font-serif text-2xl font-black uppercase text-black">
                NO ITINERARY DISPATCH GENERATED YET
              </h3>
              <p className="font-body text-xs text-neutral-600 max-w-md mx-auto">
                Fill out the configuration parameters on the left and hit "GENERATE ITINERARY DISPATCH" to construct your tailored day-by-day travel plan.
              </p>
            </div>
          )}

          {/* Saved History */}
          {tripPlans.length > 0 && (
            <div className="border-2 border-black bg-white p-5 space-y-3">
              <h3 className="font-serif text-lg font-bold uppercase text-black border-b border-black pb-2">
                YOUR SAVED TRIP HISTORY ({tripPlans.length})
              </h3>
              <div className="space-y-2">
                {tripPlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setGeneratedPlan(plan)}
                    className="p-3 border border-black bg-neutral-50 hover:bg-black hover:text-white transition-all cursor-pointer flex justify-between items-center group"
                  >
                    <div>
                      <div className="font-serif font-bold text-sm uppercase">
                        {plan.destination} ({plan.days} Days)
                      </div>
                      <div className="font-mono text-[10px] text-neutral-500 group-hover:text-neutral-300">
                        Budget: ${plan.budget} • {plan.travelers} Travelers
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-white" />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Share Trip Modal */}
      {generatedPlan && (
        <ShareTripModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          tripId={generatedPlan.id}
          tripTitle={generatedPlan.destination}
        />
      )}

    </div>
  );
};
