import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Utensils } from 'lucide-react';
import { COUNTRIES_DATA } from '../data/countries';
import { WorldMap } from '../components/WorldMap';
import { WorldArticleOfTheDay } from '../components/WorldArticleOfTheDay';

export const Home: React.FC = () => {
  const secondCountry = COUNTRIES_DATA[1]; // Japan

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">

      {/* World Article of the Day Section */}
      <WorldArticleOfTheDay />

      {/* Secondary Dispatches & Interactive Quiz */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b-4 border-black pb-10">

        {/* Secondary Lead Story — Japan */}
        <div className="space-y-3 border-2 border-black bg-white p-5 hard-shadow-hover">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-600">
            ASIA DISPATCH {secondCountry.flag}
          </div>
          <h2 className="font-serif text-2xl font-black uppercase text-black hover:text-red-700 transition-colors">
            <Link to={`/country/${secondCountry.id}`}>
              {secondCountry.name}: THE HARMONY OF ZEN GARDENS &amp; NEON TOWERS
            </Link>
          </h2>
          <p className="font-body text-xs text-neutral-700 line-clamp-3">
            {secondCountry.description} Explore traditional tea houses in Kyoto and high-speed bullet trains traversing Mount Fuji.
          </p>
          <Link
            to={`/country/${secondCountry.id}`}
            className="inline-flex items-center gap-1 font-sans text-xs font-bold text-black hover:text-red-700 uppercase pt-1"
          >
            DISCOVER JAPAN <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Travel Personality Quiz Box */}
        <div className="p-5 bg-black text-white border-2 border-black space-y-3 hard-shadow-hover flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-red-400 font-mono text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="w-4 h-4" /> INTERACTIVE QUIZ
            </div>
            <h3 className="font-serif text-xl font-bold uppercase text-white leading-tight mt-2">
              WHAT IS YOUR TRAVEL PERSONALITY?
            </h3>
            <p className="font-body text-xs text-neutral-300 mt-2">
              Take our 1-minute diagnostic quiz to uncover your ideal travel archetype and custom-tailored destination recommendations.
            </p>
          </div>
          <Link
            to="/quiz"
            className="block text-center py-2 bg-white text-black font-sans text-xs font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-colors cursor-pointer mt-3"
          >
            TAKE THE QUIZ NOW →
          </Link>
        </div>

      </section>

      {/* World Map Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-black pb-2 gap-2">
          <div>
            <span className="font-mono text-xs font-bold text-red-700 uppercase tracking-widest">
              SECTION II • CARTOGRAPHY
            </span>
            <h2 className="font-serif text-3xl font-black uppercase text-black">
              GLOBAL DESTINATION MAP
            </h2>
          </div>
          <p className="font-body text-xs text-neutral-600 max-w-md">
            Click on any pin to inspect country details, regional maps, food guides, and travel itineraries.
          </p>
        </div>

        <WorldMap height="480px" />
      </section>

      {/* Grid of All Countries - Newsprint Cards */}
      <section className="space-y-6 pt-4">
        <div className="flex justify-between items-end border-b-2 border-black pb-2">
          <div>
            <span className="font-mono text-xs font-bold text-red-700 uppercase tracking-widest">
              SECTION III • GAZETTE CATALOG
            </span>
            <h2 className="font-serif text-3xl font-black uppercase text-black">
              FEATURED COUNTRIES &amp; CULTURES
            </h2>
          </div>
          <Link
            to="/explore"
            className="font-sans text-xs font-bold uppercase tracking-wider text-black hover:text-red-700 flex items-center gap-1"
          >
            VIEW ALL CATALOG ({COUNTRIES_DATA.length}) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COUNTRIES_DATA.slice(0, 3).map((country) => (
            <article
              key={country.id}
              className="border-2 border-black bg-white p-5 space-y-4 hard-shadow-hover flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-black pb-2">
                  <span className="text-4xl">{country.flag}</span>
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 border border-black bg-neutral-100 text-black">
                    {country.code}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-2xl font-black uppercase text-black">
                    {country.name}
                  </h3>
                  <p className="font-mono text-[11px] text-neutral-600 font-bold uppercase">
                    CAPITAL: {country.capital}
                  </p>
                </div>

                <p className="font-body text-xs text-neutral-700 line-clamp-3">
                  {country.description}
                </p>

                {/* Cultural Highlights */}
                <div className="bg-[#F5F5F0] p-3 border border-black text-xs font-sans space-y-1">
                  <div className="font-bold font-mono text-[10px] text-neutral-500 uppercase flex items-center gap-1">
                    <Utensils className="w-3 h-3 text-red-700" /> FAMOUS FOOD:
                  </div>
                  <div className="font-body text-xs font-bold text-black">
                    {country.foods.map(f => f.name).slice(0, 2).join(', ')}
                  </div>
                </div>
              </div>

              <Link
                to={`/country/${country.id}`}
                className="w-full text-center py-2.5 bg-black text-white font-sans text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors border border-black cursor-pointer block"
              >
                EXPLORE {country.name.toUpperCase()} →
              </Link>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
};
