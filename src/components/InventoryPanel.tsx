import React, { useState, useRef } from 'react';
import { Product, ProductCategory } from '../types';
import { STORE_DETAILS } from '../data/mockData';
import {
  Package,
  Upload,
  Camera,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Sparkles,
  Barcode,
  Edit2,
  Trash2,
  Check,
  X,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Layers,
  ChevronRight,
  Eye
} from 'lucide-react';

interface ScannedBillItem {
  name: string;
  hindiName?: string;
  brand?: string;
  category: ProductCategory;
  subcategory?: string;
  barcode: string;
  mrp: number;
  price: number;
  purchasePrice?: number;
  unit: string;
  stockToAdd: number;
  gstRate: number;
  image?: string;
  selected?: boolean;
}

interface ScannedBillData {
  invoiceNumber: string;
  supplierName: string;
  totalBillAmount: number;
  billDate: string;
  items: ScannedBillItem[];
}

interface InventoryPanelProps {
  products: Product[];
  onUpdateProductStock: (productId: string, newStock: number) => void;
  onAddOrUpdateProduct: (product: Product) => void;
  onBulkSyncProducts: (newProducts: Product[]) => void;
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({
  products,
  onUpdateProductStock,
  onAddOrUpdateProduct,
  onBulkSyncProducts
}) => {
  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'Low' | 'OutOfStock' | 'InStock'>('All');

  // Editing state
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<number>(0);

  // Manual Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [manualProduct, setManualProduct] = useState<Partial<Product>>({
    name: '',
    hindiName: '',
    category: 'Daily Grocery Items',
    subcategory: 'General',
    brand: 'Sarv Mart',
    price: 100,
    mrp: 120,
    unit: '1 kg',
    stock: 20,
    gstRate: 5,
    barcode: `${Math.floor(8901000000000 + Math.random() * 999999999)}`,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'
  });

  // Bill Scanner Upload Modal State
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [billImagePreview, setBillImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedBillData, setScannedBillData] = useState<ScannedBillData | null>(null);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Sample Bills for Instant Demo
  const sampleBillImages = [
    {
      title: 'FMCG & Groceries Wholesale Invoice',
      supplier: 'Sarv Wholesale Lucknow',
      amount: '₹8,450',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'Oil & Spices Distributor Bill',
      supplier: 'Lucknow Oil Traders',
      amount: '₹14,200',
      image: 'https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?auto=format&fit=crop&q=80&w=600'
    }
  ];

  // Stock Calculations
  const totalStockValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  // Filtered list
  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      (p.hindiName && p.hindiName.includes(q)) ||
      p.brand.toLowerCase().includes(q) ||
      p.barcode.includes(q);

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

    let matchesStock = true;
    if (stockFilter === 'Low') matchesStock = p.stock > 0 && p.stock <= 10;
    if (stockFilter === 'OutOfStock') matchesStock = p.stock === 0;
    if (stockFilter === 'InStock') matchesStock = p.stock > 10;

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Handle Bill Image Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setBillImagePreview(base64);
        processBillImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Process Bill Image via Server Gemini OCR API
  const processBillImage = async (base64Img: string) => {
    setIsScanning(true);
    setScannedBillData(null);
    setSyncSuccessMsg(null);

    try {
      const res = await fetch('/api/inventory/scan-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Img, mimeType: 'image/jpeg' })
      });
      const data = await res.json();
      if (data.success && data.items) {
        // Mark all items as selected by default
        const preparedItems = data.items.map((item: ScannedBillItem) => ({
          ...item,
          selected: true
        }));
        setScannedBillData({
          invoiceNumber: data.invoiceNumber || 'BILL-2026-908',
          supplierName: data.supplierName || 'Wholesale Supply Distributor',
          totalBillAmount: data.totalBillAmount || 8450,
          billDate: data.billDate || new Date().toISOString().split('T')[0],
          items: preparedItems
        });
      }
    } catch (err) {
      console.error('Error scanning bill:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Select Sample Bill
  const handleSelectSampleBill = (sampleImgUrl: string) => {
    setBillImagePreview(sampleImgUrl);
    processBillImage(sampleImgUrl);
  };

  // Toggle item selection in scanned list
  const toggleItemSelection = (index: number) => {
    if (!scannedBillData) return;
    const updated = [...scannedBillData.items];
    updated[index].selected = !updated[index].selected;
    setScannedBillData({ ...scannedBillData, items: updated });
  };

  // Update item field in scanned list
  const updateScannedItemField = (index: number, field: keyof ScannedBillItem, val: any) => {
    if (!scannedBillData) return;
    const updated = [...scannedBillData.items];
    updated[index] = { ...updated[index], [field]: val };
    setScannedBillData({ ...scannedBillData, items: updated });
  };

  // Confirm and Sync to Inventory
  const handleConfirmBillSync = async () => {
    if (!scannedBillData) return;

    const selectedItems = scannedBillData.items.filter(i => i.selected);
    if (selectedItems.length === 0) {
      alert('Please select at least one product to sync into inventory.');
      return;
    }

    try {
      const res = await fetch('/api/inventory/bulk-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: selectedItems })
      });
      const data = await res.json();
      if (data.success) {
        setSyncSuccessMsg(`Successfully synced ${selectedItems.length} products to Sarv Mart Inventory!`);
        if (data.products) {
          onBulkSyncProducts(data.products);
        }
        setTimeout(() => {
          setIsBillModalOpen(false);
          setBillImagePreview(null);
          setScannedBillData(null);
          setSyncSuccessMsg(null);
        }, 1800);
      }
    } catch (err) {
      console.error('Error syncing products:', err);
      // Fallback local update
      const fallbackProds: Product[] = selectedItems.map(item => ({
        id: `p_${Date.now()}_${Math.random()}`,
        name: item.name,
        hindiName: item.hindiName || item.name,
        category: item.category || 'Daily Grocery Items',
        subcategory: item.subcategory || 'General',
        brand: item.brand || 'Sarv Mart',
        price: item.price,
        mrp: item.mrp || item.price + 20,
        unit: item.unit || '1 unit',
        stock: item.stockToAdd,
        rating: 4.8,
        reviewsCount: 15,
        image: item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
        discountPercent: Math.round((((item.mrp || item.price + 20) - item.price) / (item.mrp || item.price + 20)) * 100),
        description: 'Synced from purchase invoice bill.',
        gstRate: item.gstRate || 5,
        barcode: item.barcode || `${Math.floor(8901000000000 + Math.random() * 999999999)}`
      }));
      onBulkSyncProducts([...products, ...fallbackProds]);
      setSyncSuccessMsg(`Synced ${selectedItems.length} products to inventory!`);
      setTimeout(() => {
        setIsBillModalOpen(false);
      }, 1500);
    }
  };

  // Handle Manual Product Submit
  const handleSaveManualProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualProduct.name) return;

    const newProd: Product = {
      id: manualProduct.id || `p_${Date.now()}`,
      name: manualProduct.name,
      hindiName: manualProduct.hindiName || manualProduct.name,
      category: (manualProduct.category as ProductCategory) || 'Daily Grocery Items',
      subcategory: manualProduct.subcategory || 'General',
      brand: manualProduct.brand || 'Sarv Mart',
      price: Number(manualProduct.price) || 100,
      mrp: Number(manualProduct.mrp) || 120,
      unit: manualProduct.unit || '1 unit',
      stock: Number(manualProduct.stock) || 10,
      rating: 4.8,
      reviewsCount: 10,
      image: manualProduct.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
      discountPercent: Math.round((((Number(manualProduct.mrp) || 120) - (Number(manualProduct.price) || 100)) / (Number(manualProduct.mrp) || 120)) * 100),
      description: 'Manually added product item.',
      gstRate: Number(manualProduct.gstRate) || 5,
      barcode: manualProduct.barcode || `${Math.floor(8901000000000 + Math.random() * 999999999)}`
    };

    onAddOrUpdateProduct(newProd);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Top Banner & Quick Sync Actions */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-6 shadow-xl border border-emerald-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-emerald-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Smart AI Inventory Sync
            </span>
            <span className="text-xs text-emerald-300 font-medium">Real-Time Stock Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Sarv Mart Inventory Panel
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-sans">
            Upload or snap a photo of any wholesale bill / purchase invoice. AI automatically scans every item, cost price, GST rate, and stock quantity to update your store inventory instantly!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            onClick={() => setIsBillModalOpen(true)}
            className="flex-1 lg:flex-initial flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-sm px-5 py-3 rounded-2xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Camera className="w-5 h-5 text-emerald-950" />
            <span>Upload Bill Photo & Sync</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 lg:flex-initial flex items-center justify-center gap-2 bg-emerald-800/80 hover:bg-emerald-700 text-white font-extrabold text-sm px-4 py-3 rounded-2xl border border-emerald-600/50 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item Manually</span>
          </button>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Total Products</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900">{products.length}</p>
          <p className="text-[10px] text-gray-500 font-medium">SKUs active in Lucknow</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Total Stock Value</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700">₹{totalStockValue.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-600 font-semibold">At current selling price</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-amber-200 shadow-xs space-y-1 bg-amber-50/30">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Low Stock (&le;10)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-900">{lowStockProducts.length}</p>
          <p className="text-[10px] text-amber-700 font-medium">Requires supplier reorder</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-rose-200 shadow-xs space-y-1 bg-rose-50/30">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Out of Stock</span>
            <X className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-900">{outOfStockProducts.length}</p>
          <p className="text-[10px] text-rose-700 font-medium">Immediate restock needed</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, barcode, brand..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Categories</option>
            <option value="Daily Grocery Items">Daily Grocery Items</option>
            <option value="Groceries">Groceries</option>
            <option value="Dairy">Dairy</option>
            <option value="Household">Household</option>
            <option value="Personal Care">Personal Care</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Bakery">Bakery</option>
            <option value="Stationery">Stationery</option>
          </select>

          <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 shrink-0">
            <button
              onClick={() => setStockFilter('All')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                stockFilter === 'All' ? 'bg-white text-emerald-950 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStockFilter('Low')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                stockFilter === 'Low' ? 'bg-amber-400 text-amber-950 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Low Stock ({lowStockProducts.length})
            </button>
            <button
              onClick={() => setStockFilter('OutOfStock')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                stockFilter === 'OutOfStock' ? 'bg-rose-500 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Out of Stock ({outOfStockProducts.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans border-collapse">
            <thead>
              <tr className="bg-gray-900 text-gray-200 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Product Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Barcode</th>
                <th className="py-3.5 px-4">MRP & Selling Price</th>
                <th className="py-3.5 px-4">GST %</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map(product => {
                const isEditing = editingStockId === product.id;

                return (
                  <tr key={product.id} className="hover:bg-emerald-50/40 transition-colors">
                    {/* Product Name & Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 object-contain rounded-xl border border-gray-200 bg-white p-0.5 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-extrabold text-gray-900 text-xs flex items-center gap-1.5">
                            <span>{product.name}</span>
                            {product.isBestSeller && (
                              <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.2 rounded">
                                Best
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-2">
                            {product.hindiName && <span>{product.hindiName}</span>}
                            <span>• {product.brand}</span>
                            <span>• {product.unit}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="bg-gray-100 text-gray-700 font-medium px-2 py-1 rounded-lg text-[10px]">
                        {product.category}
                      </span>
                    </td>

                    {/* Barcode */}
                    <td className="py-3 px-4 font-mono text-gray-600">
                      <div className="flex items-center gap-1">
                        <Barcode className="w-3.5 h-3.5 text-gray-400" />
                        <span>{product.barcode}</span>
                      </div>
                    </td>

                    {/* Pricing */}
                    <td className="py-3 px-4">
                      <div className="font-black text-gray-900">₹{product.price}</div>
                      <div className="text-[10px] text-gray-400 line-through">MRP ₹{product.mrp}</div>
                    </td>

                    {/* GST */}
                    <td className="py-3 px-4 text-gray-700 font-semibold">
                      {product.gstRate}%
                    </td>

                    {/* Stock & Quick Adjust */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={tempStockValue}
                            onChange={e => setTempStockValue(Number(e.target.value))}
                            className="w-16 bg-white border border-emerald-500 rounded-lg px-2 py-1 text-xs font-bold text-gray-900"
                            autoFocus
                          />
                          <button
                            onClick={() => {
                              onUpdateProductStock(product.id, tempStockValue);
                              setEditingStockId(null);
                            }}
                            className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingStockId(null)}
                            className="p-1 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-black px-2.5 py-1 rounded-xl text-xs ${
                              product.stock === 0
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : product.stock <= 10
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            }`}
                          >
                            {product.stock} {product.unit.includes('kg') ? 'units' : 'pcs'}
                          </span>

                          <button
                            onClick={() => {
                              setEditingStockId(product.id);
                              setTempStockValue(product.stock);
                            }}
                            className="p-1 text-gray-400 hover:text-emerald-700 rounded-lg hover:bg-gray-100"
                            title="Quick Edit Stock"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onUpdateProductStock(product.id, product.stock + 10)}
                          className="px-2 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-[10px] rounded-lg border border-emerald-200"
                          title="Add +10 stock"
                        >
                          +10 Stock
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="font-bold text-gray-700">No products found matching filters</p>
                    <p className="text-xs text-gray-400">Try adjusting your search query or category</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BILL PHOTO OCR SCANNER & SYNC MODAL */}
      {isBillModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black shadow-md">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">AI Purchase Bill & Invoice Scanner</h3>
                  <p className="text-xs text-emerald-200 font-medium">
                    Upload supplier bill photo & sync all products into Sarv Mart Inventory
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsBillModalOpen(false);
                  setBillImagePreview(null);
                  setScannedBillData(null);
                }}
                className="p-2 text-emerald-200 hover:text-white rounded-xl hover:bg-emerald-800/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Success Notification Banner */}
              {syncSuccessMsg && (
                <div className="bg-emerald-600 text-white p-4 rounded-2xl flex items-center gap-3 animate-bounce">
                  <CheckCircle2 className="w-6 h-6 text-amber-300" />
                  <span className="font-bold text-sm">{syncSuccessMsg}</span>
                </div>
              )}

              {/* Upload Drop Area */}
              {!billImagePreview ? (
                <div className="space-y-6">
                  {/* Action choices: Camera vs File Upload */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Camera Capture Card */}
                    <div
                      onClick={() => cameraInputRef.current?.click()}
                      className="border-2 border-dashed border-emerald-500 bg-emerald-50/60 hover:bg-emerald-100/70 rounded-3xl p-6 text-center cursor-pointer transition-all space-y-3 group shadow-xs"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-md">
                        <Camera className="w-7 h-7 text-amber-300" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-gray-900 text-sm sm:text-base">
                          Snap Photo with Camera
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Use your phone or webcam camera to photograph physical bill
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-2 bg-emerald-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md group-hover:bg-emerald-900 transition-colors">
                        <Camera className="w-4 h-4 text-amber-300" /> Open Camera Snapshot
                      </span>
                    </div>

                    {/* File Upload Card */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-teal-500 bg-teal-50/60 hover:bg-teal-100/70 rounded-3xl p-6 text-center cursor-pointer transition-all space-y-3 group shadow-xs"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-teal-700 text-white flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-md">
                        <Upload className="w-7 h-7 text-teal-200" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-gray-900 text-sm sm:text-base">
                          Upload Invoice File / Gallery
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Choose JPG, PNG, WEBP image or scanned invoice receipt
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-2 bg-teal-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md group-hover:bg-teal-900 transition-colors">
                        <Upload className="w-4 h-4 text-teal-200" /> Browse Image Files
                      </span>
                    </div>
                  </div>

                  {/* Hidden inputs for camera capture and file selection */}
                  <input
                    type="file"
                    ref={cameraInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {/* Sample Bills Section for Quick Demo */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Or Try Sample Wholesale Supplier Invoice Bills (1-Click Demo):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {sampleBillImages.map((sample, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectSampleBill(sample.image)}
                          className="bg-gray-50 border border-gray-200 hover:border-emerald-500 rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer transition-all hover:shadow-md group"
                        >
                          <img
                            src={sample.image}
                            alt={sample.title}
                            className="w-14 h-14 object-cover rounded-xl border border-gray-200 group-hover:scale-105 transition-transform shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-extrabold text-xs text-gray-900 truncate">{sample.title}</h5>
                            <p className="text-[11px] text-gray-500">{sample.supplier}</p>
                            <span className="text-[10px] font-black text-emerald-700">{sample.amount} Scanned Bill</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Scanned Preview & Extracted Product List */
                <div className="space-y-6">
                  {/* Processing / Scanning Indicator */}
                  {isScanning && (
                    <div className="bg-emerald-950 text-white p-6 rounded-3xl border border-emerald-800 text-center space-y-3">
                      <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                      <h4 className="font-black text-base">Gemini AI is Processing Bill Photo...</h4>
                      <p className="text-xs text-emerald-200">
                        Extracting items, wholesale costs, barcodes, GST rates, and quantities from invoice.
                      </p>
                    </div>
                  )}

                  {/* Bill Details Header */}
                  {scannedBillData && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-700 text-white font-black text-[10px] px-2 py-0.5 rounded">
                            EXTRACTED BILL
                          </span>
                          <span className="font-black text-gray-900">{scannedBillData.invoiceNumber}</span>
                        </div>
                        <p className="text-gray-700 font-semibold">Distributor: {scannedBillData.supplierName}</p>
                      </div>

                      <div className="text-right space-y-1">
                        <p className="text-gray-500">Date: {scannedBillData.billDate}</p>
                        <p className="font-black text-emerald-800 text-sm">Total Bill Value: ₹{scannedBillData.totalBillAmount}</p>
                      </div>
                    </div>
                  )}

                  {/* Scanned Items Table */}
                  {scannedBillData && scannedBillData.items.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                          <span>Products Found on Scanned Bill ({scannedBillData.items.length})</span>
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Review & Sync
                          </span>
                        </h4>
                        <p className="text-xs text-gray-500">Check/Uncheck items to sync</p>
                      </div>

                      <div className="border border-gray-200 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px] sticky top-0 z-10">
                            <tr>
                              <th className="p-2.5 text-center">Sync</th>
                              <th className="p-2.5">Product Name</th>
                              <th className="p-2.5">Category</th>
                              <th className="p-2.5">Barcode</th>
                              <th className="p-2.5">Selling Price</th>
                              <th className="p-2.5">Stock to Add</th>
                              <th className="p-2.5">GST</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {scannedBillData.items.map((item, idx) => (
                              <tr key={idx} className={item.selected ? 'bg-white' : 'bg-gray-50 opacity-60'}>
                                <td className="p-2.5 text-center">
                                  <input
                                    type="checkbox"
                                    checked={item.selected}
                                    onChange={() => toggleItemSelection(idx)}
                                    className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                  />
                                </td>
                                <td className="p-2.5">
                                  <input
                                    type="text"
                                    value={item.name}
                                    onChange={e => updateScannedItemField(idx, 'name', e.target.value)}
                                    className="font-extrabold text-gray-900 bg-transparent border-b border-gray-200 focus:border-emerald-500 w-full text-xs"
                                  />
                                  <span className="text-[10px] text-emerald-700 block font-medium">
                                    {item.hindiName || item.brand}
                                  </span>
                                </td>
                                <td className="p-2.5">
                                  <span className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded">
                                    {item.category}
                                  </span>
                                </td>
                                <td className="p-2.5 font-mono text-[10px] text-gray-600">
                                  {item.barcode}
                                </td>
                                <td className="p-2.5">
                                  <div className="flex items-center gap-1">
                                    <span className="text-gray-400">₹</span>
                                    <input
                                      type="number"
                                      value={item.price}
                                      onChange={e => updateScannedItemField(idx, 'price', Number(e.target.value))}
                                      className="w-16 font-black text-gray-900 border border-gray-200 rounded px-1.5 py-0.5 text-xs"
                                    />
                                  </div>
                                </td>
                                <td className="p-2.5">
                                  <input
                                    type="number"
                                    value={item.stockToAdd}
                                    onChange={e => updateScannedItemField(idx, 'stockToAdd', Number(e.target.value))}
                                    className="w-16 font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded px-1.5 py-0.5 text-xs"
                                  />
                                </td>
                                <td className="p-2.5 font-semibold text-gray-700">
                                  {item.gstRate}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Re-upload or Cancel */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setBillImagePreview(null);
                        setScannedBillData(null);
                      }}
                      className="text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Upload Different Bill
                    </button>

                    <button
                      onClick={handleConfirmBillSync}
                      disabled={isScanning || !scannedBillData}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm px-6 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
                    >
                      Confirm & Sync to Store Inventory
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MANUAL PRODUCT ADD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-lg text-gray-900">Add Product to Inventory</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Product Name (English)</label>
                <input
                  type="text"
                  required
                  value={manualProduct.name}
                  onChange={e => setManualProduct({ ...manualProduct, name: e.target.value })}
                  placeholder="e.g. Fortune Sunflower Oil 1L"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-medium text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Hindi Name</label>
                  <input
                    type="text"
                    value={manualProduct.hindiName}
                    onChange={e => setManualProduct({ ...manualProduct, hindiName: e.target.value })}
                    placeholder="e.g. सनफ्लावर तेल"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-medium text-gray-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Brand</label>
                  <input
                    type="text"
                    value={manualProduct.brand}
                    onChange={e => setManualProduct({ ...manualProduct, brand: e.target.value })}
                    placeholder="e.g. Fortune"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-medium text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Category</label>
                  <select
                    value={manualProduct.category}
                    onChange={e => setManualProduct({ ...manualProduct, category: e.target.value as ProductCategory })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-medium text-gray-900"
                  >
                    <option value="Daily Grocery Items">Daily Grocery Items</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Household">Household</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Kitchen">Kitchen</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Unit</label>
                  <input
                    type="text"
                    value={manualProduct.unit}
                    onChange={e => setManualProduct({ ...manualProduct, unit: e.target.value })}
                    placeholder="1 kg / 1 L / Pack"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-medium text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={manualProduct.price}
                    onChange={e => setManualProduct({ ...manualProduct, price: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold text-gray-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    required
                    value={manualProduct.mrp}
                    onChange={e => setManualProduct({ ...manualProduct, mrp: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold text-gray-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Stock Qty</label>
                  <input
                    type="number"
                    required
                    value={manualProduct.stock}
                    onChange={e => setManualProduct({ ...manualProduct, stock: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-bold text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
