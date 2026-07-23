import React, { useState, useEffect, useRef } from 'react';
import { Order, OrderStatus, NotificationLog, NotificationChannel, NotificationMilestone } from '../types';
import {
  Truck,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  PackageCheck,
  Building2,
  ShieldCheck,
  Receipt,
  RotateCcw,
  MessageSquare,
  Mail,
  Send,
  Copy,
  Check,
  Play,
  Pause,
  Navigation,
  Eye,
  Layers,
  Award,
  Sparkles,
  Radio,
  BellRing,
  CheckCheck,
  KeyRound,
  Zap,
  ArrowRight,
  ChevronRight,
  X,
  ExternalLink,
  Info
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

  // Notification Modal State
  const [selectedNotification, setSelectedNotification] = useState<NotificationLog | null>(null);
  const [activeTab, setActiveTab] = useState<'tracking' | 'notifications' | 'otp_verify'>('tracking');

  // OTP Verification Input State
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);

  // Toast Banner State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
          message: `Hi ${currentOrder.address.fullName || 'Valued Customer'}, your order #${currentOrder.id} of ₹${currentOrder.totalAmount} is confirmed at Sarv Mart Behta Bazar Lucknow store. Packing in progress!`,
          timestamp: currentOrder.createdAt || new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Delivered',
        },
        {
          id: 'notif-2',
          orderId: currentOrder.id,
          milestone: 'dispatched',
          channel: 'SMS',
          recipient: currentOrder.address.phone || '+91 7388872588',
          title: 'Order Dispatched 🚚',
          message: `Sarv Mart Update: Order #${currentOrder.id} has been picked up by rider Ramesh Yadav (+91 7388872588). Track live on map.`,
          timestamp: new Date(Date.now() - 1800000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Delivered',
        },
        {
          id: 'notif-3',
          orderId: currentOrder.id,
          milestone: 'out_for_delivery',
          channel: 'SMS',
          recipient: currentOrder.address.phone || '+91 7388872588',
          title: 'Out for Delivery - OTP 4829',
          message: `Rider is 1.2 km away near Behta Bazar SBI. Share Delivery OTP: ${currentOrder.otp} upon arrival. Do not share with anyone else.`,
          timestamp: new Date(Date.now() - 600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

  // Handle Copy OTP
  const handleCopyOtp = () => {
    navigator.clipboard.writeText(currentOrder.otp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
    showToast(`OTP ${currentOrder.otp} copied to clipboard!`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Trigger manual push alert test
  const handleTriggerPushAlert = (milestone: NotificationMilestone, channel: NotificationChannel) => {
    const newNotif: NotificationLog = {
      id: `notif-${Date.now()}`,
      orderId: currentOrder.id,
      milestone,
      channel,
      recipient: currentOrder.address.phone || '+91 7388872588',
      title: `Push Alert: ${milestone.replace('_', ' ').toUpperCase()}`,
      message: `Automated ${channel} Push Alert sent for Order #${currentOrder.id}: Rider GPS waypoint verified near Lucknow Behta Bazar.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'Delivered',
    };

    setCurrentOrder((prev) => ({
      ...prev,
      notifications: [newNotif, ...(prev.notifications || [])],
    }));

    showToast(`📲 Automated ${channel} Push Alert Triggered & Delivered!`);
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
    const updatedStatus: OrderStatus = 'delivered';

    // Update state
    setCurrentOrder((prev) => ({
      ...prev,
      status: updatedStatus,
    }));

    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(currentOrder.id, updatedStatus);
    }

    // Add delivered notification log
    const deliveredNotif: NotificationLog = {
      id: `notif-delivered-${Date.now()}`,
      orderId: currentOrder.id,
      milestone: 'delivered',
      channel: 'WhatsApp',
      recipient: currentOrder.address.phone || '+91 7388872588',
      title: 'Order Delivered Successfully! ✅',
      message: `Your Sarv Mart Lucknow order #${currentOrder.id} was handed over with OTP verification. +50 reward points credited to your account. Thank you!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Delivered',
    };

    setCurrentOrder((prev) => ({
      ...prev,
      status: 'delivered',
      notifications: [deliveredNotif, ...(prev.notifications || [])],
    }));

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

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('tracking')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-extrabold text-xs transition-all ${
            activeTab === 'tracking'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Live Map & Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-extrabold text-xs transition-all relative ${
            activeTab === 'notifications'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>Automated Notifications ({currentOrder.notifications?.length || 0})</span>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-1 -right-1"></span>
        </button>

        <button
          onClick={() => setActiveTab('otp_verify')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-extrabold text-xs transition-all ${
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
                  const StepIcon = step.icon;

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

          {/* Right Column: High-Tech Interactive Map Canvas */}
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
                {/* Lucknow Map Grid Background Lines */}
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:20px_20px]" />

                {/* Simulated Street Route Canvas SVG */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
                  {/* Route Line */}
                  <path
                    d="M 50,150 Q 150,50 250,120 T 350,60"
                    fill="none"
                    stroke="#047857"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />

                  {/* Completed Route Highlight */}
                  <path
                    d="M 50,150 Q 150,50 250,120 T 350,60"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="4"
                    strokeDasharray="400"
                    strokeDashoffset={400 - (400 * routeProgress) / 100}
                  />

                  {/* Store Waypoint Pin */}
                  <g transform="translate(40, 140)">
                    <circle r="16" fill="#fbbf24" className="shadow-lg" />
                    <text x="-8" y="5" fontSize="12" fill="#022c22" fontWeight="bold">🏪</text>
                  </g>

                  {/* Rider Waypoint Marker (Dynamic along curve) */}
                  <g
                    transform={`translate(${50 + (300 * routeProgress) / 100}, ${
                      150 - Math.sin((routeProgress / 100) * Math.PI) * 70
                    })`}
                  >
                    <circle r="18" fill="#10b981" opacity="0.3" className="animate-ping" />
                    <circle r="14" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                    <text x="-7" y="5" fontSize="12">🛵</text>
                  </g>

                  {/* Destination Pin */}
                  <g transform="translate(350, 50)">
                    <circle r="16" fill="#ef4444" className="shadow-lg" />
                    <text x="-8" y="5" fontSize="12" fill="#ffffff" fontWeight="bold">📍</text>
                  </g>
                </svg>

                {/* Live Distance Overlay Box */}
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

              {/* Live Telemetry Controls */}
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

      {/* TAB 2: AUTOMATED PUSH NOTIFICATIONS LOG */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <BellRing className="w-5 h-5 text-emerald-600" />
                <span>Automated Push Notifications Log</span>
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                SMS, WhatsApp & Email alerts triggered automatically at key delivery milestones
              </p>
            </div>

            {/* Test Trigger Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTriggerPushAlert('out_for_delivery', 'WhatsApp')}
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Test WhatsApp Alert</span>
              </button>

              <button
                onClick={() => handleTriggerPushAlert('dispatched', 'SMS')}
                className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Test SMS Alert</span>
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
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                      log.channel === 'WhatsApp'
                        ? 'bg-green-100 text-green-700'
                        : log.channel === 'SMS'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {log.channel === 'WhatsApp' ? (
                      <MessageSquare className="w-5 h-5" />
                    ) : log.channel === 'SMS' ? (
                      <Send className="w-5 h-5" />
                    ) : (
                      <Mail className="w-5 h-5" />
                    )}
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

      {/* TAB 3: RIDER OTP VERIFICATION CONSOLE */}
      {activeTab === 'otp_verify' && (
        <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-md space-y-6 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-3xl flex items-center justify-center mx-auto">
            <KeyRound className="w-8 h-8 text-amber-600" />
          </div>

          <div>
            <h2 className="text-xl font-black text-gray-900">Rider Handover OTP Verification</h2>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Enter customer's 4-digit OTP code to verify and mark order as Delivered
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
                <span>Verification successful! Order marked as Delivered.</span>
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

            {/* Visual Message Card Preview */}
            <div
              className={`p-4 rounded-2xl border ${
                selectedNotification.channel === 'WhatsApp'
                  ? 'bg-green-50 border-green-200 text-green-950'
                  : 'bg-blue-50 border-blue-200 text-blue-950'
              }`}
            >
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
