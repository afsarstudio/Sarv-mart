import React, { useState } from 'react';
import { Product } from '../types';
import {
  X,
  Star,
  Truck,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Plus,
  Minus,
  Heart,
  Sparkles,
  Share2,
  ChevronRight,
  Info
} from 'lucide-react';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  quantityInCart: number;
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  allProducts: Product[];
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  quantityInCart,
  onAddToCart,
  onRemoveFromCart,
  isWishlisted,
  onToggleWishlist,
  allProducts,
}) => {
  if (!product) return null;

  const [checkPincode, setCheckPincode] = useState('226026');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(
    'Available for Express 12-Hour Delivery in Lucknow!'
  );
  const [activeTab, setActiveTab] = useState<'details' | 'nutrition' | 'reviews'>('details');

  const handleVerifyPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkPincode.trim().length === 6) {
      if (['226026', '226001', '226002', '226005', '226010'].includes(checkPincode.trim())) {
        setPincodeStatus('In Stock • Guaranteed Delivery within 12 Hours in Lucknow!');
      } else {
        setPincodeStatus('Standard 24-48 Hour Delivery available for PIN ' + checkPincode);
      }
    } else {
      setPincodeStatus('Please enter a valid 6-digit PIN code.');
    }
  };

  // Frequently bought together recommendations
  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
              {product.category}
            </span>
            <span className="text-xs text-gray-500 font-medium">GST Rate: {product.gstRate}%</span>
          </div>

          <button
            id="modal-close-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Image Column */}
            <div className="md:col-span-5 space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 shadow-inner">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.discountPercent > 0 && (
                  <span className="absolute top-3 left-3 bg-emerald-600 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-md">
                    {product.discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Guarantees Box */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Genuine & Fresh Quality</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Directly dispatched from Sarv Mart Behta Bazar Lucknow store.
                </p>
              </div>
            </div>

            {/* Right Product Details Column */}
            <div className="md:col-span-7 space-y-5 text-left">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  {product.brand}
                </span>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-snug">
                  {product.name}
                </h1>
                {product.hindiName && (
                  <p className="text-sm font-semibold text-gray-500 mt-0.5">{product.hindiName}</p>
                )}
              </div>

              {/* Rating & Barcode */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1 bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-lg border border-amber-300">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-gray-500 font-normal">({product.reviewsCount} reviews)</span>
                </div>
                <span className="text-gray-400 font-mono text-[11px]">Barcode: {product.barcode}</span>
              </div>

              {/* Price Row */}
              <div className="bg-gray-50 border border-gray-200/80 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-gray-900">₹{product.price}</span>
                    {product.mrp > product.price && (
                      <span className="text-sm text-gray-400 line-through">₹{product.mrp}</span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-700 font-bold mt-0.5">
                    Inclusive of all taxes (GST {product.gstRate}%)
                  </p>
                </div>

                <span className="bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700">
                  Unit: {product.unit}
                </span>
              </div>

              {/* Add To Cart Controls */}
              <div className="flex items-center gap-4 pt-2">
                {quantityInCart === 0 ? (
                  <button
                    id="modal-add-to-cart-btn"
                    onClick={() => onAddToCart(product)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-6 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add To Supermarket Cart</span>
                  </button>
                ) : (
                  <div className="flex-1 flex items-center justify-between bg-emerald-700 text-white p-2 rounded-2xl shadow-md">
                    <button
                      id="modal-decrement-btn"
                      onClick={() => onRemoveFromCart(product)}
                      className="p-2 hover:bg-emerald-800 rounded-xl"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="font-black text-lg">{quantityInCart} in cart</span>
                    <button
                      id="modal-increment-btn"
                      onClick={() => onAddToCart(product)}
                      className="p-2 hover:bg-emerald-800 rounded-xl"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                )}

                <button
                  id="modal-wishlist-toggle"
                  onClick={() => onToggleWishlist(product)}
                  className={`p-3 rounded-2xl border transition-colors ${
                    isWishlisted
                      ? 'bg-rose-50 border-rose-300 text-rose-600'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              {/* PIN Code Delivery Checker */}
              <div className="border border-gray-200 p-4 rounded-2xl space-y-2 bg-gray-50/50">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Check Express Delivery in Lucknow</span>
                </div>

                <form onSubmit={handleVerifyPincode} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={checkPincode}
                    onChange={(e) => setCheckPincode(e.target.value)}
                    placeholder="Enter 6-digit PIN"
                    className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold focus:border-emerald-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-800 text-white text-xs font-bold px-4 py-1.5 rounded-xl hover:bg-emerald-900"
                  >
                    Check
                  </button>
                </form>

                {pincodeStatus && (
                  <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{pincodeStatus}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Details & Nutrition Tabs */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex border-b border-gray-200 gap-6 text-sm font-bold">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-3 border-b-2 transition-colors ${
                  activeTab === 'details' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500'
                }`}
              >
                Description & Specs
              </button>
              {product.nutrition && (
                <button
                  onClick={() => setActiveTab('nutrition')}
                  className={`pb-3 border-b-2 transition-colors ${
                    activeTab === 'nutrition' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500'
                  }`}
                >
                  Nutritional Value
                </button>
              )}
            </div>

            <div className="py-4 text-xs text-gray-700 leading-relaxed">
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <p className="text-sm font-medium">{product.description}</p>
                  {product.specifications && (
                    <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                      {Object.entries(product.specifications).map(([k, v]) => (
                        <div key={k}>
                          <span className="font-bold text-gray-500">{k}: </span>
                          <span className="font-semibold text-gray-900">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'nutrition' && product.nutrition && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(product.nutrition).map(([k, v]) => (
                    <div key={k} className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-center">
                      <p className="text-[10px] text-emerald-800 font-bold uppercase">{k}</p>
                      <p className="text-sm font-extrabold text-emerald-950 mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Frequently Bought Together */}
          {relatedProducts.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Frequently Bought Together</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200"
                  >
                    <img src={rel.image} alt={rel.name} className="w-14 h-14 object-cover rounded-xl" />
                    <div className="flex-1 text-left">
                      <p className="font-bold text-xs text-gray-900 line-clamp-1">{rel.name}</p>
                      <p className="text-xs font-black text-emerald-700 mt-0.5">₹{rel.price}</p>
                    </div>
                    <button
                      onClick={() => onAddToCart(rel)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
