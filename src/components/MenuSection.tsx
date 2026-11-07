import React from 'react';
import { Search, FileText, Sparkles, Filter } from 'lucide-react';
import { Category, MenuItem } from '../types';
import { ProductCard } from './ProductCard';

interface MenuSectionProps {
  categories: Category[];
  products: MenuItem[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  onAddToCart: (product: MenuItem) => void;
  onOpenProductDetails: (product: MenuItem) => void;
  onOpenScannedMenu: () => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  categories,
  products,
  selectedCategory,
  onSelectCategory,
  onAddToCart,
  onOpenProductDetails,
  onOpenScannedMenu,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredProducts = React.useMemo(() => {
    return products.filter((product) => {
      // Category filter
      const matchesCategory =
        selectedCategory === 'all' || product.categoryId === selectedCategory;

      // Search query
      const matchesSearch =
        searchQuery.trim() === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.categoryName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <section id="menu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-right">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-stone-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>قائمة طعام مطعم يَم (YUM)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            تصفح وجباتك المفضلة واطلبها الآن
          </h2>
          <p className="text-sm text-stone-400 mt-1 max-w-xl">
            جميع الأصناف والأسعار مستخرجة بدقة ومطابقة لمنيو ديسمبر 2025 الرسمية. اختر وجبتك وأضفها للسلة بضغطة زر.
          </p>
        </div>

        {/* Action Button to View Original Scanned Menu */}
        <button
          onClick={onOpenScannedMenu}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-400 hover:text-amber-300 text-xs font-bold rounded-xl border border-stone-700 transition-all shadow-md self-start md:self-auto"
        >
          <FileText className="w-4 h-4 text-amber-500" />
          <span>تصفح المنيو المصورة الأصلية</span>
        </button>
      </div>

      {/* Controls: Search & Category Filter Tabs */}
      <div className="space-y-4 mb-10">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن وجبة، ساندوتش، بيتزا، أو إضافات..."
            className="w-full pl-4 pr-11 py-3 bg-[#161413] border border-stone-800 focus:border-amber-500 rounded-xl text-sm text-white placeholder-stone-400 focus:outline-none transition-colors"
          />
          <Search className="w-5 h-5 text-stone-400 absolute right-3.5 top-3.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-3 text-xs text-stone-400 hover:text-white"
            >
              مسح
            </button>
          )}
        </div>

        {/* Segmented Category Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'bg-stone-900/90 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-stone-400 mb-6">
        <span>
          عرض <strong className="text-white tabular-nums">{filteredProducts.length}</strong> صنف
        </span>
        {searchQuery && (
          <span>نتائج البحث عن: "{searchQuery}"</span>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onOpenDetails={onOpenProductDetails}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-stone-900/30 rounded-2xl border border-stone-800/80">
          <p className="text-base font-bold text-stone-300">لم يتم العثور على وجبات مطابقة</p>
          <p className="text-xs text-stone-400 mt-1">جرب البحث بكلمات أخرى أو اختر قسماً آخر من القائمة.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              onSelectCategory('all');
            }}
            className="mt-4 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs font-bold rounded-lg transition-colors"
          >
            عرض جميع الأصناف
          </button>
        </div>
      )}
    </section>
  );
};
