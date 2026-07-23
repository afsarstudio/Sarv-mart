import React, { useState } from 'react';
import {
  ShoppingBag,
  ShoppingCart,
  Search,
  Mic,
  MapPin,
  User,
  Heart,
  Sparkles,
  ChevronDown,
  Store,
  Receipt,
  BarChart3,
  Truck,
  Menu,
  X,
  Phone,
  Clock,
  Sparkle,
  Grid
} from 'lucide-react';
import { ProductCategory, StorePage, ViewMode } from '../types';
import { STORE_DETAILS, INITIAL_CATEGORIES } from '../data/mockData';
import { MegaMenu } from './MegaMenu';

interface NavbarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  currentPage: StorePage;
  onSelectPage: (page: StorePage) => void;
  selectedCategory: ProductCategory | 'All';
  onSelectCategory: (cat: ProductCategory | 'All') => void;
  onSelectSubcategory?: (sub: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenAiModal: () => void;
  selectedPincode: string;
  onOpenLocationModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  currentPage,
  onSelectPage,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenAiModal,
  selectedPincode,
  onOpenLocationModal,
  onSelectSubcategory,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs transition-all">
      {/* Top Bar - Lucknow Store Contact & Delivery Announcement */}
      <div className="bg-emerald-800 text-white text-xs py-1.5 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-4 text-emerald-100 font-medium">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            <span>Behta Bazar, NKS Plaza, Lucknow (226026)</span>
          </span>
          <span className="hidden md:flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-300" />
            <span>Open Today: {STORE_DETAILS.hours}</span>
          </span>
          <span className="hidden lg:flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-emerald-300" />
            <span>{STORE_DETAILS.phone}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-emerald-700/80 px-2 py-0.5 rounded-full text-amber-200 font-semibold text-[11px] whitespace-nowrap">
            <Truck className="w-3 h-3 text-amber-300 animate-pulse" />
            <span>Delivery within 12 minute</span>
          </div>

          {/* Mode Switcher Pill */}
          <div className="flex items-center bg-emerald-900/80 p-0.5 rounded-lg border border-emerald-700">
            <button
              id="nav-btn-storefront"
              onClick={() => onSelectView('storefront')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                currentView === 'storefront' ? 'bg-amber-400 text-emerald-950 font-bold shadow-xs' : 'text-emerald-200 hover:text-white'
              }`}
            >
              Storefront
            </button>
            <button
              id="nav-btn-pos"
              onClick={() => onSelectView('pos')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                currentView === 'pos' ? 'bg-amber-400 text-emerald-950 font-bold shadow-xs' : 'text-emerald-200 hover:text-white'
              }`}
            >
              <Receipt className="w-3 h-3" />
              <span>POS Billing</span>
            </button>
            <button
              id="nav-btn-admin"
              onClick={() => onSelectView('admin')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                currentView === 'admin' ? 'bg-amber-400 text-emerald-950 font-bold shadow-xs' : 'text-emerald-200 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              <span>Inventory & Admin</span>
            </button>
            <button
              id="nav-btn-delivery"
              onClick={() => onSelectView('delivery')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                currentView === 'delivery' ? 'bg-amber-400 text-emerald-950 font-bold shadow-xs' : 'text-emerald-200 hover:text-white'
              }`}
            >
              <Truck className="w-3 h-3" />
              <span>Rider App</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <button
            id="nav-logo-btn"
            onClick={() => {
              onSelectView('storefront');
              onSelectPage('home');
            }}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-11 h-11 rounded-full bg-white p-1 border border-emerald-200 shadow-md shadow-emerald-600/10 group-hover:scale-105 transition-transform overflow-hidden flex items-center justify-center shrink-0">
              <img
                src={STORE_DETAILS.logoUrl}
                alt={STORE_DETAILS.name}
                className="w-full h-full object-contain rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-2xl tracking-tight text-gray-900 group-hover:text-emerald-600 transition-colors">
                  Sarv<span className="text-emerald-600">Mart</span>
                </span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-amber-300">
                  LKO
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">Supermarket • Lucknow</p>
            </div>
          </button>

          {/* Location Picker */}
          <button
            id="nav-location-picker"
            onClick={onOpenLocationModal}
            className="hidden xl:flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200/80 px-3 py-1.5 rounded-xl text-xs transition-colors"
          >
            <div className="p-1 bg-emerald-600 text-white rounded-lg">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="text-left leading-tight">
              <p className="text-[10px] text-emerald-700 font-semibold uppercase">Delivering to</p>
              <p className="font-bold text-gray-900 flex items-center gap-1">
                <span>PIN {selectedPincode} (Behta Bazar)</span>
                <ChevronDown className="w-3 h-3 text-gray-500" />
              </p>
            </div>
          </button>
        </div>

        {/* AI Powered Search Bar */}
        <div className="flex-1 max-w-xl mx-2 relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-gray-400 pointer-events-none" />
            <input
              id="main-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSelectView('storefront');
                  onSelectPage('shop');
                }
              }}
              placeholder='Search "Aashirvaad Atta", "Paneer", "Fresh Fruits", "Mustard Oil"...'
              className="w-full bg-gray-50/80 focus:bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl pl-10 pr-24 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all outline-none"
            />

            {/* Smart AI Voice Search Button */}
            <button
              id="nav-ai-assistant-btn"
              onClick={onOpenAiModal}
              className="absolute right-1.5 flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl shadow-xs transition-all hover:scale-105 active:scale-95"
              title="AI Chef & Recipe Search"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
              <span className="hidden sm:inline">AI Recipe</span>
              <Mic className="w-3 h-3 text-emerald-200" />
            </button>
          </div>
        </div>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wishlist Button */}
          <button
            id="nav-wishlist-btn"
            onClick={() => {
              onSelectView('customer_account');
            }}
            className="relative p-2.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors hidden sm:flex"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* User Account Button */}
          <button
            id="nav-account-btn"
            onClick={() => {
              onSelectView('customer_account');
            }}
            className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors font-medium text-xs"
          >
            <div className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xs border border-emerald-200">
              <User className="w-4 h-4" />
            </div>
            <span className="hidden md:inline font-semibold text-gray-800">Account</span>
          </button>

          {/* Cart Button */}
          <button
            id="nav-cart-btn"
            onClick={onOpenCart}
            className="relative flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-3.5 py-2 rounded-2xl shadow-md shadow-emerald-600/20 transition-all transform active:scale-95"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-amber-300" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-emerald-950 font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-bold text-xs">My Cart</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            id="nav-mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-gray-900 md:hidden"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Secondary Category Navigation Links Bar */}
      <nav className="bg-gray-50 border-t border-gray-100 px-4 sm:px-8 py-2 overflow-x-auto scrollbar-none flex items-center justify-between gap-6 text-xs font-semibold text-gray-700">
        <div className="flex items-center gap-2 shrink-0">
          {/* Mega Menu Explorer Button */}
          <button
            id="nav-mega-menu-btn"
            onClick={() => setIsMegaMenuOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-green-700 hover:from-emerald-800 hover:to-green-800 text-white px-3.5 py-1.5 rounded-xl font-black transition-all shadow-xs hover:scale-[1.02] active:scale-95"
          >
            <Grid className="w-3.5 h-3.5 text-amber-300" />
            <span>Mega Menu</span>
            <span className="bg-amber-400 text-emerald-950 text-[10px] px-1.5 py-0.2 rounded-md uppercase font-mono">{INITIAL_CATEGORIES.length} Dep.</span>
          </button>

          {/* Categories Quick Dropdown Toggle */}
          <div className="relative">
            <button
              id="nav-categories-dropdown-btn"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold transition-colors"
            >
              <Menu className="w-3.5 h-3.5 text-emerald-700" />
              <span>Quick Categories</span>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-700" />
            </button>

            {/* Dropdown Menu */}
            {isCategoryDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 divide-y divide-gray-100">
                <div className="py-1">
                  <button
                    id="cat-dropdown-all"
                    onClick={() => {
                      onSelectCategory('All');
                      if (onSelectSubcategory) onSelectSubcategory('All');
                      setIsCategoryDropdownOpen(false);
                      onSelectView('storefront');
                      onSelectPage('shop');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                      selectedCategory === 'All' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <span>All Products</span>
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">Full Catalog</span>
                  </button>
                </div>
                <div className="py-1 max-h-72 overflow-y-auto">
                  {INITIAL_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      id={`cat-dropdown-${cat.id}`}
                      onClick={() => {
                        onSelectCategory(cat.name);
                        if (onSelectSubcategory) onSelectSubcategory('All');
                        setIsCategoryDropdownOpen(false);
                        onSelectView('storefront');
                        onSelectPage('shop');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                        selectedCategory === cat.name ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-gray-400 font-normal">{cat.itemCount} items</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Page Links */}
          <button
            id="nav-link-home"
            onClick={() => {
              onSelectView('storefront');
              onSelectPage('home');
            }}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              currentPage === 'home' && currentView === 'storefront' ? 'text-emerald-700 bg-emerald-100/60 font-bold' : 'hover:text-emerald-600'
            }`}
          >
            Home
          </button>
          <button
            id="nav-link-shop"
            onClick={() => {
              onSelectView('storefront');
              onSelectPage('shop');
            }}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              currentPage === 'shop' && currentView === 'storefront' ? 'text-emerald-700 bg-emerald-100/60 font-bold' : 'hover:text-emerald-600'
            }`}
          >
            Shop All
          </button>

          <button
            id="nav-link-categories"
            onClick={() => {
              onSelectView('storefront');
              onSelectPage('categories');
            }}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              currentPage === 'categories' && currentView === 'storefront' ? 'text-emerald-700 bg-emerald-100/60 font-bold' : 'hover:text-emerald-600'
            }`}
          >
            Categories
          </button>

          <button
            id="nav-link-offers"
            onClick={() => {
              onSelectView('storefront');
              onSelectPage('offers');
            }}
            className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 ${
              currentPage === 'offers' && currentView === 'storefront' ? 'text-emerald-700 bg-emerald-100/60 font-bold' : 'text-amber-700 hover:text-amber-800'
            }`}
          >
            <Sparkle className="w-3 h-3 text-amber-500 fill-amber-400" />
            <span>Offers & Deals</span>
          </button>

          <button
            id="nav-link-track"
            onClick={() => {
              onSelectView('storefront');
              onSelectPage('track_order');
            }}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              currentPage === 'track_order' && currentView === 'storefront' ? 'text-emerald-700 bg-emerald-100/60 font-bold' : 'hover:text-emerald-600'
            }`}
          >
            Track Order
          </button>

          <button
            id="nav-link-about"
            onClick={() => {
              onSelectView('storefront');
              onSelectPage('about');
            }}
            className={`px-3 py-1.5 rounded-xl transition-colors hidden md:inline ${
              currentPage === 'about' && currentView === 'storefront' ? 'text-emerald-700 bg-emerald-100/60 font-bold' : 'hover:text-emerald-600'
            }`}
          >
            About Store
          </button>

          <button
            id="nav-link-contact"
            onClick={() => {
              onSelectView('storefront');
              onSelectPage('contact');
            }}
            className={`px-3 py-1.5 rounded-xl transition-colors hidden md:inline ${
              currentPage === 'contact' && currentView === 'storefront' ? 'text-emerald-700 bg-emerald-100/60 font-bold' : 'hover:text-emerald-600'
            }`}
          >
            Contact Us
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-gray-500 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Behta Bazar Lucknow Warehouse Active</span>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 space-y-3">
          <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-900 space-y-1">
            <p className="font-bold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sarv Mart Lucknow</span>
            </p>
            <p className="text-gray-600 text-[11px]">{STORE_DETAILS.address}</p>
            <p className="text-emerald-700 font-semibold">{STORE_DETAILS.hours}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => {
                onSelectView('storefront');
                onSelectPage('home');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 bg-gray-50 rounded-xl text-left"
            >
              Home Page
            </button>
            <button
              onClick={() => {
                onSelectView('storefront');
                onSelectPage('shop');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 bg-gray-50 rounded-xl text-left"
            >
              Shop All Products
            </button>
            <button
              onClick={() => {
                onSelectView('storefront');
                onSelectPage('offers');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 bg-amber-50 text-amber-900 rounded-xl text-left font-bold"
            >
              Today's Offers & Deals
            </button>
            <button
              onClick={() => {
                onSelectView('pos');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 bg-emerald-50 text-emerald-900 rounded-xl text-left font-bold"
            >
              POS Billing Terminal
            </button>
            <button
              onClick={() => {
                onSelectView('admin');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 bg-indigo-50 text-indigo-900 rounded-xl text-left font-bold"
            >
              Admin Portal
            </button>
            <button
              onClick={() => {
                onSelectView('delivery');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 bg-blue-50 text-blue-900 rounded-xl text-left font-bold"
            >
              Delivery Partner App
            </button>
          </div>
        </div>
      )}

      {/* Mega Menu Modal Overlay */}
      <MegaMenu
        isOpen={isMegaMenuOpen}
        onClose={() => setIsMegaMenuOpen(false)}
        categories={INITIAL_CATEGORIES}
        onSelectCategoryAndSub={(cat, sub) => {
          onSelectCategory(cat);
          if (sub && onSelectSubcategory) {
            onSelectSubcategory(sub);
          } else if (onSelectSubcategory) {
            onSelectSubcategory('All');
          }
          onSelectView('storefront');
          onSelectPage('shop');
        }}
      />
    </header>
  );
};
