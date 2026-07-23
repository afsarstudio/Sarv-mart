import React from 'react';
import { Product } from '../types';
import { Star, Plus, Minus, Heart, Eye, ShoppingCart, Sparkles, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  isWishlisted: boolean;
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  isWishlisted,
  onAddToCart,
  onRemoveFromCart,
  onToggleWishlist,
  onQuickView,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl p-3 flex flex-col justify-between hover:shadow-xl hover:border-emerald-300 transition-all duration-300 transform hover:-translate-y-1">
      {/* Top Image & Badges Wrapper */}
      <div className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden mb-2.5">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
          {product.discountPercent > 0 && (
            <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
              {product.discountPercent}% OFF
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-amber-400 text-emerald-950 font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> Best Seller
            </span>
          )}
          {product.isOrganic && (
            <span className="bg-green-700 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full shadow-xs">
              100% Fresh
            </span>
          )}
        </div>

        {/* Wishlist Button & Quick View Button */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
          <button
            id={`wishlist-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all shadow-xs ${
              isWishlisted
                ? 'bg-rose-500 text-white scale-110'
                : 'bg-white/80 hover:bg-white text-gray-600 hover:text-rose-500'
            }`}
            title="Add to Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
          </button>

          <button
            id={`quickview-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-emerald-700 transition-all shadow-xs"
            title="Quick View"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center p-2 z-20">
            <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-full border border-rose-300">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Brand & Subcategory */}
          <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium mb-0.5">
            <span className="uppercase tracking-wider font-semibold text-emerald-700">{product.brand}</span>
            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md font-mono">{product.unit}</span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onQuickView(product)}
            className="font-extrabold text-xs sm:text-sm text-gray-900 line-clamp-2 hover:text-emerald-600 transition-colors cursor-pointer leading-tight"
          >
            {product.name}
          </h3>

          {/* Hindi Name if available */}
          {product.hindiName && (
            <p className="text-[11px] text-gray-500 font-medium mt-0.5 line-clamp-1">
              {product.hindiName}
            </p>
          )}

          {/* Rating & Stock Status */}
          <div className="flex items-center gap-2 mt-1.5 text-xs">
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold text-amber-800">
              <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
              <span>{product.rating}</span>
              <span className="text-gray-400 font-normal">({product.reviewsCount})</span>
            </div>

            {isLowStock && (
              <span className="text-[10px] font-semibold text-amber-700 flex items-center gap-0.5 animate-pulse">
                <AlertCircle className="w-3 h-3" /> Only {product.stock} left!
              </span>
            )}
          </div>
        </div>

        {/* Price & Quantity Add Action */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
          {/* Price */}
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-gray-900">₹{product.price}</span>
              {product.mrp > product.price && (
                <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
              )}
            </div>
            {product.mrp > product.price && (
              <p className="text-[10px] text-emerald-700 font-bold">
                Save ₹{product.mrp - product.price}
              </p>
            )}
          </div>

          {/* Quantity Selector / Add Button */}
          <div>
            {quantityInCart === 0 ? (
              <button
                id={`add-btn-${product.id}`}
                disabled={isOutOfStock}
                onClick={() => onAddToCart(product)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 shadow-xs active:scale-95'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ADD</span>
              </button>
            ) : (
              <div className="flex items-center bg-emerald-700 text-white rounded-xl shadow-xs p-0.5">
                <button
                  id={`decrement-btn-${product.id}`}
                  onClick={() => onRemoveFromCart(product)}
                  className="p-1 hover:bg-emerald-800 rounded-lg transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-black text-xs min-w-[20px] text-center">
                  {quantityInCart}
                </span>
                <button
                  id={`increment-btn-${product.id}`}
                  onClick={() => onAddToCart(product)}
                  className="p-1 hover:bg-emerald-800 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
