
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, PLAN_LIMITS } from '../store/AppContext';
import { 
  Check, 
  ArrowLeft, 
  Zap, 
  Package, 
  Smartphone, 
  ShieldCheck, 
  HelpCircle,
  Clock,
  Rocket,
  Crown,
  MessageCircle,
  Loader2,
  X
} from 'lucide-react';

const Pricing: React.FC = () => {
  const { user, upgradePlan } = useApp();
  const navigate = useNavigate();
  const [modal, setModal] = useState<{ plan: string; method: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = (method: string, plan: string) => {
    setModal({ plan, method });
  };

  const confirmPayment = () => {
    setIsProcessing(true);
    // Simulate redirection and payment gateway response
    setTimeout(() => {
      upgradePlan(modal?.plan as any, modal?.method as any);
      setIsProcessing(false);
      setModal(null);
      // Navigate to dashboard after successful "simulation"
      navigate('/');
    }, 2000);
  };

  const PlanCard = ({ title, price, planKey, limits, features, popular = false, colorClass }: any) => {
    const isCurrent = user?.plan === planKey;
    const canUpgrade = !isCurrent && (
        (planKey === 'pro' && user?.plan === 'free') || 
        (planKey === 'premium' && (user?.plan === 'free' || user?.plan === 'pro'))
    );

    return (
      <div className={`relative flex flex-col p-8 bg-white rounded-[2.5rem] border-2 shadow-2xl transition-all duration-500 hover:-translate-y-2 ${popular ? 'border-blue-500 scale-105 z-10' : 'border-slate-50'}`}>
        {popular && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl animate-badge-bump">
            Most Popular
          </div>
        )}

        <div className="mb-8">
          <div className={`w-14 h-14 ${colorClass} rounded-2xl flex items-center justify-center mb-6 shadow-lg border-2 border-white`}>
            {planKey === 'free' && <Rocket className="w-7 h-7" />}
            {planKey === 'pro' && <Zap className="w-7 h-7" />}
            {planKey === 'premium' && <Crown className="w-7 h-7" />}
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
          <p className="text-slate-400 font-bold mt-1">Starting your retail journey</p>
        </div>

        <div className="mb-10">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black text-slate-900 tracking-tighter">PKR {price}</span>
            <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">{price === 0 ? '' : '/ month'}</span>
          </div>
        </div>

        <div className="space-y-6 mb-12 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b-2 border-slate-50 pb-2">Resource Limits</p>
          <ul className="space-y-4">
            <LimitItem value={limits.products} label="SKU / Products" />
            <LimitItem value={limits.vendors} label="Source Vendors" />
            <LimitItem value={limits.customers} label="Linked Customers" />
          </ul>

          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b-2 border-slate-50 pb-2 pt-4">Features</p>
          <ul className="space-y-4">
            {features.map((f: string, i: number) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100">
                  <Check className="w-3 h-3" />
                </div>
                <span className="text-sm font-bold text-slate-600">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          {isCurrent ? (
            <div className="w-full py-5 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-center border-2 border-dashed border-slate-200">
              Active Current Plan
            </div>
          ) : planKey === 'free' ? (
             <button 
              onClick={() => navigate('/')}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl active:scale-95"
            >
              Continue Free
            </button>
          ) : (
            <>
              <button 
                onClick={() => handlePayment('jazzcash', planKey)}
                className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 active:scale-95 flex items-center justify-center gap-3"
              >
                <Smartphone className="w-4 h-4" /> Pay with JazzCash
              </button>
              <button 
                onClick={() => handlePayment('easypaisa', planKey)}
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95 flex items-center justify-center gap-3"
              >
                <Smartphone className="w-4 h-4" /> Pay with Easypaisa
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const LimitItem = ({ value, label }: any) => (
    <li className="flex items-center gap-3">
      <div className="w-5 h-5 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100">
        <Package className="w-3 h-3" />
      </div>
      <span className="text-sm font-black text-slate-800">{value === Infinity ? 'Unlimited' : value}</span>
      <span className="text-sm font-bold text-slate-400">{label}</span>
    </li>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden">
      {/* Navbar */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b-2 border-slate-100 px-8 py-6 flex items-center justify-between sticky top-0 z-[60]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Rocket className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">Stockly <span className="text-blue-600">Premium</span></h1>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-6 py-3 border-2 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-24 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
            <ShieldCheck className="w-3 h-3" /> Professional Pakistani Retail Tool
          </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">The only tool your business <br/> will ever need.</h2>
          <p className="text-slate-500 font-bold text-lg max-w-lg mx-auto italic leading-relaxed">Unlock unlimited capacity and priority cloud infrastructure for your retail empire.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <PlanCard 
            title="Free Starter"
            price={0}
            planKey="free"
            limits={PLAN_LIMITS.free}
            features={['Basic Inventory Tracking', 'Customer Ledgers', 'Simple Invoicing']}
            colorClass="bg-slate-100 text-slate-500"
          />
          <PlanCard 
            title="Pro Growth"
            price={999}
            planKey="pro"
            limits={PLAN_LIMITS.pro}
            features={['Inventory Velocity Reports', 'Vendor Management', 'Priority Updates', 'Full Profit Analytics']}
            popular={true}
            colorClass="bg-blue-600 text-white"
          />
          <PlanCard 
            title="Enterprise Elite"
            price={2499}
            planKey="premium"
            limits={PLAN_LIMITS.premium}
            features={['Everything in Pro', 'Unlimited Global Scaling', 'Dedicated WhatsApp Support', 'Cloud Backups']}
            colorClass="bg-slate-900 text-white"
          />
        </div>

        <div className="mt-20 text-center space-y-12">
           <div className="flex flex-col items-center gap-4 p-8 bg-blue-50/50 rounded-[3rem] border-2 border-dashed border-blue-100 max-w-xl mx-auto">
              <Clock className="w-8 h-8 text-blue-600" />
              <p className="text-sm font-bold text-blue-800 italic">
                Note: All monthly plans require manual renewal after 30 days to maintain priority status.
              </p>
           </div>

           <div className="flex flex-col items-center gap-6">
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Need Assistance with Payment?</p>
              <button className="flex items-center gap-3 px-10 py-5 bg-[#25D366] text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-200 hover:brightness-110 transition-all active:scale-95">
                <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
              </button>
           </div>
        </div>
      </main>

      {/* Payment Modal */}
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-white rounded-[3.5rem] shadow-3xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
             <div className="p-10 border-b flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Confirm Payment</h3>
                <button onClick={() => setModal(null)} className="p-4 hover:bg-slate-50 rounded-2xl transition-all">
                  <X className="w-6 h-6 text-slate-300" />
                </button>
             </div>
             <div className="p-12 space-y-10">
                <div className="flex flex-col items-center text-center space-y-6">
                   <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-white shadow-2xl ${modal.method === 'jazzcash' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
                      <Smartphone className="w-10 h-10" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-2">Redirecting to</p>
                      <h4 className="text-3xl font-black text-slate-900 capitalize leading-none">{modal.method}</h4>
                   </div>
                </div>

                <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100 space-y-4">
                   <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                      <span>Service Tier</span>
                      <span className="uppercase text-slate-900 font-black tracking-widest">{modal.plan} Plan</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500">Duration</span>
                      <span className="text-xs font-black text-slate-900">30 Days</span>
                   </div>
                   <div className="pt-4 border-t-2 border-dashed border-slate-200 flex justify-between items-end">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grand Total</span>
                      <span className="text-3xl font-black text-slate-900 italic">Rs. {modal.plan === 'pro' ? '999' : '2,499'}</span>
                   </div>
                </div>

                <button 
                  onClick={confirmPayment}
                  disabled={isProcessing}
                  className="w-full py-6 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-black transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-4"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Open App'}
                </button>

                <p className="text-[9px] font-black text-slate-400 text-center uppercase tracking-widest leading-relaxed">
                  Secure transaction protected by <br/> standard 256-bit encryption.
                </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;
