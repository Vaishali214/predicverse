import React, { useState, useEffect } from 'react';
import { Plane, Hotel, Calendar, Users, Compass, ExternalLink, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export const TravelSearch: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels'>('flights');

  // Flight search form state
  const [flightOrigin, setFlightOrigin] = useState<string>('DEL');
  const [flightDest, setFlightDest] = useState<string>('PAR');
  const [depDate, setDepDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [retDate, setRetDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    return d.toISOString().split('T')[0];
  });
  const [oneWay, setOneWay] = useState<boolean>(false);
  const [flightTravelers, setFlightTravelers] = useState<number>(1);
  const [cabinClass, setCabinClass] = useState<string>('ECONOMY');
  const [flightCurrency, setFlightCurrency] = useState<string>('USD');

  // Hotel search form state
  const [hotelDest, setHotelDest] = useState<string>('Paris');
  const [checkIn, setCheckIn] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [checkOut, setCheckOut] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 18);
    return d.toISOString().split('T')[0];
  });
  const [hotelGuests, setHotelGuests] = useState<number>(2);
  const [hotelRooms, setHotelRooms] = useState<number>(1);
  const [hotelCurrency, setHotelCurrency] = useState<string>('USD');

  // Results state
  const [loading, setLoading] = useState<boolean>(false);
  const [flightResults, setFlightResults] = useState<any>(null);
  const [hotelResults, setHotelResults] = useState<any>(null);

  // Parse URL query params if redirected from Trip Planner
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tabParam = searchParams.get('tab');
    const destParam = searchParams.get('dest');
    const origParam = searchParams.get('orig');

    if (tabParam === 'hotels') setActiveTab('hotels');
    if (destParam) {
      setFlightDest(destParam.slice(0, 3).toUpperCase());
      setHotelDest(destParam);
    }
    if (origParam) setFlightOrigin(origParam.slice(0, 3).toUpperCase());
  }, []);

  const handleFlightSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFlightResults(null);

    const res = await api.searchFlights({
      origin: flightOrigin,
      destination: flightDest,
      departureDate: depDate,
      returnDate: oneWay ? undefined : retDate,
      oneWay,
      travelers: flightTravelers,
      cabinClass,
      currency: flightCurrency,
    });

    setFlightResults(res);
    setLoading(false);
  };

  const handleHotelSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setHotelResults(null);

    const res = await api.searchHotels({
      destination: hotelDest,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guests: hotelGuests,
      rooms: hotelRooms,
      currency: hotelCurrency,
    });

    setHotelResults(res);
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Newspaper Header */}
      <div className="border-b-4 border-black pb-6 space-y-2">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-red-700 uppercase tracking-widest">
          <Plane className="w-4 h-4 text-red-700" />
          <span>REAL-TIME TRAVEL DISPATCH &amp; RESERVATION SEARCH</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-black uppercase text-black">
          GAZETTE TRAVEL SEARCH
        </h1>
        <p className="font-body text-sm text-neutral-700 max-w-2xl">
          Search live flight offers and hotel accommodations worldwide. Rates and availability are queried directly from live provider systems.
        </p>
      </div>

      {/* Disclaimer Banner */}
      <div className="border-2 border-amber-800 bg-amber-50 p-4 font-sans text-xs text-amber-950 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-serif font-bold uppercase tracking-wide text-sm">
            REAL TRAVEL DATA NOTICE
          </div>
          <p>
            PredicVerse never fabricates travel rates or availability. Search results are provided directly by external APIs (Amadeus / Partner Travel Providers). All prices are subject to live provider availability and booking confirmation.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border-4 border-black bg-white p-6 space-y-6 newsprint-texture">
            
            {/* Tab Selector */}
            <div className="grid grid-cols-2 gap-2 border-b-2 border-black pb-4">
              <button
                type="button"
                onClick={() => setActiveTab('flights')}
                className={`py-2.5 px-3 font-serif font-bold uppercase text-xs border-2 border-black transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'flights' ? 'bg-black text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-black'
                }`}
              >
                <Plane className="w-4 h-4" /> FLIGHTS
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('hotels')}
                className={`py-2.5 px-3 font-serif font-bold uppercase text-xs border-2 border-black transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'hotels' ? 'bg-black text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-black'
                }`}
              >
                <Hotel className="w-4 h-4" /> HOTELS
              </button>
            </div>

            {/* Flight Search Form */}
            {activeTab === 'flights' ? (
              <form onSubmit={handleFlightSearch} className="space-y-4 font-sans text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-black mb-1">
                      Origin (IATA / City)
                    </label>
                    <input
                      type="text"
                      required
                      value={flightOrigin}
                      onChange={(e) => setFlightOrigin(e.target.value)}
                      placeholder="e.g. DEL or NYC"
                      className="w-full px-3 py-2 border-2 border-black bg-white font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-black mb-1">
                      Destination (IATA)
                    </label>
                    <input
                      type="text"
                      required
                      value={flightDest}
                      onChange={(e) => setFlightDest(e.target.value)}
                      placeholder="e.g. PAR or TYO"
                      className="w-full px-3 py-2 border-2 border-black bg-white font-mono font-bold text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-black mb-1">
                      Departure Date
                    </label>
                    <input
                      type="date"
                      required
                      value={depDate}
                      onChange={(e) => setDepDate(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-black bg-white font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-black mb-1">
                      Return Date
                    </label>
                    <input
                      type="date"
                      disabled={oneWay}
                      value={retDate}
                      onChange={(e) => setRetDate(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-black bg-white font-mono text-xs font-bold disabled:bg-neutral-200"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="oneWayToggle"
                    checked={oneWay}
                    onChange={(e) => setOneWay(e.target.checked)}
                    className="w-4 h-4 accent-black cursor-pointer"
                  />
                  <label htmlFor="oneWayToggle" className="font-mono text-xs font-bold text-neutral-800 cursor-pointer">
                    One-Way Flight
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-black mb-1">
                      Travelers
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={flightTravelers}
                      onChange={(e) => setFlightTravelers(Number(e.target.value))}
                      className="w-full px-2 py-2 border-2 border-black bg-white font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-black mb-1">
                      Cabin
                    </label>
                    <select
                      value={cabinClass}
                      onChange={(e) => setCabinClass(e.target.value)}
                      className="w-full px-1 py-2 border-2 border-black bg-white font-mono text-[11px] font-bold"
                    >
                      <option value="ECONOMY">ECONOMY</option>
                      <option value="PREMIUM_ECONOMY">PREMIUM</option>
                      <option value="BUSINESS">BUSINESS</option>
                      <option value="FIRST">FIRST</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-black mb-1">
                      Currency
                    </label>
                    <select
                      value={flightCurrency}
                      onChange={(e) => setFlightCurrency(e.target.value)}
                      className="w-full px-1 py-2 border-2 border-black bg-white font-mono text-[11px] font-bold"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-red-700 hover:bg-black text-white font-serif font-black uppercase text-sm border-2 border-black transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:bg-neutral-400"
                >
                  {loading ? 'QUERYING LIVE PROVIDER...' : 'SEARCH LIVE FLIGHT OFFERS'}
                </button>
              </form>
            ) : (
              /* Hotel Search Form */
              <form onSubmit={handleHotelSearch} className="space-y-4 font-sans text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-black mb-1">
                    Destination / City
                  </label>
                  <input
                    type="text"
                    required
                    value={hotelDest}
                    onChange={(e) => setHotelDest(e.target.value)}
                    placeholder="e.g. Paris, Tokyo, London"
                    className="w-full px-3 py-2 border-2 border-black bg-white font-mono font-bold text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-black mb-1">
                      Check-In Date
                    </label>
                    <input
                      type="date"
                      required
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-black bg-white font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-black mb-1">
                      Check-Out Date
                    </label>
                    <input
                      type="date"
                      required
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-black bg-white font-mono text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-black mb-1">
                      Guests
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={hotelGuests}
                      onChange={(e) => setHotelGuests(Number(e.target.value))}
                      className="w-full px-2 py-2 border-2 border-black bg-white font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-black mb-1">
                      Rooms
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={hotelRooms}
                      onChange={(e) => setHotelRooms(Number(e.target.value))}
                      className="w-full px-2 py-2 border-2 border-black bg-white font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-black mb-1">
                      Currency
                    </label>
                    <select
                      value={hotelCurrency}
                      onChange={(e) => setHotelCurrency(e.target.value)}
                      className="w-full px-1 py-2 border-2 border-black bg-white font-mono text-[11px] font-bold"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-red-700 hover:bg-black text-white font-serif font-black uppercase text-sm border-2 border-black transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:bg-neutral-400"
                >
                  {loading ? 'QUERYING LIVE PROVIDER...' : 'SEARCH LIVE HOTELS'}
                </button>
              </form>
            )}

          </div>
        </div>

        {/* Results Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* FLIGHT RESULTS */}
          {activeTab === 'flights' && (
            <div>
              {flightResults ? (
                <div className="space-y-4">
                  
                  {/* Status Banner */}
                  <div className="border-2 border-black bg-neutral-100 p-3 font-mono text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold uppercase text-black">PROVIDER:</span> {flightResults.provider}
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold text-white uppercase ${flightResults.isLive ? 'bg-green-700' : 'bg-amber-800'}`}>
                      {flightResults.isLive ? '● LIVE API ACTIVE' : 'UNCONFIGURED PROVIDER'}
                    </span>
                  </div>

                  {flightResults.message && (
                    <div className="p-3 border border-black bg-amber-50 text-amber-950 font-body text-xs">
                      {flightResults.message}
                    </div>
                  )}

                  {flightResults.flights && flightResults.flights.length > 0 ? (
                    <div className="space-y-4">
                      {flightResults.flights.map((flight: any) => (
                        <div key={flight.id} className="border-4 border-black bg-white p-5 newsprint-texture space-y-3 font-sans">
                          <div className="flex justify-between items-start border-b border-black pb-2">
                            <div>
                              <div className="font-mono text-[11px] font-bold text-red-700 uppercase">
                                {flight.airline} • FLIGHT #{flight.flightNumber}
                              </div>
                              <div className="font-serif text-xl font-bold uppercase text-black flex items-center gap-2">
                                <span>{flight.origin}</span>
                                <ArrowRight className="w-4 h-4 text-neutral-600" />
                                <span>{flight.destination}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-serif text-2xl font-black text-black">
                                ${flight.price.amount} {flight.price.currency}
                              </div>
                              <div className="font-mono text-[10px] text-neutral-600 uppercase">
                                {flight.cabinClass}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs text-neutral-800">
                            <div>
                              <strong className="text-neutral-500">DEPARTURE:</strong><br />
                              {new Date(flight.departureTime).toLocaleString()}
                            </div>
                            <div>
                              <strong className="text-neutral-500">ARRIVAL:</strong><br />
                              {new Date(flight.arrivalTime).toLocaleString()}
                            </div>
                            <div>
                              <strong className="text-neutral-500">STOPS:</strong><br />
                              {flight.stops === 0 ? 'Direct Flight' : `${flight.stops} Stop(s)`}
                            </div>
                          </div>

                          <div className="pt-2 flex justify-end">
                            {flight.bookingUrl ? (
                              <a
                                href={flight.bookingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 border-2 border-black bg-black text-white hover:bg-red-700 transition-colors text-xs font-mono font-bold flex items-center gap-1.5"
                              >
                                VIEW PROVIDER OFFER <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <span className="text-xs font-mono text-neutral-500">No direct booking link available</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-black bg-[#F5F5F0] p-8 text-center space-y-3">
                      <Plane className="w-10 h-10 text-neutral-400 mx-auto" />
                      <div className="font-serif text-xl font-bold uppercase text-black">
                        NO FLIGHT DISPATCHES FOUND
                      </div>
                      <p className="font-body text-xs text-neutral-600 max-w-sm mx-auto">
                        No live flight options were returned for the requested route and dates.
                      </p>
                    </div>
                  )}

                </div>
              ) : (
                <div className="border-2 border-black bg-[#F5F5F0] p-12 text-center space-y-4">
                  <Compass className="w-12 h-12 text-neutral-400 mx-auto" />
                  <h3 className="font-serif text-2xl font-black uppercase text-black">
                    READY FOR FLIGHT SEARCH
                  </h3>
                  <p className="font-body text-xs text-neutral-600 max-w-md mx-auto">
                    Select your departure airport code, destination, and travel dates on the left to query live flight availability.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* HOTEL RESULTS */}
          {activeTab === 'hotels' && (
            <div>
              {hotelResults ? (
                <div className="space-y-4">
                  
                  {/* Status Banner */}
                  <div className="border-2 border-black bg-neutral-100 p-3 font-mono text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold uppercase text-black">PROVIDER:</span> {hotelResults.provider}
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold text-white uppercase ${hotelResults.isLive ? 'bg-green-700' : 'bg-amber-800'}`}>
                      {hotelResults.isLive ? '● LIVE API ACTIVE' : 'UNCONFIGURED PROVIDER'}
                    </span>
                  </div>

                  {hotelResults.message && (
                    <div className="p-3 border border-black bg-amber-50 text-amber-950 font-body text-xs">
                      {hotelResults.message}
                    </div>
                  )}

                  {hotelResults.hotels && hotelResults.hotels.length > 0 ? (
                    <div className="space-y-4">
                      {hotelResults.hotels.map((hotel: any) => (
                        <div key={hotel.id} className="border-4 border-black bg-white p-5 newsprint-texture space-y-3 font-sans">
                          <div className="flex justify-between items-start border-b border-black pb-2">
                            <div>
                              <div className="font-mono text-[11px] font-bold text-red-700 uppercase">
                                {hotel.location}
                              </div>
                              <h3 className="font-serif text-xl font-bold uppercase text-black">
                                {hotel.name}
                              </h3>
                              {hotel.starRating && (
                                <div className="text-amber-600 text-xs font-mono">
                                  {'★'.repeat(hotel.starRating)} ({hotel.starRating}-Star Hotel)
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              {hotel.price.amount > 0 ? (
                                <div className="font-serif text-2xl font-black text-black">
                                  ${hotel.price.amount} {hotel.price.currency}
                                </div>
                              ) : (
                                <div className="font-mono text-xs font-bold text-neutral-600">
                                  RATES UPON BOOKING
                                </div>
                              )}
                              <div className="font-mono text-[10px] text-neutral-600 uppercase">
                                {hotel.roomType}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 font-mono text-xs text-neutral-800">
                            <div>
                              <strong className="text-neutral-500">CHECK-IN:</strong> {hotel.checkIn}
                            </div>
                            <div>
                              <strong className="text-neutral-500">CHECK-OUT:</strong> {hotel.checkOut}
                            </div>
                          </div>

                          <div className="pt-2 flex justify-end">
                            {hotel.bookingUrl ? (
                              <a
                                href={hotel.bookingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 border-2 border-black bg-black text-white hover:bg-red-700 transition-colors text-xs font-mono font-bold flex items-center gap-1.5"
                              >
                                VIEW HOTEL OFFER <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <span className="text-xs font-mono text-neutral-500">No direct booking link available</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-black bg-[#F5F5F0] p-8 text-center space-y-3">
                      <Hotel className="w-10 h-10 text-neutral-400 mx-auto" />
                      <div className="font-serif text-xl font-bold uppercase text-black">
                        NO HOTEL OFFERS FOUND
                      </div>
                      <p className="font-body text-xs text-neutral-600 max-w-sm mx-auto">
                        No live hotel accommodations were returned for the specified destination and dates.
                      </p>
                    </div>
                  )}

                </div>
              ) : (
                <div className="border-2 border-black bg-[#F5F5F0] p-12 text-center space-y-4">
                  <Hotel className="w-12 h-12 text-neutral-400 mx-auto" />
                  <h3 className="font-serif text-2xl font-black uppercase text-black">
                    READY FOR HOTEL SEARCH
                  </h3>
                  <p className="font-body text-xs text-neutral-600 max-w-md mx-auto">
                    Enter your destination city and check-in/check-out dates on the left to query live hotel rates.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
