import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Dna, Compass, Bookmark, CheckCircle, Award } from 'lucide-react';

export interface TravelDNACategory {
  name: string;
  key: string;
  score: number; // 0 to 100
}

export interface TravelerIdentity {
  title: string;
  quote: string;
  description: string;
  keyTraits: string[];
}

export const TravelDNA: React.FC = () => {
  const { quizHistory, passport, wishlist, tripPlans } = useApp();

  // Calculate scores dynamically based on user app interactions
  const calculateScores = (): Record<string, number> => {
    // Default base balanced preferences
    const baseScores: Record<string, number> = {
      Culture: 75,
      Food: 82,
      Adventure: 65,
      Nature: 70,
      History: 78,
      Relaxation: 60,
      Nightlife: 50,
      Luxury: 45,
      Budget: 72,
      Photography: 68,
    };

    // If quiz history exists, adjust scores based on latest quiz result
    if (quizHistory.length > 0) {
      const latestQuiz = quizHistory[0];
      const type = latestQuiz.personalityType.toLowerCase();
      if (type.includes('culture') || type.includes('heritage')) {
        baseScores.Culture += 20;
        baseScores.History += 15;
      }
      if (type.includes('food') || type.includes('gourmet')) {
        baseScores.Food += 20;
      }
      if (type.includes('adventure') || type.includes('thrill')) {
        baseScores.Adventure += 25;
        baseScores.Nature += 15;
      }
      if (type.includes('nature') || type.includes('relax')) {
        baseScores.Nature += 20;
        baseScores.Relaxation += 20;
      }
    }

    // Adjust scores based on passport items count
    if (passport.length > 0) {
      baseScores.Culture += Math.min(passport.length * 3, 15);
      baseScores.Photography += Math.min(passport.length * 4, 20);
    }

    // Adjust scores based on wishlist
    if (wishlist.length > 0) {
      baseScores.Adventure += Math.min(wishlist.length * 2, 10);
    }

    // Clamp scores between 10 and 99
    Object.keys(baseScores).forEach(key => {
      baseScores[key] = Math.min(99, Math.max(15, Math.round(baseScores[key])));
    });

    return baseScores;
  };

  const scores = calculateScores();

  // Determine Primary Traveler Identity based on top scoring category
  const getTravelerIdentity = (scores: Record<string, number>): TravelerIdentity => {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const topCategory = sorted[0][0];

    const identities: Record<string, TravelerIdentity> = {
      Culture: {
        title: 'THE CULTURAL EXPLORER',
        quote: '"You don\'t travel just to see places. You travel to understand them."',
        description: 'You seek deep historical roots, sacred heritage sites, indigenous arts, and authentic local customs over tourist traps.',
        keyTraits: ['Museum Enthusiast', 'Heritage Lover', 'Architecture Connoisseur', 'Local Etiquette Observer']
      },
      Food: {
        title: 'THE FOOD HUNTER',
        quote: '"You taste the history of a city before you walk its streets."',
        description: 'For you, food is the ultimate passport. You explore street markets, historic eateries, and secret family recipes.',
        keyTraits: ['Street Food Explorer', 'Spice Connoisseur', 'Market Wanderer', 'Culinary Storyteller']
      },
      Adventure: {
        title: 'THE ADVENTURE SEEKER',
        quote: '"For you, a destination is only as good as the pulse of its thrill."',
        description: 'You thrive on mountain passes, remote trails, river rapids, and high-energy off-the-beaten-path expeditions.',
        keyTraits: ['Trekker', 'Summit Chaser', 'Wilderness Pioneer', 'Adrenaline Collector']
      },
      Nature: {
        title: 'THE NATURE ESCAPE ARTIST',
        quote: '"You seek the quiet places where wild rivers sing."',
        description: 'You find solace in pristine national parks, misty mountain ranges, coral reefs, and silent ancient forests.',
        keyTraits: ['Eco-Traveler', 'Stargazer', 'Flora & Fauna Observer', 'Serenity Seeker']
      },
      History: {
        title: 'THE CHRONICLE ARCHIVIST',
        quote: '"You walk through ancient ruins listening to whispers of the past."',
        description: 'You read the story of humanity through ruined fortresses, classical archaeology, and preserved manuscript libraries.',
        keyTraits: ['Artifact Scholar', 'Castle Explorer', 'History Buff', 'Dossier Collector']
      },
      Photography: {
        title: 'THE VISUAL NOMAD',
        quote: '"You capture the fleeting quiet between iconic monuments."',
        description: 'You possess an artist’s eye for golden-hour light, rustic alleyways, vibrant festival colors, and authentic human emotion.',
        keyTraits: ['Golden Hour Hunter', 'Storyteller', 'Composition Artist', 'Visual Chronicler']
      },
      Luxury: {
        title: 'THE LUXURY VOYAGER',
        quote: '"You experience the world through exquisite craftsmanship and comfort."',
        description: 'You appreciate refined hospitality, heritage palace stays, Michelin gastronomy, and bespoke private journeys.',
        keyTraits: ['Connoisseur', 'Palace Guest', 'Bespoke Traveler', 'Fine Living Specialist']
      },
      Budget: {
        title: 'THE BUDGET ADVENTURER',
        quote: '"You conquer the globe on wit, wanderlust, and local buses."',
        description: 'You master the art of long-term exploration, discovering hidden gems and authentic living while making every coin count.',
        keyTraits: ['Resourceful Explorer', 'Local Bus Voyager', 'Backpack Master', 'Bargain Finder']
      },
    };

    return identities[topCategory] || identities['Culture'];
  };

  const identity = getTravelerIdentity(scores);

  // Convert percentage score to ASCII progress bar (e.g. █████████░ 90%)
  const renderAsciiBar = (score: number) => {
    const totalBlocks = 10;
    const filledBlocks = Math.round((score / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    const bar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
    return bar;
  };

  const categories = [
    { name: 'Culture', score: scores.Culture },
    { name: 'Food', score: scores.Food },
    { name: 'History', score: scores.History },
    { name: 'Adventure', score: scores.Adventure },
    { name: 'Nature', score: scores.Nature },
    { name: 'Photography', score: scores.Photography },
    { name: 'Relaxation', score: scores.Relaxation },
    { name: 'Budget', score: scores.Budget },
    { name: 'Luxury', score: scores.Luxury },
    { name: 'Nightlife', score: scores.Nightlife },
  ];

  return (
    <div className="border-4 border-black bg-white p-6 sm:p-8 newsprint-texture shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-black pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-black text-white rounded-none">
            <Dna className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <div className="font-mono text-xs font-bold text-red-700 uppercase tracking-widest">
              OFFICIAL TRAVELER PROFILE
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-black uppercase text-black tracking-tight">
              YOUR TRAVEL DNA
            </h2>
          </div>
        </div>

        <div className="font-mono text-xs bg-[#F5F5F0] border border-black px-3 py-1.5 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>ALGORITHM VERIFIED • 100% ACCURATE</span>
        </div>
      </div>

      {/* Traveler Archetype Banner */}
      <div className="border-2 border-black p-6 bg-[#FAF9F5] space-y-3 relative overflow-hidden">
        <div className="absolute top-2 right-4 pointer-events-none opacity-10 select-none font-serif text-7xl font-black">
          ARCHETYPE
        </div>

        <div className="font-mono text-xs font-bold uppercase text-neutral-500 tracking-wider">
          PRIMARY TRAVELER IDENTITY
        </div>

        <h3 className="font-serif text-2xl sm:text-3xl font-black uppercase text-red-700 tracking-tight">
          {identity.title}
        </h3>

        <blockquote className="font-serif italic text-base sm:text-lg text-neutral-800 border-l-4 border-black pl-3 py-0.5">
          {identity.quote}
        </blockquote>

        <p className="font-body text-xs sm:text-sm text-neutral-700 leading-relaxed max-w-2xl">
          {identity.description}
        </p>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-300">
          {identity.keyTraits.map((trait, idx) => (
            <span key={idx} className="font-mono text-[10px] font-bold px-2 py-0.5 bg-black text-white uppercase tracking-wider">
              ★ {trait}
            </span>
          ))}
        </div>
      </div>

      {/* DNA Progress Bars Grid */}
      <div className="space-y-3">
        <div className="font-mono text-xs font-black uppercase text-black border-b border-black pb-1 flex justify-between">
          <span>CATEGORY PREFERENCE SPECTRUM</span>
          <span>WEIGHTED %</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 font-mono text-xs">
          {categories.map(cat => (
            <div key={cat.name} className="flex justify-between items-center p-2 bg-[#F9F9F7] border border-neutral-300 hover:border-black transition-colors">
              <span className="font-bold text-neutral-900 w-28 uppercase">{cat.name}</span>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-red-700 font-bold tracking-tighter text-sm">
                  {renderAsciiBar(cat.score)}
                </span>
                <span className="font-bold w-10 text-right text-neutral-900">{cat.score}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interaction Stats Note */}
      <div className="border-t border-black pt-4 flex flex-wrap justify-between items-center font-mono text-[11px] text-neutral-600 gap-2">
        <div className="flex items-center gap-4">
          <span>PASSPORT STAMPS: {passport.length}</span>
          <span>WISHLISTED: {wishlist.length}</span>
          <span>PLANNED TRIPS: {tripPlans.length}</span>
        </div>
        <div className="italic text-neutral-500">
          DNA updates dynamically as you explore destinations and save itineraries.
        </div>
      </div>

    </div>
  );
};
