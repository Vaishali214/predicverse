import React, { useState } from 'react';
import { Scale, ArrowLeftRight, Check, X, Shield, Globe } from 'lucide-react';
import { COUNTRIES_DATA } from '../data/countries';
import { Country } from '../types';

export const Compare: React.FC = () => {
  const [countryAId, setCountryAId] = useState<string>('india');
  const [countryBId, setCountryBId] = useState<string>('japan');

  const countryA = COUNTRIES_DATA.find(c => c.id === countryAId) || COUNTRIES_DATA[0];
  const countryB = COUNTRIES_DATA.find(c => c.id === countryBId) || COUNTRIES_DATA[1];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="border-b-4 border-black pb-6 space-y-2">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-red-700 uppercase tracking-widest">
          <Scale className="w-4 h-4 text-red-700" />
          <span>SIDE-BY-SIDE ANALYTICS MATRIX</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-black uppercase text-black">
          COUNTRY COMPARISON TOOL
        </h1>
        <p className="font-body text-sm text-neutral-700 max-w-2xl">
          Compare key cultural metrics, climate types, currency rates, regional cuisine, emergency contacts, and travel parameters between any two nations.
        </p>
      </div>

      {/* Selector Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#F5F5F0] p-4 border-2 border-black">
        
        <div className="md:col-span-5">
          <label className="block font-mono text-xs font-bold uppercase text-black mb-1">
            FIRST COUNTRY (LEFT)
          </label>
          <select
            value={countryAId}
            onChange={(e) => setCountryAId(e.target.value)}
            className="w-full px-3 py-2 border border-black bg-white text-xs font-bold uppercase cursor-pointer"
          >
            {COUNTRIES_DATA.map(c => (
              <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 text-center">
          <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center mx-auto border-2 border-white font-mono font-bold text-xs">
            VS
          </div>
        </div>

        <div className="md:col-span-5">
          <label className="block font-mono text-xs font-bold uppercase text-black mb-1">
            SECOND COUNTRY (RIGHT)
          </label>
          <select
            value={countryBId}
            onChange={(e) => setCountryBId(e.target.value)}
            className="w-full px-3 py-2 border border-black bg-white text-xs font-bold uppercase cursor-pointer"
          >
            {COUNTRIES_DATA.map(c => (
              <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Comparison Matrix Table */}
      <div className="border-4 border-black bg-white overflow-hidden hard-shadow-hover">
        <table className="w-full text-left font-sans text-xs border-collapse">
          
          {/* Header Row */}
          <thead>
            <tr className="bg-black text-white border-b-2 border-black font-serif text-lg">
              <th className="p-4 w-1/4 uppercase tracking-wider font-bold">COMPARISON METRIC</th>
              <th className="p-4 w-3/8 uppercase tracking-wider font-bold border-l border-neutral-700 bg-neutral-900">
                <span className="mr-2 text-2xl">{countryA.flag}</span> {countryA.name}
              </th>
              <th className="p-4 w-3/8 uppercase tracking-wider font-bold border-l border-neutral-700">
                <span className="mr-2 text-2xl">{countryB.flag}</span> {countryB.name}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-black font-body text-xs">
            
            {/* Capital */}
            <tr className="bg-white">
              <td className="p-4 font-mono font-bold text-black uppercase bg-neutral-100">Capital City</td>
              <td className="p-4 font-bold text-black">{countryA.capital}</td>
              <td className="p-4 font-bold text-black">{countryB.capital}</td>
            </tr>

            {/* Population */}
            <tr className="bg-[#F5F5F0]">
              <td className="p-4 font-mono font-bold text-black uppercase bg-neutral-100">Population</td>
              <td className="p-4 font-mono">{countryA.population}</td>
              <td className="p-4 font-mono">{countryB.population}</td>
            </tr>

            {/* Currency */}
            <tr className="bg-white">
              <td className="p-4 font-mono font-bold text-black uppercase bg-neutral-100">Currency</td>
              <td className="p-4 font-mono font-bold text-red-800">{countryA.currency}</td>
              <td className="p-4 font-mono font-bold text-red-800">{countryB.currency}</td>
            </tr>

            {/* Languages */}
            <tr className="bg-[#F5F5F0]">
              <td className="p-4 font-mono font-bold text-black uppercase bg-neutral-100">Languages</td>
              <td className="p-4">{countryA.languages.join(', ')}</td>
              <td className="p-4">{countryB.languages.join(', ')}</td>
            </tr>

            {/* Climate */}
            <tr className="bg-white">
              <td className="p-4 font-mono font-bold text-black uppercase bg-neutral-100">Climate Type</td>
              <td className="p-4">{countryA.climate}</td>
              <td className="p-4">{countryB.climate}</td>
            </tr>

            {/* Government */}
            <tr className="bg-[#F5F5F0]">
              <td className="p-4 font-mono font-bold text-black uppercase bg-neutral-100">Government System</td>
              <td className="p-4">{countryA.government}</td>
              <td className="p-4">{countryB.government}</td>
            </tr>

            {/* Famous Food */}
            <tr className="bg-white">
              <td className="p-4 font-mono font-bold text-black uppercase bg-neutral-100">Signature Culinary Dish</td>
              <td className="p-4 font-bold">{countryA.foods[0]?.name} ({countryA.foods[0]?.description})</td>
              <td className="p-4 font-bold">{countryB.foods[0]?.name} ({countryB.foods[0]?.description})</td>
            </tr>

            {/* Key Festival */}
            <tr className="bg-[#F5F5F0]">
              <td className="p-4 font-mono font-bold text-black uppercase bg-neutral-100">Major Festival</td>
              <td className="p-4">🎉 {countryA.festivals[0]?.name} ({countryA.festivals[0]?.month})</td>
              <td className="p-4">🎉 {countryB.festivals[0]?.name} ({countryB.festivals[0]?.month})</td>
            </tr>

            {/* Emergency Hotline */}
            <tr className="bg-white">
              <td className="p-4 font-mono font-bold text-black uppercase bg-neutral-100">Police Hotline</td>
              <td className="p-4 font-mono font-bold text-red-700">{countryA.emergencyNumbers.police}</td>
              <td className="p-4 font-mono font-bold text-red-700">{countryB.emergencyNumbers.police}</td>
            </tr>

          </tbody>

        </table>
      </div>

    </div>
  );
};
