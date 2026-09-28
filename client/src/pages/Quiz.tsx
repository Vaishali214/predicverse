import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Compass, RefreshCw, ArrowRight, Award, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { QuizResult } from '../types';
import { COUNTRIES_DATA } from '../data/countries';

export const Quiz: React.FC = () => {
  const { saveQuizResult } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [completedResult, setCompletedResult] = useState<{
    personalityType: string;
    description: string;
    recommendedCountryIds: string[];
  } | null>(null);

  const questions = [
    {
      title: "WHAT IS YOUR IDEAL MORNING DISPATCH?",
      options: [
        { text: "Exploring ancient stone ruins & thousand-year-old temples", archetype: "Heritage Scholar" },
        { text: "Sipping fresh espresso in an outdoor street cafe while people-watching", archetype: "Culinary Connoisseur" },
        { text: "Riding a high-speed bullet train through neon-lit metropolises", archetype: "Modern Futurist" },
        { text: "Hiking quiet coastal mountain trails looking out over the ocean", archetype: "Wilderness Wanderer" }
      ]
    },
    {
      title: "WHEN CHOOSING DINNER, WHAT TAKES PRIORITY?",
      options: [
        { text: "Authentic street food stalls cooked over open flames with rich spices", archetype: "Culinary Connoisseur" },
        { text: "Michelin-starred multi-course tasting menus with fine wine pairing", archetype: "Culinary Connoisseur" },
        { text: "Historic traditional recipes served in family-run taverns", archetype: "Heritage Scholar" },
        { text: "Quick food markets offering innovative modern fusion bites", archetype: "Modern Futurist" }
      ]
    },
    {
      title: "HOW DO YOU PREFER TO NAVIGATE A NEW CITY?",
      options: [
        { text: "Getting intentionally lost on foot through medieval cobblestone alleyways", archetype: "Heritage Scholar" },
        { text: "Following a meticulously planned timetable via ultra-efficient subway trains", archetype: "Modern Futurist" },
        { text: "Renting a vintage scooter to ride along coastal highways", archetype: "Wilderness Wanderer" },
        { text: "Hopping between local artisan bakeries, markets, and specialty coffee roasters", archetype: "Culinary Connoisseur" }
      ]
    },
    {
      title: "WHAT IS YOUR MUST-HAVE TRAVEL SOUVENIR?",
      options: [
        { text: "Hand-crafted textiles, ceramics, or antique historical artifacts", archetype: "Heritage Scholar" },
        { text: "Local spices, artisanal olive oils, or regional wine bottles", archetype: "Culinary Connoisseur" },
        { text: "Cutting-edge gadgets, limited-edition anime art, or high fashion", archetype: "Modern Futurist" },
        { text: "Stunning landscape photographs and natural botanical samples", archetype: "Wilderness Wanderer" }
      ]
    }
  ];

  const handleSelectOption = (index: number) => {
    const newAnswers = [...answers, index];
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate Result Archetype
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (finalAnswers: number[]) => {
    // Count archetypes
    const counts: Record<string, number> = {};
    finalAnswers.forEach((ansIndex, qIndex) => {
      const arch = questions[qIndex].options[ansIndex].archetype;
      counts[arch] = (counts[arch] || 0) + 1;
    });

    let topArchetype = "Heritage Scholar";
    let maxCount = 0;
    Object.entries(counts).forEach(([arch, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topArchetype = arch;
      }
    });

    let resultObj = {
      personalityType: "THE HERITAGE SCHOLAR",
      description: "You thrive on ancient architecture, timeless folklore, sacred temples, and deep historical narratives.",
      recommendedCountryIds: ['india', 'italy']
    };

    if (topArchetype === "Culinary Connoisseur") {
      resultObj = {
        personalityType: "THE CULINARY CONNOISSEUR",
        description: "Your travels are guided by flavor profiles, vibrant street markets, regional spices, and legendary gastronomy.",
        recommendedCountryIds: ['france', 'india', 'italy']
      };
    } else if (topArchetype === "Modern Futurist") {
      resultObj = {
        personalityType: "THE MODERN FUTURIST",
        description: "You love high-tech skylines, efficient public transit, cutting-edge art museums, and fast-paced city energy.",
        recommendedCountryIds: ['japan', 'usa']
      };
    } else if (topArchetype === "Wilderness Wanderer") {
      resultObj = {
        personalityType: "THE WILDERNESS WANDERER",
        description: "You are drawn to majestic national parks, dramatic mountain ranges, coastal cliffs, and pristine nature.",
        recommendedCountryIds: ['usa', 'france']
      };
    }

    setCompletedResult(resultObj);

    // Save to AppContext
    const newQuizResult: QuizResult = {
      id: 'quiz_' + crypto.randomUUID(),
      userId: 'usr_local',
      personalityType: resultObj.personalityType,
      answers: finalAnswers,
      recommendations: resultObj.recommendedCountryIds,
      createdAt: new Date().toISOString(),
    };
    saveQuizResult(newQuizResult);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers([]);
    setCompletedResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="border-b-4 border-black pb-6 space-y-2 text-center">
        <span className="font-mono text-xs font-bold text-red-700 uppercase tracking-widest px-3 py-1 bg-neutral-100 border border-black inline-block">
          EDITORIAL DIAGNOSTIC TOOL
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-black uppercase text-black">
          TRAVEL PERSONALITY QUIZ
        </h1>
        <p className="font-body text-sm text-neutral-700 max-w-xl mx-auto">
          Answer four quick editorial queries to identify your wanderlust archetype and discover your ideal destination matches.
        </p>
      </div>

      {!completedResult ? (
        /* Quiz Active Step */
        <div className="border-4 border-black bg-white p-6 sm:p-10 newsprint-texture space-y-6 hard-shadow-hover">
          
          {/* Progress Bar */}
          <div className="flex justify-between items-center font-mono text-xs font-bold border-b border-black pb-2">
            <span>QUERY #{currentStep + 1} OF {questions.length}</span>
            <span className="text-red-700">PROGRESS: {Math.round(((currentStep + 1) / questions.length) * 100)}%</span>
          </div>

          {/* Question Title */}
          <h2 className="font-serif text-2xl sm:text-3xl font-black uppercase text-black">
            {questions[currentStep].title}
          </h2>

          {/* Options list */}
          <div className="space-y-3 pt-2">
            {questions[currentStep].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className="w-full text-left p-4 border-2 border-black bg-[#F5F5F0] hover:bg-black hover:text-white transition-all font-sans font-bold text-xs uppercase flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-black text-white group-hover:bg-white group-hover:text-black flex items-center justify-center font-mono text-xs">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt.text}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>

        </div>
      ) : (
        /* Quiz Result Card */
        <div className="border-4 border-black bg-white p-8 newsprint-texture space-y-6 hard-shadow-hover text-center">
          <Award className="w-16 h-16 text-red-700 mx-auto" />
          
          <div>
            <span className="font-mono text-xs font-bold text-neutral-500 uppercase">
              DIAGNOSTIC ARCHETYPE RESULT
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-black uppercase text-black mt-1">
              {completedResult.personalityType}
            </h2>
          </div>

          <p className="font-body text-base text-neutral-800 max-w-xl mx-auto border-y-2 border-black py-4 italic">
            "{completedResult.description}"
          </p>

          {/* Recommended Countries */}
          <div className="space-y-4 pt-2">
            <h3 className="font-serif text-xl font-bold uppercase text-black">
              YOUR TOP RECOMMENDED DESTINATION MATCHES
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {completedResult.recommendedCountryIds.map(id => {
                const country = COUNTRIES_DATA.find(c => c.id === id);
                if (!country) return null;
                return (
                  <div key={country.id} className="border-2 border-black p-4 bg-[#F5F5F0] space-y-2 text-left">
                    <div className="flex justify-between items-center border-b border-black pb-1">
                      <span className="text-3xl">{country.flag}</span>
                      <h4 className="font-serif font-black text-xl uppercase text-black">{country.name}</h4>
                    </div>
                    <p className="font-body text-xs text-neutral-700 line-clamp-2">{country.description}</p>
                    <Link
                      to={`/country/${country.id}`}
                      className="block text-center py-2 bg-black text-white font-sans text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors"
                    >
                      EXPLORE {country.name.toUpperCase()} →
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-200 text-black font-sans text-xs font-bold uppercase border-2 border-black hover:bg-black hover:text-white transition-colors cursor-pointer mt-4"
          >
            <RefreshCw className="w-4 h-4" /> RETAKE PERSONALITY QUIZ
          </button>

        </div>
      )}

    </div>
  );
};
