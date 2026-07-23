import React, { useState } from 'react';
import { ProductCategory, CategoryItem } from '../types';
import { STORE_DETAILS } from '../data/mockData';
import {
  Wheat,
  Apple,
  Carrot,
  Milk,
  Cake,
  PenTool,
  Utensils,
  Home,
  Sparkles,
  Smile,
  Smartphone,
  ShoppingBag,
  ChevronRight,
  Search,
  X,
  Sparkle,
  ArrowRight,
  Tag,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  onSelectCategoryAndSub: (cat: ProductCategory, subcategory?: string) => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({
  isOpen,
  onClose,
  categories,
  onSelectCategoryAndSub,
}) => {
  const [activeCatId, setActiveCatId] = useState<string>(categories[0]?.id || 'groceries');
  const [menuSearch, setMenuSearch] = useState('');

  if (!isOpen) return null;

  const activeCategory = categories.find((c) => c.id === activeCatId) || categories[0];

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wheat':
        return <Wheat className="w-4 h-4 text-emerald-600" />;
      case 'Apple':
        return <Apple className="w-4 h-4 text-red-500" />;
      case 'Carrot':
        return <Carrot className="w-4 h-4 text-orange-500" />;
      case 'Milk':
        return <Milk className="w-4 h-4 text-blue-500" />;
      case 'Cake':
        return <Cake className="w-4 h-4 text-pink-500" />;
      case 'PenTool':
        return <PenTool className="w-4 h-4 text-indigo-500" />;
      case 'Utensils':
        return <Utensils className="w-4 h-4 text-amber-600" />;
      case 'Home':
        return <Home className="w-4 h-4 text-teal-600" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'Smile':
        return <Smile className="w-4 h-4 text-rose-500" />;
      case 'Smartphone':
        return <Smartphone className="w-4 h-4 text-cyan-600" />;
      default:
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
    }
  };

  // Filter categories and subcategories by menuSearch
  const filteredCategories = categories.filter((c) => {
    if (!menuSearch.trim()) return true;
    const q = menuSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.subcategories.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in text-left">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Mega Menu Dropdown Box */}
      <div className="relative max-w-7xl mx-auto top-3 sm:top-20 px-2 sm:px-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[80vh]">
          {/* Header Bar inside Mega Menu */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-900 text-white p-3.5 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-emerald-700/50">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white p-0.5 rounded-full flex items-center justify-center font-black shadow-md shrink-0 border border-emerald-500/40 overflow-hidden">
                <img
                  src={STORE_DETAILS.logoUrl}
                  alt={STORE_DETAILS.name}
                  className="w-full h-full object-contain rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight flex items-center gap-2">
                  <span>Sarv Mart Multi-Category Explorer</span>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-300/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono hidden sm:inline">
                    {categories.length} Categories
                  </span>
                </h3>
                <p className="text-[11px] sm:text-xs text-emerald-200 font-medium">
                  Browse fresh groceries, dairy, kitchen & household with instant 12 minute delivery in Lucknow
                </p>
              </div>
            </div>

            {/* Quick Filter Search */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-emerald-300 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter categories & items..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full bg-emerald-950/60 border border-emerald-700/60 text-white placeholder-emerald-300 text-xs pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                onClick={onClose}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-colors"
                title="Close Mega Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Content 3-Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
            {/* Left Column: Category Selector List */}
            <div className="md:col-span-4 lg:col-span-3 border-r border-gray-100 bg-gray-50/70 p-3 overflow-y-auto max-h-[60vh] space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                All Departments
              </div>

              {filteredCategories.map((cat) => {
                const isActive = cat.id === activeCategory.id;
                return (
                  <button
                    key={cat.id}
                    onMouseEnter={() => setActiveCatId(cat.id)}
                    onClick={() => {
                      setActiveCatId(cat.id);
                      onSelectCategoryAndSub(cat.name);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all text-xs font-bold ${
                      isActive
                        ? 'bg-white text-emerald-900 shadow-sm border border-emerald-200 ring-2 ring-emerald-500/10'
                        : 'text-gray-700 hover:bg-white hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-gray-100/80 rounded-xl group-hover:bg-emerald-50">
                        {getCategoryIcon(cat.iconName)}
                      </div>
                      <span>{cat.name}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-gray-400 bg-gray-200/60 px-1.5 py-0.5 rounded-md font-mono">
                        {cat.itemCount}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-gray-300'}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Middle Column: Subcategories & Direct Jump Links */}
            <div className="md:col-span-8 lg:col-span-6 p-6 overflow-y-auto max-h-[60vh] space-y-6">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h4 className="font-extrabold text-lg text-gray-900 flex items-center gap-2">
                      <span>{activeCategory.name}</span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        {activeCategory.itemCount}+ Products
                      </span>
                    </h4>
                    <p className="text-xs text-gray-500 font-medium">Select a subcategory to browse products</p>
                  </div>

                  <button
                    onClick={() => {
                      onSelectCategoryAndSub(activeCategory.name);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors"
                  >
                    <span>Explore All {activeCategory.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subcategories Grid Pills */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {activeCategory.subcategories.map((sub, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onSelectCategoryAndSub(activeCategory.name, sub);
                        onClose();
                      }}
                      className="group p-3 rounded-2xl border border-gray-200/80 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 text-left transition-all duration-200 flex items-center justify-between shadow-2xs hover:shadow-sm"
                    >
                      <div>
                        <p className="font-bold text-xs text-gray-900 group-hover:text-emerald-800">
                          {sub}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5 flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Direct Stock</span>
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-600 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Tag Highlights */}
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Popular in Lucknow This Week</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {['Chakki Fresh Atta', 'Amul Butter 500g', 'Fresh Farm Milk', 'Fortune Mustard Oil', 'Kagzi Lemon'].map(
                    (tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          onSelectCategoryAndSub('Groceries', tag);
                          onClose();
                        }}
                        className="bg-white hover:bg-emerald-600 hover:text-white border border-emerald-200/80 text-emerald-900 text-[11px] font-semibold px-2.5 py-1 rounded-xl transition-colors"
                      >
                        {tag}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Featured Banner Card */}
            <div className="hidden lg:block lg:col-span-3 p-5 bg-gradient-to-b from-emerald-950 to-gray-900 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10 space-y-3">
                <span className="bg-amber-400 text-emerald-950 font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">
                  Special Offer
                </span>
                <h4 className="font-black text-xl text-white leading-tight">
                  {activeCategory.name} Bonanza
                </h4>
                <p className="text-xs text-emerald-200">
                  Save up to 30% OFF on certified organic and fresh batch stock. Delivered direct to your doorstep.
                </p>

                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 space-y-1">
                  <p className="text-[10px] text-amber-300 uppercase font-bold tracking-wider">
                    Coupon Code
                  </p>
                  <p className="text-base font-black font-mono text-white tracking-widest">
                    SARV20
                  </p>
                  <p className="text-[10px] text-emerald-200">Flat 20% OFF on orders over ₹499</p>
                </div>
              </div>

              {/* Image Preview */}
              <div className="relative z-10 mt-4 rounded-2xl overflow-hidden h-32 border border-white/20">
                <img
                  src={activeCategory.image}
                  alt={activeCategory.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                  <span className="text-[11px] font-bold text-white flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    100% Quality Inspected
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectCategoryAndSub(activeCategory.name);
                  onClose();
                }}
                className="mt-4 w-full bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs py-2.5 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 relative z-10"
              >
                <span>Browse {activeCategory.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
