import React from 'react';
import { UserProfile, Order, Product } from '../types';
import {
  User,
  ShoppingBag,
  Sparkles,
  Wallet,
  MapPin,
  Heart,
  RotateCcw,
  Receipt,
  Phone,
  Mail,
  CheckCircle2
} from 'lucide-react';

interface CustomerAccountViewProps {
  userProfile: UserProfile;
  orders: Order[];
  wishlistProducts: Product[];
  onReorder: (order: Order) => void;
  onRemoveFromWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const CustomerAccountView: React.FC<CustomerAccountViewProps> = ({
  userProfile,
  orders,
  wishlistProducts,
  onReorder,
  onRemoveFromWishlist,
  onAddToCart,
}) => {
  return (
    <div className="max-w-5xl mx-auto my-8 px-4 sm:px-8 text-left space-y-8 animate-fade-in">
      {/* Profile Card */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-900 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-amber-400 text-emerald-950 font-black rounded-3xl flex items-center justify-center text-2xl shadow-lg border-2 border-white/20">
            {userProfile.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-black">{userProfile.name}</h1>
            <p className="text-xs text-emerald-200 flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {userProfile.phone}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {userProfile.email}</span>
            </p>
          </div>
        </div>

        {/* Sarv Coins & Wallet Pill */}
        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl text-center min-w-[110px]">
            <p className="text-[10px] uppercase font-extrabold text-amber-300 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" /> Sarv Coins
            </p>
            <p className="text-xl font-black text-white">{userProfile.rewardPoints} pts</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl text-center min-w-[110px]">
            <p className="text-[10px] uppercase font-extrabold text-emerald-200 flex items-center justify-center gap-1">
              <Wallet className="w-3 h-3" /> Wallet
            </p>
            <p className="text-xl font-black text-amber-300">₹{userProfile.walletBalance}</p>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-emerald-600" />
          <span>Recent Supermarket Orders</span>
        </h2>

        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-gray-200 pb-2">
                <div>
                  <span className="font-extrabold text-gray-900 text-sm">{o.id}</span>
                  <span className="text-gray-500 font-mono ml-2">{o.createdAt.slice(0, 10)}</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full uppercase">
                  {o.status}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-1 text-xs text-gray-700">
                {o.items.map((it, idx) => (
                  <p key={idx}>• {it.product.name} ({it.quantity} {it.product.unit}) - ₹{it.product.price * it.quantity}</p>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-xs">
                <span className="font-black text-gray-900">Total: ₹{o.totalAmount}</span>
                <button
                  onClick={() => onReorder(o)}
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reorder All</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Wishlist */}
      {wishlistProducts.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span>My Saved Wishlist ({wishlistProducts.length})</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {wishlistProducts.map((p) => (
              <div key={p.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-gray-900 line-clamp-1">{p.name}</p>
                  <p className="text-xs font-black text-emerald-700">₹{p.price}</p>
                </div>
                <button
                  onClick={() => onAddToCart(p)}
                  className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl"
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
