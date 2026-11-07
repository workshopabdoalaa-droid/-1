import React from 'react';
import { X, CheckCircle2, Bike, Store, AlertTriangle, ShieldCheck } from 'lucide-react';
import { CartItem, DeliveryZone, FulfillmentType, Order, RestaurantInfo } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  deliveryZones: DeliveryZone[];
  restaurantInfo: RestaurantInfo;
  onOrderSuccess: (order: Order) => void;
  onClearCart: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  deliveryZones,
  restaurantInfo,
  onOrderSuccess,
  onClearCart,
}) => {
  if (!isOpen) return null;

  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [fulfillmentType, setFulfillmentType] = React.useState<FulfillmentType>('delivery');
  const [selectedZoneId, setSelectedZoneId] = React.useState<string>(
    deliveryZones.length > 0 ? deliveryZones[0].id : 'el-santa'
  );
  const [notes, setNotes] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const currentZone = deliveryZones.find((z) => z.id === selectedZoneId);
  const deliveryFee =
    fulfillmentType === 'pickup'
      ? 0
      : currentZone && currentZone.isEnabled && currentZone.fee !== null
      ? currentZone.fee
      : 0;

  const total = subtotal + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!name.trim()) {
      setErrorMessage('الرجاء إدخال الاسم بالكامل');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('يرجى إدخال رقم هاتف صحيح (مثال: 01061119339)');
      return;
    }

    if (fulfillmentType === 'delivery') {
      if (!selectedZoneId) {
        setErrorMessage('الرجاء اختيار منطقة التوصيل (السنطة أو أبو الجهور)');
        return;
      }
      if (!currentZone || !currentZone.isEnabled) {
        setErrorMessage('منطقة التوصيل المختارة غير مفعلة حالياً');
        return;
      }
      if (!currentZone.isConfigured || currentZone.fee === null) {
        setErrorMessage(
          `رسوم التوصيل إلى ${currentZone.name} لم يتم ضبطها بعد من قبل إدارة المطعم. يرجى التواصل عبر الواتساب.`
        );
        return;
      }
      if (!address.trim() || address.trim().length < 5) {
        setErrorMessage('الرجاء كتابة تفاصيل العنوان بوضوح (الشارع، رقم العمارة أو علامة مميزة)');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customer: {
          name: name.trim(),
          phone: phone.trim(),
          address: fulfillmentType === 'delivery' ? address.trim() : restaurantInfo.addressShort,
          deliveryZoneId: fulfillmentType === 'delivery' ? selectedZoneId : undefined,
          deliveryZoneName: fulfillmentType === 'delivery' ? currentZone?.name : 'استلام من المطعم',
          fulfillmentType,
          notes: notes.trim() || undefined,
        },
        items,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشلت عملية حفظ الطلب في قاعدة البيانات');
      }

      onClearCart();
      onOrderSuccess(data.order);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ غير متوقع أثناء إرسال الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-[#161413] border border-stone-800 rounded-3xl overflow-hidden shadow-2xl text-right animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-white">إتمام الطلب أونلاين</span>
          </div>
        </div>

        <form onSubmit={handleSubmitOrder} className="p-6 space-y-6">
          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 bg-red-950/80 border border-red-800/80 rounded-xl text-xs font-bold text-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Fulfillment Type (Delivery vs Pickup) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-300 block">طريقة استلام الطلب:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFulfillmentType('delivery')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  fulfillmentType === 'delivery'
                    ? 'border-red-600 bg-red-600/10 text-white shadow-md'
                    : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:border-stone-700'
                }`}
              >
                <Bike className="w-4 h-4 text-red-500" />
                <span>توصيل للمنزل</span>
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentType('pickup')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  fulfillmentType === 'pickup'
                    ? 'border-amber-500 bg-amber-500/10 text-white shadow-md'
                    : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:border-stone-700'
                }`}
              >
                <Store className="w-4 h-4 text-amber-500" />
                <span>استلام من المطعم (مجاناً)</span>
              </button>
            </div>
          </div>

          {/* Customer Personal Details */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">الاسم بالكامل *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك الكريم"
                className="w-full px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-400 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">
                رقم الهاتف (للتواصل والتأكيد) *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="مثال: 01061119339"
                className="w-full px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-400 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Delivery Zone & Address (If Delivery) */}
          {fulfillmentType === 'delivery' ? (
            <div className="space-y-4 p-4 bg-stone-900/50 rounded-2xl border border-stone-800/80">
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-2">
                  اختر منطقة التوصيل المتاحة:
                </label>
                <div className="space-y-2">
                  {deliveryZones.map((zone) => {
                    const isSelected = selectedZoneId === zone.id;
                    const isConfigured = zone.isConfigured && zone.fee !== null;
                    return (
                      <button
                        key={zone.id}
                        type="button"
                        disabled={!zone.isEnabled || !isConfigured}
                        onClick={() => setSelectedZoneId(zone.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                            : 'border-stone-800 bg-stone-900/60 text-stone-300 hover:border-stone-700'
                        } ${!zone.isEnabled || !isConfigured ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-amber-500 bg-amber-500 text-black'
                                : 'border-stone-600'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                          </div>
                          <span>{zone.name}</span>
                        </div>
                        <div>
                          {isConfigured ? (
                            <span className="text-amber-400 font-bold tabular-nums">
                              {zone.fee} ج.م توصيل ({zone.estimatedMinutes})
                            </span>
                          ) : (
                            <span className="text-red-400 text-[11px]">رسوم غير محددة بعد</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">
                  العنوان بالتفصيل *
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="الشارع، رقم العمارة، الطابق، أو أقرب علامة مميزة"
                  className="w-full px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-400 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 bg-stone-900/50 rounded-2xl border border-stone-800/80 text-xs text-stone-300 space-y-1">
              <span className="font-bold text-amber-400 block">عنوان استلام الطلب من المطعم:</span>
              <p>{restaurantInfo.address}</p>
              <p className="text-stone-400 text-[11px]">
                سيكون طلبك جاهزاً للاستلام خلال 20 - 30 دقيقة من تأكيده.
              </p>
            </div>
          )}

          {/* Special Notes */}
          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">
              ملاحظات إضافية للمطعم أو الدليفري (اختياري)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: يرجى الاتصال عند الوصول، بدون شطة..."
              className="w-full px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-400 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Payment Method Notice (Cash on Delivery ONLY) */}
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/50 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-900/60 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-700/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-emerald-400 font-bold">طريقة الدفع المعتمدة:</p>
              <p className="text-sm font-black text-white">الدفع كاش عند الاستلام</p>
            </div>
          </div>

          {/* Order Summary & Final Total */}
          <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800/90 space-y-2 text-xs">
            <div className="flex justify-between text-stone-300">
              <span>إجمالي الأصناف ({items.length}):</span>
              <span className="font-bold tabular-nums text-white">{subtotal} ج.م</span>
            </div>
            <div className="flex justify-between text-stone-300">
              <span>رسوم التوصيل ({fulfillmentType === 'delivery' ? currentZone?.name : 'استلام'}):</span>
              <span className="font-bold tabular-nums text-white">{deliveryFee} ج.م</span>
            </div>
            <div className="pt-2 border-t border-stone-800 flex justify-between items-center text-sm">
              <span className="font-extrabold text-white">المبلغ النهائي المستحق للدفع:</span>
              <span className="text-xl font-black text-amber-400 tabular-nums">
                {total} <span className="text-xs font-bold text-stone-300">ج.م</span>
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 text-white font-black text-base rounded-2xl shadow-xl shadow-red-700/30 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>جاري تسجيل الطلب بقاعدة البيانات...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>تأكيد الطلب والدفع كاش عند الاستلام</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
