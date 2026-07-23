import React, { useState } from 'react';
import { UserProfile, Order, Product } from '../types';
import { generateInvoicePdf } from '../utils/generateInvoicePdf';
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
  CheckCircle2,
  Download,
  FileText,
  Eye,
  Printer,
  X,
  Share2
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
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  const handleDownloadPdf = (order: Order) => {
    try {
      setDownloadingOrderId(order.id);
      generateInvoicePdf(order);
      setDownloadSuccessMsg(`✅ Downloaded Tax Invoice PDF for ${order.id}`);
      setTimeout(() => setDownloadSuccessMsg(null), 4000);
    } catch (err) {
      alert('Error generating PDF invoice. Please try again.');
    } finally {
      setDownloadingOrderId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto my-8 px-4 sm:px-8 text-left space-y-8 animate-fade-in">
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
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <span>Recent Supermarket Orders</span>
          </h2>
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {orders.length} Past Orders
          </span>
        </div>

        <div className="space-y-4">
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

              {/* Action Buttons: Total, View Invoice Modal, Download PDF, Reorder */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t border-gray-200 text-xs gap-3">
                <div className="space-y-0.5">
                  <p className="text-gray-500 text-[11px]">Total Paid Amount (Incl. GST):</p>
                  <p className="font-black text-gray-900 text-base">₹{o.totalAmount.toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                  {/* View Details Modal */}
                  <button
                    onClick={() => setSelectedOrderForModal(o)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-3 py-2 rounded-xl transition-colors border border-gray-300 text-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-gray-600" />
                    <span>View Invoice</span>
                  </button>

                  {/* PDF Download Button */}
                  <button
                    onClick={() => handleDownloadPdf(o)}
                    disabled={downloadingOrderId === o.id}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold px-3.5 py-2 rounded-xl transition-all shadow-xs text-xs active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-300" />
                    <span>{downloadingOrderId === o.id ? 'Generating...' : 'Download PDF Invoice'}</span>
                  </button>

                  {/* Reorder Button */}
                  <button
                    onClick={() => onReorder(o)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black px-3.5 py-2 rounded-xl transition-colors shadow-xs text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reorder</span>
                  </button>
                </div>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200 text-left space-y-0 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-amber-300" />
                  <h3 className="font-extrabold text-base text-white">SARV MART TAX INVOICE</h3>
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
            <div className="p-6 overflow-y-auto space-y-5 text-xs font-sans text-gray-800">
              {/* Store Identity Bar */}
              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row justify-between gap-2">
                <div>
                  <p className="font-black text-emerald-950 text-sm">Sarv Mart Supermarket</p>
                  <p className="text-gray-600 text-[11px]">Behta Bazar, Hardoi Road, Lucknow - 226101 (UP)</p>
                  <p className="text-gray-600 text-[11px]">GSTIN: 09SARVMART8821Z5 | FSSAI: 12723001000492</p>
                </div>
                <div className="text-right sm:text-right text-gray-600 text-[11px]">
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
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
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
            <div className="p-4 bg-gray-100 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
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
