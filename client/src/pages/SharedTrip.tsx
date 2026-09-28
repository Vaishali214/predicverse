import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Compass, Sparkles, FileDown, Calendar, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export const SharedTrip: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sharedTrip, setSharedTrip] = useState<any>(null);

  const [weather, setWeather] = useState<any>(null);
  const [currency, setCurrency] = useState<any>(null);
  const [culture, setCulture] = useState<any>(null);

  const [pdfExporting, setPdfExporting] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadSharedTrip(token);
    }
  }, [token]);

  const loadSharedTrip = async (shareToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.resolveSharedTrip(shareToken);
      setSharedTrip(data);

      if (data && data.destination) {
        // Fetch intelligence data for destination
        Promise.all([
          api.getWeather(data.destination).catch(() => null),
          api.getCurrency(data.budget || 1000, 'USD').catch(() => null),
          api.getCultureInfo(data.destination).catch(() => null),
        ]).then(([w, c, cult]) => {
          setWeather(w);
          setCurrency(c);
          setCulture(cult);
        });
      }
    } catch (err: any) {
      setError(err.message || 'THIS GAZETTE EDITION IS NO LONGER AVAILABLE');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!sharedTrip) return;
    setPdfExporting(true);
    setPdfError(null);
    try {
      await api.downloadGuidebookPdf({
        destination: sharedTrip.destination,
        budget: sharedTrip.budget,
        days: sharedTrip.days,
        travelers: sharedTrip.travelers,
        interests: sharedTrip.interests,
        travelStyle: sharedTrip.travelStyle,
        itinerary: sharedTrip.itinerary,
      });
    } catch (err: any) {
      setPdfError(err.message || 'Unable to generate the guidebook. Please try again.');
    } finally {
      setPdfExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9F7] flex flex-col items-center justify-center font-mono text-xs newsprint-texture p-4">
        <div className="border-4 border-black p-8 bg-white hard-shadow text-center space-y-4 max-w-sm">
          <div className="font-serif text-3xl font-black uppercase tracking-tight">PREDICVERSE</div>
          <div className="text-neutral-600 font-bold animate-pulse uppercase">
            RESOLVING SHARED GAZETTE DISPATCH...
          </div>
        </div>
      </div>
    );
  }

  if (error || !sharedTrip) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6 text-center">
        <div className="border-4 border-black bg-white p-12 space-y-5 newsprint-texture hard-shadow">
          <AlertTriangle className="w-16 h-16 text-red-700 mx-auto" />
          <h1 className="font-serif text-3xl sm:text-4xl font-black uppercase text-black">
            {error || 'THIS GAZETTE EDITION IS NO LONGER AVAILABLE'}
          </h1>
          <p className="font-body text-sm text-neutral-600 max-w-md mx-auto">
            This shared travel dispatch link may have expired, been revoked by the trip owner, or modified.
          </p>
          <div className="pt-4">
            <Link
              to="/planner"
              className="px-6 py-2.5 bg-black text-white font-sans text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors inline-block border border-black"
            >
              CREATE YOUR OWN TRAVEL DISPATCH
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Newspaper Top Header */}
      <div className="border-b-4 border-black pb-6 space-y-2 newsprint-texture">
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs font-bold text-red-700 uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-red-700" />
            <span>SHARED GAZETTE DISPATCH • SPECIAL ACCESS</span>
          </div>
          <div className="text-neutral-600 font-normal">
            OWNER: <span className="font-bold text-black">{sharedTrip.ownerName}</span>
          </div>
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl font-black uppercase text-black">
          {sharedTrip.destination} ({sharedTrip.days} DAYS)
        </h1>
        <p className="font-body text-sm text-neutral-700">
          Official PredicVerse Travel &amp; Culture Guidebook shared for collaboration and trip inspection.
        </p>
      </div>

      {/* Metadata Dispatch Box */}
      <div className="border-4 border-black bg-white p-6 newsprint-texture space-y-4 hard-shadow">
        <div className="flex flex-wrap justify-between items-center gap-4 border-b-2 border-black pb-3">
          <div>
            <span className="font-mono text-xs font-bold text-neutral-500 uppercase block">DISPATCH TITLE</span>
            <span className="font-serif text-2xl font-black uppercase text-black">
              {sharedTrip.title || `${sharedTrip.destination} Travel Agenda`}
            </span>
          </div>
          <button
            onClick={handleDownloadPdf}
            disabled={pdfExporting}
            className="px-4 py-2 bg-red-700 text-white font-sans text-xs font-black uppercase tracking-wider hover:bg-black transition-colors border border-black cursor-pointer flex items-center gap-1.5"
          >
            <FileDown className={`w-4 h-4 ${pdfExporting ? 'animate-bounce' : ''}`} />
            <span>{pdfExporting ? 'GENERATING GUIDEBOOK...' : 'DOWNLOAD VINTAGE GUIDEBOOK'}</span>
          </button>
        </div>

        {pdfError && (
          <div className="p-3 border-2 border-red-800 bg-red-50 text-red-900 font-mono text-xs font-bold">
            ⚠️ {pdfError}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs pt-2">
          <div className="space-y-1">
            <span className="text-neutral-500 font-bold uppercase block">DESTINATION</span>
            <span className="font-bold text-black text-sm">{sharedTrip.destination}</span>
          </div>
          <div className="space-y-1">
            <span className="text-neutral-500 font-bold uppercase block">DURATION</span>
            <span className="font-bold text-black text-sm">{sharedTrip.days} Days</span>
          </div>
          <div className="space-y-1">
            <span className="text-neutral-500 font-bold uppercase block">BUDGET TIER</span>
            <span className="font-bold text-black text-sm">${sharedTrip.budget} USD</span>
          </div>
          <div className="space-y-1">
            <span className="text-neutral-500 font-bold uppercase block">GUEST COUNT</span>
            <span className="font-bold text-black text-sm">{sharedTrip.travelers} Traveler(s)</span>
          </div>
        </div>
      </div>

      {/* Intelligence Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#F5F5F0] border-2 border-black font-mono text-xs">
        {/* Weather */}
        <div className="space-y-1">
          <div className="font-bold text-neutral-500 uppercase">METEOROLOGICAL DISPATCH</div>
          <div className="font-bold text-sm text-black">
            {weather?.isLive ? `${weather.temperature}${weather.unit} • ${weather.condition}` : 'Live weather connection active'}
          </div>
        </div>
        {/* Currency */}
        <div className="space-y-1 sm:border-l border-black sm:pl-4">
          <div className="font-bold text-neutral-500 uppercase">CURRENCY CONVERSION</div>
          <div className="font-bold text-sm text-black">
            {currency?.isLive ? `$${sharedTrip.budget} USD ≈ ${currency.conversions?.INR?.formatted || 'N/A'}` : 'Reference rates active'}
          </div>
        </div>
      </div>

      {/* Cultural Briefing */}
      {culture && (
        <div className="border border-black bg-amber-50 p-4 space-y-2 font-sans text-xs">
          <div className="font-serif font-bold text-sm uppercase text-amber-950 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-800" />
            REGIONAL CULTURAL ETIQUETTE ({culture.country})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-amber-900 text-xs">
            <div><strong>Etiquette:</strong> {culture.etiquette[0]}</div>
            <div><strong>Tipping:</strong> {culture.tippingCustoms}</div>
          </div>
        </div>
      )}

      {/* Itinerary Text */}
      <div className="border-4 border-black bg-white p-6 space-y-4 newsprint-texture hard-shadow">
        <h2 className="font-serif text-2xl font-black uppercase text-black border-b-2 border-black pb-2">
          DAY-BY-DAY ITINERARY AGENDA
        </h2>

        <div className="font-body text-xs leading-relaxed space-y-4 text-neutral-900">
          {(sharedTrip.itinerary || '').split('\n\n').map((block: string, idx: number) => {
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
      </div>

    </div>
  );
};
