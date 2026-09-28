import React, { createContext, useContext, useState, useEffect } from 'react';
import { WishlistItem, PassportEntry, TripPlan, QuizResult } from '../types';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

interface AppContextType {
  wishlist: WishlistItem[];
  passport: PassportEntry[];
  tripPlans: TripPlan[];
  quizHistory: QuizResult[];
  addToWishlist: (item: Omit<WishlistItem, 'id' | 'userId' | 'addedAt'>) => void;
  removeFromWishlist: (destinationId: string) => void;
  isInWishlist: (destinationId: string) => boolean;
  addToPassport: (item: Omit<PassportEntry, 'id' | 'userId' | 'visitedAt'>) => void;
  removeFromPassport: (destinationId: string) => void;
  isInPassport: (destinationId: string) => boolean;
  saveTripPlan: (plan: TripPlan) => void;
  saveQuizResult: (result: QuizResult) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isIntroOpen: boolean;
  setIsIntroOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();

  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('predicverse_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [passport, setPassport] = useState<PassportEntry[]>(() => {
    try {
      const saved = localStorage.getItem('predicverse_passport');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tripPlans, setTripPlans] = useState<TripPlan[]>(() => {
    try {
      const saved = localStorage.getItem('predicverse_trips');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [quizHistory, setQuizHistory] = useState<QuizResult[]>(() => {
    try {
      const saved = localStorage.getItem('predicverse_quizzes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isIntroOpen, setIsIntroOpen] = useState(false);

  // Sync with backend API when user logs in, or reset state on logout
  useEffect(() => {
    if (isAuthenticated && token) {
      const loadBackendData = async () => {
        const [serverWishlist, serverPassport, serverTrips] = await Promise.all([
          api.getWishlist(token),
          api.getPassport(token),
          api.getTrips(token),
        ]);

        if (serverWishlist && Array.isArray(serverWishlist)) {
          const mapped: WishlistItem[] = serverWishlist.map((w: any) => ({
            id: w.id,
            userId: w.userId,
            destinationType: w.destinationType,
            destinationId: w.destinationId,
            destinationName: w.destinationName,
            addedAt: w.createdAt || new Date().toISOString(),
          }));
          setWishlist(mapped);
        }

        if (serverPassport && Array.isArray(serverPassport)) {
          const mapped: PassportEntry[] = serverPassport.map((p: any) => ({
            id: p.id,
            userId: p.userId,
            destinationType: p.destinationType,
            destinationId: p.destinationId,
            destinationName: p.destination || p.destinationName,
            visitedAt: p.stampDate || new Date().toISOString(),
          }));
          setPassport(mapped);
        }

        if (serverTrips && Array.isArray(serverTrips)) {
          const mapped: TripPlan[] = serverTrips.map((t: any) => ({
            id: t.id,
            userId: t.userId,
            destination: t.destination,
            budget: t.budget || 1000,
            days: t.days || 3,
            travelers: t.travelers || 1,
            interests: typeof t.interests === 'string' ? JSON.parse(t.interests || '[]') : (t.interests || []),
            itinerary: t.description || t.itinerary || '',
            createdAt: t.createdAt || new Date().toISOString(),
          }));
          setTripPlans(mapped);
        }
      };

      loadBackendData();
    } else if (!isAuthenticated) {
      setWishlist([]);
      setPassport([]);
      setTripPlans([]);
      setQuizHistory([]);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    localStorage.setItem('predicverse_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('predicverse_passport', JSON.stringify(passport));
  }, [passport]);

  useEffect(() => {
    localStorage.setItem('predicverse_trips', JSON.stringify(tripPlans));
  }, [tripPlans]);

  useEffect(() => {
    localStorage.setItem('predicverse_quizzes', JSON.stringify(quizHistory));
  }, [quizHistory]);

  const addToWishlist = (item: Omit<WishlistItem, 'id' | 'userId' | 'addedAt'>) => {
    if (wishlist.some(w => w.destinationId === item.destinationId)) return;
    const newItem: WishlistItem = {
      ...item,
      id: 'wish_' + crypto.randomUUID(),
      userId: 'usr_local',
      addedAt: new Date().toISOString(),
    };
    setWishlist(prev => [...prev, newItem]);

    if (token) {
      api.addToWishlist(token, {
        destinationType: item.destinationType,
        destinationId: item.destinationId,
        destinationName: item.destinationName,
      });
    }
  };

  const removeFromWishlist = (destinationId: string) => {
    setWishlist(prev => prev.filter(w => w.destinationId !== destinationId));
    if (token) {
      api.removeFromWishlist(token, destinationId);
    }
  };

  const isInWishlist = (destinationId: string) => {
    return wishlist.some(w => w.destinationId === destinationId);
  };

  const addToPassport = (item: Omit<PassportEntry, 'id' | 'userId' | 'visitedAt'>) => {
    if (passport.some(p => p.destinationId === item.destinationId)) return;
    const newItem: PassportEntry = {
      ...item,
      id: 'pass_' + crypto.randomUUID(),
      userId: 'usr_local',
      visitedAt: new Date().toISOString(),
    };
    setPassport(prev => [...prev, newItem]);

    if (token) {
      api.addToPassport(token, {
        destinationType: item.destinationType,
        destinationId: item.destinationId,
        destination: item.destinationName,
      });
    }
  };

  const removeFromPassport = (destinationId: string) => {
    setPassport(prev => prev.filter(p => p.destinationId !== destinationId));
    if (token) {
      api.removeFromPassport(token, destinationId);
    }
  };

  const isInPassport = (destinationId: string) => {
    return passport.some(p => p.destinationId === destinationId);
  };

  const saveTripPlan = (plan: TripPlan) => {
    setTripPlans(prev => [plan, ...prev]);
    if (token) {
      api.saveTrip(token, plan);
    }
  };

  const saveQuizResult = (result: QuizResult) => {
    setQuizHistory(prev => [result, ...prev]);
    if (token) {
      api.updateTravelDNA(token, {
        archetype: result.personalityType,
      });
    }
  };

  return (
    <AppContext.Provider
      value={{
        wishlist,
        passport,
        tripPlans,
        quizHistory,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        addToPassport,
        removeFromPassport,
        isInPassport,
        saveTripPlan,
        saveQuizResult,
        isSearchOpen,
        setIsSearchOpen,
        isAuthOpen,
        setIsAuthOpen,
        isIntroOpen,
        setIsIntroOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
