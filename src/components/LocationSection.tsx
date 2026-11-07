import React from 'react';
import { MapPin, Phone, MessageSquare, Clock, Star, ExternalLink, Navigation, CheckCircle } from 'lucide-react';
import { RestaurantInfo } from '../types';

interface LocationSectionProps {
  restaurantInfo: RestaurantInfo;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ restaurantInfo }) => {
  const cleanWhatsappNumber = restaurantInfo.whatsapp.replace(/\D/g, '');

  return (
    <section id="location" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-right">
      <div className="bg-[#141212] border border-stone-800 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Info Details */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block mb-1">
                موقع وفروع مطعم يم
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                تفضل بزيارتنا أو اطلب أونلاين
              </h2>
              <p className="text-stone-300 text-sm mt-2 leading-relaxed">
                يسعدنا استقبالكم في صالة المطعم العائلية أو تجهيز طلبكم للتيك أواي والتوصيل المنزلي السريع لكافة مناطق السنطة وأبو الجهور.
              </p>
            </div>

            {/* Key Information Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Address */}
              <div className="p-4 bg-stone-900/80 rounded-2xl border border-stone-800 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-red-500">
                  <MapPin className="w-4 h-4" />
                  <span>عنوان المطعم</span>
                </div>
                <p className="text-sm font-bold text-white">{restaurantInfo.addressShort}</p>
                <p className="text-xs text-stone-400">{restaurantInfo.address}</p>
              </div>

              {/* Working Hours */}
              <div className="p-4 bg-stone-900/80 rounded-2xl border border-stone-800 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
                  <Clock className="w-4 h-4" />
                  <span>مواعيد العمل الرسمية</span>
                </div>
                <p className="text-sm font-bold text-white">{restaurantInfo.openingHours}</p>
                <p className="text-xs text-emerald-400 font-medium">مستعدون لخدمتكم طوال أيام الأسبوع</p>
              </div>

              {/* Phone */}
              <div className="p-4 bg-stone-900/80 rounded-2xl border border-stone-800 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                  <Phone className="w-4 h-4" />
                  <span>الهاتف والطلبات السريعة</span>
                </div>
                <p className="text-base font-black text-white tabular-nums tracking-wider" dir="ltr">
                  {restaurantInfo.phone}
                </p>
                <p className="text-xs text-stone-400">متاح للمكالمات والرد الفوري</p>
              </div>

              {/* Rating */}
              <div className="p-4 bg-stone-900/80 rounded-2xl border border-stone-800 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>تقييم العملاء على جوجل</span>
                </div>
                <p className="text-sm font-black text-white">
                  {restaurantInfo.googleRating} من 5 نجوم
                </p>
                <p className="text-xs text-stone-400">
                  بناءً على {restaurantInfo.reviewsCount} تقييم حقيقي على خرائط جوجل
                </p>
              </div>
            </div>

            {/* Services badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-300 font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>تناول الطعام داخل الصالة</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-300 font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>استلام تيك أواي من المطعم</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-300 font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>توصيل دليفري (السنطة وأبو الجهور)</span>
              </span>
            </div>

            {/* Direct Action Links */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={restaurantInfo.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-red-700/20 transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>فتح الموقع على خرائط جوجل</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              <a
                href={`https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(
                  'مرحباً مطعم يم، أود الاستفسار عن المنيو أو التوصيل.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>محادثة واتساب</span>
              </a>

              <a
                href={`tel:${restaurantInfo.phone}`}
                className="flex items-center gap-2 px-5 py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-bold text-xs rounded-xl border border-stone-700 transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>اتصال هاتفي</span>
              </a>
            </div>
          </div>

          {/* Map Preview Graphic */}
          <div className="lg:col-span-5 h-full min-h-[300px]">
            <div className="w-full h-full rounded-2xl overflow-hidden border border-stone-800 bg-stone-900 relative flex flex-col justify-between p-6">
              <div className="space-y-2">
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 font-bold text-xs rounded-lg inline-block border border-amber-500/30">
                  فرع السنطة - أبو الجهور
                </span>
                <h3 className="text-xl font-black text-white">YUM Fast Food Restaurant</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  بجوار طلعت الشاذلي، فوزي عبد القادر، أبو الجهور، السنطة، محافظة الغربية.
                </p>
              </div>

              {/* Interactive Map Visual Link */}
              <div className="my-6 p-4 rounded-xl bg-stone-950/80 border border-stone-800 text-center space-y-3">
                <MapPin className="w-10 h-10 text-red-500 mx-auto animate-bounce" />
                <div>
                  <p className="text-xs font-bold text-white">إحداثيات وموقع المطعم المعتمد</p>
                  <p className="text-[11px] text-stone-400">P4G8+VFW El Santa, Gharbia</p>
                </div>
                <a
                  href={restaurantInfo.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black rounded-lg transition-colors"
                >
                  <span>عرض الخريطة والاتجاهات المباشرة</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="text-[11px] text-stone-400 text-center">
                فروع أخرى مذكورة بالمنيو: زفتى وميت غمر
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
