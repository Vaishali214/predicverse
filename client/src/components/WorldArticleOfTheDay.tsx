import React, { useState, useEffect } from 'react';
import { Globe, CheckCircle, ExternalLink, BookOpen, Clock, Calendar, X, ShieldCheck, Sparkles, MapPin } from 'lucide-react';
import { api } from '../services/api';
import { WorldArticle } from '../types';

export const WorldArticleOfTheDay: React.FC = () => {
  const [article, setArticle] = useState<WorldArticle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchArticle = async () => {
      try {
        const data = await api.getArticleOfTheDay();
        if (isMounted) setArticle(data);
      } catch {
        // Fallback error handling
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchArticle();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full border-2 border-black bg-white p-8 newsprint-texture text-center space-y-3">
        <div className="inline-block w-6 h-6 border-2 border-black border-t-red-700 rounded-full animate-spin"></div>
        <p className="font-mono text-xs font-bold text-neutral-600 uppercase">FETCHING TODAY'S VERIFIED WORLD DISPATCH...</p>
      </div>
    );
  }

  if (!article) return null;

  return (
    <section className="w-full my-8">
      {/* Container Outer Box with Hard Offset Shadow */}
      <div className="border-4 border-black bg-white newsprint-texture p-6 sm:p-8 space-y-6 relative hard-shadow-hover">
        
        {/* Editorial Top Bar: Live Status & Publication Date */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-black text-white px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse inline-block" />
              <span>LIVE DISPATCH • UPDATED TODAY</span>
            </div>
            <span className="font-mono text-xs font-bold text-neutral-700 hidden sm:inline">
              {article.publishDate}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] font-bold text-neutral-600 hidden md:inline">
              CATEGORY: {article.category.toUpperCase()}
            </span>
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 hover:bg-black hover:text-white border border-black font-mono text-[11px] font-bold text-black transition-colors cursor-pointer"
              title="Click to view verified original source"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-green-700" />
              <span>VERIFIED SOURCE</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Section Header Title */}
        <div className="flex items-center justify-between border-b border-neutral-300 pb-2">
          <div className="font-serif font-black text-xs uppercase tracking-[0.2em] text-red-700 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>WORLD ARTICLE OF THE DAY</span>
          </div>
          <div className="font-mono text-[11px] text-neutral-500 font-bold uppercase">
            DAILY FEATURE • {article.country.toUpperCase()}
          </div>
        </div>

        {/* Main Article Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Article Image & Caption (5 cols) */}
          <div className="lg:col-span-5 space-y-2">
            <div className="border-2 border-black bg-neutral-100 relative group overflow-hidden">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-64 sm:h-72 object-cover grayscale-img transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3 bg-black text-white px-2.5 py-1 font-mono text-xs font-bold border border-white flex items-center gap-1.5">
                <span className="text-sm">{article.flag}</span>
                <span>{article.countryCode}</span>
              </div>
              <div className="absolute bottom-3 right-3 bg-white/95 text-black px-2 py-0.5 font-mono text-[10px] font-bold border border-black flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{article.readTime}</span>
              </div>
            </div>
            <p className="font-mono text-[11px] text-neutral-600 italic border-l-2 border-black pl-2 py-0.5">
              📍 {article.location} — {article.imageCaption}
            </p>
          </div>

          {/* Article Editorial Content (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            <div className="space-y-2">
              <h2
                onClick={() => setIsModalOpen(true)}
                className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black text-black leading-tight uppercase hover:text-red-700 transition-colors cursor-pointer"
              >
                {article.title}
              </h2>
              <p className="font-serif text-sm sm:text-base italic text-neutral-700 leading-snug border-l-4 border-red-700 pl-3">
                "{article.subtitle}"
              </p>
            </div>

            {/* Drop-cap Abstract */}
            <p className="drop-cap font-body text-xs sm:text-sm text-neutral-800 leading-relaxed text-justify">
              {article.summary}
            </p>

            {/* Verified Highlights Box */}
            <div className="bg-[#F5F5F0] border border-black p-3.5 newsprint-texture space-y-2">
              <div className="font-serif font-extrabold text-xs uppercase text-black border-b border-black pb-1 flex items-center justify-between">
                <span>KEY FACTUAL HIGHLIGHTS</span>
                <span className="font-mono text-[10px] text-red-700">FACT-CHECKED</span>
              </div>
              <ul className="space-y-1 font-body text-xs text-neutral-800">
                {article.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-green-700 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-black text-white font-sans text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors border border-black flex items-center gap-2 cursor-pointer hard-shadow-hover"
              >
                <BookOpen className="w-4 h-4" />
                <span>READ FULL VERIFIED DOSSIER →</span>
              </button>

              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white text-black font-sans text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 transition-colors border border-black flex items-center gap-2 cursor-pointer"
              >
                <Globe className="w-4 h-4 text-neutral-700" />
                <span>SOURCE: {article.sourceName}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

        </div>

      </div>

      {/* Full Article Reading Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[5000] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F9F9F7] w-full max-w-3xl max-h-[85vh] border-4 border-black hard-shadow-hover overflow-y-auto flex flex-col newsprint-texture">
            
            {/* Modal Header */}
            <div className="p-4 border-b-2 border-black bg-white flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-red-700 uppercase">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span>VERIFIED GAZETTE ARTICLE DOSSIER</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-black hover:text-white border border-black transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Article Content */}
            <div className="p-6 sm:p-8 space-y-6 bg-white">
              
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-neutral-600 uppercase">
                  <span className="bg-black text-white px-2 py-0.5">{article.flag} {article.country}</span>
                  <span>•</span>
                  <span>{article.location}</span>
                  <span>•</span>
                  <span>{article.publishDate}</span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl font-black text-black uppercase leading-tight">
                  {article.title}
                </h1>
                <p className="font-serif text-base italic text-neutral-700 border-l-4 border-red-700 pl-3">
                  {article.subtitle}
                </p>
              </div>

              <div className="border-2 border-black overflow-hidden">
                <img src={article.imageUrl} alt={article.title} className="w-full h-72 object-cover" />
                <div className="bg-neutral-100 p-2 border-t border-black font-mono text-xs text-neutral-600 italic">
                  {article.imageCaption}
                </div>
              </div>

              <div className="font-body text-sm text-neutral-900 leading-relaxed space-y-4 text-justify drop-cap">
                {article.fullContent.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              <div className="bg-[#F5F5F0] border-2 border-black p-4 space-y-3">
                <div className="font-serif font-black text-sm uppercase text-black border-b border-black pb-1 flex items-center justify-between">
                  <span>OFFICIAL SOURCE AUDIT</span>
                  <span className="font-mono text-xs text-green-800 font-bold">✓ VERIFIED ACCURATE</span>
                </div>
                <p className="font-body text-xs text-neutral-700">
                  This dispatch is verified against authoritative reference databases including {article.sourceName}.
                </p>
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white font-sans text-xs font-bold uppercase hover:bg-red-700 transition-colors border border-black cursor-pointer"
                >
                  <span>VIEW EXTERNAL SOURCE AT {article.sourceName.toUpperCase()}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t-2 border-black bg-[#F5F5F0] flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-black text-white text-xs font-bold font-sans uppercase hover:bg-neutral-800 cursor-pointer"
              >
                CLOSE DOSSIER
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
