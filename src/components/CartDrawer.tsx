import React, { useState } from 'react';
import { CartItem, Coupon } from '../types';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Tag, Truck, ShieldCheck, Sparkles, Check } from 'lucide-react';
import { INITIAL_COUPONS } from '../data/mockData';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  appliedCoupon: Coupon | null;
  onApplyCoupon: (coupon: Coupon | null) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  appliedCoupon,
  onApplyCoupon,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<string | null>(null);

  // Bill Calculations
  const itemTotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const mrpTotal = cartItems.reduce((acc, item) => acc + item.product.mrp * item.quantity, 0);
  const mrpSavings = Math.max(0, mrpTotal - itemTotal);

  const freeDeliveryThreshold = 399;
  const isFreeDelivery = itemTotal >= freeDeliveryThreshold;
  const deliveryFee = isFreeDelivery ? 0 : 40;

  let couponDiscount = 0;
  if (appliedCoupon && itemTotal >= appliedCoupon.minOrderValue) {
    if (appliedCoupon.discountType === 'flat') {
      couponDiscount = appliedCoupon.discountValue;
    } else {
      couponDiscount = Math.round((itemTotal * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.maxDiscount) {
        couponDiscount = Math.min(couponDiscount, appliedCoupon.maxDiscount);
      }
    }
  }

  const finalTotal = Math.max(0, itemTotal + deliveryFee - couponDiscount);

  const handleApplyCouponCode = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    const found = INITIAL_COUPONS.find((c) => c.code === code && c.isActive);

    if (found) {
      if (itemTotal < found.minOrderValue) {
        setCouponMsg(`Min order ₹${found.minOrderValue} required for ${code}`);
      } else {
        onApplyCoupon(found);
        setCouponMsg(`Coupon ${code} applied successfully!`);
      }
    } else {
      setCouponMsg('Invalid promo code');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-emerald-800 text-white flex items-center justify-between border-b border-emerald-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-700 text-amber-300 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base">My Supermarket Cart</h2>
              <p className="text-xs text-emerald-200">{cartItems.length} items selected</p>
            </div>
          </div>

          <button
            id="cart-drawer-close"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-700 text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Progress Bar */}
        <div className="bg-emerald-50 border-b border-emerald-100 p-3 text-xs text-emerald-950 font-medium">
          {isFreeDelivery ? (
            <p className="flex items-center gap-1.5 font-bold text-emerald-800">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>You unlocked FREE 12-Hour Express Delivery in Lucknow!</span>
            </p>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span>Add <strong className="text-emerald-800 font-extrabold">₹{freeDeliveryThreshold - itemTotal}</strong> more for FREE Delivery!</span>
                <span className="font-bold">{Math.round((itemTotal / freeDeliveryThreshold) * 100)}%</span>
              </div>
              <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (itemTotal / freeDeliveryThreshold) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="py-20 text-center space-y-3 text-gray-500">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="font-bold text-base text-gray-800">Your cart is empty</p>
              <p className="text-xs text-gray-400">Explore fresh groceries, fruits & essentials from Sarv Mart.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-all"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-xl bg-white border border-gray-200"
                />

                <div className="flex-1 text-left space-y-1">
                  <p className="font-bold text-xs text-gray-900 line-clamp-1">{item.product.name}</p>
                  <p className="text-[10px] text-gray-500">{item.product.unit}</p>

                  <div className="flex items-baseline gap-2">
                    <span className="font-black text-sm text-gray-900">
                      ₹{item.product.price * item.quantity}
                    </span>
                    {item.product.mrp > item.product.price && (
                      <span className="text-[10px] text-gray-400 line-through">
                        ₹{item.product.mrp * item.quantity}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5 bg-white border border-gray-200 p-1 rounded-xl shadow-2xs">
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, -1)}
                    className="p-1 hover:bg-gray-100 text-gray-700 rounded-lg"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-extrabold text-xs px-1 min-w-[18px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, 1)}
                    className="p-1 hover:bg-gray-100 text-gray-700 rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Bill & Checkout */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
            {/* Promo Code Input */}
            <div>
              <form onSubmit={handleApplyCouponCode} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter Coupon Code (e.g. SARV100)"
                    className="w-full bg-white border border-gray-300 rounded-xl pl-9 pr-3 py-2 text-xs uppercase font-bold outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-emerald-800 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-emerald-900"
                >
                  Apply
                </button>
              </form>

              {couponMsg && (
                <p className="text-[10px] font-bold text-emerald-700 mt-1">{couponMsg}</p>
              )}

              {appliedCoupon && (
                <div className="mt-2 flex items-center justify-between bg-emerald-100 text-emerald-900 p-2 rounded-xl text-xs font-bold">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Coupon {appliedCoupon.code} Applied</span>
                  </span>
                  <button
                    onClick={() => onApplyCoupon(null)}
                    className="text-[10px] text-rose-600 underline font-extrabold"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Bill Summary Breakdown */}
            <div className="bg-white p-3 rounded-2xl border border-gray-200 text-xs space-y-1.5 text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-gray-900">₹{itemTotal}</span>
              </div>

              {mrpSavings > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>MRP Discount Savings</span>
                  <span>-₹{mrpSavings}</span>
                </div>
              )}

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Promo Coupon Discount</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className={isFreeDelivery ? 'text-emerald-700 font-bold' : 'font-bold text-gray-900'}>
                  {isFreeDelivery ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-1.5 flex justify-between font-black text-sm text-gray-900">
                <span>To Pay</span>
                <span className="text-emerald-700 text-base">₹{finalTotal}</span>
              </div>
            </div>

            {/* Proceed to Checkout Button */}
            <button
              id="cart-drawer-checkout-btn"
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-between"
            >
              <div className="text-left">
                <p className="text-[10px] font-bold text-emerald-200 uppercase">Grand Total</p>
                <p className="text-base font-black leading-none">₹{finalTotal}</p>
              </div>

              <div className="flex items-center gap-1 text-sm">
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
