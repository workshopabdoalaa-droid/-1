import React from 'react';
import { ShoppingBag, FileText, Clock, Bike, CheckCircle2, Star } from 'lucide-react';
import { RestaurantInfo } from '../types';

interface HeroProps {
  restaurantInfo: RestaurantInfo;
  onExploreMenu: () => void;
  onOpenScannedMenu: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  restaurantInfo,
  onExploreMenu,
  onOpenScannedMenu,
}) => {
  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-[#141212] via-[#100e0e] to-[#0f0e0e] pt-8 pb-16 border-b border-stone-800">
      {/* Subtle ambient red/amber glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-900/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column (in RTL: Right Side) - Text Content */}
          <div className="lg:col-span-7 space-y-6 text-right">
            {/* Trust and status kicker */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-stone-300">
              <span className="flex items-center gap-1.5 bg-stone-900/90 text-amber-400 px-3 py-1.5 rounded-lg border border-stone-800">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>تقييم {restaurantInfo.googleRating} من 5 (130 مراجعة على خرائط جوجل)</span>
              </span>
              <span className="flex items-center gap-1.5 bg-stone-900/90 text-stone-300 px-3 py-1.5 rounded-lg border border-stone-800">
                <Clock className="w-3.5 h-3.5 text-red-500" />
                <span>{restaurantInfo.openingHours}</span>
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight text-balance">
              {restaurantInfo.headline || 'الطعم اللي يستاهل التجربة'}
            </h1>

            {/* Subtitle / Description */}
            <p className="text-lg text-stone-300 leading-relaxed max-w-2xl">
              الموقع الرسمي لمطعم <span className="text-amber-400 font-bold">YUM (يم)</span>. نقدم أشهى وجبات الكرسبي الذهبي، البرجر باللحم البلدي الصافي 100%، بيتزا الرانش الإيطالية، وفانكي فرايز بألذ صوصات الشيدر. اطلب الآن واستلم طعامك طازج وساخن مع التوصيل السريع لـ{' '}
              <strong className="text-white">السنطة وأبو الجهور</strong>.
            </p>

            {/* Crucial COD Reassurance & Delivery Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-950/60 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800/40">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-stone-400 font-medium">طريقة الدفع</p>
                  <p className="text-sm font-bold text-white">كاش عند الاستلام فقط</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-950/60 text-red-400 flex items-center justify-center shrink-0 border border-red-800/40">
                  <Bike className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-stone-400 font-medium">مناطق التوصيل</p>
                  <p className="text-sm font-bold text-white">السنطة & أبو الجهور</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-950/60 text-amber-400 flex items-center justify-center shrink-0 border border-amber-800/40">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-stone-400 font-medium">المنيو الرسمية</p>
                  <p className="text-sm font-bold text-white">محدثة ديسمبر 2025</p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onExploreMenu}
                className="flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-base rounded-xl shadow-xl shadow-red-700/30 active:scale-95 transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>اطلب أونلاين الآن</span>
              </button>

              <button
                onClick={onOpenScannedMenu}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-stone-900 hover:bg-stone-800 text-amber-400 hover:text-amber-300 font-bold text-base rounded-xl border border-stone-700 transition-all"
              >
                <FileText className="w-5 h-5" />
                <span>تصفح المنيو المصورة الأصلية</span>
              </button>
            </div>
          </div>

          {/* Right Column (in RTL: Left Side) - Visual Feast Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-stone-700/60 shadow-2xl shadow-black/80 bg-stone-950">
              <img
                src="/src/assets/images/hero_yum_feast_1793990895319.jpg"
                alt="وجبات مطعم يم YUM الشهية"
                className="w-full h-auto object-cover aspect-[4/3] transform hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

              <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between text-right">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">YUM Feast</span>
                  <span className="text-base font-black text-white">سوبر كرسبي · برجر · بيتزا رانش · فرايز</span>
                </div>
                <span className="px-3 py-1 bg-red-600/90 text-white text-xs font-black rounded-lg">
                  طازج يومياً
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
