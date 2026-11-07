import React from 'react';
import { Sparkles, ShoppingBag, Flame, Tag } from 'lucide-react';
import { MenuItem } from '../types';

interface OffersSectionProps {
  products: MenuItem[];
  onAddToCart: (product: MenuItem) => void;
  onOpenDetails: (product: MenuItem) => void;
}

export const OffersSection: React.FC<OffersSectionProps> = ({
  products,
  onAddToCart,
  onOpenDetails,
}) => {
  const offerItems = products.filter(
    (p) => p.categoryId === 'offers' || p.id === 'meal-family' || p.isFeatured
  ).slice(0, 3);

  return (
    <section id="offers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-right">
      <div className="bg-gradient-to-r from-red-950/60 via-[#161413] to-amber-950/40 border border-red-900/30 rounded-3xl p-6 sm:p-10 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
              <Flame className="w-4 h-4 text-red-500 fill-red-500" />
              <span>عروض التوفير الأسبوعية والعائلية</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              أقوى عروض مطعم YUM بأسعار لا تُقاوم
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              وجبات عائلية تكفي العيلة وتجمعات الصحاب بأعلى توفير وألذ طعم.
            </p>
          </div>
        </div>

        {/* Offers Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offerItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenDetails(item)}
              className="bg-[#181514] hover:bg-[#1d1918] border border-stone-800 hover:border-red-600/40 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl flex flex-col justify-between cursor-pointer group"
            >
              <div className="relative aspect-[16/9] bg-stone-900 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute top-3 right-3 px-2.5 py-0.5 bg-red-600 text-white text-[11px] font-black rounded-md flex items-center gap-1 shadow-md">
                  <Tag className="w-3 h-3" />
                  <span>عرض حصري</span>
                </span>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-stone-300 mt-1 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between">
                  <span className="text-lg font-black text-amber-400 tabular-nums">
                    {item.price} <span className="text-xs font-bold text-stone-300">ج.م</span>
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetails(item);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>طلب العرض</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
