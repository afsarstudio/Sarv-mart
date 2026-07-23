import React, { useState } from 'react';
import { Sparkles, Mic, Search, X, ChefHat, ShoppingBag, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { Product } from '../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  allProducts: Product[];
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
  allProducts,
}) => {
  if (!isOpen) return null;

  const [aiQuery, setAiQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    explanation: string;
    matchedProducts: Product[];
    recipeOrTips: string[];
  } | null>(null);

  // Preset Smart Prompts
  const samplePrompts = [
    'Ingredients for Paneer Butter Masala',
    'Healthy breakfast under ₹200',
    'Monthly grocery checklist for family',
    'Fresh fruit salad kit',
  ];

  const handleAiSearch = async (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;

    setIsLoading(true);
    setAiResult(null);

    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();

      if (data.success) {
        setAiResult({
          explanation: data.aiExplanation,
          matchedProducts: data.matchedProducts || [],
          recipeOrTips: data.recipeOrTips || [],
        });
      }
    } catch (err) {
      console.error('AI search failed', err);
      // Client-side fallback search
      const matched = allProducts.filter(
        p => p.name.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase())
      );
      setAiResult({
        explanation: `Here are matching Sarv Mart items for "${q}".`,
        matchedProducts: matched,
        recipeOrTips: ['Add all items to your cart with one click for express 12-hour delivery!'],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceListen = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice recognition is simulated for this browser session.');
      setAiQuery('Ingredients for Kadai Paneer and Atta');
      handleAiSearch('Ingredients for Kadai Paneer and Atta');
      return;
    }

    try {
      setIsListening(true);
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.start();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setAiQuery(transcript);
        setIsListening(false);
        handleAiSearch(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };
    } catch {
      setIsListening(false);
    }
  };

  const handleAddAllToCart = () => {
    if (aiResult?.matchedProducts) {
      aiResult.matchedProducts.forEach(p => onAddToCart(p));
      alert(`Added ${aiResult.matchedProducts.length} items to your cart!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400 text-emerald-950 rounded-2xl shadow-md font-black">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                <span>Sarv Mart Smart Product Search</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                Type or use voice search to quickly find groceries, brand items and daily household needs.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-emerald-200 hover:text-white rounded-full hover:bg-emerald-700/60 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input Box */}
        <div className="p-6 bg-gray-50 border-b border-gray-200 space-y-3">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-emerald-600" />
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAiSearch(aiQuery);
              }}
              placeholder='Try "Paneer Butter Masala recipe", "Dal and Mustard oil"...'
              className="w-full bg-white border-2 border-emerald-300 focus:border-emerald-600 rounded-2xl pl-12 pr-28 py-3.5 text-sm font-semibold text-gray-900 outline-none shadow-xs"
            />

            <div className="absolute right-2 flex items-center gap-1">
              <button
                type="button"
                onClick={handleVoiceListen}
                className={`p-2 rounded-xl transition-colors ${
                  isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                }`}
                title="Voice Search"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleAiSearch(aiQuery)}
                disabled={isLoading}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-2 rounded-xl"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find'}
              </button>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1">
            <span className="text-[11px] font-bold text-gray-400 shrink-0">Try:</span>
            {samplePrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setAiQuery(prompt);
                  handleAiSearch(prompt);
                }}
                className="text-[11px] font-semibold bg-white border border-gray-200 text-gray-700 hover:border-emerald-400 hover:text-emerald-800 px-2.5 py-1 rounded-full shrink-0 transition-colors shadow-xs"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-left">
          {isLoading && (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-sm font-bold text-gray-700">Sarv AI is analyzing your recipe request...</p>
            </div>
          )}

          {!isLoading && !aiResult && (
            <div className="py-10 text-center text-gray-500 space-y-2">
              <ChefHat className="w-12 h-12 text-emerald-200 mx-auto" />
              <p className="font-bold text-sm text-gray-800">Speak or type a dish name!</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                AI will match all fresh groceries, vegetables, and spices needed from Sarv Mart store in Behta Bazar Lucknow.
              </p>
            </div>
          )}

          {!isLoading && aiResult && (
            <div className="space-y-4">
              {/* AI Explanation Banner */}
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-950 font-medium space-y-1">
                <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>AI Supermarket Recommendation</span>
                </p>
                <p className="leading-relaxed">{aiResult.explanation}</p>
              </div>

              {/* Recipe Tips */}
              {aiResult.recipeOrTips.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-xs text-amber-900 space-y-1">
                  {aiResult.recipeOrTips.map((tip, idx) => (
                    <p key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </p>
                  ))}
                </div>
              )}

              {/* Matched Products List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-black text-sm text-gray-900">
                    Matched Ingredients ({aiResult.matchedProducts.length})
                  </h3>

                  {aiResult.matchedProducts.length > 0 && (
                    <button
                      onClick={handleAddAllToCart}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs"
                    >
                      + Add All To Cart
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {aiResult.matchedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between bg-gray-50 border border-gray-200 p-3 rounded-2xl hover:border-emerald-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-xl bg-white border border-gray-200"
                        />
                        <div>
                          <p className="font-bold text-xs text-gray-900">{product.name}</p>
                          <p className="text-[10px] text-gray-500">{product.unit} • ₹{product.price}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => onAddToCart(product)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
