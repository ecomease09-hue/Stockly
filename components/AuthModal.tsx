import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { X, Package, ArrowRight, Mail, Lock, User } from 'lucide-react';

const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuth, loginWithCredentials } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password || (!isLogin && !name)) return;
    
    const usersDb = JSON.parse(localStorage.getItem('stockly_users_db') || '{}');

    if (isLogin) {
      const user = usersDb[email];
      if (!user) {
        setError('Account not found. Please sign up first.');
        return;
      }
      if (user.password !== password) {
        setError('Invalid password.');
        return;
      }
      loginWithCredentials(email, user.name);
    } else {
      if (usersDb[email]) {
        setError('Account already exists with this email.');
        return;
      }
      usersDb[email] = { email, password, name };
      localStorage.setItem('stockly_users_db', JSON.stringify(usersDb));
      loginWithCredentials(email, name);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[3.5rem] shadow-3xl w-full max-w-md overflow-hidden animate-in zoom-in duration-500 relative">
        <button 
          onClick={closeAuth} 
          className="absolute top-8 right-8 p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-xl transition-all z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-12 space-y-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto text-white shadow-2xl shadow-blue-200">
              <Package className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              {isLogin ? 'Access Terminal' : 'New Registration'}
            </h2>
            <p className="text-slate-400 font-bold text-sm">
              {isLogin ? 'Enter your credentials to continue' : 'Create your Stockly account'}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all" 
                    placeholder="John Doe" 
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all" 
                  placeholder="admin@stockly.com" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-5 mt-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl active:scale-95"
            >
              {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-6 border-t border-slate-100 text-center">
            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
