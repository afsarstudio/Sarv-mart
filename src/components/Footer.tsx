import React, { useState } from 'react';
import { StorePage, ViewMode } from '../types';
import { STORE_DETAILS } from '../data/mockData';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Truck,
  Store,
  Send,
  Heart,
  QrCode,
  CreditCard,
  Banknote,
  CheckCircle2
} from 'lucide-react';

interface FooterProps {
  onSelectView: (view: ViewMode) => void;
  onSelectPage: (page: StorePage) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectView, onSelectPage }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) setSubscribed(true);
  };

  return (
    <footer className="bg-gray-950 text-gray-300 border-t border-gray-800 text-xs font-sans mt-16 pt-12 pb-8 px-4 sm:px-8 text-left">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top Newsletter & Guarantee Row */}
        <div className="bg-emerald-950 border border-emerald-800/80 p-6 sm:p-8 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-2">
            <span className="text-[10px] bg-amber-400 text-emerald-950 font-black px-2.5 py-0.5 rounded-full uppercase">
              Sarv Mart Lucknow Newsletter
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Get Weekly Supermarket Discount Coupons
            </h3>
            <p className="text-xs text-emerald-200">
              Subscribe for exclusive flash deals on fresh fruits, daily groceries & household offers.
            </p>
          </div>

          <div className="md:col-span-5">
            {subscribed ? (
              <p className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Subscribed! Check your email for ₹100 discount coupon code.</span>
              </p>
            ) : (
              <form onSubmit={handleNewsletter} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email..."
                  className="flex-1 bg-gray-900 border border-emerald-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-400 font-medium"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 font-black px-4 py-2.5 rounded-xl hover:from-amber-500 hover:to-amber-600 shadow-md transition-all shrink-0"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-8">
          {/* Col 1: Brand & Contact */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-white p-1 border border-emerald-700/50 overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src={STORE_DETAILS.logoUrl}
                  alt={STORE_DETAILS.name}
                  className="w-full h-full object-contain rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Sarv<span className="text-emerald-500">Mart</span>
              </span>
            </div>

            <p className="text-gray-400 text-xs leading-relaxed">
              Sarv Mart is Lucknow’s leading multi-category supermarket. Shop groceries, home essentials, dairy, household items and personal care with guaranteed 12 minute home delivery.
            </p>

            <div className="space-y-2 text-xs text-gray-300 font-medium">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{STORE_DETAILS.address}</span>
              </p>

              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{STORE_DETAILS.phone}</span>
              </p>

              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{STORE_DETAILS.email}</span>
              </p>

              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{STORE_DETAILS.hours}</span>
              </p>
            </div>
          </div>

          {/* Col 2: Shop Categories */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">Top Categories</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button onClick={() => { onSelectView('storefront'); onSelectPage('shop'); }} className="hover:text-emerald-400">
                  Atta, Rice & Dals
                </button>
              </li>
              <li>
                <button onClick={() => { onSelectView('storefront'); onSelectPage('shop'); }} className="hover:text-emerald-400">
                  Edible Oils & Ghee
                </button>
              </li>
              <li>
                <button onClick={() => { onSelectView('storefront'); onSelectPage('shop'); }} className="hover:text-emerald-400">
                  Fresh Shimla Fruits
                </button>
              </li>
              <li>
                <button onClick={() => { onSelectView('storefront'); onSelectPage('shop'); }} className="hover:text-emerald-400">
                  Lucknow Daily Veggies
                </button>
              </li>
              <li>
                <button onClick={() => { onSelectView('storefront'); onSelectPage('shop'); }} className="hover:text-emerald-400">
                  Amul Dairy & Butter
                </button>
              </li>
              <li>
                <button onClick={() => { onSelectView('storefront'); onSelectPage('shop'); }} className="hover:text-emerald-400">
                  Household Detergents
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation & Systems */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">Platform Portals</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button onClick={() => onSelectView('storefront')} className="hover:text-emerald-400">
                  Customer Supermarket Website
                </button>
              </li>
              <li>
                <button onClick={() => onSelectView('pos')} className="hover:text-emerald-400 text-amber-300 font-bold">
                  POS Cashier Billing System
                </button>
              </li>
              <li>
                <button onClick={() => onSelectView('admin')} className="hover:text-emerald-400 text-indigo-300 font-bold">
                  Admin Dashboard & Reports
                </button>
              </li>
              <li>
                <button onClick={() => onSelectView('delivery')} className="hover:text-emerald-400 text-sky-300 font-bold">
                  Delivery Partner App
                </button>
              </li>
              <li>
                <button onClick={() => { onSelectView('storefront'); onSelectPage('track_order'); }} className="hover:text-emerald-400">
                  Live Order Tracker
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Store Location Map Card */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">Store Location Map</h4>
            <div className="bg-gray-900 p-3 rounded-2xl border border-gray-800 space-y-2">
              <div className="h-32 bg-emerald-950 rounded-xl relative overflow-hidden flex items-center justify-center border border-emerald-800">
                <MapPin className="w-8 h-8 text-amber-400 animate-bounce" />
                <span className="absolute bottom-2 left-2 text-[10px] bg-black/80 px-2 py-0.5 rounded text-emerald-300 font-mono">
                  NKS Plaza Behta Bazar LKO
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Visit our physical supermarket near SBI Bank Behta Bazar Lucknow (PIN 226026).
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-[11px]">
          <p>© {new Date().getFullYear()} Sarv Mart Lucknow. All Rights Reserved.</p>

          {/* Payment Badges */}
          <div className="flex items-center gap-3 font-semibold text-gray-400">
            <span className="flex items-center gap-1"><QrCode className="w-3.5 h-3.5 text-emerald-400" /> UPI</span>
            <span>•</span>
            <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5 text-blue-400" /> Visa / RuPay</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Banknote className="w-3.5 h-3.5 text-amber-400" /> Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
