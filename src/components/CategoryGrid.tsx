import React from 'react';
import { ProductCategory, CategoryItem } from '../types';
import { INITIAL_CATEGORIES } from '../data/mockData';
import { ChevronRight, ArrowRight } from 'lucide-react';

interface CategoryGridProps {
  selectedCategory: ProductCategory | 'All';
  onSelectCategory: (cat: ProductCategory) => void;
  onViewAllCategories: () => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  selectedCategory,
  onSelectCategory,
  onViewAllCategories,
}) => {
  return (
    <section className="my-8 mx-4 sm:mx-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-fluid-h2 font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Explore Categories</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full shrink-0">
              {INITIAL_CATEGORIES.length} Categories
            </span>
          </h2>
          <p className="text-xs text-gray-500 font-medium">Daily groceries, home care, kitchen essentials & household items</p>
        </div>

        <button
          id="cat-grid-view-all"
          onClick={onViewAllCategories}
          className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors"
        >
          <span>View All</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {INITIAL_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.name;

          return (
            <button
              key={cat.id}
              id={`cat-card-${cat.id}`}
              onClick={() => onSelectCategory(cat.name)}
              className={`group relative overflow-hidden rounded-2xl p-3 text-left transition-all duration-300 border ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-500/20 scale-[1.02]'
                  : 'border-gray-200/80 bg-white hover:bg-gray-50/80 hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <div className="relative h-24 sm:h-28 rounded-xl overflow-hidden mb-2 bg-gray-100">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                <span className="absolute bottom-2 left-2 text-[10px] bg-white/90 backdrop-blur-md text-gray-900 font-bold px-2 py-0.5 rounded-md shadow-xs">
                  {cat.itemCount}+ items
                </span>
              </div>

              <h3 className={`font-bold text-xs sm:text-sm line-clamp-1 transition-colors ${
                isSelected ? 'text-emerald-900 font-extrabold' : 'text-gray-900 group-hover:text-emerald-700'
              }`}>
                {cat.name}
              </h3>
              <p className="text-[10px] text-gray-500 line-clamp-1 font-medium mt-0.5">
                {cat.subcategories.slice(0, 2).join(', ')}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
};
