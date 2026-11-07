import React from 'react';
import { Plus, Check, Sparkles, AlertCircle } from 'lucide-react';
import { MenuItem } from '../types';

interface ProductCardProps {
  product: MenuItem;
  onAddToCart: (product: MenuItem) => void;
  onOpenDetails: (product: MenuItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onOpenDetails,
}) => {
  const [justAdded, setJustAdded] = React.useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.sizes && product.sizes.length > 0) {
      onOpenDetails(product);
      return;
    }
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const hasMultipleSizes = product.sizes && product.sizes.length > 0;
  const lowestPrice = hasMultipleSizes
    ? Math.min(...product.sizes!.map((s) => s.price))
    : product.price;

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group relative flex flex-col bg-[#161413] hover:bg-[#1a1716] border border-stone-800 hover:border-stone-700 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/50 cursor-pointer"
    >
      {/* Product Image */}
      <div className="relative w-full aspect-[4/3] bg-stone-900 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // fallback if an image fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        {/* Status / Availability Badge */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          {product.isFeatured && (
            <span className="flex items-center gap-1 bg-amber-500 text-black text-[11px] font-black px-2.5 py-0.5 rounded-md shadow-md">
              <Sparkles className="w-3 h-3" />
              <span>وجبة مميزة</span>
            </span>
          )}
          {!product.isAvailable && (
            <span className="bg-red-900/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md">
              غير متوفر مؤقتًا
            </span>
          )}
        </div>

        {/* Source indicator */}
        <div className="absolute bottom-2 right-3 text-[10px] text-stone-300 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded">
          {product.confidenceStatus}
        </div>
      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col p-4 text-right space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span>{product.categoryName}</span>
          {hasMultipleSizes && (
            <span className="text-amber-400 font-semibold">{product.sizes?.length} أحجام متاحة</span>
          )}
        </div>

        <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
          {product.name}
        </h3>

        <p className="text-xs text-stone-400 leading-relaxed line-clamp-2 flex-1">
          {product.description || 'وجبة طازجة وشهية محضرة يومياً بخلطة يم الخاصة.'}
        </p>

        {/* Price and Add CTA */}
        <div className="pt-2 flex items-center justify-between border-t border-stone-800/80">
          <div className="text-right">
            <span className="text-[11px] text-stone-400 block">
              {hasMultipleSizes ? 'يبدأ من' : 'السعر'}
            </span>
            <span className="text-lg font-black text-amber-400 tabular-nums">
              {lowestPrice} <span className="text-xs font-bold text-stone-300">ج.م</span>
            </span>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={!product.isAvailable}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : !product.isAvailable
                ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-900/20 active:scale-95'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>تمت الإضافة</span>
              </>
            ) : hasMultipleSizes ? (
              <>
                <span>اختر الحجم</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>أضف للسلة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
