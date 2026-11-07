import React from 'react';
import { X, Plus, Minus, Check, ShoppingBag, Info } from 'lucide-react';
import { MenuItem, ProductAddition, ProductVariantSize } from '../types';

interface ProductDetailModalProps {
  product: MenuItem | null;
  onClose: () => void;
  onAddToCartWithOptions: (
    product: MenuItem,
    size: ProductVariantSize | undefined,
    additions: ProductAddition[],
    quantity: number,
    notes: string
  ) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCartWithOptions,
}) => {
  if (!product) return null;

  const [selectedSize, setSelectedSize] = React.useState<ProductVariantSize | undefined>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  );
  const [selectedAdditions, setSelectedAdditions] = React.useState<ProductAddition[]>([]);
  const [quantity, setQuantity] = React.useState(1);
  const [notes, setNotes] = React.useState('');
  const [addedSuccess, setAddedSuccess] = React.useState(false);

  // Reset states when product changes
  React.useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);
      setSelectedAdditions([]);
      setQuantity(1);
      setNotes('');
      setAddedSuccess(false);
    }
  }, [product]);

  const toggleAddition = (addition: ProductAddition) => {
    if (selectedAdditions.some((a) => a.id === addition.id)) {
      setSelectedAdditions(selectedAdditions.filter((a) => a.id !== addition.id));
    } else {
      setSelectedAdditions([...selectedAdditions, addition]);
    }
  };

  const basePrice = selectedSize ? selectedSize.price : product.price;
  const additionsTotal = selectedAdditions.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = basePrice + additionsTotal;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    onAddToCartWithOptions(product, selectedSize, selectedAdditions, quantity, notes);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#181514] border border-stone-800 rounded-3xl overflow-hidden shadow-2xl text-right animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-stone-300 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Media */}
        <div className="relative w-full aspect-[16/9] bg-stone-900">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181514] via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between text-xs text-amber-500 font-bold mb-1">
              <span>{product.categoryName}</span>
              <span className="text-stone-400 font-normal">{product.confidenceStatus}</span>
            </div>
            <h2 className="text-2xl font-black text-white">{product.name}</h2>
            <p className="text-sm text-stone-300 mt-2 leading-relaxed">
              {product.description || 'وجبة طازجة وشهية محضرة يومياً بخلطة يم الخاصة.'}
            </p>
            {product.menuSource && (
              <p className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-stone-400" />
                <span>مصدر الصنف: {product.menuSource}</span>
              </p>
            )}
          </div>

          {/* Sizes Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-300 block">اختر الحجم / عدد القطع:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize?.name === size.name;
                  return (
                    <button
                      key={size.name}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 text-amber-400 font-bold'
                          : 'border-stone-800 bg-stone-900/60 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <span className="block text-xs">{size.name}</span>
                      <span className="block text-sm font-black tabular-nums mt-0.5">{size.price} ج.م</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Additions / Extras */}
          {product.additions && product.additions.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-300 block">إضافات وصوصات اختيارية:</label>
              <div className="space-y-2">
                {product.additions.map((addition) => {
                  const isSelected = selectedAdditions.some((a) => a.id === addition.id);
                  return (
                    <button
                      key={addition.id}
                      type="button"
                      onClick={() => toggleAddition(addition)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-xs ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                          : 'border-stone-800 bg-stone-900/60 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isSelected ? 'bg-amber-500 border-amber-500 text-black' : 'border-stone-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{addition.name}</span>
                      </div>
                      <span className="text-amber-400 font-bold tabular-nums">+{addition.price} ج.م</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes textarea */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-300 block">ملاحظاتك الخاصة (اختياري):</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: بدون بصل، زيادة صوص ثومية، سبايسي..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white placeholder-stone-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Quantity and Final Total */}
          <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-4">
            {/* Quantity Stepper */}
            <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-white flex items-center justify-center font-bold"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center text-sm font-black text-white tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-white flex items-center justify-center font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Total and Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="text-left">
                <span className="text-[11px] text-stone-400 block">الإجمالي</span>
                <span className="text-xl font-black text-amber-400 tabular-nums">
                  {totalPrice} <span className="text-xs text-stone-300">ج.م</span>
                </span>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={!product.isAvailable}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm transition-all ${
                  addedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30 active:scale-95'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>تمت الإضافة!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>أضف للسلة</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
