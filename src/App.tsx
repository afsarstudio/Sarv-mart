import React, { useState, useEffect } from 'react';
import {
  CartItem,
  Coupon,
  Order,
  OrderStatus,
  Product,
  ProductCategory,
  POSBill,
  StorePage,
  ViewMode,
  UserProfile
} from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_ORDERS,
  MOCK_USER_PROFILE
} from './data/mockData';

import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryGrid } from './components/CategoryGrid';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutView } from './components/CheckoutView';
import { OrderTrackingView } from './components/OrderTrackingView';
import { PosBillingView } from './components/PosBillingView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { DeliveryAppView } from './components/DeliveryAppView';
import { CustomerAccountView } from './components/CustomerAccountView';
import { StaticPages } from './components/StaticPages';
import { Footer } from './components/Footer';

import { Filter, SlidersHorizontal, Sparkles, MapPin, Check, X, ShieldCheck, Tag } from 'lucide-react';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewMode>('storefront');
  const [currentPage, setCurrentPage] = useState<StorePage>('home');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Data Stores
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([
    { product: INITIAL_PRODUCTS[0], quantity: 1 }, // Default initial sample item
    { product: INITIAL_PRODUCTS[8], quantity: 2 },
  ]);
  const [wishlist, setWishlist] = useState<Product[]>([INITIAL_PRODUCTS[1]]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(INITIAL_COUPONS[0]);
  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_USER_PROFILE);

  // Modals & Drawers
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedPincode, setSelectedPincode] = useState('226026');
  const [activeTrackOrder, setActiveTrackOrder] = useState<Order | null>(INITIAL_ORDERS[0]);

  // Shop Filter State
  const [filterBrand, setFilterBrand] = useState<string>('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<'All' | 'Organic' | 'BestSeller' | 'New' | 'Discounted'>('All');
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'discount'>('relevance');

  // Fetch initial products from Express API if running
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products) {
          setProducts(data.products);
        }
      })
      .catch(() => {
        // Fallback to local mock data
      });
  }, []);

  // Cart Operations
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (product: Product) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === product.id) {
            if (item.quantity <= 1) return null;
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const handleOrderPlaced = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setActiveTrackOrder(newOrder);
    setCart([]);
    setCurrentView('storefront');
    setCurrentPage('track_order');
  };

  const handleUpdateProductStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );
  };

  const handleAddOrUpdateProduct = (prod: Product) => {
    setProducts((prev) => {
      const existing = prev.findIndex((p) => p.id === prod.id);
      if (existing >= 0) {
        const copy = [...prev];
        copy[existing] = prod;
        return copy;
      }
      return [prod, ...prev];
    });

    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prod),
    }).catch(() => {});
  };

  const handleBulkSyncProducts = (syncedProds: Product[]) => {
    setProducts(syncedProds);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  // Filtered Products for Shop View
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'All' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (selectedSubcategory !== 'All' && p.subcategory && p.subcategory.toLowerCase() !== selectedSubcategory.toLowerCase()) {
      return false;
    }
    if (p.price > maxPrice) {
      return false;
    }
    if (inStockOnly && p.stock <= 0) {
      return false;
    }
    if (selectedTag === 'Organic' && !p.isOrganic) return false;
    if (selectedTag === 'BestSeller' && !p.isBestSeller) return false;
    if (selectedTag === 'New' && !p.isNew) return false;
    if (selectedTag === 'Discounted' && p.discountPercent < 15) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        (p.hindiName && p.hindiName.includes(q)) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (filterBrand !== 'All' && p.brand !== filterBrand) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'discount') return b.discountPercent - a.discountPercent;
    return 0;
  });

  const uniqueBrands = Array.from(new Set(products.map((p) => p.brand)));

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-gray-900 font-sans antialiased flex flex-col justify-between selection:bg-emerald-200">
      {/* Sticky Header Navbar */}
      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedSubcategory('All');
        }}
        onSelectSubcategory={setSelectedSubcategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        selectedPincode={selectedPincode}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {/* VIEW MODE 1: CUSTOMER STOREFRONT */}
        {currentView === 'storefront' && (
          <>
            {/* PAGE: HOME */}
            {currentPage === 'home' && (
              <div className="space-y-8 pb-12">
                <HeroBanner
                  onSelectPage={setCurrentPage}
                  onOpenAiModal={() => setIsAiModalOpen(true)}
                />

                <CategoryGrid
                  selectedCategory={selectedCategory}
                  onSelectCategory={(cat) => {
                    setSelectedCategory(cat);
                    setCurrentPage('shop');
                  }}
                  onViewAllCategories={() => setCurrentPage('categories')}
                />

                {/* Today's Flash Deals & Best Sellers Section */}
                <section className="my-8 mx-4 sm:mx-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <span>Today's Best Sellers</span>
                        <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full">
                          Lucknow Favorites
                        </span>
                      </h2>
                      <p className="text-xs text-gray-500 font-medium">Top purchased daily groceries and fresh items</p>
                    </div>

                    <button
                      onClick={() => setCurrentPage('shop')}
                      className="text-xs font-bold text-emerald-700 hover:underline"
                    >
                      Shop All Products →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                    {products.slice(0, 10).map((product) => {
                      const cartItem = cart.find((item) => item.product.id === product.id);
                      const isWishlisted = wishlist.some((p) => p.id === product.id);

                      return (
                        <ProductCard
                          key={product.id}
                          product={product}
                          quantityInCart={cartItem ? cartItem.quantity : 0}
                          isWishlisted={isWishlisted}
                          onAddToCart={handleAddToCart}
                          onRemoveFromCart={handleRemoveFromCart}
                          onToggleWishlist={handleToggleWishlist}
                          onQuickView={setQuickViewProduct}
                        />
                      );
                    })}
                  </div>
                </section>
              </div>
            )}

            {/* PAGE: SHOP / CATALOG */}
            {currentPage === 'shop' && (() => {
              const activeCategoryItem = INITIAL_CATEGORIES.find(
                (c) => c.name.toLowerCase() === selectedCategory.toLowerCase()
              );
              const availableSubcategories = activeCategoryItem
                ? activeCategoryItem.subcategories
                : Array.from(new Set(INITIAL_CATEGORIES.flatMap((c) => c.subcategories))).slice(0, 8);

              const hasActiveFilters =
                selectedCategory !== 'All' ||
                selectedSubcategory !== 'All' ||
                filterBrand !== 'All' ||
                maxPrice < 2000 ||
                inStockOnly ||
                selectedTag !== 'All' ||
                searchQuery.trim().length > 0;

              return (
                <div className="max-w-7xl mx-auto my-6 px-4 sm:px-8 space-y-6 text-left animate-fade-in">
                  {/* Breadcrumbs Navigation */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <button
                      onClick={() => setCurrentPage('home')}
                      className="hover:text-emerald-700 font-semibold"
                    >
                      Home
                    </button>
                    <span>/</span>
                    <button
                      onClick={() => {
                        setSelectedCategory('All');
                        setSelectedSubcategory('All');
                      }}
                      className="hover:text-emerald-700 font-semibold"
                    >
                      Shop
                    </button>
                    {selectedCategory !== 'All' && (
                      <>
                        <span>/</span>
                        <span className="font-bold text-gray-900">{selectedCategory}</span>
                      </>
                    )}
                    {selectedSubcategory !== 'All' && (
                      <>
                        <span>/</span>
                        <span className="font-bold text-emerald-700">{selectedSubcategory}</span>
                      </>
                    )}
                  </div>

                  {/* Shop Header & Filter Control Panel */}
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-5">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                      <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                          <span>{selectedCategory === 'All' ? 'All Products Catalog' : selectedCategory}</span>
                          <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full">
                            {filteredProducts.length} Items Found
                          </span>
                        </h1>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                          Fresh inventory from Sarv Mart Behta Bazar • Delivered within 12 minute
                        </p>
                      </div>

                      {/* Right Filter Actions */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {/* Brand Filter */}
                        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl font-medium">
                          <Filter className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-gray-500 font-semibold">Brand:</span>
                          <select
                            value={filterBrand}
                            onChange={(e) => setFilterBrand(e.target.value)}
                            className="bg-transparent font-bold text-gray-900 outline-none"
                          >
                            <option value="All">All Brands</option>
                            {uniqueBrands.map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Sort Selector */}
                        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl font-medium">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-gray-500 font-semibold">Sort By:</span>
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="bg-transparent font-bold text-gray-900 outline-none"
                          >
                            <option value="relevance">Relevance</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="rating">Customer Rating</option>
                            <option value="discount">Biggest Discount</option>
                          </select>
                        </div>

                        {hasActiveFilters && (
                          <button
                            onClick={() => {
                              setSelectedCategory('All');
                              setSelectedSubcategory('All');
                              setFilterBrand('All');
                              setMaxPrice(2000);
                              setInStockOnly(false);
                              setSelectedTag('All');
                              setSearchQuery('');
                            }}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reset Filters</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Subcategories Horizontal Scroll Bar */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                        Subcategory Navigation
                      </p>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        <button
                          onClick={() => setSelectedSubcategory('All')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                            selectedSubcategory === 'All'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          All Subcategories
                        </button>

                        {availableSubcategories.map((sub) => {
                          const isSelected = selectedSubcategory === sub;
                          return (
                            <button
                              key={sub}
                              onClick={() => setSelectedSubcategory(sub)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border ${
                                isSelected
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-500 shadow-xs ring-2 ring-emerald-500/10'
                                  : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                              }`}
                            >
                              {sub}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Advanced Dynamic Controls Row (Price Slider, Dietary Tags, Stock Toggle) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3 border-t border-gray-100 items-center text-xs">
                      {/* Price Range Slider */}
                      <div className="md:col-span-4 bg-gray-50/80 p-3 rounded-2xl border border-gray-100 space-y-1">
                        <div className="flex justify-between items-center font-semibold text-gray-700">
                          <span>Max Price Filter</span>
                          <span className="font-extrabold text-emerald-800">₹{maxPrice}</span>
                        </div>
                        <input
                          type="range"
                          min={20}
                          max={2000}
                          step={10}
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(Number(e.target.value))}
                          className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
                        />
                      </div>

                      {/* Special Filter Tags */}
                      <div className="md:col-span-5 flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-gray-500 mr-1">Tags:</span>
                        {[
                          { id: 'All', label: 'All Items' },
                          { id: 'Organic', label: '🌿 Organic' },
                          { id: 'BestSeller', label: '🔥 Best Sellers' },
                          { id: 'New', label: '✨ New' },
                          { id: 'Discounted', label: '🏷️ 15%+ Off' },
                        ].map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => setSelectedTag(tag.id as any)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                              selectedTag === tag.id
                                ? 'bg-amber-400 text-emerald-950 shadow-xs'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            {tag.label}
                          </button>
                        ))}
                      </div>

                      {/* In-Stock Toggle */}
                      <div className="md:col-span-3 flex items-center justify-end">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700 select-none">
                          <input
                            type="checkbox"
                            checked={inStockOnly}
                            onChange={(e) => setInStockOnly(e.target.checked)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                          />
                          <span>In-Stock Items Only</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Products Grid */}
                  {filteredProducts.length === 0 ? (
                    <div className="py-20 bg-white rounded-3xl border border-gray-200 text-center space-y-3">
                      <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto font-black text-xl">
                        🔍
                      </div>
                      <p className="font-bold text-lg text-gray-800">No matching products found</p>
                      <p className="text-xs text-gray-500">Try loosening your price slider or filter tags.</p>
                      <button
                        onClick={() => {
                          setSelectedCategory('All');
                          setSelectedSubcategory('All');
                          setSearchQuery('');
                          setFilterBrand('All');
                          setMaxPrice(2000);
                          setInStockOnly(false);
                          setSelectedTag('All');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                      {filteredProducts.map((product) => {
                        const cartItem = cart.find((item) => item.product.id === product.id);
                        const isWishlisted = wishlist.some((p) => p.id === product.id);

                        return (
                          <ProductCard
                            key={product.id}
                            product={product}
                            quantityInCart={cartItem ? cartItem.quantity : 0}
                            isWishlisted={isWishlisted}
                            onAddToCart={handleAddToCart}
                            onRemoveFromCart={handleRemoveFromCart}
                            onToggleWishlist={handleToggleWishlist}
                            onQuickView={setQuickViewProduct}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* PAGE: CATEGORIES */}
            {currentPage === 'categories' && (
              <CategoryGrid
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  setCurrentPage('shop');
                }}
                onViewAllCategories={() => {}}
              />
            )}

            {/* PAGE: OFFERS & DEALS */}
            {currentPage === 'offers' && (
              <div className="max-w-6xl mx-auto my-8 px-4 sm:px-8 space-y-6 text-left">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-emerald-950 p-8 rounded-3xl shadow-xl space-y-2">
                  <span className="bg-emerald-950 text-white text-xs font-black px-3 py-1 rounded-full uppercase">
                    Sarv Mart Offers
                  </span>
                  <h1 className="text-3xl font-black">Supermarket Coupon Codes & Flash Sales</h1>
                  <p className="text-xs font-bold text-emerald-900">
                    Apply promo codes at cart checkout for instant savings in Lucknow!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {INITIAL_COUPONS.map((coupon) => (
                    <div
                      key={coupon.code}
                      className="bg-white p-5 rounded-3xl border-2 border-dashed border-amber-300 shadow-xs space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-lg bg-amber-100 text-amber-900 px-3 py-1 rounded-xl">
                          {coupon.code}
                        </span>
                        <span className="text-[10px] text-gray-500">Valid till {coupon.validTill}</span>
                      </div>
                      <h3 className="font-extrabold text-sm text-gray-900">{coupon.title}</h3>
                      <p className="text-xs text-gray-600 font-medium">{coupon.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PAGE: CHECKOUT */}
            {currentPage === 'checkout' && (
              <CheckoutView
                cartItems={cart}
                appliedCoupon={appliedCoupon}
                onOrderPlaced={handleOrderPlaced}
                onBackToShop={() => setCurrentPage('shop')}
              />
            )}

            {/* PAGE: TRACK ORDER */}
            {currentPage === 'track_order' && (
              <OrderTrackingView
                order={activeTrackOrder}
                onBackToShop={() => setCurrentPage('shop')}
                onUpdateOrderStatus={(orderId, status) => {
                  handleUpdateOrderStatus(orderId, status);
                  if (activeTrackOrder && activeTrackOrder.id === orderId) {
                    setActiveTrackOrder({ ...activeTrackOrder, status });
                  }
                }}
              />
            )}

            {/* STATIC PAGES */}
            {['about', 'contact', 'faq', 'privacy', 'returns', 'terms'].includes(currentPage) && (
              <StaticPages page={currentPage} />
            )}
          </>
        )}

        {/* VIEW MODE 2: POS BILLING TERMINAL */}
        {currentView === 'pos' && (
          <PosBillingView
            products={products}
            onBillCreated={(bill) => {
              // Add bill record
            }}
            onNavigateHome={() => {
              setCurrentView('storefront');
              setCurrentPage('home');
            }}
          />
        )}

        {/* VIEW MODE 3: ADMIN PANEL */}
        {currentView === 'admin' && (
          <AdminDashboardView
            products={products}
            orders={orders}
            onUpdateProductStock={handleUpdateProductStock}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onAddOrUpdateProduct={handleAddOrUpdateProduct}
            onBulkSyncProducts={handleBulkSyncProducts}
          />
        )}

        {/* VIEW MODE 4: DELIVERY RIDER APP */}
        {currentView === 'delivery' && (
          <DeliveryAppView
            orders={orders}
            onCompleteDelivery={(orderId) => handleUpdateOrderStatus(orderId, 'delivered')}
          />
        )}

        {/* VIEW MODE 5: CUSTOMER ACCOUNT */}
        {currentView === 'customer_account' && (
          <CustomerAccountView
            userProfile={userProfile}
            orders={orders}
            wishlistProducts={wishlist}
            onReorder={(order) => {
              setCart(order.items);
              setCurrentView('storefront');
              setCurrentPage('checkout');
            }}
            onRemoveFromWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
          />
        )}
      </main>

      {/* Global Modals & Drawers */}
      <ProductDetailsModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        quantityInCart={
          quickViewProduct
            ? cart.find((i) => i.product.id === quickViewProduct.id)?.quantity || 0
            : 0
        }
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        isWishlisted={quickViewProduct ? wishlist.some((p) => p.id === quickViewProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
        allProducts={products}
      />

      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onAddToCart={handleAddToCart}
        allProducts={products}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={(id) => handleUpdateCartQuantity(id, -99)}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={setAppliedCoupon}
        onProceedToCheckout={() => {
          setCurrentView('storefront');
          setCurrentPage('checkout');
        }}
      />

      {/* Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="font-black text-base text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>Select Delivery PIN Code in Lucknow</span>
              </h2>
              <button onClick={() => setIsLocationModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-600 font-medium">Enter your 6-digit Lucknow PIN code:</p>
              <input
                type="text"
                value={selectedPincode}
                onChange={(e) => setSelectedPincode(e.target.value)}
                placeholder="226026"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-emerald-700 font-bold">
                ✓ Express 12-Hour Home Delivery active for PIN {selectedPincode} (Behta Bazar Lucknow)
              </p>
            </div>

            <button
              onClick={() => setIsLocationModalOpen(false)}
              className="w-full bg-emerald-700 text-white font-bold text-xs py-3 rounded-2xl"
            >
              Confirm Location
            </button>
          </div>
        </div>
      )}

      {/* Footer (hidden during POS billing terminal mode) */}
      {currentView !== 'pos' && (
        <Footer onSelectView={setCurrentView} onSelectPage={setCurrentPage} />
      )}
    </div>
  );
}
