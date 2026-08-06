import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Order, Product, ThemeMode, LoyaltyTransaction } from '../types';
import { generateInvoicePdf } from '../utils/generateInvoicePdf';
import {
  User,
  ShoppingBag,
  Heart,
  Download,
  RotateCcw,
  Sparkles,
  Wallet,
  Phone,
  Mail,
  Receipt,
  CheckCircle2,
  Eye,
  Printer,
  X,
  Share2,
  Award,
  Gift,
  Trophy,
  TrendingUp,
  History,
  Palette,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Check,
  Coins,
  Filter,
  FileSpreadsheet,
  ShoppingCart
} from 'lucide-react';

interface CustomerAccountViewProps {
  userProfile: UserProfile;
  orders: Order[];
  wishlistProducts: Product[];
  onReorder: (order: Order) => void;
  onRemoveFromWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  currentTheme?: ThemeMode;
  onSelectTheme?: (theme: ThemeMode) => void;
}

export const CustomerAccountView: React.FC<CustomerAccountViewProps> = ({
  userProfile,
  orders,
  wishlistProducts,
  onReorder,
  onRemoveFromWishlist,
  onAddToCart,
  currentTheme = 'emerald',
  onSelectTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'transactions' | 'theme' | 'wishlist'>('orders');
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);
  const [reorderingOrderId, setReorderingOrderId] = useState<string | null>(null);
  const [reorderToast, setReorderToast] = useState<{ id: string; count: number } | null>(null);

  const handleReorderWithAnimation = (order: Order) => {
    // Tactile haptic vibration feedback on supported mobile/touch devices
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([20, 35, 20]);
      } catch {
        // Fallback for browsers restricting vibration without user touch gesture
      }
    }

    setReorderingOrderId(order.id);
    const totalItemCount = order.items.reduce((acc, it) => acc + it.quantity, 0);
    setReorderToast({ id: order.id, count: totalItemCount });

    onReorder(order);

    setTimeout(() => {
      setReorderingOrderId(null);
    }, 2200);

    setTimeout(() => {
      setReorderToast(null);
    }, 4000);
  };

  // Transaction History Filters
  const [txnFilter, setTxnFilter] = useState<'ALL' | 'EARNED' | 'REDEEMED' | 'BONUS'>('ALL');
  const [txnSearch, setTxnSearch] = useState('');

  const handleDownloadPdf = (order: Order) => {
    try {
      setDownloadingOrderId(order.id);
      generateInvoicePdf(order, userProfile);
      setDownloadSuccessMsg(`Tax Invoice for #${order.id} downloaded successfully!`);
      setTimeout(() => setDownloadSuccessMsg(null), 4000);
    } catch {
      alert('Unable to generate PDF invoice. Printing invoice view...');
    } finally {
      setDownloadingOrderId(null);
    }
  };

  const handleDownloadCsv = () => {
    if (!orders || orders.length === 0) {
      alert('No order history available to export.');
      return;
    }

    const headers = [
      'Order ID',
      'Invoice Number',
      'Order Date',
      'Status',
      'Payment Method',
      'Payment Status',
      'Items Summary',
      'Total Items Count',
      'Subtotal (INR)',
      'Discount (INR)',
      'Delivery Fee (INR)',
      'Total Paid (INR)'
    ];

    const escapeCsv = (str: string | number | undefined) => {
      if (str === undefined || str === null) return '""';
      const stringified = String(str).replace(/"/g, '""');
      return `"${stringified}"`;
    };

    const rows = orders.map((o) => {
      const itemsSummary = o.items
        .map((it) => `${it.product.name} (x${it.quantity} ${it.product.unit || 'unit'})`)
        .join('; ');
      const totalItemsCount = o.items.reduce((acc, it) => acc + it.quantity, 0);

      return [
        escapeCsv(o.id),
        escapeCsv(o.invoiceNumber || o.id),
        escapeCsv(o.createdAt ? o.createdAt.slice(0, 10) : ''),
        escapeCsv(o.status),
        escapeCsv(o.paymentMethod),
        escapeCsv(o.paymentStatus || 'Paid'),
        escapeCsv(itemsSummary),
        escapeCsv(totalItemsCount),
        escapeCsv(o.subtotal ? o.subtotal.toFixed(2) : '0.00'),
        escapeCsv(o.discount ? o.discount.toFixed(2) : '0.00'),
        escapeCsv(o.deliveryFee ? o.deliveryFee.toFixed(2) : '0.00'),
        escapeCsv(o.totalAmount ? o.totalAmount.toFixed(2) : '0.00'),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SarvMart_Order_History_${userProfile.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccessMsg(`Order history CSV (${orders.length} orders) downloaded successfully!`);
    setTimeout(() => setDownloadSuccessMsg(null), 4000);
  };

  // Consolidate Loyalty Transactions Log
  const rawHistory: LoyaltyTransaction[] = userProfile.loyaltyHistory ?? [
    {
      id: 'TXN-901',
      date: '2026-07-22 18:30',
      orderId: 'ORD-98421',
      description: 'Points earned from Order #ORD-98421 (Grocery & Dairy)',
      points: 42,
      type: 'EARNED',
      orderTotal: 423.00,
    },
    {
      id: 'TXN-880',
      date: '2026-07-15 11:10',
      orderId: 'POS-SB-91728',
      description: 'POS Billing Counter purchase at NKS Plaza Lucknow',
      points: 68,
      type: 'EARNED',
      orderTotal: 668.00,
    },
    {
      id: 'TXN-750',
      date: '2026-07-01 09:00',
      description: 'Sarv Mart New Account Welcome Loyalty Bonus',
      points: 250,
      type: 'BONUS',
    },
    {
      id: 'TXN-610',
      date: '2026-06-20 14:20',
      description: 'Redeemed points for ₹20 Supermarket Coupon (SARV20)',
      points: -20,
      type: 'REDEEMED',
    }
  ];

  // Make sure current orders are represented if missing
  const allTransactions: LoyaltyTransaction[] = [...rawHistory];
  orders.forEach((ord) => {
    const exists = allTransactions.some((t) => t.orderId === ord.id);
    if (!exists) {
      const earned = Math.floor(ord.totalAmount / 10);
      if (earned > 0) {
        allTransactions.unshift({
          id: `TXN-${ord.id.replace(/[^0-9]/g, '') || Math.floor(Math.random() * 1000)}`,
          orderId: ord.id,
          date: ord.createdAt ? ord.createdAt.slice(0, 16).replace('T', ' ') : new Date().toISOString().slice(0, 16),
          description: `Points earned on Order #${ord.id}`,
          points: earned,
          type: 'EARNED',
          orderTotal: ord.totalAmount,
        });
      }
    }
  });

  const filteredTransactions = allTransactions.filter((t) => {
    const matchesType = txnFilter === 'ALL' || t.type === txnFilter;
    const matchesSearch =
      !txnSearch ||
      t.description.toLowerCase().includes(txnSearch.toLowerCase()) ||
      (t.orderId && t.orderId.toLowerCase().includes(txnSearch.toLowerCase())) ||
      t.id.toLowerCase().includes(txnSearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalPointsEarned = allTransactions
    .filter((t) => t.points > 0)
    .reduce((acc, t) => acc + t.points, 0);

  const totalPointsRedeemed = Math.abs(
    allTransactions
      .filter((t) => t.points < 0)
      .reduce((acc, t) => acc + t.points, 0)
  );

  const THEMES_LIST: {
    id: ThemeMode;
    name: string;
    description: string;
    gradient: string;
    badge: string;
    colors: string[];
  }[] = [
    {
      id: 'emerald',
      name: 'Emerald Classic (Default)',
      description: 'Fresh Lucknow Emerald & Warm Sun Gold accent',
      gradient: 'from-emerald-900 via-teal-900 to-green-950',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      colors: ['#065f46', '#fbbf24', '#047857', '#10b981'],
    },
    {
      id: 'midnight',
      name: 'Midnight Luxury',
      description: 'Dark Obsidian Canvas, Royal Navy & Imperial Gold',
      gradient: 'from-slate-900 via-indigo-950 to-slate-950',
      badge: 'bg-slate-800 text-amber-300 border-slate-700',
      colors: ['#0f172a', '#fbbf24', '#312e81', '#6366f1'],
    },
    {
      id: 'ocean',
      name: 'Ocean Breeze',
      description: 'Crisp Marine Teal, Vibrant Cyan & Ice White',
      gradient: 'from-teal-900 via-cyan-950 to-slate-900',
      badge: 'bg-teal-100 text-teal-900 border-teal-300',
      colors: ['#134e4a', '#22d3ee', '#0f766e', '#06b6d4'],
    },
    {
      id: 'harvest',
      name: 'Sunlit Harvest',
      description: 'Warm Autumn Terracotta, Sun Orange & Honey Amber',
      gradient: 'from-amber-900 via-orange-950 to-stone-900',
      badge: 'bg-amber-100 text-amber-900 border-amber-300',
      colors: ['#78350f', '#fb923c', '#92400e', '#f59e0b'],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto my-4 sm:my-8 px-3 sm:px-6 lg:px-8 text-left space-y-6 animate-fade-in">
      {/* Toast Alert for Download Success */}
      {downloadSuccessMsg && (
        <div className="bg-emerald-900 text-white p-3.5 rounded-2xl shadow-xl border border-emerald-500/50 flex items-center justify-between text-xs font-bold animate-bounce">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{downloadSuccessMsg}</span>
          </div>
          <button onClick={() => setDownloadSuccessMsg(null)} className="text-emerald-300 hover:text-white font-black text-sm">
            ✕
          </button>
        </div>
      )}

      {/* User Header Profile Card */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-green-900 text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 border border-emerald-700/50">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-400 text-emerald-950 font-black rounded-2xl sm:rounded-3xl flex items-center justify-center text-xl sm:text-2xl shadow-lg border-2 border-white/20 shrink-0">
            {userProfile.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{userProfile.name}</h1>
            <div className="text-xs text-emerald-200 flex flex-wrap items-center gap-2 mt-1">
              <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-amber-300" /> {userProfile.phone}</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-amber-300" /> {userProfile.email}</span>
            </div>
          </div>
        </div>

        {/* Sarv Points & Wallet Pill */}
        <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2.5 sm:p-3 rounded-2xl text-center flex-1 md:flex-initial min-w-[100px] sm:min-w-[120px]">
            <p className="text-[10px] uppercase font-extrabold text-amber-300 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" /> Sarv Points
            </p>
            <p className="text-lg sm:text-xl font-black text-white">{userProfile.points ?? userProfile.rewardPoints ?? 0} pts</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2.5 sm:p-3 rounded-2xl text-center flex-1 md:flex-initial min-w-[100px] sm:min-w-[120px]">
            <p className="text-[10px] uppercase font-extrabold text-emerald-200 flex items-center justify-center gap-1">
              <Wallet className="w-3 h-3" /> Wallet
            </p>
            <p className="text-lg sm:text-xl font-black text-amber-300">₹{userProfile.walletBalance}</p>
          </div>
        </div>
      </div>

      {/* Loyalty Points Tracking System Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-emerald-500/30 space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-emerald-800/80 pb-3 sm:pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-400 text-emerald-950 rounded-2xl flex items-center justify-center shadow-lg font-black shrink-0">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">Sarv Loyalty Rewards Tracker</h2>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Silver Tier Member
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-200">Earn 1 Sarv Loyalty Point for every ₹10 spent at Sarv Mart</p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-emerald-900/60 p-2.5 sm:p-3 rounded-2xl border border-emerald-700/50 shrink-0">
            <span className="text-[10px] uppercase font-bold text-emerald-300 block">Current Loyalty Balance</span>
            <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">{userProfile.points ?? userProfile.rewardPoints ?? 0}</span>
            <span className="text-xs font-bold text-emerald-200 ml-1">Pts</span>
          </div>
        </div>

        {/* Dynamic Progress Bar Section */}
        {(() => {
          const currentPoints = userProfile.points ?? userProfile.rewardPoints ?? 0;
          const rewardMilestones = [
            { pts: 500, reward: '₹50 Supermarket Discount Voucher' },
            { pts: 1000, reward: '₹120 Free Grocery Voucher' },
            { pts: 2000, reward: '₹250 VIP Shopping Pass + Free Delivery' },
            { pts: 5000, reward: '₹750 Megasaver Gift Card' },
          ];

          const nextMilestone = rewardMilestones.find(m => m.pts > currentPoints) || {
            pts: Math.ceil((currentPoints + 1) / 1000) * 1000,
            reward: '₹500 Store Cash Voucher'
          };

          const prevMilestonePts = rewardMilestones.filter(m => m.pts <= currentPoints).pop()?.pts || 0;
          const pointsNeeded = Math.max(0, nextMilestone.pts - currentPoints);
          const progressPercent = Math.min(
            100,
            Math.max(0, Math.round(((currentPoints - prevMilestonePts) / (nextMilestone.pts - prevMilestonePts)) * 100))
          );

          return (
            <div className="space-y-3 bg-white/5 p-3.5 sm:p-4 rounded-2xl border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold gap-1">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Trophy className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Next Target: {nextMilestone.reward}</span>
                </div>
                <span className="text-emerald-300 font-mono text-[11px]">
                  {pointsNeeded > 0 ? `${pointsNeeded} pts needed for next reward` : '🎉 Reward Unlocked!'}
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="relative w-full h-4 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-emerald-500/40 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 rounded-full transition-all duration-500 relative flex items-center justify-end pr-1.5"
                  style={{ width: `${Math.max(6, progressPercent)}%` }}
                >
                  <span className="text-[9px] font-black text-slate-950 leading-none">
                    {progressPercent}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-200 pt-1">
                <span>{prevMilestonePts} Pts</span>
                <span className="font-bold text-amber-300">{currentPoints} / {nextMilestone.pts} Pts</span>
                <span>{nextMilestone.pts} Pts</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-gray-200">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 border ${
            activeTab === 'orders'
              ? 'bg-emerald-800 text-white border-emerald-800 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-amber-300" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 border ${
            activeTab === 'transactions'
              ? 'bg-emerald-800 text-white border-emerald-800 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <History className="w-4 h-4 text-amber-300" />
          <span>Points Transaction History ({allTransactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('theme')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 border ${
            activeTab === 'theme'
              ? 'bg-emerald-800 text-white border-emerald-800 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Palette className="w-4 h-4 text-amber-300" />
          <span>Theme Changer</span>
        </button>

        {wishlistProducts.length > 0 && (
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 border ${
              activeTab === 'wishlist'
                ? 'bg-emerald-800 text-white border-emerald-800 shadow-md'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>Wishlist ({wishlistProducts.length})</span>
          </button>
        )}
      </div>

      {/* TAB CONTENT 1: TRANSACTION HISTORY */}
      {activeTab === 'transactions' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-xs space-y-5">
          {/* Header & Stats Cards */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                <span>Loyalty Points Statement & History</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Detailed record of all points earned on order completions, bonuses, and redeemed rewards.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full">
                Total Earned: +{totalPointsEarned} Pts
              </span>
              {totalPointsRedeemed > 0 && (
                <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full">
                  Redeemed: -{totalPointsRedeemed} Pts
                </span>
              )}
            </div>
          </div>

          {/* Search & Filter Controls Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={txnSearch}
                onChange={(e) => setTxnSearch(e.target.value)}
                placeholder="Search by Order ID, Txn ID, or keyword..."
                className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-emerald-500 font-medium"
              />
              {txnSearch && (
                <button
                  onClick={() => setTxnSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {(['ALL', 'EARNED', 'BONUS', 'REDEEMED'] as const).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setTxnFilter(filterType)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                    txnFilter === filterType
                      ? 'bg-emerald-900 text-amber-300 shadow-xs'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {filterType === 'ALL' && 'All Txns'}
                  {filterType === 'EARNED' && '➕ Order Points'}
                  {filterType === 'BONUS' && '🎁 Bonuses'}
                  {filterType === 'REDEEMED' && '🔥 Redeemed'}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions Log List (Responsive Tablet / Mobile Cards & Desktop Table) */}
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-gray-500 space-y-2 border border-dashed border-gray-200 rounded-2xl">
              <p className="font-bold text-sm">No transaction records found</p>
              <p className="text-xs">Try clearing search filters to see all historical points logs.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((txn) => {
                const isPositive = txn.points > 0;
                return (
                  <div
                    key={txn.id}
                    className="p-3.5 sm:p-4 bg-gray-50/80 rounded-2xl border border-gray-200 hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2.5 rounded-2xl shrink-0 mt-0.5 ${
                          txn.type === 'EARNED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : txn.type === 'BONUS'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {txn.type === 'EARNED' && <ArrowUpRight className="w-5 h-5" />}
                        {txn.type === 'BONUS' && <Gift className="w-5 h-5" />}
                        {txn.type === 'REDEEMED' && <ArrowDownLeft className="w-5 h-5" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-gray-900 text-xs sm:text-sm">{txn.description}</span>
                          {txn.orderId && (
                            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black font-mono px-2 py-0.5 rounded-md border border-emerald-200">
                              #{txn.orderId}
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              txn.type === 'EARNED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : txn.type === 'BONUS'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {txn.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            {txn.date}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-gray-400">Txn Ref: {txn.id}</span>
                          {txn.orderTotal && (
                            <>
                              <span>•</span>
                              <span className="font-bold text-gray-700">Order Spend: ₹{txn.orderTotal}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Points Value Badge */}
                    <div className="text-right self-end sm:self-center shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 font-mono font-black text-base sm:text-lg px-3 py-1 rounded-xl shadow-2xs ${
                          isPositive
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}
                      >
                        {isPositive ? `+${txn.points}` : txn.points} Pts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: THEME CHANGER */}
      {activeTab === 'theme' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-xs space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Palette className="w-5 h-5 text-emerald-600" />
              <span>Personalized App Theme Changer</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Select your preferred visual theme for Sarv Mart. Changes apply instantly across the storefront and header.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {THEMES_LIST.map((theme) => {
              const isSelected = currentTheme === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => onSelectTheme && onSelectTheme(theme.id)}
                  className={`p-5 rounded-2xl sm:rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden space-y-3 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-gray-200 hover:border-emerald-300 bg-gray-50/50'
                  }`}
                >
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 bg-emerald-600 text-white p-1 rounded-full shadow-md">
                      <Check className="w-4 h-4" />
                    </div>
                  )}

                  {/* Gradient Preview Header */}
                  <div className={`h-16 rounded-2xl bg-gradient-to-r ${theme.gradient} p-3 text-white flex items-center justify-between`}>
                    <span className="font-black text-xs sm:text-sm tracking-wide">{theme.name}</span>
                    <div className="flex items-center gap-1.5">
                      {theme.colors.map((c, idx) => (
                        <span key={idx} className="w-3.5 h-3.5 rounded-full border border-white/40" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 font-medium">{theme.description}</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectTheme) onSelectTheme(theme.id);
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <span>{isSelected ? 'Active Theme Selected' : 'Apply Theme'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: RECENT ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-3">
            <div>
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <span>Recent Supermarket Orders</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">View tax invoices, reorder past items, or export your complete order statement.</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleDownloadCsv}
                className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs shadow-2xs transition-all active:scale-95"
                title="Download CSV file of all order records for personal bookkeeping"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-300" />
                <span>Download Order History (CSV)</span>
              </button>

              <span className="text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 px-3 py-2 rounded-xl">
                {orders.length} Orders
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Reorder Toast Notification Banner */}
            <AnimatePresence>
              {reorderToast && (
                <motion.div
                  initial={{ opacity: 0, y: -12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  className="bg-emerald-900 text-white p-3.5 rounded-2xl border border-emerald-700 shadow-lg flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-700/90 rounded-xl text-amber-300 shadow-2xs">
                      <ShoppingCart className="w-4 h-4 animate-bounce" />
                    </div>
                    <div>
                      <p className="font-extrabold text-white text-xs">Items Restocked in Cart!</p>
                      <p className="text-[11px] text-emerald-200">
                        {reorderToast.count} items from Order #{reorderToast.id} added back to your cart.
                      </p>
                    </div>
                  </div>
                  <span className="bg-amber-400 text-emerald-950 font-black px-3 py-1 rounded-xl text-[10px] uppercase shadow-2xs shrink-0">
                    Cart Updated
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {orders.map((o) => (
              <div key={o.id} className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-3 hover:border-emerald-300 transition-colors">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs border-b border-gray-200 pb-2 gap-2">
                  <div>
                    <span className="font-extrabold text-gray-900 text-sm">{o.id}</span>
                    <span className="text-gray-500 font-mono ml-2">Invoice: {o.invoiceNumber || o.id}</span>
                    <span className="text-gray-400 font-mono ml-2">• {o.createdAt.slice(0, 10)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase text-[10px]">
                      {o.status}
                    </span>
                    <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                      {o.paymentMethod} ({o.paymentStatus || 'Paid'})
                    </span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="space-y-1.5 text-xs text-gray-700">
                  {o.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between font-medium">
                      <span>• {it.product.name} ({it.quantity} {it.product.unit || 'unit'})</span>
                      <span className="font-mono text-gray-900 font-bold">₹{it.product.price * it.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t border-gray-200 text-xs gap-3">
                  <div className="space-y-0.5">
                    <p className="text-gray-500 text-[11px]">Total Paid Amount (Incl. GST):</p>
                    <p className="font-black text-gray-900 text-base">₹{o.totalAmount.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    <button
                      onClick={() => setSelectedOrderForModal(o)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-3 py-2 rounded-xl transition-colors border border-gray-300 text-xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-gray-600" />
                      <span>View Invoice</span>
                    </button>

                    <button
                      onClick={() => handleDownloadPdf(o)}
                      disabled={downloadingOrderId === o.id}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold px-3.5 py-2 rounded-xl transition-all shadow-xs text-xs active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-300" />
                      <span>{downloadingOrderId === o.id ? 'Generating...' : 'Download PDF Invoice'}</span>
                    </button>

                    <motion.button
                      whileTap={{ scale: 0.88, rotate: -3 }}
                      whileHover={{ scale: 1.04 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 17 }}
                      onClick={() => handleReorderWithAnimation(o)}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 font-extrabold px-4 py-2 rounded-xl text-xs transition-all shadow-xs ${
                        reorderingOrderId === o.id
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400'
                          : 'bg-amber-500 hover:bg-amber-600 text-gray-950 shadow-amber-500/20'
                      }`}
                      title="Add all items from this order back into your active shopping cart"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {reorderingOrderId === o.id ? (
                          <motion.div
                            key="success"
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                            className="flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-4 h-4 text-amber-300 animate-pulse" />
                            <span>Added to Cart!</span>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="reorder"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reorder</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: SAVED WISHLIST */}
      {activeTab === 'wishlist' && wishlistProducts.length > 0 && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span>My Saved Wishlist ({wishlistProducts.length})</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {wishlistProducts.map((p) => (
              <div key={p.id} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-gray-900 line-clamp-1">{p.name}</p>
                  <p className="text-xs font-black text-emerald-700">₹{p.price}</p>
                </div>
                <button
                  onClick={() => onAddToCart(p)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Tax Invoice Modal */}
      {selectedOrderForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-200 text-left my-auto max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-amber-300" />
                  <h3 className="font-extrabold text-sm sm:text-base text-white">SARV MART TAX INVOICE</h3>
                </div>
                <p className="text-xs text-emerald-200 font-mono mt-0.5">
                  Invoice No: {selectedOrderForModal.invoiceNumber || selectedOrderForModal.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Printable Tax Invoice Format */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-xs font-sans text-gray-800">
              {/* Store Identity Bar */}
              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row justify-between gap-2">
                <div>
                  <p className="font-black text-emerald-950 text-sm">Sarv Mart Supermarket</p>
                  <p className="text-gray-600 text-[11px]">Behta Bazar, Hardoi Road, Lucknow - 226101 (UP)</p>
                  <p className="text-gray-600 text-[11px]">GSTIN: 09SARVMART8821Z5 | FSSAI: 12723001000492</p>
                </div>
                <div className="text-left sm:text-right text-gray-600 text-[11px]">
                  <p><strong className="text-gray-900">Order ID:</strong> {selectedOrderForModal.id}</p>
                  <p><strong className="text-gray-900">Date:</strong> {selectedOrderForModal.createdAt}</p>
                  <p><strong className="text-gray-900">Payment:</strong> {selectedOrderForModal.paymentMethod}</p>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <p className="font-bold text-gray-900 text-xs">Customer Shipping Address:</p>
                <p className="font-semibold text-gray-800">{selectedOrderForModal.address?.fullName} (+91 {selectedOrderForModal.address?.phone})</p>
                <p className="text-gray-600">{selectedOrderForModal.address?.streetAddress}, {selectedOrderForModal.address?.landmark}, {selectedOrderForModal.address?.area}, {selectedOrderForModal.address?.city} - {selectedOrderForModal.address?.pincode}</p>
              </div>

              {/* Itemized Table */}
              <div className="border border-gray-200 rounded-2xl overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead className="bg-emerald-800 text-white font-extrabold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Item Details</th>
                      <th className="p-2.5 text-center">GST</th>
                      <th className="p-2.5 text-right">MRP</th>
                      <th className="p-2.5 text-right">Price</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-medium text-xs">
                    {selectedOrderForModal.items.map((it, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="p-2.5 text-center text-gray-400 font-mono">{i + 1}</td>
                        <td className="p-2.5">
                          <p className="font-bold text-gray-900">{it.product.name}</p>
                          <p className="text-[10px] text-gray-500">{it.product.brand} • {it.product.unit}</p>
                        </td>
                        <td className="p-2.5 text-center text-gray-600">{it.product.gstRate ?? 5}%</td>
                        <td className="p-2.5 text-right text-gray-400 line-through">₹{it.product.mrp || it.product.price}</td>
                        <td className="p-2.5 text-right font-bold text-gray-900">₹{it.product.price}</td>
                        <td className="p-2.5 text-center font-bold text-emerald-900">{it.quantity}</td>
                        <td className="p-2.5 text-right font-black text-gray-900">₹{(it.product.price * it.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Calculation Totals Card */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs font-medium">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal (Items Total):</span>
                  <span className="font-bold text-gray-900">₹{selectedOrderForModal.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrderForModal.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Coupon / Promo Savings:</span>
                    <span className="font-bold">- ₹{selectedOrderForModal.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charge:</span>
                  <span className="font-bold text-emerald-700">
                    {selectedOrderForModal.deliveryFee === 0 ? 'FREE Express Delivery' : `₹${selectedOrderForModal.deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST Amount (Included):</span>
                  <span className="font-bold text-gray-900">₹{(selectedOrderForModal.gstAmount || 0).toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-gray-300 flex justify-between text-sm font-black text-emerald-950">
                  <span>Grand Total Paid:</span>
                  <span className="text-base text-emerald-700">₹{selectedOrderForModal.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-gray-100 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <p className="text-[11px] text-gray-500">Official Computer Generated Tax Invoice</p>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleDownloadPdf(selectedOrderForModal)}
                  className="flex-1 sm:flex-none bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 active:scale-95 text-xs"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>Download Formatted PDF Invoice</span>
                </button>
                <button
                  onClick={() => setSelectedOrderForModal(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold px-4 py-2.5 rounded-xl text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
