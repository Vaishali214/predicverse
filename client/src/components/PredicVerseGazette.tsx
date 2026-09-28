import React from 'react';
import { Country, State, City } from '../types';
import { ClassifiedDestination } from './ClassifiedDestination';
import { Compass, BookOpen, AlertTriangle, Lightbulb, Utensils, Shield, MapPin, Award, CheckCircle, Info } from 'lucide-react';

interface PredicVerseGazetteProps {
  country?: Country;
  state?: State;
  city?: City;
}

export const PredicVerseGazette: React.FC<PredicVerseGazetteProps> = ({ country, state, city }) => {
  const destName = city?.name || state?.name || country?.name || 'Kyoto';
  const countryName = country?.name || 'Japan';
  const flag = country?.flag || '🎌';
  const capital = country?.capital || 'Tokyo';
  const population = country?.population || '125 Million';
  const currency = country?.currency || 'Japanese Yen (JPY ¥)';
  const bestTime = country?.bestTimeToVisit || 'Spring (March–May) & Autumn (Sept–Nov)';

  // Dynamic Headline Generation
  const headline = city
    ? `${city.name}'s Hidden Alleys & Secrets Await`
    : state
    ? `${state.name}: Where Ancient Heritage Meets Uncharted Beauty`
    : country
    ? `${country.name}'s Timeless Magic Unveiled`
    : "Kyoto's Hidden Streets Await";

  // Story introduction text
  const editorialIntro = city?.overview || state?.description || country?.description ||
    `Across the historic expanse of ${destName}, timeless traditions whisper through narrow lantern-lit streets and centuries-old architectural marvels. Travelers who step beyond standard guidebooks find an enchanting world of culture, local culinary mastery, and untouched secrets.`;

  const historyText = state?.history || country?.history ||
    `Rooted in ancient dynasties, monumental trade routes, and profound spiritual transformations, ${destName} has weathered centuries of cultural evolution to become a crown jewel of global human heritage.`;

  const cultureText = state?.culture || country?.culture ||
    `Life in ${destName} revolves around deep-seated community respect, artistic mastery, seasonal festivals, and a harmonious balance between sacred traditions and modern life.`;

  const foods = country?.foods || [
    { name: 'Ramen & Gyoza', type: 'must-try', description: 'Rich pork or miso broth noodles served with pan-fried dumplings.' },
    { name: 'Sushi & Sashimi', type: 'specialty', description: 'Freshly sliced ocean fish served over seasoned vinegared rice.' },
    { name: 'Matcha Sweets', type: 'dessert', description: 'Artisanal stone-ground green tea parfaits and traditional wagashi.' }
  ];

  const travelTips = country?.travelTips || [
    'Always carry small local currency notes for traditional family-owned shops.',
    'Respect local quiet hours on public transport and in residential neighborhoods.',
    'Learn three basic local greetings to express sincere gratitude.'
  ];

  const funFacts = country?.funFacts || [
    `Home to over several ancient UNESCO heritage sites and protected landscapes.`,
    `Local culinary traditions place immense pride on hyper-seasonal ingredients.`,
    `Voted among the safest and most hospitable destinations for global solo travelers.`
  ];

  const dosAndDonts = country?.dosAndDonts || {
    dos: [
      'Take off shoes when entering traditional accommodations or wooden temples.',
      'Accept gifts or business cards with both hands as a sign of respect.',
      'Keep trash until you find designated waste sorting bins.'
    ],
    donts: [
      'Do not talk loudly on public transport during commuting hours.',
      'Do not leave tips at traditional dining establishments.',
      'Do not touch or disturb sacred shrines, relics, or ancient artifacts.'
    ]
  };

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <article className="max-w-6xl mx-auto border-8 border-black bg-[#FAF9F5] p-4 sm:p-8 md:p-12 newsprint-texture shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-[#111111] selection:bg-black selection:text-white relative">
      
      {/* Newspaper Top Header Line */}
      <div className="border-b-2 border-black pb-2 mb-4 flex flex-wrap justify-between items-center font-mono text-[11px] uppercase font-bold tracking-widest text-neutral-800">
        <div>VOL. CXXVI — ISSUE NO. 842</div>
        <div className="hidden sm:block">PRINTED IN THE PREDICVERSE GAZETTE PRESS</div>
        <div>{currentDateStr}</div>
      </div>

      {/* Main Gazette Masthead Title */}
      <div className="text-center border-b-4 border-black pb-6 mb-6">
        <div className="flex items-center justify-center gap-3 font-mono text-xs font-black uppercase text-red-700 tracking-[0.2em] mb-1">
          <Award className="w-4 h-4" />
          <span>SPECIAL DEDICATED DESTINATION GAZETTE</span>
          <Award className="w-4 h-4" />
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-none text-black">
          THE PREDICVERSE GAZETTE
        </h1>
        <div className="mt-3 py-1.5 border-y border-black font-sans text-xs sm:text-sm font-extrabold uppercase tracking-[0.3em] bg-white inline-block px-6">
          SPECIAL EDITION: {destName.toUpperCase()}, {countryName.toUpperCase()} {flag}
        </div>
      </div>

      {/* Headline Banner */}
      <div className="text-center my-6 py-4 border-b-2 border-black">
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight leading-tight uppercase">
          "{headline}"
        </h2>
        <p className="font-serif italic text-base sm:text-lg text-neutral-700 mt-2 max-w-3xl mx-auto">
          An exclusive chronicle on the cultural wonders, local gastronomy, secret passages, and travel wisdom of {destName}.
        </p>
      </div>

      {/* Key Gazette Fact Box */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-white border-2 border-black font-mono text-xs mb-8 shadow-sm">
        <div>
          <span className="block text-[10px] text-neutral-500 uppercase font-bold">CAPITAL / HUB</span>
          <strong className="text-black">{capital}</strong>
        </div>
        <div>
          <span className="block text-[10px] text-neutral-500 uppercase font-bold">POPULATION</span>
          <strong className="text-black">{population}</strong>
        </div>
        <div>
          <span className="block text-[10px] text-neutral-500 uppercase font-bold">LOCAL CURRENCY</span>
          <strong className="text-black">{currency}</strong>
        </div>
        <div>
          <span className="block text-[10px] text-neutral-500 uppercase font-bold">OPTIMAL SEASON</span>
          <strong className="text-black">{bestTime}</strong>
        </div>
      </div>

      {/* 3-Column Newspaper Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        
        {/* COLUMN 1: EDITORIAL & HISTORY */}
        <div className="space-y-6 border-b lg:border-b-0 lg:border-r border-black pb-6 lg:pb-0 lg:pr-6">
          
          {/* Section 1: Lead Editorial */}
          <section className="space-y-3">
            <div className="font-mono text-xs font-black uppercase tracking-widest text-red-700 border-b border-black pb-1 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>EDITORIAL INTRODUCTION</span>
            </div>
            <p className="font-serif text-sm leading-relaxed text-justify text-neutral-900 first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:leading-none first-letter:font-serif">
              {editorialIntro}
            </p>
          </section>

          {/* Section 2: Historical Chronicles */}
          <section className="space-y-3 pt-4 border-t border-dashed border-neutral-400">
            <div className="font-mono text-xs font-black uppercase tracking-widest text-black border-b border-black pb-1 flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              <span>HISTORICAL ORIGINS</span>
            </div>
            <p className="font-serif text-xs leading-relaxed text-neutral-800 text-justify">
              {historyText}
            </p>
          </section>

          {/* Section 3: Cultural Tapestry */}
          <section className="space-y-3 pt-4 border-t border-dashed border-neutral-400">
            <div className="font-mono text-xs font-black uppercase tracking-widest text-black border-b border-black pb-1 flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>CULTURE & TRADITIONS</span>
            </div>
            <p className="font-serif text-xs leading-relaxed text-neutral-800 text-justify">
              {cultureText}
            </p>
          </section>

          {/* Editorial Stamp */}
          <div className="p-4 bg-white border border-black text-center space-y-1 rotate-[-1deg]">
            <div className="font-mono text-[10px] font-black text-red-700 uppercase tracking-widest">
              ★ OFFICIAL PREDICVERSE GAZETTE SEAL ★
            </div>
            <div className="font-serif text-xs font-bold uppercase text-black">
              VERIFIED EDITORIAL REPORT
            </div>
          </div>
        </div>

        {/* COLUMN 2: MUST-SEE PLACES & GASTRONOMY */}
        <div className="space-y-6 border-b lg:border-b-0 lg:border-r border-black pb-6 lg:pb-0 lg:pr-6">
          
          {/* Must See Places */}
          <section className="space-y-3">
            <div className="font-mono text-xs font-black uppercase tracking-widest text-red-700 border-b border-black pb-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>MUST-SEE LANDMARKS & SPOTS</span>
            </div>
            <div className="space-y-2">
              {(country?.topLandmarks || city?.attractions || state?.touristPlaces || ['Historic District', 'Central Cultural Temple', 'Panoramas & Outlooks']).slice(0, 4).map((place, idx) => (
                <div key={idx} className="p-2.5 bg-white border border-black flex items-start gap-2">
                  <span className="font-mono font-black text-xs text-red-700 bg-red-50 px-1.5 py-0.5 border border-red-200">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-serif text-xs font-bold text-black uppercase">{place}</h4>
                    <p className="font-sans text-[11px] text-neutral-600">Essential visitor experience in {destName}.</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Local Gastronomy */}
          <section className="space-y-3 pt-4 border-t border-dashed border-neutral-400">
            <div className="font-mono text-xs font-black uppercase tracking-widest text-black border-b border-black pb-1 flex items-center gap-1.5">
              <Utensils className="w-4 h-4" />
              <span>LOCAL GASTRONOMY & DELICACIES</span>
            </div>
            <div className="space-y-3">
              {foods.slice(0, 3).map((food, idx) => (
                <div key={idx} className="p-3 bg-white border border-black space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-serif text-xs font-black text-black uppercase">{food.name}</span>
                    <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 bg-neutral-100 text-neutral-700 uppercase border border-neutral-300">
                      {food.type}
                    </span>
                  </div>
                  <p className="font-sans text-[11px] text-neutral-700">{food.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Newspaper Pull Quote */}
          <blockquote className="p-4 border-y-2 border-black italic font-serif text-sm text-center text-neutral-900 bg-amber-50/50">
            "To travel through {destName} is to witness history breathing alongside modern wonder."
          </blockquote>
        </div>

        {/* COLUMN 3: CLASSIFIED GEMS, TIPS, ETIQUETTE & FACTS */}
        <div className="space-y-6">
          
          {/* Traveler Tips & Etiquette */}
          <section className="space-y-3">
            <div className="font-mono text-xs font-black uppercase tracking-widest text-red-700 border-b border-black pb-1 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" />
              <span>ESSENTIAL TRAVELER WISDOM</span>
            </div>
            <ul className="space-y-2 font-sans text-xs">
              {travelTips.map((tip, idx) => (
                <li key={idx} className="p-2.5 bg-white border border-black flex items-start gap-2">
                  <span className="font-mono text-red-700 font-bold">•</span>
                  <span className="text-neutral-800 leading-snug">{tip}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Things to Avoid / Hazards */}
          <section className="space-y-3 pt-4 border-t border-dashed border-neutral-400">
            <div className="font-mono text-xs font-black uppercase tracking-widest text-black border-b border-black pb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>THINGS TO AVOID & ETIQUETTE</span>
            </div>
            <div className="p-3 bg-red-50/60 border border-red-900/30 space-y-2 font-sans text-xs text-red-950">
              <strong className="block font-mono text-[10px] uppercase font-bold text-red-800">
                CRITICAL DOS &amp; DON'TS:
              </strong>
              {dosAndDonts.donts.slice(0, 3).map((dont, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="text-red-700 font-mono font-bold">✕</span>
                  <span>{dont}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Fascinating Facts */}
          <section className="space-y-3 pt-4 border-t border-dashed border-neutral-400">
            <div className="font-mono text-xs font-black uppercase tracking-widest text-black border-b border-black pb-1 flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              <span>INTERESTING GAZETTE FACTS</span>
            </div>
            <div className="space-y-2">
              {funFacts.map((fact, idx) => (
                <div key={idx} className="p-2.5 bg-white border border-black font-serif text-xs text-neutral-800">
                  <strong className="font-mono text-[10px] text-red-700 block uppercase">FACT #{idx + 1}</strong>
                  {fact}
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>

      {/* EMBEDDED FEATURE 3: CLASSIFIED DESTINATION AT BOTTOM OF GAZETTE */}
      <div className="mt-10">
        <ClassifiedDestination country={country} state={state} city={city} />
      </div>

      {/* Newspaper Footer Signoff */}
      <footer className="mt-8 pt-4 border-t-2 border-black flex flex-col sm:flex-row justify-between items-center gap-2 font-mono text-xs text-neutral-600 uppercase">
        <div>THE PREDICVERSE GAZETTE — ALL RIGHTS RESERVED</div>
        <div>PUBLISHED FOR THE GLOBAL EXPLORER</div>
      </footer>

    </article>
  );
};
