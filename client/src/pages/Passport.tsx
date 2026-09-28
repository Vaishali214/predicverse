import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, Globe, Printer } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VintagePassport } from '../components/VintagePassport';
import { COUNTRIES_DATA } from '../data/countries';

export const Passport: React.FC = () => {
  const { wishlist, removeFromWishlist } = useApp();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      
      {/* Physical Vintage Booklet & Travel DNA */}
      <VintagePassport />

      {/* Wishlist Saved Items Section */}
      <div className="space-y-4 pt-6 border-t-4 border-black">
        <div className="flex justify-between items-center border-b-2 border-black pb-2">
          <div>
            <div className="font-mono text-xs font-bold text-red-700 uppercase tracking-widest">
              SAVED DESTINATIONS ARCHIVE
            </div>
            <h2 className="font-serif text-3xl font-black uppercase text-black flex items-center gap-2">
              <Bookmark className="w-6 h-6 text-black" /> WISHLIST ({wishlist.length})
            </h2>
          </div>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-black text-white font-mono text-xs font-bold uppercase cursor-pointer hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT DOSSIER</span>
          </button>
        </div>

        {wishlist.length === 0 ? (
          <div className="border-2 border-black p-8 bg-[#F5F5F0] text-center space-y-2 newsprint-texture">
            <p className="font-serif text-sm font-bold text-neutral-700">YOUR WISHLIST ARCHIVE IS CURRENTLY EMPTY.</p>
            <p className="font-mono text-xs text-neutral-500">Explore destination gazettes and save places to plan future journeys.</p>
            <Link to="/explore" className="inline-block px-4 py-2 bg-black text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-red-700">
              BROWSE DESTINATIONS
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wishlist.map((item) => {
              const country = COUNTRIES_DATA.find(c => c.id === item.destinationId);
              return (
                <div key={item.id} className="border-2 border-black bg-white p-4 flex justify-between items-center hard-shadow-hover newsprint-texture">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{country?.flag || '🌍'}</span>
                    <div>
                      <h4 className="font-serif font-black text-lg uppercase text-black">
                        {item.destinationName}
                      </h4>
                      <span className="font-mono text-[10px] text-neutral-500">
                        SAVED ON {new Date(item.addedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {country && (
                      <Link
                        to={`/country/${country.id}`}
                        className="px-3 py-1.5 bg-black text-white font-mono text-xs font-bold uppercase hover:bg-red-700 transition-colors"
                      >
                        GAZETTE
                      </Link>
                    )}
                    <button
                      onClick={() => removeFromWishlist(item.destinationId)}
                      className="p-1.5 border border-black hover:bg-red-100 text-red-700 cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
