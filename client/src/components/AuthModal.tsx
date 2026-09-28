import React, { useState } from 'react';
import { X, User, Lock, Mail, UserPlus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC = () => {
  const { isAuthOpen, setIsAuthOpen } = useApp();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  if (!isAuthOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'login') {
      const ok = await login(email, password);
      if (ok) {
        setSuccess('Successfully logged in!');
        setTimeout(() => setIsAuthOpen(false), 800);
      } else {
        setError('Invalid credentials. Try demo credentials below.');
      }
    } else {
      if (!name.trim()) {
        setError('Please enter your full name.');
        setLoading(false);
        return;
      }
      const ok = await register(name, email, password);
      if (ok) {
        setSuccess('Account created successfully!');
        setTimeout(() => setIsAuthOpen(false), 800);
      } else {
        setError('Registration failed. Please check details.');
      }
    }
    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setEmail('traveler@predicverse.com');
    setPassword('password123');
    setLoading(true);
    await login('traveler@predicverse.com', 'password123');
    setSuccess('Logged in with Demo Account!');
    setTimeout(() => setIsAuthOpen(false), 800);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[5000] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#F9F9F7] w-full max-w-md border-4 border-black hard-shadow-hover overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-black text-white p-4 flex justify-between items-center border-b border-black">
          <div>
            <h3 className="font-serif text-xl font-black uppercase tracking-wider">
              {mode === 'login' ? 'PASSPORT LOGIN' : 'NEW TRAVELER REGISTRATION'}
            </h3>
            <p className="font-mono text-[10px] text-neutral-400">
              OFFICIAL PREDICVERSE DISPATCH IMMIGRATION
            </p>
          </div>
          <button
            onClick={() => setIsAuthOpen(false)}
            className="p-1 hover:bg-neutral-800 border border-white cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 border-b-2 border-black font-sans text-xs font-bold uppercase">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`py-2.5 text-center cursor-pointer transition-colors ${
              mode === 'login' ? 'bg-[#F9F9F7] text-black border-b-2 border-red-700 font-extrabold' : 'bg-[#E5E5E0] text-neutral-600 hover:text-black'
            }`}
          >
            SIGN IN
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`py-2.5 text-center cursor-pointer transition-colors ${
              mode === 'register' ? 'bg-[#F9F9F7] text-black border-b-2 border-red-700 font-extrabold' : 'bg-[#E5E5E0] text-neutral-600 hover:text-black'
            }`}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-sans">
          {error && (
            <div className="p-3 bg-red-100 border-2 border-red-700 text-red-800 text-xs font-mono font-bold">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-100 border-2 border-green-700 text-green-800 text-xs font-mono font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {success}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amelia Earhart"
                  className="w-full pl-9 pr-3 py-2 border-2 border-black bg-white text-xs font-body focus:outline-none focus:bg-amber-50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="traveler@domain.com"
                className="w-full pl-9 pr-3 py-2 border-2 border-black bg-white text-xs font-body focus:outline-none focus:bg-amber-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 border-2 border-black bg-white text-xs font-body focus:outline-none focus:bg-amber-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-widest border-2 border-black hover:bg-red-700 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? 'PROCESSING...' : mode === 'login' ? 'STAMP PASSPORT (LOGIN)' : 'REGISTER PASSPORT'}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-400"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono bg-[#F9F9F7] px-2 text-neutral-500">
              OR QUICK DEMO ACCESS
            </div>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2 bg-neutral-200 text-black text-xs font-mono font-bold uppercase border border-black hover:bg-white transition-colors cursor-pointer"
          >
            🔑 LOGIN AS DEMO EXPLORER
          </button>
        </form>

      </div>
    </div>
  );
};
