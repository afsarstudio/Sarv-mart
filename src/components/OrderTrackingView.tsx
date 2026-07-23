import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, NotificationLog, NotificationMilestone } from '../types';
import {
  Truck,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  PackageCheck,
  Building2,
  MessageSquare,
  Mail,
  Send,
  Copy,
  Check,
  Play,
  Pause,
  Navigation,
  Eye,
  Radio,
  BellRing,
  CheckCheck,
  KeyRound,
  Zap,
  ChevronRight,
  X,
  ExternalLink,
  RefreshCw,
  Share2,
  Sparkles,
  ShieldCheck,
  Activity
} from 'lucide-react';

interface OrderTrackingViewProps {
  order: Order | null;
  onBackToShop: () => void;
  onUpdateOrderStatus?: (orderId: string, status: OrderStatus) => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  order,
  onBackToShop,
  onUpdateOrderStatus,
}) => {
  if (!order) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-white rounded-3xl border border-gray-200 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto">
          <Truck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900">No active order selected</h2>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          Place an order from Sarv Mart supermarket to experience live GPS delivery tracking and automated SMS/WhatsApp milestone push notifications.
        </p>
        <button
          onClick={onBackToShop}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-md transition-all"
        >
          Explore Products & Place Order
        </button>
      </div>
    );
  }

  // Local state for active order copy
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Live Map Simulation State
  const [isSimulatingGps, setIsSimulatingGps] = useState(true);
  const [routeProgress, setRouteProgress] = useState(65); // 0% at store, 100% at customer
  const [mapMode, setMapMode] = useState<'street' | 'satellite' | 'route'>('street');
  const [riderSpeed, setRiderSpeed] = useState(24);

  // Navigation Sub-Tab State
  const [activeTab, setActiveTab] = useState<'tracking' | 'whatsapp_engine' | 'notifications' | 'otp_verify'>('tracking');
  const [selectedNotification, setSelectedNotification] = useState<NotificationLog | null>(null);

  // OTP Verification Input State
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);

  // Toast & WhatsApp Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [waAutoTriggerEnabled, setWaAutoTriggerEnabled] = useState(true);
  const [customWaMsg, setCustomWaMsg] = useState('');
  const [sendingWa, setSendingWa] = useState(false);
  const [waToast, setWaToast] = useState<{
    title: string;
    message: string;
    waUrl: string;
    waMessageId: string;
    status: OrderStatus;
  } | null>(null);

  // Sync prop changes
  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  // Generate default milestone notifications if none exist
  useEffect(() => {
    if (!currentOrder.notifications || currentOrder.notifications.length === 0) {
      const initialLogs: NotificationLog[] = [
        {
          id: 'notif-1',
          orderId: currentOrder.id,
          milestone: 'confirmation',
          channel: 'WhatsApp',
          recipient: currentOrder.address.phone || '+91 7388872588',
          title: 'Order Confirmed! 🎉',
          message: `🎉 Hi ${currentOrder.address.fullName || 'Valued Customer'}, your Sarv Mart order #${currentOrder.id} of ₹${currentOrder.totalAmount} is confirmed at Behta Bazar Lucknow store. Packing in progress!`,
          timestamp: currentOrder.createdAt || new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Delivered',
        },
        {
          id: 'notif-2',
          orderId: currentOrder.id,
          milestone: 'dispatched',
          channel: 'WhatsApp',
          recipient: currentOrder.address.phone || '+91 7388872588',
          title: 'Order Dispatched 🚚',
          message: `🚚 Sarv Mart Update: Order #${currentOrder.id} picked up by rider Ramesh Yadav (+91 7388872588). Share Delivery OTP: ${currentOrder.otp}.`,
          timestamp: new Date(Date.now() - 1800000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Delivered',
        },
      ];

      setCurrentOrder((prev) => ({ ...prev, notifications: initialLogs }));
    }
  }, [currentOrder.id]);

  // Live GPS rider movement simulator loop
  useEffect(() => {
    if (!isSimulatingGps || currentOrder.status === 'delivered') return;

    const interval = setInterval(() => {
      setRouteProgress((prev) => {
        if (prev >= 98) {
          setIsSimulatingGps(false);
          return 98; // Arrived at customer doorstep
        }
        return prev + 1;
      });

      // Fluctuate rider speed
      setRiderSpeed(Math.floor(20 + Math.random() * 8));
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulatingGps, currentOrder.status]);

  // Calculated distance & ETA based on progress
  const remainingKm = Math.max(0.1, (1.8 * (100 - routeProgress) / 100)).toFixed(1);
  const remainingMins = Math.max(1, Math.ceil(Number(remainingKm) * 4));

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(currentOrder.otp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
    showToast(`OTP ${currentOrder.otp} copied to clipboard!`);
  };

  // Automated WhatsApp Status Notification Trigger
  const handleUpdateStatusAndNotifyWhatsApp = async (newStatus: OrderStatus) => {
    // 1. Update local state
    setCurrentOrder((prev) => ({
      ...prev,
      status: newStatus,
    }));

    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(currentOrder.id, newStatus);
    }

    // 2. Call backend WhatsApp messaging service endpoint
    try {
      const res = await fetch(`/api/orders/${currentOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (data.success && data.order) {
        if (data.order.notifications) {
          setCurrentOrder((prev) => ({
            ...prev,
            status: newStatus,
            notifications: data.order.notifications,
          }));
        }

        if (data.waResult) {
          const phone = currentOrder.address.phone || '7388872588';
          const cleanPhone = phone.replace(/\D/g, '');
          const waUrl = data.waResult.directWaUrl || `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(data.waResult.messageContent)}`;

          setWaToast({
            title: `WhatsApp Message Dispatched (${newStatus.toUpperCase()})`,
            message: data.waResult.messageContent,
            waUrl,
            waMessageId: data.waResult.waMessageId || 'wamid.HBgM882193',
            status: newStatus,
          });

          setTimeout(() => setWaToast(null), 8000);
        }
      } else {
        triggerLocalWhatsAppNotification(newStatus);
      }
    } catch {
      triggerLocalWhatsAppNotification(newStatus);
    }
  };

  // Helper for Local WhatsApp notification fallback
  const triggerLocalWhatsAppNotification = (newStatus: OrderStatus) => {
    const phone = currentOrder.address.phone || '7388872588';
    const custName = currentOrder.address.fullName || 'Valued Customer';
    let title = '';
    let msg = '';
    let milestone: NotificationMilestone = 'confirmation';

    if (newStatus === 'pending') {
      title = 'Order Confirmed! 🎉';
      msg = `🎉 Hi *${custName}*, your Sarv Mart order *#${currentOrder.id}* (Total: ₹${currentOrder.totalAmount}) is confirmed! Packing in progress. Delivery Slot: ${currentOrder.deliverySlot}.`;
      milestone = 'confirmation';
    } else if (newStatus === 'packing') {
      title = 'Items Freshly Packed 📦';
      msg = `📦 Hi *${custName}*, items for order *#${currentOrder.id}* are freshly packed & quality verified at Sarv Mart Behta Bazar. Ready for rider dispatch!`;
      milestone = 'confirmation';
    } else if (newStatus === 'dispatched') {
      title = 'Order Dispatched 🚚';
      msg = `🚚 Hi *${custName}*, order *#${currentOrder.id}* is on the way! Rider Ramesh Yadav (+91 7388872588) has picked up your parcel. Delivery OTP: *${currentOrder.otp}*.`;
      milestone = 'dispatched';
    } else if (newStatus === 'delivered') {
      title = 'Order Delivered! ✅';
      msg = `✅ Hi *${custName}*, order *#${currentOrder.id}* was delivered successfully. 🎁 +50 Sarv Mart reward points credited! Thank you for shopping with us.`;
      milestone = 'delivered';
    }

    const newLog: NotificationLog = {
      id: `notif-wa-local-${Date.now()}`,
      orderId: currentOrder.id,
      milestone,
      channel: 'WhatsApp',
      recipient: phone,
      title,
      message: msg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Delivered',
    };

    setCurrentOrder((prev) => ({
      ...prev,
      notifications: [newLog, ...(prev.notifications || [])],
    }));

    const cleanPhone = phone.replace(/\D/g, '');
    const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`;

    setWaToast({
      title: `WhatsApp Alert (${newStatus.toUpperCase()})`,
      message: msg,
      waUrl,
      waMessageId: `wamid.HBgM${Math.floor(100000 + Math.random() * 900000)}`,
      status: newStatus,
    });

    setTimeout(() => setWaToast(null), 8000);
  };

  // Handle sending direct custom WhatsApp message to customer
  const handleSendCustomWhatsAppMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customWaMsg.trim()) return;

    setSendingWa(true);
    const phone = currentOrder.address.phone || '7388872588';
    const cleanPhone = phone.replace(/\D/g, '');

    try {
      const res = await fetch(`/api/orders/${currentOrder.id}/notify-whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customMessage: customWaMsg, targetStatus: currentOrder.status }),
      });

      const data = await res.json();
      const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(customWaMsg)}`;

      setWaToast({
        title: 'Custom WhatsApp Notification Sent',
        message: customWaMsg,
        waUrl,
        waMessageId: data.waResult?.waMessageId || `wamid.HBgM${Date.now().toString().slice(-6)}`,
        status: currentOrder.status,
      });

      const newLog: NotificationLog = {
        id: `notif-custom-wa-${Date.now()}`,
        orderId: currentOrder.id,
        milestone: 'confirmation',
        channel: 'WhatsApp',
        recipient: phone,
        title: 'Direct Customer Alert 💬',
        message: customWaMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Delivered',
      };

      setCurrentOrder((prev) => ({
        ...prev,
        notifications: [newLog, ...(prev.notifications || [])],
      }));

      setCustomWaMsg('');
      setTimeout(() => setWaToast(null), 8000);
    } catch {
      alert('Custom notification logged locally!');
    } finally {
      setSendingWa(false);
    }
  };

  // Verify Delivery OTP
  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    if (enteredOtp.trim() !== currentOrder.otp) {
      setOtpError(`Invalid OTP entered. Please enter correct 4-digit code (${currentOrder.otp}).`);
      return;
    }

    setOtpSuccess(true);
    handleUpdateStatusAndNotifyWhatsApp('delivered');
    showToast('🎉 Order Verified & Delivered Successfully! 50 Reward Points Earned.');
  };

  const steps: { status: OrderStatus; label: string; desc: string; icon: any }[] = [
    { status: 'pending', label: 'Order Confirmed', desc: 'Received at Sarv Mart NKS Plaza Store', icon: Building2 },
    { status: 'packing', label: 'Items Packed', desc: 'Freshness & quality verified', icon: PackageCheck },
    { status: 'dispatched', label: 'Out for Delivery', desc: 'Rider Ramesh Yadav is on the way', icon: Truck },
    { status: 'delivered', label: 'Order Delivered', desc: 'Handed over with OTP verification', icon: CheckCircle2 },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'packing':
        return 1;
      case 'dispatched':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(currentOrder.status);

  return (
    <div className="max-w-6xl mx-auto my-6 px-4 sm:px-8 text-left space-y-6 animate-fade-in relative pb-12">
      {/* Toast Notification Alert Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500 flex items-center gap-3 animate-slide-in">
          <BellRing className="w-5 h-5 text-amber-400 animate-bounce" />
          <p className="text-xs font-bold">{toastMessage}</p>
        </div>
      )}

      {/* Floating WhatsApp Auto-Dispatched Pop-up Toast */}
      {waToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-emerald-950 text-white p-5 rounded-3xl shadow-2xl border-2 border-emerald-400 animate-slide-in space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-500 text-emerald-950 rounded-xl">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-xs text-emerald-200">{waToast.title}</span>
            </div>

            <button onClick={() => setWaToast(null)} className="text-emerald-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs font-medium text-emerald-100 bg-emerald-900/60 p-3 rounded-2xl leading-relaxed">
            {waToast.message}
          </p>

          <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono">
            <span>ID: {waToast.waMessageId}</span>
            <span>Status: Delivered</span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <a
              href={waToast.waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-500 hover:bg-green-400 text-emerald-950 font-black text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in WhatsApp Web / App</span>
            </a>
            <button
              onClick={() => setWaToast(null)}
              className="bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-xs px-3 py-2 rounded-xl font-bold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-emerald-700/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-emerald-950 font-black text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse text-emerald-900" />
              Live Order Tracker
            </span>
            <span className="text-xs text-emerald-200 font-mono">ID: #{currentOrder.id}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
            {currentOrder.status === 'delivered' ? 'Order Delivered!' : `Estimated Delivery: ${remainingMins} mins`}
          </h1>
          <p className="text-xs text-emerald-100 font-medium mt-1">
            {currentOrder.deliverySlot} • Lucknow 226026
          </p>
        </div>

        {/* OTP Security Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="text-left">
            <p className="text-[10px] uppercase font-black text-amber-300 flex items-center gap-1 tracking-wider">
              <KeyRound className="w-3.5 h-3.5 text-amber-300" />
              Delivery OTP Code
            </p>
            <p className="text-2xl font-black font-mono tracking-widest text-white mt-0.5">
              {currentOrder.otp}
            </p>
            <p className="text-[10px] text-emerald-200">Share with rider upon arrival</p>
          </div>

          <button
            onClick={handleCopyOtp}
            className="bg-amber-400 hover:bg-amber-300 text-emerald-950 p-2.5 rounded-xl font-bold transition-all shadow-xs"
            title="Copy OTP"
          >
            {copiedOtp ? <Check className="w-5 h-5 text-emerald-900" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* AUTOMATED WHATSAPP STATUS NOTIFICATION CONTROLLER BAR */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm text-left space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 text-green-800 rounded-xl">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                <span>Automated WhatsApp Status Notification Switcher</span>
                <span className="bg-green-100 text-green-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                  Meta Graph API Active
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                Click a milestone status below to update order status & dispatch an automated WhatsApp notification to +91 {currentOrder.address.phone || '7388872588'}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-600">Auto-Triggers:</span>
            <button
              onClick={() => setWaAutoTriggerEnabled(!waAutoTriggerEnabled)}
              className={`px-3 py-1 rounded-full text-xs font-black transition-colors ${
                waAutoTriggerEnabled ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {waAutoTriggerEnabled ? 'ENABLED' : 'PAUSED'}
            </button>
          </div>
        </div>

        {/* Milestone Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <button
            onClick={() => handleUpdateStatusAndNotifyWhatsApp('pending')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              currentOrder.status === 'pending'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                : 'bg-gray-50 hover:bg-emerald-50 text-gray-800 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider opacity-80">Phase 1</span>
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <p className="font-extrabold text-xs mt-1">1. Confirmed</p>
            <p className="text-[10px] opacity-80 mt-0.5 truncate">Send WA Confirmed Alert</p>
          </button>

          <button
            onClick={() => handleUpdateStatusAndNotifyWhatsApp('packing')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              currentOrder.status === 'packing'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                : 'bg-gray-50 hover:bg-emerald-50 text-gray-800 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider opacity-80">Phase 2</span>
              <PackageCheck className="w-3.5 h-3.5" />
            </div>
            <p className="font-extrabold text-xs mt-1">2. Packed</p>
            <p className="text-[10px] opacity-80 mt-0.5 truncate">Send WA Items Packed Alert</p>
          </button>

          <button
            onClick={() => handleUpdateStatusAndNotifyWhatsApp('dispatched')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              currentOrder.status === 'dispatched'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                : 'bg-gray-50 hover:bg-emerald-50 text-gray-800 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider opacity-80">Phase 3</span>
              <Truck className="w-3.5 h-3.5" />
            </div>
            <p className="font-extrabold text-xs mt-1">3. Dispatched</p>
            <p className="text-[10px] opacity-80 mt-0.5 truncate">Send WA Dispatched Alert</p>
          </button>

          <button
            onClick={() => handleUpdateStatusAndNotifyWhatsApp('delivered')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              currentOrder.status === 'delivered'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                : 'bg-gray-50 hover:bg-emerald-50 text-gray-800 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider opacity-80">Phase 4</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <p className="font-extrabold text-xs mt-1">4. Delivered</p>
            <p className="text-[10px] opacity-80 mt-0.5 truncate">Send WA Delivered Alert</p>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tracking')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-extrabold text-xs transition-all whitespace-nowrap ${
            activeTab === 'tracking'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Live Map & Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('whatsapp_engine')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-extrabold text-xs transition-all whitespace-nowrap relative ${
            activeTab === 'whatsapp_engine'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-amber-300" />
          <span>WhatsApp Messaging Service</span>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping absolute -top-1 -right-1"></span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-extrabold text-xs transition-all whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>Notification Logs ({currentOrder.notifications?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('otp_verify')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-extrabold text-xs transition-all whitespace-nowrap ${
            activeTab === 'otp_verify'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Rider OTP Verification</span>
        </button>
      </div>

      {/* TAB 1: LIVE MAP & TIMELINE TRACKING */}
      {activeTab === 'tracking' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Timeline & Rider Details */}
          <div className="md:col-span-6 space-y-6">
            {/* Step Timeline */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-600" />
                  <span>Delivery Status Milestones</span>
                </h2>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {currentOrder.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-6 relative pl-5 border-l-2 border-emerald-100 ml-2">
                {steps.map((step, idx) => {
                  const isDone = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div key={step.status} className="relative flex items-start gap-4">
                      <div
                        className={`absolute -left-[29px] top-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-md ring-4 ring-emerald-100'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-extrabold ${isCurrent ? 'text-emerald-700' : 'text-gray-900'}`}>
                              {step.label}
                            </p>
                            {isCurrent && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                                Active Phase
                              </span>
                            )}
                          </div>

                          {isDone && (
                            <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 font-bold flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-green-600" />
                              <span>WA Alert Sent</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rider Details Card */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-700 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-md">
                  R
                </div>
                <div>
                  <p className="font-extrabold text-sm text-gray-900">Ramesh Yadav</p>
                  <p className="text-xs text-gray-500 font-medium">Hero Splendor • UP32 EV 9421</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px]">
                    <span className="text-amber-600 font-bold">★ 4.9 Rating</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-emerald-700 font-bold">840+ deliveries</span>
                  </div>
                </div>
              </div>

              <a
                href="tel:+917388872588"
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call Rider</span>
              </a>
            </div>

            {/* Delivery Address Card */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Delivery Destination</span>
              </div>
              <p className="font-bold text-gray-900">{currentOrder.address.fullName || 'Customer'}</p>
              <p className="text-gray-600">
                {currentOrder.address.streetAddress}, {currentOrder.address.landmark}, {currentOrder.address.area}, {currentOrder.address.city} - {currentOrder.address.pincode}
              </p>
              <p className="text-gray-500 font-mono">Contact: {currentOrder.address.phone}</p>
            </div>
          </div>

          {/* Right Column: Interactive GPS Map Canvas */}
          <div className="md:col-span-6 space-y-6">
            <div className="bg-emerald-950 rounded-3xl border border-emerald-800 p-5 text-white space-y-4 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[420px]">
              {/* Map Header Controls */}
              <div className="flex items-center justify-between gap-2 z-10">
                <div className="flex items-center gap-2 bg-emerald-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-700/60">
                  <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-100">Live GPS Telemetry</span>
                </div>

                <div className="flex items-center gap-1.5 bg-emerald-900/80 p-1 rounded-xl border border-emerald-700/60 text-[11px]">
                  <button
                    onClick={() => setMapMode('street')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                      mapMode === 'street' ? 'bg-amber-400 text-emerald-950 shadow-xs' : 'text-emerald-200'
                    }`}
                  >
                    2D Map
                  </button>
                  <button
                    onClick={() => setMapMode('satellite')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                      mapMode === 'satellite' ? 'bg-amber-400 text-emerald-950 shadow-xs' : 'text-emerald-200'
                    }`}
                  >
                    Satellite
                  </button>
                </div>
              </div>

              {/* Simulated Map Visual Canvas */}
              <div className="relative w-full h-64 my-auto bg-emerald-900/40 rounded-2xl border border-emerald-800/80 overflow-hidden flex items-center justify-center p-4">
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:20px_20px]" />

                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
                  <path
                    d="M 50,150 Q 150,50 250,120 T 350,60"
                    fill="none"
                    stroke="#047857"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />

                  <path
                    d="M 50,150 Q 150,50 250,120 T 350,60"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="4"
                    strokeDasharray="400"
                    strokeDashoffset={400 - (400 * routeProgress) / 100}
                  />

                  <g transform="translate(40, 140)">
                    <circle r="16" fill="#fbbf24" className="shadow-lg" />
                    <text x="-8" y="5" fontSize="12" fill="#022c22" fontWeight="bold">🏪</text>
                  </g>

                  <g
                    transform={`translate(${50 + (300 * routeProgress) / 100}, ${
                      150 - Math.sin((routeProgress / 100) * Math.PI) * 70
                    })`}
                  >
                    <circle r="18" fill="#10b981" opacity="0.3" className="animate-ping" />
                    <circle r="14" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                    <text x="-7" y="5" fontSize="12">🛵</text>
                  </g>

                  <g transform="translate(350, 50)">
                    <circle r="16" fill="#ef4444" className="shadow-lg" />
                    <text x="-8" y="5" fontSize="12" fill="#ffffff" fontWeight="bold">📍</text>
                  </g>
                </svg>

                <div className="absolute bottom-3 left-3 bg-emerald-950/90 backdrop-blur-md p-3 rounded-xl border border-emerald-700/80 text-[11px] space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-300 font-extrabold">{remainingKm} km</span>
                    <span className="text-emerald-300">Remaining</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-white font-bold">{riderSpeed} km/h</span>
                    <span className="text-emerald-400">Rider Speed</span>
                  </div>
                </div>

                <div className="absolute top-3 right-3 bg-emerald-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-700/80 text-[11px] font-mono text-emerald-200">
                  Lucknow 226026
                </div>
              </div>

              {/* Telemetry Controls */}
              <div className="flex items-center justify-between gap-3 z-10 pt-2 border-t border-emerald-800/80">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSimulatingGps(!isSimulatingGps)}
                    className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                  >
                    {isSimulatingGps ? <Pause className="w-3.5 h-3.5 text-amber-300" /> : <Play className="w-3.5 h-3.5 text-emerald-300" />}
                    <span>{isSimulatingGps ? 'Pause GPS' : 'Resume GPS'}</span>
                  </button>

                  <button
                    onClick={() => setRouteProgress((prev) => Math.min(100, prev + 10))}
                    className="bg-emerald-900/80 hover:bg-emerald-800 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-200"
                  >
                    Step +10%
                  </button>
                </div>

                <p className="text-[11px] text-emerald-300 font-medium">
                  Near Behta Bazar SBI Branch
                </p>
              </div>
            </div>

            {/* Quick Invoice & Payment Summary */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="font-extrabold text-sm text-gray-900">Invoice #{currentOrder.invoiceNumber}</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  {currentOrder.paymentMethod} • {currentOrder.paymentStatus}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Items ({currentOrder.items.length})</span>
                  <span>₹{currentOrder.subtotal}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span>-₹{currentOrder.discount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹{currentOrder.deliveryFee}</span>
                </div>
                <div className="flex justify-between font-black text-gray-900 text-sm pt-2 border-t border-gray-100">
                  <span>Total Paid</span>
                  <span>₹{currentOrder.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WHATSAPP AUTOMATED MESSAGING SERVICE */}
      {activeTab === 'whatsapp_engine' && (
        <div className="space-y-6">
          {/* Service Status Header Card */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-6 rounded-3xl border border-emerald-700 shadow-lg space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-emerald-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500 text-emerald-950 rounded-2xl font-black shadow-md">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg flex items-center gap-2">
                    <span>Sarv Mart WhatsApp Order Status Engine</span>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </h3>
                  <p className="text-xs text-emerald-100">
                    Automated customer notifications triggered instantly via Meta WhatsApp Business Graph API on order status transition.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="bg-green-500/20 text-green-300 border border-green-500/40 px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-green-400 animate-pulse" />
                  <span>Engine: Active</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-emerald-900/60 p-3 rounded-2xl border border-emerald-800">
                <p className="text-emerald-300 font-bold uppercase text-[10px]">Target Phone</p>
                <p className="text-sm font-black text-white font-mono mt-0.5">+91 {currentOrder.address.phone || '7388872588'}</p>
                <p className="text-[10px] text-emerald-200 mt-0.5">{currentOrder.address.fullName || 'Valued Customer'}</p>
              </div>

              <div className="bg-emerald-900/60 p-3 rounded-2xl border border-emerald-800">
                <p className="text-emerald-300 font-bold uppercase text-[10px]">Active Order ID</p>
                <p className="text-sm font-black text-white font-mono mt-0.5">#{currentOrder.id}</p>
                <p className="text-[10px] text-emerald-200 mt-0.5">Status: {currentOrder.status.toUpperCase()}</p>
              </div>

              <div className="bg-emerald-900/60 p-3 rounded-2xl border border-emerald-800">
                <p className="text-emerald-300 font-bold uppercase text-[10px]">Delivery OTP</p>
                <p className="text-sm font-black text-amber-300 font-mono mt-0.5">{currentOrder.otp}</p>
                <p className="text-[10px] text-emerald-200 mt-0.5">Auto-included in dispatch text</p>
              </div>
            </div>
          </div>

          {/* Interactive Custom WhatsApp Messenger Form */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-gray-900">Send Direct WhatsApp Message to Customer</h3>
              </div>
              <span className="text-xs text-gray-500 font-mono">Recipient: +91 {currentOrder.address.phone}</span>
            </div>

            <form onSubmit={handleSendCustomWhatsAppMessage} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Custom WhatsApp Message Text
                </label>
                <textarea
                  rows={3}
                  value={customWaMsg}
                  onChange={(e) => setCustomWaMsg(e.target.value)}
                  placeholder={`e.g. Hello ${currentOrder.address.fullName || 'Customer'}, your order #${currentOrder.id} is ready! Rider Ramesh Yadav is arriving in ~10 mins. OTP: ${currentOrder.otp}`}
                  className="w-full bg-gray-50 border border-gray-300 rounded-2xl p-3 text-xs text-gray-900 outline-none focus:border-emerald-600 focus:bg-white transition-all font-sans"
                />
              </div>

              {/* Quick Preset Tags */}
              <div className="flex items-center gap-2 overflow-x-auto text-[11px] pb-1">
                <span className="text-gray-400 font-bold shrink-0">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => setCustomWaMsg(`🎉 *Order Confirmed!* Hi ${currentOrder.address.fullName || 'Customer'}, your Sarv Mart order #${currentOrder.id} (₹${currentOrder.totalAmount}) is confirmed at Behta Bazar Lucknow!`)}
                  className="bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-900 px-2.5 py-1 rounded-xl whitespace-nowrap font-medium"
                >
                  + Order Confirmed
                </button>

                <button
                  type="button"
                  onClick={() => setCustomWaMsg(`🚚 *Rider Dispatched!* Hi ${currentOrder.address.fullName || 'Customer'}, rider Ramesh Yadav (+91 7388872588) is on the way for order #${currentOrder.id}. OTP: *${currentOrder.otp}*.`)}
                  className="bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-900 px-2.5 py-1 rounded-xl whitespace-nowrap font-medium"
                >
                  + Rider Dispatched
                </button>

                <button
                  type="button"
                  onClick={() => setCustomWaMsg(`📍 *Near Doorstep!* Rider is 2 mins away near Behta Bazar. Please keep OTP: *${currentOrder.otp}* ready!`)}
                  className="bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-900 px-2.5 py-1 rounded-xl whitespace-nowrap font-medium"
                >
                  + Near Doorstep
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <a
                  href={`https://wa.me/91${(currentOrder.address.phone || '7388872588').replace(/\D/g, '')}?text=${encodeURIComponent(customWaMsg || `Hello ${currentOrder.address.fullName}, update regarding order #${currentOrder.id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-5 py-2.5 rounded-2xl transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open WhatsApp App</span>
                </a>

                <button
                  type="submit"
                  disabled={sendingWa || !customWaMsg.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs px-6 py-2.5 rounded-2xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingWa ? 'Dispatching...' : 'Dispatch via WhatsApp API'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Automated Message Milestone Templates Preview */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-gray-900">Automated Milestone Templates for Order #{currentOrder.id}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    1. Order Confirmed Template
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">Automated</span>
                </div>
                <p className="text-xs text-gray-800 leading-relaxed font-sans bg-white p-3 rounded-xl border border-emerald-100">
                  🎉 *Order Confirmed!* Hi *{currentOrder.address.fullName || 'Customer'}*, your Sarv Mart order *#{currentOrder.id}* (Total: ₹{currentOrder.totalAmount}) is confirmed at Behta Bazar Lucknow store. Packing in progress! Delivery Slot: {currentOrder.deliverySlot}.
                </p>
                <button
                  onClick={() => handleUpdateStatusAndNotifyWhatsApp('pending')}
                  className="text-emerald-700 font-bold text-[11px] hover:underline flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  <span>Trigger Status & WhatsApp Message</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-emerald-950 flex items-center gap-1.5">
                    <PackageCheck className="w-4 h-4 text-emerald-600" />
                    2. Items Packed Template
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">Automated</span>
                </div>
                <p className="text-xs text-gray-800 leading-relaxed font-sans bg-white p-3 rounded-xl border border-emerald-100">
                  📦 *Items Packed & Ready!* Hi *{currentOrder.address.fullName || 'Customer'}*, items for your Sarv Mart order *#{currentOrder.id}* have been quality checked & packed at our Lucknow store. Dispatching shortly!
                </p>
                <button
                  onClick={() => handleUpdateStatusAndNotifyWhatsApp('packing')}
                  className="text-emerald-700 font-bold text-[11px] hover:underline flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  <span>Trigger Status & WhatsApp Message</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-emerald-950 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    3. Order Dispatched Template
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">Automated</span>
                </div>
                <p className="text-xs text-gray-800 leading-relaxed font-sans bg-white p-3 rounded-xl border border-emerald-100">
                  🚚 *Order Dispatched!* Hi *{currentOrder.address.fullName || 'Customer'}*, order *#{currentOrder.id}* is on the way! Rider Ramesh Yadav (+91 7388872588) has picked up your parcel. Delivery OTP: *{currentOrder.otp}*.
                </p>
                <button
                  onClick={() => handleUpdateStatusAndNotifyWhatsApp('dispatched')}
                  className="text-emerald-700 font-bold text-[11px] hover:underline flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  <span>Trigger Status & WhatsApp Message</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    4. Order Delivered Template
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">Automated</span>
                </div>
                <p className="text-xs text-gray-800 leading-relaxed font-sans bg-white p-3 rounded-xl border border-emerald-100">
                  ✅ *Order Delivered!* Hi *{currentOrder.address.fullName || 'Customer'}*, order *#{currentOrder.id}* was handed over with OTP verification. 🎁 +50 Sarv Mart reward points credited to your account! Thank you for shopping with us.
                </p>
                <button
                  onClick={() => handleUpdateStatusAndNotifyWhatsApp('delivered')}
                  className="text-emerald-700 font-bold text-[11px] hover:underline flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  <span>Trigger Status & WhatsApp Message</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUTOMATED PUSH NOTIFICATIONS LOG */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <BellRing className="w-5 h-5 text-emerald-600" />
                <span>Automated WhatsApp & Push Notifications Log</span>
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Real-time WhatsApp & SMS alerts triggered at every order status milestone
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpdateStatusAndNotifyWhatsApp(currentOrder.status)}
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Re-Trigger WhatsApp Alert</span>
              </button>
            </div>
          </div>

          {/* Notifications Log Table / Cards */}
          <div className="space-y-3">
            {currentOrder.notifications?.map((log) => (
              <div
                key={log.id}
                onClick={() => setSelectedNotification(log)}
                className="p-4 rounded-2xl border border-gray-200 hover:border-emerald-500 bg-gray-50/50 hover:bg-white cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 bg-green-100 text-green-700">
                    <MessageSquare className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-emerald-700">
                        {log.title}
                      </h4>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        {log.milestone.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-1 mt-1 font-medium">{log.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-2">
                      <span>Recipient: {log.recipient}</span>
                      <span>•</span>
                      <span>Time: {log.timestamp}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCheck className="w-4 h-4 text-emerald-600" />
                    <span>{log.status}</span>
                  </span>

                  <button className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-gray-200">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RIDER OTP VERIFICATION CONSOLE */}
      {activeTab === 'otp_verify' && (
        <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-md space-y-6 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-3xl flex items-center justify-center mx-auto">
            <KeyRound className="w-8 h-8 text-amber-600" />
          </div>

          <div>
            <h2 className="text-xl font-black text-gray-900">Rider Handover OTP Verification</h2>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Enter customer's 4-digit OTP code to verify and mark order as Delivered & trigger WhatsApp receipt.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-1">
            <p className="text-[10px] uppercase font-black text-emerald-800">Customer OTP</p>
            <p className="text-3xl font-black font-mono tracking-widest text-emerald-900">
              {currentOrder.otp}
            </p>
          </div>

          <form onSubmit={handleVerifyOtpSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Enter 4-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={4}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                placeholder="e.g. 4829"
                className="w-full text-center text-2xl font-black tracking-widest py-3 border-2 border-gray-200 rounded-2xl focus:border-emerald-600 focus:outline-none"
              />
            </div>

            {otpError && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-xl text-center">
                {otpError}
              </p>
            )}

            {otpSuccess && (
              <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-3 rounded-xl text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verification successful! Order marked as Delivered and WhatsApp notification sent.</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg transition-all"
            >
              Verify OTP & Complete Delivery
            </button>
          </form>
        </div>
      )}

      {/* Notification Preview Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200 animate-scale-up text-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-gray-900">
                  {selectedNotification.channel} Alert Preview
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  {selectedNotification.status}
                </span>
              </div>

              <button
                onClick={() => setSelectedNotification(null)}
                className="p-1 rounded-xl hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl border bg-green-50 border-green-200 text-green-950">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 mb-2">
                <span>To: {selectedNotification.recipient}</span>
                <span>{selectedNotification.timestamp}</span>
              </div>

              <h4 className="font-extrabold text-sm mb-1">{selectedNotification.title}</h4>
              <p className="text-xs leading-relaxed font-medium">{selectedNotification.message}</p>
            </div>

            <button
              onClick={() => setSelectedNotification(null)}
              className="w-full bg-gray-900 text-white font-bold text-xs py-2.5 rounded-xl"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
