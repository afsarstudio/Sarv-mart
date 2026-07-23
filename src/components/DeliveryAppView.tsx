import React, { useState } from 'react';
import { Order } from '../types';
import { Truck, Phone, MapPin, CheckCircle2, ShieldCheck, Navigation, AlertCircle } from 'lucide-react';

interface DeliveryAppViewProps {
  orders: Order[];
  onCompleteDelivery: (orderId: string) => void;
}

export const DeliveryAppView: React.FC<DeliveryAppViewProps> = ({ orders, onCompleteDelivery }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [otpInput, setOtpInput] = useState<Record<string, string>>({});

  const activeOrders = orders.filter((o) => o.status === 'dispatched' || o.status === 'packing');

  const handleVerifyAndComplete = (order: Order) => {
    const entered = otpInput[order.id]?.trim();
    if (entered === order.otp) {
      onCompleteDelivery(order.id);
      alert(`Order ${order.id} delivered successfully!`);
    } else {
      alert(`Incorrect OTP entered! Correct OTP for testing is ${order.otp}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-6 px-4 text-left space-y-6 animate-fade-in">
      {/* Rider Header */}
      <div className="bg-emerald-900 text-white p-5 rounded-3xl shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-400 text-emerald-950 font-black rounded-2xl flex items-center justify-center text-xl">
            R
          </div>
          <div>
            <h1 className="text-lg font-black">Ramesh Yadav (Rider ID #8812)</h1>
            <p className="text-xs text-emerald-200">Sarv Mart Lucknow • Vehicle: UP 32 EV 4912</p>
          </div>
        </div>

        {/* Online Status Toggle */}
        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            isOnline ? 'bg-emerald-500 text-white shadow-xs' : 'bg-gray-700 text-gray-300'
          }`}
        >
          {isOnline ? '● Online & Accepting' : '○ Offline'}
        </button>
      </div>

      {/* Active Orders List */}
      <div className="space-y-4">
        <h2 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
          <Truck className="w-5 h-5 text-emerald-600" />
          <span>Assigned Express Deliveries ({activeOrders.length})</span>
        </h2>

        {activeOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center text-gray-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="font-bold text-gray-800">All assigned deliveries completed!</p>
            <p className="text-xs text-gray-400">Waiting at Sarv Mart NKS Plaza Behta Bazar store for next batch.</p>
          </div>
        ) : (
          activeOrders.map((order) => (
            <div key={order.id} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 text-xs">
                <div>
                  <span className="font-black text-sm text-gray-900">{order.id}</span>
                  <span className="text-gray-500 font-mono ml-2">Slot: {order.deliverySlot}</span>
                </div>
                <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full uppercase">
                  {order.status}
                </span>
              </div>

              {/* Customer details */}
              <div className="space-y-1 text-xs text-gray-700">
                <p className="font-extrabold text-sm text-gray-900">{order.address.fullName}</p>
                <p className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{order.address.streetAddress}, {order.address.area}, Lucknow ({order.address.pincode})</span>
                </p>
                <p className="text-gray-500">Landmark: {order.address.landmark}</p>
              </div>

              {/* Call Customer & Navigation */}
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`tel:${order.address.phone}`}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Customer ({order.address.phone})</span>
                </a>

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(order.address.streetAddress + ' ' + order.address.city)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-2.5 rounded-xl flex items-center gap-1"
                >
                  <Navigation className="w-4 h-4" />
                  <span>GPS Map</span>
                </a>
              </div>

              {/* OTP Delivery Verification */}
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center gap-2 text-xs">
                <span className="font-bold text-emerald-950 shrink-0">Enter OTP:</span>
                <input
                  type="text"
                  maxLength={4}
                  value={otpInput[order.id] || ''}
                  onChange={(e) => setOtpInput({ ...otpInput, [order.id]: e.target.value })}
                  placeholder="4-digit OTP"
                  className="bg-white border border-emerald-300 rounded-lg px-2 py-1 text-xs font-mono font-bold w-28 outline-none text-center"
                />
                <button
                  onClick={() => handleVerifyAndComplete(order)}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3 py-1.5 rounded-xl text-xs ml-auto"
                >
                  Verify & Handover
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
