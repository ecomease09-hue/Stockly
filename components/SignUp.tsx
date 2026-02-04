
import React from 'react';
import { useApp } from '../store/AppContext';
import { Package, ArrowRight, Store } from 'lucide-react';

const SignUp: React.FC = () => {
  const { openAuth } = useApp();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200 mb-8 text-white">
          <Package className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Start Your Shop</h1>
        <p className="text-slate-500 mb-10 font-medium leading-relaxed">Join the network of automated retailers globally.</p>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
          <div className="mb-8 flex flex-col items-center">
             <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <Store className="w-8 h-8" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enterprise Ready</p>
          </div>

          <button
            onClick={openAuth}
            className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 group"
          >
            Create My Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="mt-8 text-slate-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">
            Instant Deployment with <br/>
            <span className="text-slate-900">High-Availability Infrastructure</span>
          </p>
        </div>

        <div className="mt-12 text-center">
           <p className="text-sm font-bold text-slate-400">
              Already a member?{' '}
              <button onClick={openAuth} className="text-blue-600 hover:underline">Sign In Instead</button>
           </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
