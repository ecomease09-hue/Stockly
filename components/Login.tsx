
import React from 'react';
import { useApp } from '../store/AppContext';
import { Package, ArrowRight, ShieldCheck, UserPlus } from 'lucide-react';

const Login: React.FC = () => {
  const { openAuth } = useApp();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-600 rounded-[2.5rem] shadow-2xl shadow-blue-200 mb-10 text-white animate-in zoom-in duration-700">
          <Package className="w-12 h-12" />
        </div>
        
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-12 duration-1000">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Login or Sign Up</h1>
          <p className="text-slate-500 font-medium mb-10 italic">Access your Stockly Automator Terminal</p>

          <div className="flex items-center gap-3 justify-center mb-10 text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Secure Cloud Authentication</span>
          </div>
          
          <button
            onClick={openAuth}
            className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 hover:bg-black shadow-2xl transition-all active:scale-95 group"
          >
            Login / Signup <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="mt-10 pt-10 border-t border-slate-50 flex flex-col items-center gap-4">
             <div className="flex items-center gap-2 text-slate-400">
                <UserPlus className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">New users can register instantly</span>
             </div>
             <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto opacity-60">
                Managed by Netlify Identity Identity Protocol v1.0
             </p>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-8 opacity-20">
           <div className="h-px w-12 bg-slate-900"></div>
           <p className="text-[10px] font-black uppercase tracking-[0.5em]">Enterprise Edition</p>
           <div className="h-px w-12 bg-slate-900"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
