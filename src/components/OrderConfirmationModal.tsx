import React from 'react';
import { X, CheckCircle2, MessageSquare, Phone, Clock, Bike, Copy, Check } from 'lucide-react';
import { Order, RestaurantInfo } from '../types';

interface OrderConfirmationModalProps {
  order: Order | null;
  restaurantInfo: RestaurantInfo;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  restaurantInfo,
  onClose,
}) => {
  if (!order) return null;

  const [copied, setCopied] = React.useState(false);

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build WhatsApp pre-filled message
  const itemsText = order.items
    .map(
      (item) =>
        `- ${item.quantity}x ${item.name}${item.selectedSize ? ` (${item.selectedSize.name})` : ''}: ${item.totalPrice} ج.م`
    )
    .join('\n');

  const waMessage = encodeURIComponent(
    `مرحباً مطعم يَم (YUM) 👋\nأنا العميل: ${order.customer.name}\nرقم الطلب: ${order.orderNumber}\nرقم الهاتف: ${order.customer.phone}\nطريقة الاستلام: ${
      order.customer.fulfillmentType === 'delivery'
        ? `توصيل (${order.customer.deliveryZoneName}) - ${order.customer.address}`
        : 'استلام من المطعم'
    }\n\nالوجبات المطلوبة:\n${itemsText}\n\nإجمالي الحساب: ${order.total} ج.م (كاش عند الاستلام)\nشكراً لكم!`
  );

  const cleanWhatsappNumber = restaurantInfo.whatsapp.replace(/\D/g, '');
  const waUrl = `https://wa.me/${cleanWhatsappNumber}?text=${waMessage}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-[#161413] border border-stone-800 rounded-3xl overflow-hidden shadow-2xl text-right animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-amber-500">تم حفظ الطلب بنجاح في قاعدة البيانات</span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Big Success Icon */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-black text-white">شكراً لك! تم استلام طلبك</h2>
            <p className="text-xs text-stone-300">
              يقوم فريق عمل مطعم <strong className="text-amber-400">YUM</strong> بتجهيز طلبك الآن بأعلى جودة.
            </p>
          </div>

          {/* Order Number Box */}
          <div className="p-4 bg-stone-900/90 rounded-2xl border border-stone-800 flex items-center justify-between">
            <div className="text-right">
              <span className="text-[11px] text-stone-400 block">رقم الطلب المرجعي</span>
              <span className="text-2xl font-black text-amber-400 tracking-wider tabular-nums">
                {order.orderNumber}
              </span>
            </div>
            <button
              onClick={copyOrderNumber}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الرقم</span>
                </>
              )}
            </button>
          </div>

          {/* Status Timeline */}
          <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>حالة الطلب الحالية:</span>
              </span>
              <span className="text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                {order.statusAr}
              </span>
            </div>

            {/* Simple Step Bar */}
            <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold pt-1">
              <div className="p-1 rounded bg-amber-500 text-black">1. تم الاستلام</div>
              <div className="p-1 rounded bg-stone-800 text-stone-400">2. قيد التجهيز</div>
              <div className="p-1 rounded bg-stone-800 text-stone-400">3. في الطريق</div>
              <div className="p-1 rounded bg-stone-800 text-stone-400">4. تم التسليم</div>
            </div>
          </div>

          {/* Summary Details */}
          <div className="p-4 bg-stone-900/60 rounded-2xl border border-stone-800 text-xs space-y-2">
            <div className="flex justify-between text-stone-300">
              <span className="text-stone-400">اسم العميل:</span>
              <span className="font-bold text-white">{order.customer.name}</span>
            </div>
            <div className="flex justify-between text-stone-300">
              <span className="text-stone-400">رقم الهاتف:</span>
              <span className="font-bold text-white tabular-nums">{order.customer.phone}</span>
            </div>
            <div className="flex justify-between text-stone-300">
              <span className="text-stone-400">طريقة الاستلام:</span>
              <span className="font-bold text-white">
                {order.customer.fulfillmentType === 'delivery'
                  ? `توصيل إلى ${order.customer.deliveryZoneName || 'المنزل'}`
                  : 'استلام من المطعم'}
              </span>
            </div>
            {order.customer.address && (
              <div className="flex justify-between text-stone-300">
                <span className="text-stone-400">العنوان:</span>
                <span className="font-bold text-white text-left max-w-[200px] truncate">
                  {order.customer.address}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-stone-800 flex justify-between items-center">
              <span className="font-black text-white text-sm">المبلغ المطلوب كاش:</span>
              <span className="text-lg font-black text-amber-400 tabular-nums">
                {order.total} ج.م
              </span>
            </div>
          </div>

          {/* WhatsApp & Phone Action Buttons */}
          <div className="space-y-2.5">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-700/20 active:scale-98 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>مشاركة ملخص الطلب عبر واتساب المطعم</span>
            </a>

            <a
              href={`tel:${restaurantInfo.phone}`}
              className="w-full flex items-center justify-center gap-2 py-3 bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-white font-bold text-xs rounded-xl border border-stone-700 transition-all"
            >
              <Phone className="w-4 h-4 text-red-500" />
              <span>اتصل بالمطعم للاستفسار ({restaurantInfo.phone})</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
