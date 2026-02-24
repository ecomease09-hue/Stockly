
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { GoogleGenAI } from "@google/genai";
import { 
  Sparkles, 
  Send, 
  X, 
  MessageSquare, 
  Bot, 
  ChevronDown, 
  BrainCircuit,
  Zap,
  TrendingUp,
  AlertCircle,
  Loader2
} from 'lucide-react';

const GeminiAssistant: React.FC = () => {
  const { products, invoices, vendors, user } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const generateBusinessContext = () => {
    const stockSummary = products.map(p => `${p.name} (SKU: ${p.sku}): ${p.stockQuantity} units left, Min Threshold: ${p.lowStockThreshold}`).join('\n');
    const recentSales = invoices.slice(-10).map(i => `Inv #${i.invoiceNumber}: Rs. ${i.total} to ${i.customerName}`).join('\n');
    const vendorSummary = vendors.map(v => `${v.name}: Balance Owed Rs. ${v.totalBalance}`).join('\n');

    return `
      You are the Smart Business Consultant for "${user?.shopName}". 
      Current Store Owner: ${user?.name}.
      
      Here is the business snapshot:
      
      INVENTORY STATUS:
      ${stockSummary}
      
      RECENT SALES (Last 10):
      ${recentSales}
      
      VENDOR DEBTS:
      ${vendorSummary}
      
      Answer business questions accurately. Be concise. Suggest specific actions like "You should reorder [Product] because it's running low". 
      If asked about profit or growth, use the provided numbers. 
      You can communicate in English and provide Urdu translations if relevant for the local Pakistani context.
    `;
  };

  const handleAskGemini = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isTyping) return;

    const userText = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { role: 'user', parts: [{ text: generateBusinessContext() }] },
          { role: 'user', parts: [{ text: userText }] }
        ],
        config: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      });

      const aiText = response.text || "I apologize, I couldn't analyze the data right now.";
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "Error connecting to Intelligence Hub. Please check your network." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 z-[80] w-16 h-16 rounded-full bg-blue-600 text-white shadow-3xl shadow-blue-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group no-print ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <Sparkles className="w-8 h-8 group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full animate-pulse"></div>
      </button>

      {/* Assistant Window */}
      <div className={`fixed bottom-8 right-8 z-[90] w-full max-w-md bg-white rounded-[2.5rem] shadow-4xl border border-slate-100 overflow-hidden transition-all duration-500 ease-out transform origin-bottom-right no-print ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-90 pointer-events-none'}`}>
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl -mr-16 -mt-16"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/50">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black tracking-tighter text-lg leading-tight">Gemini Strategy</h3>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-3 h-3" /> Live Intelligence Active
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
            <ChevronDown className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="h-[450px] overflow-y-auto p-6 space-y-6 bg-slate-50/50 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 px-4">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center animate-bounce duration-[2000ms]">
                <Bot className="w-10 h-10" />
              </div>
              <div>
                <h4 className="font-black text-slate-800 text-xl tracking-tight">How can I help {user?.shopName}?</h4>
                <p className="text-slate-500 text-sm font-medium mt-2">Ask me about stock predictions, profitability, or vendor status.</p>
              </div>
              <div className="grid grid-cols-1 gap-2 w-full">
                <QuickAction text="Which products are selling fastest?" onClick={setQuery} />
                <QuickAction text="Summarize my current debts." onClick={setQuery} />
                <QuickAction text="Predict stockout for this week." onClick={setQuery} />
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] p-5 rounded-[1.8rem] text-sm font-medium shadow-sm ${
                m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
              }`}>
                {m.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-100 p-5 rounded-[1.8rem] rounded-bl-none shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Analyzing Data...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleAskGemini} className="p-6 bg-white border-t flex items-center gap-3">
          <input 
            type="text" 
            placeholder="Ask your assistant..." 
            className="flex-1 px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!query.trim() || isTyping}
            className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-black active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:grayscale"
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
      </div>
    </>
  );
};

const QuickAction: React.FC<{ text: string, onClick: (t: string) => void }> = ({ text, onClick }) => (
  <button 
    onClick={() => onClick(text)}
    className="w-full text-left px-5 py-3 bg-white border border-slate-100 hover:border-blue-500 hover:bg-blue-50 rounded-xl text-xs font-bold text-slate-600 transition-all flex items-center justify-between group"
  >
    {text}
    <ChevronDown className="w-4 h-4 text-slate-300 group-hover:text-blue-500 -rotate-90" />
  </button>
);

export default GeminiAssistant;
