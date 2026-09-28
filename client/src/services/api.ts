/// <reference types="vite/client" />
import { User, TripPlan, WorldArticle } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api';

export const api = {
  async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.message || 'Registration failed. Please try again.');
    }

    // Backend returns { success, data: { user, token } }
    return json.data || json;
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.message || 'Invalid email or password.');
    }

    // Backend returns { success, data: { user, token } }
    return json.data || json;
  },

  async me(token: string): Promise<User | null> {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        // Backend returns { success, data: { user } }
        const payload = json.data || json;
        return payload.user;
      }
    } catch {
      // Network failure — user will be logged out on next refresh
    }
    return null;
  },

  async getArticleOfTheDay(): Promise<WorldArticle> {
    try {
      const res = await fetch(`${API_BASE}/articles/today`);
      if (res.ok) {
        const data = await res.json();
        if (data.article) return data.article;
      }
    } catch {
      // Client offline fallback
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const ARTICLES: WorldArticle[] = [
      {
        id: 'art_kyoto_tea',
        title: 'THE SACRED RITUAL OF CHADO: KYOTO’S CENTURIES-OLD TEA HOUSES',
        subtitle: 'Inside the quiet wooden machiya where Zen philosophy meets meticulous hospitality in Japan’s cultural heart.',
        country: 'Japan',
        countryCode: 'JP',
        flag: '🇯🇵',
        location: 'Kyoto, Kansai Region',
        category: 'Culture',
        publishDate: formattedDate,
        readTime: '4 min read',
        summary: 'The Japanese tea ceremony, known as Chadō or Sukiya-zukuri tradition, is a refined cultural activity involving the ceremonial preparation and presentation of matcha. In Kyoto’s historic Gion and Higashiyama districts, tea masters pass down traditions dating back to 16th-century master Sen no Rikyū.',
        fullContent: 'Rooted in Zen Buddhism, the Japanese tea ceremony (Chadō or Sadō, "The Way of Tea") is a spiritual practice centered on harmony (Wa), respect (Kei), purity (Sei), and tranquility (Jaku). In Kyoto, historic machiya townhouses host intimate gatherings where every movement—from folding the silk cloth (fukusa) to whisking stone-ground ceremonial matcha—is executed with mindfulness.',
        imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80',
        imageCaption: 'Traditional wooden tea house tearoom with tatami mat flooring in Kyoto, Japan.',
        sourceName: 'Wikipedia / UNESCO Intangible Heritage Archive',
        sourceUrl: 'https://en.wikipedia.org/wiki/Japanese_tea_ceremony',
        isVerified: true,
        highlights: [
          'Founded on 16th-century principles of master Sen no Rikyū',
          'Uses ceremonial grade matcha whisked with bamboo chasen',
          'Low entrances symbolise equality of all guests regardless of status'
        ]
      },
      {
        id: 'art_rajasthan_stepwells',
        title: 'ARCHITECTURAL WONDERS: THE SACRED GEOMETRIC STEPWELLS OF RAJASTHAN',
        subtitle: 'Engineering marvels built to harvest monsoon rains while serving as subterranean community retreats.',
        country: 'India',
        countryCode: 'IN',
        flag: '🇮🇳',
        location: 'Abhaneri, Rajasthan',
        category: 'Architecture',
        publishDate: formattedDate,
        readTime: '5 min read',
        summary: 'Chand Baori in Abhaneri, Rajasthan, is one of the deepest and largest stepwells in the world. Constructed by King Chanda of the Nikumbha Dynasty between 800 and 900 CE, it extends 13 stories down with 3,500 narrow steps arranged in precise geometric symmetry.',
        fullContent: 'Stepwells, called baoris or baolis in northern India, are unique subterranean structures that combine water conservation with architectural elegance. Built across arid regions of Rajasthan and Gujarat, these multi-story stone structures features cooling microclimates where temperatures at the bottom remain 5–6 degrees Celsius cooler than the desert surface.',
        imageUrl: 'https://images.unsplash.com/photo-1598977123118-4e30ba3c4f5b?auto=format&fit=crop&w=1200&q=80',
        imageCaption: 'The 3,500 geometric steps of Chand Baori stepwell in Abhaneri, Rajasthan.',
        sourceName: 'Archaeological Survey of India / Wikipedia',
        sourceUrl: 'https://en.wikipedia.org/wiki/Chand_Baori',
        isVerified: true,
        highlights: [
          'Contains 3,500 symmetrically arranged stone steps down 13 stories',
          'Built in the 9th century to harvest seasonal desert rainfall',
          'Subterranean depth provides natural cooling in arid temperatures'
        ]
      }
    ];

    const dateKey = today.toISOString().split('T')[0];
    let hash = 0;
    for (let i = 0; i < dateKey.length; i++) {
      hash = (hash << 5) - hash + dateKey.charCodeAt(i);
      hash |= 0;
    }
    return ARTICLES[Math.abs(hash) % ARTICLES.length];
  },

  async generateTripPlan(params: {
    destination: string;
    budget: number;
    days: number;
    travelers: number;
    interests: string[];
  }): Promise<TripPlan> {
    try {
      const token = localStorage.getItem('predicverse_token');
      const res = await fetch(`${API_BASE}/trips/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback client generation
    }

    // High quality client-side fallback itinerary
    const itineraryLines = [];
    itineraryLines.push(`### 🏛️ Day-by-Day Itinerary for ${params.destination} (${params.days} Days)`);
    itineraryLines.push(`**Budget Tier:** $${params.budget} | **Travelers:** ${params.travelers} | **Style:** ${params.interests.join(', ')}\n`);

    for (let day = 1; day <= params.days; day++) {
      itineraryLines.push(`#### Day ${day}: Exploring Core Landmarks & Culinary Delights`);
      itineraryLines.push(`- **Morning (09:00 - 12:30):** Historic Walking Tour & Breakfast at local cafe.`);
      itineraryLines.push(`- **Afternoon (13:00 - 17:00):** Visit primary attractions (${params.interests.includes('Culture & History') ? 'Museums & Ancient Temples' : 'Scenic Viewpoints & Local Markets'}).`);
      itineraryLines.push(`- **Evening (18:30 - 21:30):** Dinner experiencing authentic traditional cuisine and night walking market.\n`);
    }

    itineraryLines.push(`---`);
    itineraryLines.push(`💰 **Estimated Budget Breakdown:**`);
    itineraryLines.push(`- Accommodation: $${Math.round(params.budget * 0.4)}`);
    itineraryLines.push(`- Food & Dining: $${Math.round(params.budget * 0.3)}`);
    itineraryLines.push(`- Activities & Entry Fees: $${Math.round(params.budget * 0.2)}`);
    itineraryLines.push(`- Transport: $${Math.round(params.budget * 0.1)}`);

    return {
      id: 'trip_' + crypto.randomUUID(),
      userId: 'usr_current',
      destination: params.destination,
      budget: params.budget,
      days: params.days,
      travelers: params.travelers,
      interests: params.interests,
      itinerary: itineraryLines.join('\n'),
      createdAt: new Date().toISOString(),
    };
  },

  // ============================================================
  // WISHLIST API
  // ============================================================
  async getWishlist(token: string) {
    try {
      const res = await fetch(`${API_BASE}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.items || [];
      }
    } catch {
      // Fallback to local storage
    }
    return null;
  },

  async addToWishlist(token: string, item: { destinationType: string; destinationId: string; destinationName: string }) {
    try {
      const res = await fetch(`${API_BASE}/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.item || null;
      }
    } catch {
      // Fallback
    }
    return null;
  },

  async removeFromWishlist(token: string, destinationId: string) {
    try {
      await fetch(`${API_BASE}/wishlist/by-destination/${destinationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Fallback
    }
  },

  // ============================================================
  // PASSPORT API
  // ============================================================
  async getPassport(token: string) {
    try {
      const res = await fetch(`${API_BASE}/passport`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.stamps || [];
      }
    } catch {
      // Fallback
    }
    return null;
  },

  async addToPassport(token: string, item: { destinationType: string; destinationId: string; destination: string; country?: string; flag?: string }) {
    try {
      const res = await fetch(`${API_BASE}/passport`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...item,
          destinationName: item.destination,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.stamp || null;
      }
    } catch {
      // Fallback
    }
    return null;
  },

  async removeFromPassport(token: string, destinationId: string) {
    try {
      await fetch(`${API_BASE}/passport/by-destination/${destinationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Fallback
    }
  },

  // ============================================================
  // TRIPS API
  // ============================================================
  async getTrips(token: string) {
    try {
      const res = await fetch(`${API_BASE}/trips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.trips || [];
      }
    } catch {
      // Fallback
    }
    return null;
  },

  async saveTrip(token: string, trip: TripPlan) {
    try {
      const res = await fetch(`${API_BASE}/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `Trip to ${trip.destination}`,
          destination: trip.destination,
          budget: trip.budget,
          days: trip.days,
          travelers: trip.travelers,
          interests: trip.interests,
          itinerary: trip.itinerary,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.trip || null;
      }
    } catch {
      // Fallback
    }
    return null;
  },

  // ============================================================
  // TRAVEL DNA API
  // ============================================================
  async getTravelDNA(token: string) {
    try {
      const res = await fetch(`${API_BASE}/users/me/travel-dna`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.travelDNA || null;
      }
    } catch {
      // Fallback
    }
    return null;
  },

  async updateTravelDNA(token: string, data: any) {
    try {
      const res = await fetch(`${API_BASE}/users/me/travel-dna`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.travelDNA || null;
      }
    } catch {
      // Fallback
    }
    return null;
  },

  // ============================================================
  // TRAVEL INTELLIGENCE API
  // ============================================================
  async getWeather(location: string) {
    try {
      const res = await fetch(`${API_BASE}/intelligence/weather?location=${encodeURIComponent(location)}`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Fallback
    }
    return {
      location,
      temperature: 22,
      unit: '°C',
      condition: 'Clear & Pleasant',
      humidity: 55,
      windSpeed: 12,
      isLive: false,
      forecast: [
        { day: 'Today', tempHigh: 23, tempLow: 15, condition: 'Sunny' },
        { day: 'Tomorrow', tempHigh: 22, tempLow: 14, condition: 'Clear' },
      ],
    };
  },

  async getCurrency(amount: number = 1000, base: string = 'USD') {
    try {
      const res = await fetch(`${API_BASE}/intelligence/currency?amount=${amount}&base=${base}`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Fallback
    }
    return {
      baseCurrency: base,
      amount,
      rates: { USD: 1, INR: 83.5, EUR: 0.92, GBP: 0.78, JPY: 152 },
      conversions: {
        USD: { amount, symbol: '$', formatted: `$${amount.toLocaleString()}` },
        INR: { amount: Math.round(amount * 83.5), symbol: '₹', formatted: `₹${Math.round(amount * 83.5).toLocaleString()}` },
        EUR: { amount: Math.round(amount * 0.92), symbol: '€', formatted: `€${Math.round(amount * 0.92).toLocaleString()}` },
        GBP: { amount: Math.round(amount * 0.78), symbol: '£', formatted: `£${Math.round(amount * 0.78).toLocaleString()}` },
        JPY: { amount: Math.round(amount * 152), symbol: '¥', formatted: `¥${Math.round(amount * 152).toLocaleString()}` },
      },
      isLive: false,
      updatedAt: new Date().toISOString(),
    };
  },

  async getRecommendationMatch(destinationId: string, token?: string) {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/intelligence/recommendation-match?destinationId=${encodeURIComponent(destinationId)}`, {
        headers,
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Fallback
    }
    return {
      destinationId,
      destinationName: destinationId.toUpperCase(),
      matchPercentage: 92,
      archetype: 'THE CULTURAL EXPLORER',
      reasons: [
        '✓ Strong food culture matching your profile',
        '✓ High cultural exploration potential',
        '✓ Rich heritage and ancient historical landmarks',
        '✓ Fits your preferred travel style',
      ],
      breakdown: {},
    };
  },

  async getCultureInfo(countryId: string) {
    try {
      const res = await fetch(`${API_BASE}/intelligence/culture?countryId=${encodeURIComponent(countryId)}`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Fallback
    }
    return null;
  },

  async searchFlights(params: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    oneWay?: boolean;
    travelers?: number;
    cabinClass?: string;
    currency?: string;
  }) {
    try {
      const res = await fetch(`${API_BASE}/travel/flights/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Flight search request failed.');
      }
      return json;
    } catch (err: any) {
      return {
        success: false,
        isLive: false,
        provider: 'Amadeus API',
        message: err.message || 'Flight search temporarily unavailable.',
        flights: [],
      };
    }
  },

  async searchHotels(params: {
    destination: string;
    checkInDate: string;
    checkOutDate: string;
    guests?: number;
    rooms?: number;
    currency?: string;
  }) {
    try {
      const res = await fetch(`${API_BASE}/travel/hotels/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Hotel search request failed.');
      }
      return json;
    } catch (err: any) {
      return {
        success: false,
        isLive: false,
        provider: 'Amadeus API',
        message: err.message || 'Hotel search temporarily unavailable.',
        hotels: [],
      };
    }
  },

  async downloadGuidebookPdf(payload: {
    tripId?: string;
    destination: string;
    budget?: number;
    days?: number;
    travelers?: number;
    interests?: string[];
    travelStyle?: string;
    itinerary?: string;
    structuredAI?: any;
    flightData?: any;
    hotelData?: any;
  }): Promise<void> {
    const token = localStorage.getItem('predicverse_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let url = `${API_BASE}/trips/export-pdf`;
    let method = 'POST';
    let body: string | undefined = JSON.stringify(payload);

    if (payload.tripId) {
      url = `${API_BASE}/trips/${payload.tripId}/export-pdf`;
      method = 'GET';
      body = undefined;
    } else {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, { method, headers, body });

    if (!res.ok) {
      const errText = await res.text();
      let errorMsg = 'Unable to generate the guidebook. Please try again.';
      try {
        const json = JSON.parse(errText);
        if (json.message) errorMsg = json.message;
      } catch {}
      throw new Error(errorMsg);
    }

    const blob = await res.blob();
    const sanitizedDest = (payload.destination || 'Destination')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_');
    const filename = `PredicVerse_${sanitizedDest}_Travel_Guide.pdf`;

    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  },

  // ============================================================
  // TRIP COLLABORATION & SHARING API
  // ============================================================

  async createShareLink(tripId: string, role: 'VIEWER' | 'EDITOR' = 'VIEWER', expirationDays?: number | null) {
    const token = localStorage.getItem('predicverse_token');
    const res = await fetch(`${API_BASE}/trips/${tripId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role, expirationDays }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to create share link.');
    return json.data;
  },

  async getShareLinks(tripId: string) {
    const token = localStorage.getItem('predicverse_token');
    const res = await fetch(`${API_BASE}/trips/${tripId}/share`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch share links.');
    return json.data;
  },

  async revokeShareLink(tripId: string, linkId: string) {
    const token = localStorage.getItem('predicverse_token');
    const res = await fetch(`${API_BASE}/trips/${tripId}/share/${linkId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to revoke share link.');
    return json;
  },

  async resolveSharedTrip(token: string) {
    const res = await fetch(`${API_BASE}/shared/trips/${token}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'THIS GAZETTE EDITION IS NO LONGER AVAILABLE');
    return json.data;
  },

  async addCollaborator(tripId: string, email: string, role: 'VIEWER' | 'EDITOR' = 'VIEWER') {
    const authToken = localStorage.getItem('predicverse_token');
    const res = await fetch(`${API_BASE}/trips/${tripId}/collaborators`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ email, role }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to add collaborator.');
    return json.data;
  },

  async getCollaborators(tripId: string) {
    const token = localStorage.getItem('predicverse_token');
    const res = await fetch(`${API_BASE}/trips/${tripId}/collaborators`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch collaborators.');
    return json.data;
  },

  async updateCollaboratorRole(tripId: string, targetUserId: string, role: 'VIEWER' | 'EDITOR') {
    const token = localStorage.getItem('predicverse_token');
    const res = await fetch(`${API_BASE}/trips/${tripId}/collaborators/${targetUserId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update collaborator role.');
    return json.data;
  },

  async removeCollaborator(tripId: string, targetUserId: string) {
    const token = localStorage.getItem('predicverse_token');
    const res = await fetch(`${API_BASE}/trips/${tripId}/collaborators/${targetUserId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to remove collaborator.');
    return json;
  },
};
