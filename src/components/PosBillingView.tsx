import React, { useState, useEffect } from 'react';
import { Product, POSBill, POSItem } from '../types';
import { STORE_DETAILS } from '../data/mockData';
import {
  Receipt,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  QrCode,
  Banknote,
  CreditCard,
  User,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Barcode,
  Keyboard,
  Clock,
  Maximize2,
  Minimize2,
  MessageSquare,
  Gift,
  Share2,
  Phone,
  Calendar,
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
  AlertTriangle,
  Download,
  CheckCircle,
  Server,
  Zap,
  CloudOff,
  ShieldCheck,
  Home,
  X
} from 'lucide-react';

interface PosBillingViewProps {
  products: Product[];
  onBillCreated: (bill: POSBill) => void;
  onNavigateHome?: () => void;
}

export const PosBillingView: React.FC<PosBillingViewProps> = ({ products, onBillCreated, onNavigateHome }) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<POSItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerBirthOrAnniversary, setCustomerBirthOrAnniversary] = useState('');
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Credit'>('Cash');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [overallDiscount, setOverallDiscount] = useState<number>(0);
  const [showThermalReceipt, setShowThermalReceipt] = useState(false);
  const [activeBill, setActiveBill] = useState<POSBill | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [whatsappSentStatus, setWhatsappSentStatus] = useState<string | null>(null);

  // Network & LocalStorage Offline Caching State
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);
  const [queuedBills, setQueuedBills] = useState<POSBill[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncFeedbackMsg, setSyncFeedbackMsg] = useState<string | null>(null);
  const [showQueueModal, setShowQueueModal] = useState<boolean>(false);
  const [toastAlert, setToastAlert] = useState<{
    type: 'online' | 'offline' | 'queued' | 'synced';
    message: string;
  } | null>(null);

  // Effective network status
  const effectiveOnline = isOnline && !simulatedOffline;

  // Load Queued Bills from LocalStorage
  const loadQueuedBills = () => {
    try {
      const stored = localStorage.getItem('sarv_mart_offline_pos_bills');
      if (stored) {
        const parsed: POSBill[] = JSON.parse(stored);
        setQueuedBills(parsed);
      } else {
        setQueuedBills([]);
      }
    } catch {
      setQueuedBills([]);
    }
  };

  // Sync Offline Queued Bills to Database
  const syncOfflineQueue = async () => {
    if (isSyncing) return;
    try {
      const stored = localStorage.getItem('sarv_mart_offline_pos_bills');
      const bills: POSBill[] = stored ? JSON.parse(stored) : [];

      if (bills.length === 0) {
        setSyncFeedbackMsg('No offline queued transactions to synchronize.');
        setTimeout(() => setSyncFeedbackMsg(null), 3000);
        return;
      }

      setIsSyncing(true);
      setSyncFeedbackMsg(`Syncing ${bills.length} queued offline bill(s) with database...`);

      const res = await fetch('/api/pos/batch-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bills }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.removeItem('sarv_mart_offline_pos_bills');
        setQueuedBills([]);
        const now = new Date().toLocaleTimeString('en-IN');
        setLastSyncTime(now);
        setSyncFeedbackMsg(`✅ Synced ${data.count || bills.length} bill(s) with database at ${now}!`);
        setToastAlert({
          type: 'synced',
          message: `🎉 Offline Queue Synced! ${data.count || bills.length} POS transaction(s) committed to database.`,
        });
        setTimeout(() => setToastAlert(null), 6000);
      } else {
        throw new Error(data.message || 'Sync failed');
      }
    } catch (err: any) {
      setSyncFeedbackMsg(`Sync retry required: ${err.message || 'Server connection error'}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedbackMsg(null), 5000);
    }
  };

  // Listen for online/offline events
  useEffect(() => {
    loadQueuedBills();

    const handleOnline = () => {
      setIsOnline(true);
      setToastAlert({
        type: 'online',
        message: '🟢 Network reconnected! Auto-synchronizing offline POS transactions...',
      });
      setTimeout(() => setToastAlert(null), 5000);
      syncOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setToastAlert({
        type: 'offline',
        message: '🔴 Internet Connection Lost. POS Billing remains 100% functional with Local Storage Queue.',
      });
      setTimeout(() => setToastAlert(null), 6000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Toggle browser native fullscreen + overlay view
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch(() => {
          setIsFullscreen(!isFullscreen);
        });
      } else {
        setIsFullscreen(!isFullscreen);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(() => {
          setIsFullscreen(false);
        });
      } else {
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    }, 200);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Search filtered products
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add item by product
  const handleAddItem = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? {
                ...i,
                quantity: i.quantity + 1,
                itemTotal: (i.quantity + 1) * product.price,
              }
            : i
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          customDiscountPercent: 0,
          itemTotal: product.price,
        },
      ];
    });
  };

  // Handle Barcode Scan
  const handleBarcodeScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matched = products.find((p) => p.barcode === barcodeInput.trim() || p.id === barcodeInput.trim());
    if (matched) {
      handleAddItem(matched);
      setBarcodeInput('');
    } else {
      alert(`No product found matching barcode "${barcodeInput}"`);
    }
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              itemTotal: newQty * item.product.price,
            };
          }
          return item;
        })
        .filter(Boolean) as POSItem[]
    );
  };

  // Billing Totals
  const subtotal = cart.reduce((acc, item) => acc + item.itemTotal, 0);
  const totalGst = cart.reduce((acc, item) => {
    const itemGst = (item.itemTotal * item.product.gstRate) / (100 + item.product.gstRate);
    return acc + itemGst;
  }, 0);

  const finalTotal = Math.max(0, subtotal - overallDiscount);
  const changeDue = Math.max(0, cashTendered - finalTotal);

  const handleCheckoutBill = async () => {
    if (cart.length === 0) return;

    const billNo = `POS-SB-${Math.floor(10000 + Math.random() * 90000)}`;
    const bill: POSBill = {
      id: `bill_${Date.now()}`,
      billNo,
      items: cart,
      subtotal,
      totalGst: Math.round(totalGst),
      discount: overallDiscount,
      finalTotal,
      paymentMode,
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim(),
      customerBirthOrAnniversary: customerBirthOrAnniversary.trim(),
      whatsappOptIn,
      cashierName: 'Anoop Srivastava (Counter 1)',
      timestamp: new Date().toLocaleString('en-IN'),
      paidAmount: paymentMode === 'Cash' ? cashTendered : finalTotal,
      changeAmount: paymentMode === 'Cash' ? changeDue : 0,
      isOfflineSync: !effectiveOnline,
    };

    let isSavedDirectly = false;

    if (effectiveOnline) {
      try {
        const res = await fetch('/api/pos/bill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bill),
        });
        if (res.ok) {
          isSavedDirectly = true;
        }
      } catch {
        isSavedDirectly = false;
      }
    }

    if (!isSavedDirectly) {
      // Save bill into Local Storage Queue
      const offlineBill: POSBill = {
        ...bill,
        isOfflineSync: true,
      };
      const stored = localStorage.getItem('sarv_mart_offline_pos_bills');
      const currentQueue: POSBill[] = stored ? JSON.parse(stored) : [];
      const updatedQueue = [offlineBill, ...currentQueue];
      localStorage.setItem('sarv_mart_offline_pos_bills', JSON.stringify(updatedQueue));
      setQueuedBills(updatedQueue);

      setToastAlert({
        type: 'queued',
        message: `⚡ ${simulatedOffline ? 'Simulated Offline Mode' : 'Network Unstable'}: Bill #${bill.billNo} saved safely to Local Storage Queue! (${updatedQueue.length} pending sync)`,
      });
      setTimeout(() => setToastAlert(null), 6000);
    } else {
      setToastAlert({
        type: 'online',
        message: `✅ Bill #${bill.billNo} processed & saved directly to live database!`,
      });
      setTimeout(() => setToastAlert(null), 4000);
    }

    // Capture customer details for WhatsApp Marketing directory if online
    if (customerPhone.trim().length >= 8 && effectiveOnline) {
      try {
        await fetch('/api/customers/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: customerName.trim() || 'Store Customer',
            phone: customerPhone.trim(),
            whatsappOptIn,
            specialOccasion: customerBirthOrAnniversary,
            city: 'Lucknow',
            billNo: bill.billNo,
            totalAmount: bill.finalTotal,
            source: 'POS_PRINT',
          }),
        });
      } catch {
        // Silently caught if offline
      }
    }

    setWhatsappSentStatus(null);
    setActiveBill(bill);
    setShowThermalReceipt(true);
    onBillCreated(bill);
  };

  const handleClearTerminal = () => {
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerBirthOrAnniversary('');
    setCashTendered(0);
    setOverallDiscount(0);
    setWhatsappSentStatus(null);
  };

  const handleExportQueuedJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(queuedBills, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sarv_mart_offline_bills_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearQueue = () => {
    if (confirm("Are you sure you want to clear the offline queued transactions? Any unsynced sales will be permanently removed.")) {
      localStorage.removeItem('sarv_mart_offline_pos_bills');
      setQueuedBills([]);
      setShowQueueModal(false);
    }
  };

  const handleCloseAndNavigateHome = () => {
    setShowThermalReceipt(false);
    handleClearTerminal();
    if (onNavigateHome) {
      onNavigateHome();
    }
  };

  return (
    <div className={isFullscreen ? "fixed inset-0 z-50 bg-slate-950 text-gray-900 overflow-y-auto p-3 sm:p-5 space-y-4 animate-fade-in" : "max-w-7xl mx-auto my-4 px-2 sm:px-6 text-left space-y-4 animate-fade-in"}>
      {/* Toast Alert Banner */}
      {toastAlert && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-slide-in text-xs font-bold max-w-md ${
          toastAlert.type === 'online'
            ? 'bg-emerald-950 text-white border-emerald-500'
            : toastAlert.type === 'offline'
            ? 'bg-red-950 text-white border-red-500'
            : toastAlert.type === 'queued'
            ? 'bg-amber-950 text-white border-amber-400'
            : 'bg-teal-950 text-white border-teal-400'
        }`}>
          {toastAlert.type === 'online' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toastAlert.type === 'offline' && <WifiOff className="w-5 h-5 text-red-400 shrink-0" />}
          {toastAlert.type === 'queued' && <Zap className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />}
          {toastAlert.type === 'synced' && <Database className="w-5 h-5 text-teal-400 shrink-0" />}
          <p className="leading-snug">{toastAlert.message}</p>
        </div>
      )}

      {/* POS Top Bar */}
      <div className="bg-gray-900 text-white p-3.5 sm:p-4 rounded-3xl shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white p-1 rounded-full shadow-md overflow-hidden flex items-center justify-center shrink-0">
            <img
              src={STORE_DETAILS.logoUrl}
              alt={STORE_DETAILS.name}
              className="w-full h-full object-contain rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-xl font-black tracking-tight">Sarv Mart POS Billing</h1>
              <span className="bg-emerald-500/20 text-emerald-400 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Offline Capable
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-gray-400 font-medium">Counter #1 • Behta Bazar Lucknow Store</p>
          </div>
        </div>

        {/* Network & Fullscreen Shortcuts Bar */}
        <div className="flex flex-wrap items-center justify-start md:justify-end gap-2">
          {/* Network Status Indicator */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold border transition-all ${
            effectiveOnline
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
          }`}>
            {effectiveOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>ONLINE DB</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>OFFLINE QUEUED</span>
              </>
            )}
          </div>

          {/* Offline Simulation Toggle */}
          <button
            type="button"
            onClick={() => {
              const newSimState = !simulatedOffline;
              setSimulatedOffline(newSimState);
              setToastAlert({
                type: newSimState ? 'queued' : 'online',
                message: newSimState
                  ? '⚡ Offline Simulation ENABLED: New bills will queue in LocalStorage for sync testing.'
                  : '🟢 Online Simulation Restored: Reconnected to live server DB.',
              });
              setTimeout(() => setToastAlert(null), 4000);
            }}
            className={`text-[11px] sm:text-xs px-2.5 py-1.5 rounded-xl font-bold border transition-colors flex items-center gap-1 ${
              simulatedOffline
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Toggle Offline Simulation Mode to test queuing without turning off WiFi"
          >
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span>{simulatedOffline ? 'Sim Offline' : 'Simulate Offline'}</span>
          </button>

          {/* Queued Bills Counter Badge */}
          {queuedBills.length > 0 && (
            <button
              type="button"
              onClick={() => setShowQueueModal(true)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] sm:text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Database className="w-3.5 h-3.5 shrink-0" />
              <span>{queuedBills.length} Queued</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] sm:text-xs px-3 py-1.5 rounded-xl transition-all shadow-md active:scale-95 shrink-0"
            title="Toggle Fullscreen Billing View"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-amber-300" /> : <Maximize2 className="w-3.5 h-3.5 text-amber-300" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Offline Status & Sync Control Banner */}
      {(!effectiveOnline || queuedBills.length > 0) && (
        <div className="bg-amber-950/90 text-amber-100 border border-amber-600/60 p-4 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-2xl font-black shrink-0">
              <CloudOff className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-extrabold text-sm text-amber-200">
                  {!effectiveOnline ? 'Offline POS Billing Active (LocalStorage Queue & ServiceWorker Caching)' : 'Unsynced Offline Transactions Pending Database Commit'}
                </p>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-amber-500/40">
                  Service Worker Ready
                </span>
              </div>
              <p className="text-xs text-amber-300/80 font-medium mt-0.5">
                Billing terminal is 100% operational offline. Sales will queue safely in browser Local Storage and auto-sync when online.
              </p>
              {syncFeedbackMsg && (
                <p className="text-xs font-bold text-amber-400 mt-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{syncFeedbackMsg}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            {queuedBills.length > 0 && (
              <button
                onClick={syncOfflineQueue}
                disabled={isSyncing}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2 rounded-2xl flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : `Sync ${queuedBills.length} Bill(s) Now`}</span>
              </button>
            )}

            <button
              onClick={() => setShowQueueModal(true)}
              className="bg-amber-900/80 hover:bg-amber-800 text-amber-100 font-extrabold text-xs px-3.5 py-2 rounded-2xl border border-amber-700/80"
            >
              Queue ({queuedBills.length})
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Search & Barcode Scan */}
        <div className="lg:col-span-7 space-y-4">
          {/* Barcode Input Bar */}
          <form onSubmit={handleBarcodeScanSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="w-5 h-5 absolute left-3.5 top-3 text-emerald-600" />
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan USB Barcode or enter barcode (e.g., 8901030001001)..."
                className="w-full bg-white border-2 border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl pl-11 pr-3 py-2.5 text-xs font-bold font-mono outline-none shadow-xs"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-2xl"
            >
              Scan Add
            </button>
          </form>

          {/* Search Filter */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items by name, category..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
            />
          </div>

          {/* Product Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => handleAddItem(p)}
                className="p-2.5 bg-white border border-gray-200 hover:border-emerald-400 rounded-2xl text-left hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                    <span className="font-mono">{p.barcode.slice(-4)}</span>
                    <span className="bg-gray-100 text-gray-700 px-1 rounded">{p.unit}</span>
                  </div>
                  <p className="font-bold text-xs text-gray-900 line-clamp-2 group-hover:text-emerald-700">
                    {p.name}
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between pt-1 border-t border-gray-100">
                  <span className="font-black text-xs text-emerald-800">₹{p.price}</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    + Add
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Billing Terminal Cart & Payment */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-200 p-4 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Customer Details Bar & WhatsApp Capture */}
            <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                  <span>WhatsApp Customer Capture</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300/50">
                  Auto-Offers & E-Bill
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer Name (e.g. Ramesh)"
                  className="bg-white border border-gray-300 focus:border-emerald-500 rounded-xl px-2.5 py-1.5 text-xs font-medium outline-none shadow-2xs"
                />
                <div className="relative">
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="WhatsApp No (10 digits)"
                    className="w-full bg-white border border-gray-300 focus:border-emerald-500 rounded-xl pl-6 pr-2 py-1.5 text-xs font-mono font-bold outline-none shadow-2xs text-gray-900"
                  />
                  <span className="absolute left-2 top-2 text-[10px] text-emerald-700 font-bold">+91</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <div className="relative flex items-center">
                  <Calendar className="w-3 h-3 text-gray-400 absolute left-2" />
                  <input
                    type="text"
                    value={customerBirthOrAnniversary}
                    onChange={(e) => setCustomerBirthOrAnniversary(e.target.value)}
                    placeholder="B'day / Anniversary (Optional)"
                    className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-xl pl-6 pr-2 py-1 text-[11px] text-gray-700 outline-none"
                  />
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-emerald-900 font-semibold select-none">
                  <input
                    type="checkbox"
                    checked={whatsappOptIn}
                    onChange={(e) => setWhatsappOptIn(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 accent-emerald-600"
                  />
                  <span>Send WhatsApp Deals & E-Receipt</span>
                </label>
              </div>
            </div>

            {/* Billing Cart Items */}
            <div className="max-h-60 overflow-y-auto space-y-2 divide-y divide-gray-100 pr-1">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs">
                  <Receipt className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                  <p className="font-bold">Billing cart is empty</p>
                  <p className="text-[10px]">Scan barcode or click products to generate invoice</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="pt-2 flex items-center justify-between text-xs">
                    <div className="flex-1 text-left pr-2">
                      <p className="font-bold text-gray-900 line-clamp-1">{item.product.name}</p>
                      <p className="text-[10px] text-gray-400">
                        ₹{item.product.price} x {item.quantity} (GST {item.product.gstRate}%)
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50 p-0.5">
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, -1)}
                          className="px-1 text-gray-600 hover:text-black font-bold"
                        >
                          -
                        </button>
                        <span className="px-1.5 font-bold font-mono">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product.id, 1)}
                          className="px-1 text-gray-600 hover:text-black font-bold"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-black text-gray-900 min-w-[50px] text-right">
                        ₹{item.itemTotal}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payment & Totals */}
          <div className="border-t border-gray-200 pt-3 space-y-3">
            {/* Mode selection */}
            <div className="grid grid-cols-4 gap-1.5">
              {(['Cash', 'UPI', 'Card', 'Credit'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setPaymentMode(m)}
                  className={`py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                    paymentMode === m ? 'bg-emerald-700 text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {paymentMode === 'Cash' && (
              <div className="flex items-center justify-between gap-2 bg-emerald-50 p-2 rounded-xl text-xs">
                <span className="font-bold text-emerald-900">Cash Tendered:</span>
                <input
                  type="number"
                  value={cashTendered || ''}
                  onChange={(e) => setCashTendered(Number(e.target.value))}
                  placeholder="₹ Amount"
                  className="w-28 bg-white border border-emerald-300 rounded-lg px-2 py-1 font-mono font-bold text-emerald-950 outline-none"
                />
                <span className="font-bold text-emerald-900">
                  Change: <strong className="text-emerald-700 font-extrabold">₹{changeDue}</strong>
                </span>
              </div>
            )}

            {/* Bill Summary */}
            <div className="bg-gray-50 p-3 rounded-2xl text-xs space-y-1 font-medium text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-gray-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Inclusive GST Tax</span>
                <span className="font-bold text-gray-900">₹{Math.round(totalGst)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-1 text-base font-black text-gray-900">
                <span>Final Payable</span>
                <span className="text-emerald-700">₹{finalTotal}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearTerminal}
                className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold text-xs"
                title="Clear"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                id="pos-print-bill-btn"
                disabled={cart.length === 0}
                onClick={handleCheckoutBill}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black py-3 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>
                  Print Thermal Bill (₹{finalTotal}) {!effectiveOnline ? '⚡ [Offline Queue]' : ''}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Offline Transactions Queue Modal */}
      {showQueueModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowQueueModal(false);
          }}
        >
          <div className="bg-slate-900 text-white w-full max-w-xl sm:max-w-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-700 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-xl">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">LocalStorage Offline POS Bills Queue</h3>
                  <p className="text-xs text-slate-400">Transactions stored locally during network instability</p>
                </div>
              </div>

              <button
                onClick={() => setShowQueueModal(false)}
                className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Queue Summary Bar */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Queued Bills</span>
                <p className="text-lg font-black text-amber-400 font-mono mt-0.5">{queuedBills.length}</p>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Total Sales Value</span>
                <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                  ₹{queuedBills.reduce((acc, b) => acc + b.finalTotal, 0)}
                </p>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Last Sync</span>
                <p className="text-xs font-bold text-slate-200 mt-1">{lastSyncTime || 'Pending'}</p>
              </div>
            </div>

            {/* List of Queued Bills */}
            <div className="max-h-60 overflow-y-auto space-y-2 divide-y divide-slate-800 pr-1">
              {queuedBills.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                  <p className="font-bold text-slate-300">All offline transactions are fully synchronized!</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">New offline sales will be automatically listed here.</p>
                </div>
              ) : (
                queuedBills.map((bill) => (
                  <div key={bill.id} className="pt-2 flex items-center justify-between text-xs font-sans">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-amber-300">{bill.billNo}</span>
                        <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/30">
                          {bill.paymentMode}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        {bill.customerName} ({bill.items.length} items) • {bill.timestamp}
                      </p>
                    </div>

                    <div className="text-right font-mono">
                      <p className="font-extrabold text-sm text-emerald-400">₹{bill.finalTotal}</p>
                      <span className="text-[10px] text-slate-400">Status: Queued</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Queue Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportQueuedJson}
                  disabled={queuedBills.length === 0}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>

                <button
                  onClick={handleClearQueue}
                  disabled={queuedBills.length === 0}
                  className="bg-red-950/60 hover:bg-red-900 disabled:opacity-40 text-red-300 text-xs font-bold px-3 py-2 rounded-xl border border-red-800"
                >
                  Clear Queue
                </button>
              </div>

              <button
                onClick={syncOfflineQueue}
                disabled={isSyncing || queuedBills.length === 0}
                className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black text-xs px-5 py-2 rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing Server...' : 'Sync All Bills Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thermal Receipt Print Modal */}
      {showThermalReceipt && activeBill && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto cursor-pointer"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowThermalReceipt(false);
              handleClearTerminal();
            }
          }}
        >
          <div
            className="bg-white w-full max-w-sm sm:max-w-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl space-y-3 sm:space-y-4 text-center font-mono text-xs my-auto max-h-[90vh] overflow-y-auto relative border border-gray-100 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              onClick={() => {
                setShowThermalReceipt(false);
                handleClearTerminal();
              }}
              className="absolute top-3 right-3 p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors font-sans"
              title="Close Receipt"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Receipt Header */}
            <div className="border-b-2 border-dashed border-gray-300 pb-3 space-y-1 pt-1">
              <img
                src={STORE_DETAILS.logoUrl}
                alt={STORE_DETAILS.name}
                className="w-12 h-12 object-contain mx-auto mb-1 rounded-full border border-gray-200"
                referrerPolicy="no-referrer"
              />
              <h2 className="font-black text-lg text-gray-900 tracking-tight">SARV MART</h2>
              <p className="text-[10px] text-gray-600 font-sans">NKS Plaza, Near SBI Bank, Behta Bazar, Lucknow</p>
              <p className="text-[10px] text-gray-600 font-sans">GSTIN: 09SARVMART2026LKO</p>
              <p className="text-[10px] text-gray-600">Ph: +91 7388872588</p>
              <p className="text-[10px] font-bold text-gray-800 mt-2">Bill No: {activeBill.billNo}</p>
              <p className="text-[10px] text-gray-500">{activeBill.timestamp}</p>

              {activeBill.isOfflineSync && (
                <div className="bg-amber-100 text-amber-950 border border-amber-300 px-2 py-1 rounded text-[10px] font-sans font-bold flex items-center justify-center gap-1 mt-1">
                  <Zap className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>QUEUED OFFLINE (Auto-Sync On Reconnect)</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="space-y-1 text-left border-b-2 border-dashed border-gray-300 pb-3">
              <div className="flex justify-between font-bold text-[11px] pb-1 border-b border-gray-200">
                <span>ITEM</span>
                <span>QTY x RATE = TOTAL</span>
              </div>
              {activeBill.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span className="line-clamp-1 flex-1 pr-2">{item.product.name}</span>
                  <span className="font-bold shrink-0">
                    {item.quantity} x {item.product.price} = ₹{item.itemTotal}
                  </span>
                </div>
              ))}
            </div>

            {/* Bill Summary */}
            <div className="space-y-1 text-right font-bold text-xs border-b-2 border-dashed border-gray-300 pb-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{activeBill.subtotal}</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Incl. GST Tax:</span>
                <span>₹{activeBill.totalGst}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-gray-900 pt-1">
                <span>TOTAL:</span>
                <span>₹{activeBill.finalTotal}</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>Payment Mode:</span>
                <span>{activeBill.paymentMode}</span>
              </div>
              {activeBill.customerPhone && (
                <div className="flex justify-between text-[10px] text-emerald-800 font-bold bg-emerald-50 p-1 rounded mt-1">
                  <span>Customer (WhatsApp Captured):</span>
                  <span>{activeBill.customerName || 'Customer'} ({activeBill.customerPhone})</span>
                </div>
              )}
            </div>

            {/* WhatsApp Offer & E-Bill Send Widget */}
            {activeBill.customerPhone ? (
              <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-3 rounded-2xl text-left space-y-2 border border-emerald-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-sans font-bold text-xs text-emerald-300">
                    <MessageSquare className="w-4 h-4 text-emerald-400 fill-emerald-400/20 shrink-0" />
                    <span>Send WhatsApp E-Bill & Promo Offer</span>
                  </div>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.5 rounded border border-emerald-500/40 shrink-0">
                    CAPTURED
                  </span>
                </div>

                <p className="text-[10px] text-emerald-100/80 font-sans leading-tight">
                  Customer details captured for offers! Send instant WhatsApp receipt with <strong>₹100 OFF Coupon (WELCOME100)</strong>.
                </p>

                {whatsappSentStatus ? (
                  <div className="bg-emerald-800/80 text-emerald-200 text-[10px] font-sans p-2 rounded-xl flex items-center gap-1.5 border border-emerald-400/40">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    <span>{whatsappSentStatus}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      const cleanPhone = activeBill.customerPhone?.replace(/\D/g, '') || '';
                      const messageText = `🛒 *SARV MART LUCKNOW - POS RECEIPT & WELCOME OFFER* 🛒\n\nDear *${activeBill.customerName || 'Valued Customer'}*,\nThank you for shopping at Sarv Mart Lucknow (Behta Bazar)!\n\n🧾 *Bill No:* ${activeBill.billNo}\n💰 *Total Paid:* ₹${activeBill.finalTotal}\n💳 *Payment Mode:* ${activeBill.paymentMode}\n\n🎁 *SPECIAL WHATSAPP OFFER:* Use coupon code *WELCOME100* on your next store visit or online order to get *₹100 OFF* on purchases above ₹500!\n\n🌐 *Order Online:* https://sarvmart.com\n📞 *WhatsApp Order Helpline:* +91 7388872588\n\nHave a wonderful day ahead! 🙏`;
                      
                      const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(messageText)}`;
                      window.open(waUrl, '_blank');
                      setWhatsappSentStatus(`WhatsApp link opened for +91 ${cleanPhone}`);

                      // Log send event on server
                      fetch('/api/customers/send-whatsapp-offer', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          customerId: `cust_${activeBill.customerPhone}`,
                          offerMessage: messageText,
                          offerCode: 'WELCOME100'
                        })
                      }).catch(() => {});
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black font-sans text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                  >
                    <Share2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Send WhatsApp E-Bill & ₹100 Offer</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-amber-50 text-amber-900 border border-amber-200 p-2 rounded-xl text-left font-sans text-[10px]">
                💡 Tip: Enter customer's WhatsApp mobile number before printing to automatically capture them for marketing deals & send instant WhatsApp bills.
              </div>
            )}

            <p className="text-[10px] text-gray-500 font-sans">
              Thank you for shopping at Sarv Mart Lucknow!
            </p>

            {/* Receipt Actions */}
            <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200 font-sans">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-md active:scale-95 transition-all"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => {
                    setShowThermalReceipt(false);
                    handleClearTerminal();
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 px-3 rounded-xl text-xs transition-colors border border-gray-200"
                >
                  New Sale
                </button>
              </div>

              {/* Return to Home Page Button */}
              <button
                id="receipt-return-home-btn"
                onClick={handleCloseAndNavigateHome}
                className="w-full bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-md transition-all active:scale-95 border border-amber-500/50"
              >
                <Home className="w-4 h-4 text-emerald-950 shrink-0" />
                <span>Finish & Return to Home Page</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

