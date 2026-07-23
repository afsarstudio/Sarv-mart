import React, { useState } from 'react';
import { CartItem, Coupon, OrderAddress, Order } from '../types';
import {
  MapPin,
  Clock,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  ShieldCheck,
  Building2,
  ArrowRight,
  Truck,
  Plus,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MOCK_USER_PROFILE } from '../data/mockData';

interface CheckoutViewProps {
  cartItems: CartItem[];
  appliedCoupon: Coupon | null;
  onOrderPlaced: (order: Order) => void;
  onBackToShop: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cartItems,
  appliedCoupon,
  onOrderPlaced,
  onBackToShop,
}) => {
  const [selectedAddress, setSelectedAddress] = useState<OrderAddress>(
    MOCK_USER_PROFILE.savedAddresses[0]
  );
  const [selectedSlot, setSelectedSlot] = useState('Express Within 12 Hours');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'COD' | 'Wallet'>('UPI');
  const [needGstInvoice, setNeedGstInvoice] = useState(false);
  const [gstinNumber, setGstinNumber] = useState('09AAAAA0000A1Z5');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Bill Calculations
  const itemTotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const isFreeDelivery = itemTotal >= 399;
  const deliveryFee = isFreeDelivery ? 0 : 40;

  let couponDiscount = 0;
  if (appliedCoupon && itemTotal >= appliedCoupon.minOrderValue) {
    if (appliedCoupon.discountType === 'flat') {
      couponDiscount = appliedCoupon.discountValue;
    } else {
      couponDiscount = Math.round((itemTotal * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.maxDiscount) couponDiscount = Math.min(couponDiscount, appliedCoupon.maxDiscount);
    }
  }

  const finalTotal = Math.max(0, itemTotal + deliveryFee - couponDiscount);

  const deliverySlots = [
    { title: 'Express Delivery', desc: 'Guaranteed Within 12 Hours', isPopular: true },
    { title: 'Today Morning', desc: '07:00 AM - 10:00 AM' },
    { title: 'Today Evening', desc: '05:00 PM - 08:00 PM' },
    { title: 'Tomorrow Morning', desc: '07:00 AM - 10:00 AM' },
  ];

  const handleConfirmOrder = async () => {
    setIsPlacingOrder(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          address: selectedAddress,
          deliverySlot: selectedSlot,
          paymentMethod,
          couponCode: appliedCoupon?.code,
          subtotal: itemTotal,
          discount: couponDiscount,
          gstAmount: Math.round(itemTotal * 0.05),
          deliveryFee,
          totalAmount: finalTotal,
          gstin: needGstInvoice ? gstinNumber : undefined,
        }),
      });

      const data = await res.json();

      if (data.success && data.order) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        onOrderPlaced(data.order);
      }
    } catch (err) {
      console.error('Failed to create order', err);
      alert('Order placed locally!');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto my-8 px-4 sm:px-8 text-left space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Checkout</h1>
          <p className="text-xs text-gray-500 font-medium">Deliveries from Sarv Mart Behta Bazar Lucknow Store</p>
        </div>

        <button
          onClick={onBackToShop}
          className="text-xs font-bold text-emerald-700 hover:underline"
        >
          ← Back to Shopping
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Section */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Delivery Address */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                  1
                </span>
                <span>Delivery Address in Lucknow</span>
              </h2>

              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full">
                PIN 226026
              </span>
            </div>

            {/* Saved Address Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOCK_USER_PROFILE.savedAddresses.map((addr, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedAddress(addr)}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${
                    selectedAddress.streetAddress === addr.streetAddress
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-gray-900 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{addr.addressType} ({addr.fullName})</span>
                    </span>
                    {selectedAddress.streetAddress === addr.streetAddress && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 font-medium line-clamp-2">{addr.streetAddress}</p>
                  <p className="text-[11px] text-gray-500 mt-1">{addr.landmark}, {addr.area}, {addr.pincode}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Delivery Slot */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                2
              </span>
              <span>Select Delivery Time Slot</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {deliverySlots.map((slot) => (
                <button
                  key={slot.title}
                  onClick={() => setSelectedSlot(`${slot.title} (${slot.desc})`)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    selectedSlot.includes(slot.title)
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'
                  }`}
                >
                  <p className="text-xs font-black text-gray-900 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{slot.title}</span>
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium mt-0.5">{slot.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Payment Options */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                3
              </span>
              <span>Payment Options</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'UPI' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold' : 'border-gray-200 text-gray-700'
                }`}
              >
                <QrCode className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                <span className="text-xs">UPI / GPay</span>
              </button>

              <button
                onClick={() => setPaymentMethod('Card')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'Card' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold' : 'border-gray-200 text-gray-700'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                <span className="text-xs">Card</span>
              </button>

              <button
                onClick={() => setPaymentMethod('COD')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'COD' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold' : 'border-gray-200 text-gray-700'
                }`}
              >
                <Banknote className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                <span className="text-xs">Cash on Delivery</span>
              </button>

              <button
                onClick={() => setPaymentMethod('Wallet')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'Wallet' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold' : 'border-gray-200 text-gray-700'
                }`}
              >
                <Sparkles className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                <span className="text-xs">Wallet (₹150)</span>
              </button>
            </div>

            {/* UPI QR Display preview */}
            {paymentMethod === 'UPI' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-4 text-xs text-emerald-950">
                <div className="w-20 h-20 bg-white p-2 rounded-xl border border-emerald-300 flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-emerald-900" />
                </div>
                <div>
                  <p className="font-extrabold text-sm">Scan QR or enter UPI ID</p>
                  <p className="text-[11px] text-emerald-700">Accepting Google Pay, PhonePe, Paytm & BHIM</p>
                  <p className="font-mono text-emerald-800 font-bold mt-1">sarvmart.lko@upi</p>
                </div>
              </div>
            )}

            {/* Commercial GST Invoice Option */}
            <div className="pt-2 border-t border-gray-100">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={needGstInvoice}
                  onChange={(e) => setNeedGstInvoice(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Need GST Tax Invoice for Business Tax Input Credit</span>
              </label>

              {needGstInvoice && (
                <input
                  type="text"
                  value={gstinNumber}
                  onChange={(e) => setGstinNumber(e.target.value)}
                  placeholder="Enter 15-digit GSTIN (e.g. 09AAAAA0000A1Z5)"
                  className="mt-2 w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold outline-none uppercase"
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Summary Section */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-md space-y-4 sticky top-24">
            <h3 className="font-black text-base text-gray-900 border-b border-gray-100 pb-3">
              Order Summary ({cartItems.length} items)
            </h3>

            {/* Items summary */}
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{item.quantity}x</span>
                    <span className="text-gray-700 line-clamp-1">{item.product.name}</span>
                  </div>
                  <span className="font-extrabold text-gray-900">₹{item.product.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-gray-200 pt-3 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Items Total</span>
                <span className="font-bold text-gray-900">₹{itemTotal}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className={isFreeDelivery ? 'text-emerald-700 font-bold' : 'font-bold text-gray-900'}>
                  {isFreeDelivery ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-2 flex justify-between font-black text-lg text-gray-900">
                <span>Total Payable</span>
                <span className="text-emerald-700">₹{finalTotal}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              id="confirm-place-order-btn"
              disabled={isPlacingOrder}
              onClick={handleConfirmOrder}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 text-base"
            >
              <ShieldCheck className="w-5 h-5 text-amber-300" />
              <span>{isPlacingOrder ? 'Processing Order...' : `Confirm & Pay ₹${finalTotal}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
