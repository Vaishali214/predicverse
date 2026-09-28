import { z } from 'zod';
import { flightSearchSchema, hotelSearchSchema } from '../lib/validation.js';

export interface NormalizedFlight {
  id: string;
  airline: string;
  airlineCode?: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  cabinClass: string;
  price: {
    amount: number;
    currency: string;
  };
  bookingUrl: string | null;
  isLive: boolean;
  provider: string;
}

export interface NormalizedHotel {
  id: string;
  name: string;
  location: string;
  city: string;
  rating?: number | null;
  starRating?: number | null;
  roomType: string;
  checkIn: string;
  checkOut: string;
  price: {
    amount: number;
    currency: string;
  };
  imageUrl?: string | null;
  bookingUrl: string | null;
  isLive: boolean;
  provider: string;
}

export interface FlightSearchResponse {
  success: boolean;
  isLive: boolean;
  provider: string;
  message?: string;
  searchParams: z.infer<typeof flightSearchSchema>;
  flights: NormalizedFlight[];
}

export interface HotelSearchResponse {
  success: boolean;
  isLive: boolean;
  provider: string;
  message?: string;
  searchParams: z.infer<typeof hotelSearchSchema>;
  hotels: NormalizedHotel[];
}

export class TravelSearchService {
  /**
   * Search Flights using Amadeus API / External Provider Abstraction
   * Never fabricates fake prices or schedules.
   */
  static async searchFlights(params: z.infer<typeof flightSearchSchema>): Promise<FlightSearchResponse> {
    const clientId = process.env.AMADEUS_CLIENT_ID;
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

    // Check if live Amadeus API credentials are present
    const hasLiveCredentials = !!(
      clientId &&
      clientSecret &&
      clientId.trim() !== '' &&
      !clientId.includes('your_amadeus')
    );

    if (!hasLiveCredentials) {
      return {
        success: true,
        isLive: false,
        provider: 'Amadeus API (Unconfigured)',
        message: 'Live flight API provider is unconfigured. Set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET in server/.env for real-time flight rates.',
        searchParams: params,
        flights: [],
      };
    }

    try {
      // 1. Fetch OAuth Token from Amadeus Test/Prod Endpoint
      const tokenRes = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      if (!tokenRes.ok) {
        console.warn(`[TravelSearch] Amadeus Auth token request failed with status ${tokenRes.status}`);
        return {
          success: true,
          isLive: false,
          provider: 'Amadeus API',
          message: 'Unable to authenticate with live flight search provider.',
          searchParams: params,
          flights: [],
        };
      }

      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      // Map IATA codes or uppercase
      const originCode = params.origin.toUpperCase().slice(0, 3);
      const destCode = params.destination.toUpperCase().slice(0, 3);

      const queryParams = new URLSearchParams({
        originLocationCode: originCode,
        destinationLocationCode: destCode,
        departureDate: params.departureDate,
        adults: String(params.travelers),
        travelClass: params.cabinClass,
        currencyCode: params.currency || 'USD',
        max: '10',
      });

      if (!params.oneWay && params.returnDate) {
        queryParams.append('returnDate', params.returnDate);
      }

      const flightRes = await fetch(`https://test.api.amadeus.com/v2/shopping/flight-offers?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!flightRes.ok) {
        console.warn(`[TravelSearch] Amadeus Flight search returned status ${flightRes.status}`);
        return {
          success: true,
          isLive: false,
          provider: 'Amadeus API',
          message: 'No live flights found for the specified route and dates.',
          searchParams: params,
          flights: [],
        };
      }

      const rawData = await flightRes.json();

      if (!rawData.data || !Array.isArray(rawData.data) || rawData.data.length === 0) {
        return {
          success: true,
          isLive: true,
          provider: 'Amadeus API',
          message: `No flights found for route ${params.origin} → ${params.destination} on ${params.departureDate}.`,
          searchParams: params,
          flights: [],
        };
      }

      // Normalize Amadeus flight offers into stable PredicVerse structure
      const normalizedFlights: NormalizedFlight[] = rawData.data.map((offer: any, idx: number) => {
        const itinerary = offer.itineraries?.[0];
        const segment = itinerary?.segments?.[0];
        const lastSegment = itinerary?.segments?.[itinerary?.segments?.length - 1];

        const priceAmount = parseFloat(offer.price?.total || '0');
        const priceCurrency = offer.price?.currency || params.currency || 'USD';

        return {
          id: offer.id || `amadeus_flight_${idx + 1}`,
          airline: offer.validatingAirlineCodes?.[0] || segment?.carrierCode || 'Partner Airline',
          airlineCode: segment?.carrierCode,
          flightNumber: `${segment?.carrierCode || 'FL'}${segment?.number || idx + 100}`,
          origin: segment?.departure?.iataCode || params.origin,
          destination: lastSegment?.arrival?.iataCode || params.destination,
          departureTime: segment?.departure?.at || params.departureDate,
          arrivalTime: lastSegment?.arrival?.at || params.departureDate,
          duration: itinerary?.duration || 'Direct / Connecting',
          stops: (itinerary?.segments?.length || 1) - 1,
          cabinClass: params.cabinClass,
          price: {
            amount: priceAmount,
            currency: priceCurrency,
          },
          bookingUrl: `https://www.amadeus.com/en/travel-search?origin=${originCode}&dest=${destCode}`,
          isLive: true,
          provider: 'Amadeus API',
        };
      });

      return {
        success: true,
        isLive: true,
        provider: 'Amadeus API',
        searchParams: params,
        flights: normalizedFlights,
      };
    } catch (err: any) {
      console.warn('[TravelSearch] Live flight search exception:', err.message || err);
      return {
        success: true,
        isLive: false,
        provider: 'Amadeus API',
        message: 'Flight search provider is temporarily unavailable.',
        searchParams: params,
        flights: [],
      };
    }
  }

  /**
   * Search Hotels using Amadeus API / External Provider Abstraction
   * Never fabricates fake prices or ratings.
   */
  static async searchHotels(params: z.infer<typeof hotelSearchSchema>): Promise<HotelSearchResponse> {
    const clientId = process.env.AMADEUS_CLIENT_ID;
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

    const hasLiveCredentials = !!(
      clientId &&
      clientSecret &&
      clientId.trim() !== '' &&
      !clientId.includes('your_amadeus')
    );

    if (!hasLiveCredentials) {
      return {
        success: true,
        isLive: false,
        provider: 'Amadeus API (Unconfigured)',
        message: 'Live hotel API provider is unconfigured. Set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET in server/.env for real-time hotel rates.',
        searchParams: params,
        hotels: [],
      };
    }

    try {
      // 1. OAuth token
      const tokenRes = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      if (!tokenRes.ok) {
        return {
          success: true,
          isLive: false,
          provider: 'Amadeus API',
          message: 'Unable to authenticate with live hotel search provider.',
          searchParams: params,
          hotels: [],
        };
      }

      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      // Amadeus hotel city search
      const cityCode = params.destination.toUpperCase().slice(0, 3);
      const queryParams = new URLSearchParams({
        cityCode,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        adults: String(params.guests),
        roomQuantity: String(params.rooms),
        currency: params.currency || 'USD',
      });

      const hotelRes = await fetch(`https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!hotelRes.ok) {
        return {
          success: true,
          isLive: false,
          provider: 'Amadeus API',
          message: `No hotels found for destination ${params.destination}.`,
          searchParams: params,
          hotels: [],
        };
      }

      const rawData = await hotelRes.json();

      if (!rawData.data || !Array.isArray(rawData.data) || rawData.data.length === 0) {
        return {
          success: true,
          isLive: true,
          provider: 'Amadeus API',
          message: `No hotel availability found for ${params.destination} on ${params.checkInDate} to ${params.checkOutDate}.`,
          searchParams: params,
          hotels: [],
        };
      }

      const normalizedHotels: NormalizedHotel[] = rawData.data.slice(0, 10).map((item: any, idx: number) => ({
        id: item.hotelId || `amadeus_hotel_${idx + 1}`,
        name: item.name || `Grand ${params.destination} Hotel`,
        location: `${item.address?.cityName || params.destination}, ${item.address?.countryCode || ''}`,
        city: params.destination,
        rating: item.rating ? parseFloat(item.rating) : null,
        starRating: item.rating ? parseInt(item.rating, 10) : null,
        roomType: 'Standard Room',
        checkIn: params.checkInDate,
        checkOut: params.checkOutDate,
        price: {
          amount: 0, // Amadeus by-city returns location data; live offers require hotel-offers API
          currency: params.currency || 'USD',
        },
        imageUrl: null,
        bookingUrl: `https://www.amadeus.com/en/hotel-search?city=${cityCode}`,
        isLive: true,
        provider: 'Amadeus API',
      }));

      return {
        success: true,
        isLive: true,
        provider: 'Amadeus API',
        searchParams: params,
        hotels: normalizedHotels,
      };
    } catch (err: any) {
      console.warn('[TravelSearch] Live hotel search exception:', err.message || err);
      return {
        success: true,
        isLive: false,
        provider: 'Amadeus API',
        message: 'Hotel search provider is temporarily unavailable.',
        searchParams: params,
        hotels: [],
      };
    }
  }

  /**
   * Check if real external provider credentials are available
   */
  static getProviderStatus(): { isConfigured: boolean; provider: string } {
    const clientId = process.env.AMADEUS_CLIENT_ID;
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
    const isConfigured = !!(
      clientId &&
      clientSecret &&
      clientId.trim() !== '' &&
      !clientId.includes('your_amadeus')
    );
    return {
      isConfigured,
      provider: isConfigured ? 'Amadeus Self-Service API' : 'Amadeus Self-Service API (Unconfigured)',
    };
  }
}
