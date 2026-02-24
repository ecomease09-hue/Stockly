
import React from 'react';
import { useApp } from '../store/AppContext';
import { 
  Package, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Users, 
  Cpu, 
  Globe,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const { openAuth } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden font-sans">
      {/* Navigation Header */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
            <Package className="w-7 h-7" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter">Stockly</span>
        </div>
        <button 
          onClick={openAuth}
          className="px-8 py-3 bg-white border-2 border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95 shadow-sm"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-10 pb-20 px-8">
        {/* Ambient Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
              <Sparkles className="w-3 h-3" /> Powered by Gemini AI Intelligence
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.05]">
              Automate your <br/>
              <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">Retail Empire.</span>
            </h1>
            
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg italic">
              The all-in-one terminal for inventory synchronization, automated customer ledgers, and intelligent business insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={openAuth}
                className="px-10 py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 hover:bg-black shadow-3xl transition-all active:scale-95 group"
              >
                Launch App Terminal <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center gap-4 px-6 py-4 bg-white/50 backdrop-blur-md rounded-[2rem] border border-white">
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                      <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-900 uppercase">Trusted by Experts</p>
                  <p className="text-[9px] font-bold text-slate-400">1,200+ Active Shop Owners</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-8">
              <FeatureMinimal icon={Zap} label="Instant Sync" />
              <FeatureMinimal icon={ShieldCheck} label="Secure Cloud" />
              <FeatureMinimal icon={Globe} label="Multi-User" />
            </div>
          </div>

          {/* Integrated Login Section Card */}
          <div className="relative animate-in fade-in zoom-in-95 duration-1000">
             <div className="absolute inset-0 bg-blue-600/5 rounded-[4rem] blur-3xl transform rotate-3"></div>
             <div className="relative bg-white p-12 md:p-16 rounded-[4rem] shadow-4xl border border-white shadow-blue-900/5 space-y-10">
                <div className="text-center space-y-4">
                   <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto text-white shadow-2xl shadow-blue-200">
                      <Cpu className="w-10 h-10" />
                   </div>
                   <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Access Terminal</h2>
                   <p className="text-slate-400 font-bold text-sm">Secure biometric and cloud gateway</p>
                </div>

                <div className="space-y-6">
                   <button 
                    onClick={openAuth}
                    className="w-full py-6 bg-blue-50 text-blue-600 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-blue-100 transition-all border border-blue-100"
                   >
                     Login with Identity Provider
                   </button>
                   <button 
                    onClick={openAuth}
                    className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl active:scale-95"
                   >
                     New Registration
                   </button>
                </div>

                <div className="pt-10 border-t border-slate-50">
                   <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active Infrastructure</span>
                      <span className="flex items-center gap-1.5">
                         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                         <span className="text-[9px] font-black text-emerald-600 uppercase">System Online</span>
                      </span>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <BarChart3 className="w-5 h-5 text-blue-500 mb-2" />
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reports</p>
                         <p className="text-xs font-bold text-slate-700">Real-time Analytics</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <Users className="w-5 h-5 text-indigo-500 mb-2" />
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ledger</p>
                         <p className="text-xs font-bold text-slate-700">Auto-Balancing</p>
                      </div>
                   </div>
                </div>

                <div className="flex justify-center gap-4">
                   <ShieldCheck className="w-4 h-4 text-slate-300" />
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">256-bit Encrypted Archive</p>
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Feature Showcase */}
      <section className="bg-slate-900 py-32 px-8">
        <div className="max-w-7xl mx-auto space-y-24">
           <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none uppercase">Enterprise Features <br/><span className="text-blue-500">Local Pricing</span></h2>
              <div className="h-1.5 w-24 bg-blue-600 mx-auto rounded-full"></div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <LandingFeatureCard 
                title="AI Business Strategy" 
                desc="Predict stockouts and analyze sales trends with our integrated Gemini AI engine."
                icon={Sparkles}
                color="text-blue-400"
              />
              <LandingFeatureCard 
                title="Automated Ledgers" 
                desc="Never manual entries again. Customer and vendor accounts balance automatically after every sale."
                icon={BarChart3}
                color="text-emerald-400"
              />
              <LandingFeatureCard 
                title="Professional Billing" 
                desc="Generate beautiful PDF invoices with your shop logo and digital QR authentication."
                icon={Package}
                color="text-amber-400"
              />
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 text-center bg-white border-t border-slate-100">
         <div className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-3 grayscale opacity-30">
               <Package className="w-8 h-8" />
               <span className="text-xl font-black uppercase tracking-tighter">Stockly Terminal</span>
            </div>
            <p className="text-slate-400 text-sm font-medium">© {new Date().getFullYear()} Global Retail Systems Inc. All rights reserved.</p>
            <div className="flex gap-8">
               <a href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Privacy</a>
               <a href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Terms</a>
               <a href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Infrastructure</a>
            </div>
         </div>
      </footer>
    </div>
  );
};

const FeatureMinimal: React.FC<{ icon: any, label: string }> = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100">
      <Icon className="w-4 h-4" />
    </div>
    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{label}</span>
  </div>
);

const LandingFeatureCard: React.FC<{ title: string, desc: string, icon: any, color: string }> = ({ title, desc, icon: Icon, color }) => (
  <div className="p-10 bg-slate-800/50 border border-slate-700 rounded-[3rem] hover:bg-slate-800 transition-all group">
    <div className={`w-14 h-14 ${color} bg-white/5 rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-white/5 group-hover:scale-110 transition-transform`}>
      <Icon className="w-7 h-7" />
    </div>
    <h3 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase">{title}</h3>
    <p className="text-slate-400 font-medium leading-relaxed italic">{desc}</p>
    <div className="mt-8 pt-8 border-t border-slate-700 flex items-center justify-between">
       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Module Core v1.0</span>
       <CheckCircle2 className="w-4 h-4 text-emerald-500/50" />
    </div>
  </div>
);

export default LandingPage;
