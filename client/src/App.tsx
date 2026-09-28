import React, { useState, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { NewsTicker } from './components/NewsTicker';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { AuthModal } from './components/AuthModal';
import { CinematicIntro } from './components/CinematicIntro';
import { LoginGateway } from './components/LoginGateway';

// ============================================================
// LAZY-LOADED PAGES (Code-splitting for production performance)
// ============================================================
const Home = React.lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Explore = React.lazy(() => import('./pages/Explore').then(m => ({ default: m.Explore })));
const CountryDetail = React.lazy(() => import('./pages/CountryDetail').then(m => ({ default: m.CountryDetail })));
const StateDetail = React.lazy(() => import('./pages/StateDetail').then(m => ({ default: m.StateDetail })));
const CityDetail = React.lazy(() => import('./pages/CityDetail').then(m => ({ default: m.CityDetail })));
const TripPlanner = React.lazy(() => import('./pages/TripPlanner').then(m => ({ default: m.TripPlanner })));
const Compare = React.lazy(() => import('./pages/Compare').then(m => ({ default: m.Compare })));
const Quiz = React.lazy(() => import('./pages/Quiz').then(m => ({ default: m.Quiz })));
const Passport = React.lazy(() => import('./pages/Passport').then(m => ({ default: m.Passport })));
const TravelSearch = React.lazy(() => import('./pages/TravelSearch').then(m => ({ default: m.TravelSearch })));
const SharedTrip = React.lazy(() => import('./pages/SharedTrip').then(m => ({ default: m.SharedTrip })));

// Gazette-themed loading spinner for route transitions
const PageLoader: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="border-4 border-black p-8 bg-white text-center space-y-3 max-w-xs" style={{ boxShadow: '4px 4px 0 #000' }}>
      <div className="font-serif text-2xl font-black uppercase tracking-tight">PREDICVERSE</div>
      <div className="text-neutral-600 font-mono text-xs font-bold animate-pulse">LOADING GAZETTE EDITION...</div>
    </div>
  </div>
);

const AppInner: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showIntro, setShowIntro] = useState<boolean>(true);

  // Allow public access to /shared/trips/:token without LoginGateway block
  const isSharedTripRoute = window.location.pathname.startsWith('/shared/trips/');

  // Always play 10-second Cinematic Intro right after user logs in
  React.useEffect(() => {
    if (isAuthenticated) {
      setShowIntro(true);
    }
  }, [isAuthenticated]);

  // When checking credentials on startup
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F9F7] flex flex-col items-center justify-center font-mono text-xs newsprint-texture">
        <div className="border-4 border-black p-8 bg-white hard-shadow text-center space-y-4 max-w-sm">
          <div className="font-serif text-3xl font-black uppercase tracking-tight">PREDICVERSE</div>
          <div className="text-neutral-600 font-bold animate-pulse">VERIFYING PASSPORT CREDENTIALS...</div>
        </div>
      </div>
    );
  }

  // Require user login for app pages except public shared trip links
  if (!isAuthenticated && !isSharedTripRoute) {
    return <LoginGateway />;
  }

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] text-[#111111] flex flex-col font-body selection:bg-black selection:text-white">
      {/* Cinematic Intro — always plays on open, blocks main content until dismissed */}
      {!isSharedTripRoute && (
        <CinematicIntro
          isOpen={showIntro}
          onClose={handleIntroComplete}
          onComplete={handleIntroComplete}
        />
      )}

      <NewsTicker />
      <Navbar />

      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/country/:countryId" element={<CountryDetail />} />
            <Route path="/state/:countryId/:stateId" element={<StateDetail />} />
            <Route path="/city/:countryId/:stateId/:cityId" element={<CityDetail />} />
            <Route path="/planner" element={<TripPlanner />} />
            <Route path="/travel" element={<TravelSearch />} />
            <Route path="/shared/trips/:token" element={<SharedTrip />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/passport" element={<Passport />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />

      {/* Global Overlays */}
      <SearchModal />
      <AuthModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <AppInner />
      </AppProvider>
    </AuthProvider>
  );
};

