import React, { useState, useEffect } from 'react';
import { Truck, ShieldCheck, Sparkles, Clock, ArrowRight, Tag, Zap } from 'lucide-react';
import { StorePage } from '../types';

interface HeroBannerProps {
  onSelectPage: (page: StorePage) => void;
  onOpenAiModal: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectPage, onOpenAiModal }) => {
  // Flash Sale Timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 5, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-950 text-white rounded-3xl my-3 sm:my-4 mx-2 sm:mx-8 shadow-2xl border border-emerald-700/50">
      {/* Background Decorative Accents */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-12 py-6 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
        {/* Left Column Text Content */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left">
          {/* Top Badge */}
          <div className="inline-flex flex-wrap items-center gap-2 bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-2xl sm:rounded-full text-xs font-semibold text-amber-300 shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow shrink-0" />
            <span className="text-[11px] sm:text-xs">Lucknow’s Premium Supermarket • Behta Bazar</span>
            <span className="bg-amber-400 text-emerald-950 px-2 py-0.5 text-[10px] font-black rounded-full uppercase shrink-0">
              12 Min Express
            </span>
          </div>

          <h1 className="text-fluid-h1 font-black tracking-tight leading-[1.1] text-white">
            Fresh Groceries & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
              Daily Essentials
            </span>
          </h1>

          <p className="text-emerald-100 text-xs sm:text-base max-w-xl font-medium leading-relaxed">
            Order top-quality Atta, Oils, Dairy, Home Care & Household items directly from <span className="text-white font-bold underline decoration-amber-400">NKS Plaza, Lucknow</span>. Guaranteed delivery within 12 minute!
          </p>

          {/* Flash Sale Countdown Bar */}
          <div className="bg-emerald-950/60 border border-emerald-600/40 backdrop-blur-md p-3.5 rounded-2xl max-w-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400 animate-bounce" />
              <div>
                <p className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">Today's Flash Deals</p>
                <p className="text-[11px] text-emerald-200">Up to 50% Off on Groceries</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-xs font-extrabold text-gray-900">
              <span className="bg-amber-400 px-2 py-1 rounded-lg shadow-xs">
                {String(timeLeft.hours).padStart(2, '0')}h
              </span>
              <span className="text-amber-300 font-bold">:</span>
              <span className="bg-amber-400 px-2 py-1 rounded-lg shadow-xs">
                {String(timeLeft.minutes).padStart(2, '0')}m
              </span>
              <span className="text-amber-300 font-bold">:</span>
              <span className="bg-amber-400 px-2 py-1 rounded-lg shadow-xs">
                {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-btn-shop-now"
              onClick={() => onSelectPage('shop')}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-emerald-950 font-black text-sm px-6 py-3.5 rounded-2xl shadow-xl shadow-amber-400/20 transition-all hover:scale-105 active:scale-95"
            >
              <span>Explore Shop</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-btn-offers"
              onClick={() => onSelectPage('offers')}
              className="flex items-center gap-2 text-amber-300 hover:text-white font-bold text-xs px-4 py-3 rounded-2xl transition-colors"
            >
              <Tag className="w-4 h-4" />
              <span>View Offers</span>
            </button>
          </div>
        </div>

        {/* Right Column Featured Banner Graphic */}
        <div className="lg:col-span-5 relative">
          <div className="relative mx-auto max-w-sm rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-600/40 group">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
              alt="Sarv Mart Fresh Produce"
              className="w-full h-80 sm:h-96 object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/20 to-transparent"></div>

            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl text-gray-900 border border-white/40 shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Sarv Mart Special</span>
                <span className="text-xs bg-red-100 text-red-700 font-extrabold px-2 py-0.5 rounded-full">
                  FLAT 20% OFF
                </span>
              </div>
              <p className="font-extrabold text-sm text-gray-900">Farm Fresh Fruits & Organic Vegetables</p>
              <p className="text-[11px] text-gray-500 font-medium">Sourced daily from local farmers around Lucknow</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Value Props Banner Strip */}
      <div className="border-t border-emerald-700/60 bg-emerald-950/70 backdrop-blur-md px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium text-emerald-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-800 text-amber-300 rounded-xl">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-white text-xs">12 Minute Delivery</p>
            <p className="text-[11px] text-emerald-300">Express dispatch across Lucknow</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-800 text-amber-300 rounded-xl">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-white text-xs">100% Quality Assurance</p>
            <p className="text-[11px] text-emerald-300">Handpicked & sealed items</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-800 text-amber-300 rounded-xl">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-white text-xs">Wholesale Store Prices</p>
            <p className="text-[11px] text-emerald-300">Discounts on every MRP</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-800 text-amber-300 rounded-xl">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-white text-xs">Morning To Night</p>
            <p className="text-[11px] text-emerald-300">6:30 AM to 11:00 PM</p>
          </div>
        </div>
      </div>
    </section>
  );
};
