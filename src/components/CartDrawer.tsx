import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Bike } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-[#161413] border-r sm:border-r-0 sm:border-l border-stone-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-200 text-right">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-white">سلة المشتريات</span>
            <div className="w-6 h-6 rounded-full bg-red-600/90 text-white text-xs font-bold flex items-center justify-center tabular-nums">
              {items.length}
            </div>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-stone-900 text-stone-400 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">السلة فارغة حالياً</h3>
              <p className="text-xs text-stone-400 max-w-xs">
                اختر وجباتك وساندوتشاتك المفضلة من المنيو لتظهر هنا.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all"
              >
                تصفح قائمة الطعام
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.cartItemId}
                className="p-3.5 bg-stone-900/80 rounded-2xl border border-stone-800 space-y-3"
              >
                <div className="flex items-start gap-3">
                  {/* Item Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 bg-stone-800"
                    referrerPolicy="no-referrer"
                  />

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                    {item.selectedSize && (
                      <p className="text-xs text-amber-400 font-medium mt-0.5">
                        الحجم: {item.selectedSize.name}
                      </p>
                    )}
                    {item.selectedAdditions && item.selectedAdditions.length > 0 && (
                      <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">
                        + {item.selectedAdditions.map((a) => a.name).join('، ')}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-[10px] text-stone-400 italic mt-0.5 truncate">
                        ملاحظة: {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(item.cartItemId)}
                    className="p-1.5 text-stone-400 hover:text-red-400 transition-colors"
                    title="حذف الصنف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Price and Quantity Stepper */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-800/60">
                  <div className="flex items-center gap-2 bg-stone-950 p-1 rounded-xl border border-stone-800">
                    <button
                      onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                      className="w-6 h-6 rounded-lg bg-stone-800 hover:bg-stone-700 text-white flex items-center justify-center font-bold text-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-white tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                      className="w-6 h-6 rounded-lg bg-stone-800 hover:bg-stone-700 text-white flex items-center justify-center font-bold text-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-left">
                    <span className="text-sm font-black text-amber-400 tabular-nums">
                      {item.totalPrice} <span className="text-xs text-stone-300 font-bold">ج.م</span>
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-800 bg-[#141212] space-y-4">
            <div className="space-y-1.5 text-xs text-stone-300">
              <div className="flex justify-between">
                <span>إجمالي الأصناف:</span>
                <span className="font-bold tabular-nums text-white">{subtotal} ج.م</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span className="flex items-center gap-1">
                  <Bike className="w-3.5 h-3.5 text-red-500" />
                  <span>رسوم التوصيل:</span>
                </span>
                <span>تُحسب حسب المنطقة (السنطة / أبو الجهور)</span>
              </div>
              <p className="text-[11px] text-emerald-400 font-medium pt-1">
                الدفع كاش عند الاستلام فقط 💵
              </p>
            </div>

            <button
              onClick={onProceedToCheckout}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-red-700/30 active:scale-98 transition-all"
            >
              <span>متابعة لإتمام الطلب</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
