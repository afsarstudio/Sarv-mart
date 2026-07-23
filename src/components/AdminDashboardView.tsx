import React, { useState } from 'react';
import { Product, Order, OrderStatus } from '../types';
import { STORE_DETAILS } from '../data/mockData';
import { InventoryPanel } from './InventoryPanel';
import { WhatsAppCustomersPanel } from './WhatsAppCustomersPanel';
import {
  BarChart3,
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit,
  CheckCircle2,
  Clock,
  Printer,
  Tag,
  DollarSign,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';

interface AdminDashboardViewProps {
  products: Product[];
  orders: Order[];
  onUpdateProductStock: (productId: string, newStock: number) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onAddOrUpdateProduct?: (product: Product) => void;
  onBulkSyncProducts?: (syncedProducts: Product[]) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  products,
  orders,
  onUpdateProductStock,
  onUpdateOrderStatus,
  onAddOrUpdateProduct,
  onBulkSyncProducts,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'customers'>('analytics');
  const [stockEditInput, setStockEditInput] = useState<Record<string, number>>({});

  const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const lowStockCount = products.filter((p) => p.stock <= 10).length;

  return (
    <div className="max-w-7xl mx-auto my-6 px-4 sm:px-8 text-left space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-emerald-950 to-gray-900 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white p-1 rounded-full shadow-md flex items-center justify-center shrink-0 overflow-hidden border border-emerald-500/30">
            <img
              src={STORE_DETAILS.logoUrl}
              alt={STORE_DETAILS.name}
              className="w-full h-full object-contain rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-emerald-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                Supermarket Admin
              </span>
              <span className="text-xs text-gray-400">Sarv Mart Lucknow</span>
            </div>
            <h1 className="text-2xl font-black mt-1">Management Portal</h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-gray-800/80 p-1 rounded-2xl border border-gray-700 w-full sm:w-auto overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'analytics' ? 'bg-amber-400 text-emerald-950 shadow-xs' : 'text-gray-300 hover:text-white'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'products' ? 'bg-amber-400 text-emerald-950 shadow-xs' : 'text-gray-300 hover:text-white'
            }`}
          >
            Inventory ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'orders' ? 'bg-amber-400 text-emerald-950 shadow-xs' : 'text-gray-300 hover:text-white'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'customers' ? 'bg-emerald-500 text-gray-950 shadow-xs' : 'text-gray-300 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
            <span>WhatsApp CRM & Offers</span>
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs font-bold uppercase tracking-wider">Total Sales Revenue</span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-gray-900">₹{totalRevenue}</p>
              <p className="text-[11px] text-emerald-700 font-semibold">From live supermarket orders</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-gray-900">{orders.length}</p>
              <p className="text-[11px] text-gray-500">12-Hour delivery dispatches</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs font-bold uppercase tracking-wider">Product Catalog</span>
                <Package className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-gray-900">{products.length}</p>
              <p className="text-[11px] text-gray-500">12 active categories</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs font-bold uppercase tracking-wider">Low Stock Alerts</span>
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-3xl font-black text-gray-900">{lowStockCount}</p>
              <p className="text-[11px] text-amber-700 font-semibold">Stock &lt; 10 units</p>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Panel Tab */}
      {activeTab === 'products' && (
        <InventoryPanel
          products={products}
          onUpdateProductStock={onUpdateProductStock}
          onAddOrUpdateProduct={(prod) => {
            if (onAddOrUpdateProduct) onAddOrUpdateProduct(prod);
          }}
          onBulkSyncProducts={(syncedProds) => {
            if (onBulkSyncProducts) onBulkSyncProducts(syncedProds);
          }}
        />
      )}

      {/* Orders Management */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <span className="font-black text-sm text-gray-900">{o.id}</span>
                  <span className="text-xs text-gray-500 font-mono ml-2">Invoice: {o.invoiceNumber}</span>
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-600">Status:</span>
                  <select
                    value={o.status}
                    onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                    className="bg-gray-50 border border-gray-300 font-bold text-xs rounded-xl px-2.5 py-1 outline-none text-emerald-800"
                  >
                    <option value="pending">Pending</option>
                    <option value="packing">Packing</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="text-xs space-y-1 text-gray-600">
                <p><strong>Customer:</strong> {o.address.fullName} ({o.address.phone})</p>
                <p><strong>Address:</strong> {o.address.streetAddress}, {o.address.area}, PIN {o.address.pincode}</p>
                <p><strong>Total:</strong> ₹{o.totalAmount} • <strong>Payment:</strong> {o.paymentMethod} ({o.paymentStatus})</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WhatsApp CRM & Marketing Tab */}
      {activeTab === 'customers' && <WhatsAppCustomersPanel />}
    </div>
  );
};
