import React from 'react';
import { Phone, MessageSquare, MapPin, Clock, ShieldCheck, Heart } from 'lucide-react';
import { RestaurantInfo } from '../types';

interface FooterProps {
  restaurantInfo: RestaurantInfo;
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
  onOpenScannedMenu: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  restaurantInfo,
  onNavigate,
  onOpenAdmin,
  onOpenScannedMenu,
}) => {
  const cleanWhatsappNumber = restaurantInfo.whatsapp.replace(/\D/g, '');

  return (
    <footer className="bg-[#0c0a0a] border-t border-stone-800 text-right text-stone-400 text-xs">
      {/* Top Banner in Footer */}
      <div className="border-b border-stone-800/80 bg-[#100e0e] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-right space-y-1">
            <h3 className="text-xl font-black text-white flex items-center gap-2 justify-center md:justify-start">
              <span>مطعم يم (YUM) - الطعم اللي يستاهل التجربة</span>
            </h3>
            <p className="text-xs text-stone-400">
              أشهى وجبات الكرسبي، البرجر البلدي، والبيتزا الإيطالية بالسنطة وأبو الجهور.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`tel:${restaurantInfo.phone}`}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-md transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>اتصل الآن: {restaurantInfo.phone}</span>
            </a>

            <a
              href={`https://wa.me/${cleanWhatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>واتساب: {restaurantInfo.whatsapp}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: About */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 text-white font-black text-sm flex items-center justify-center">
                YUM
              </div>
              <span className="text-base font-black text-white">مطعم يَم</span>
            </div>
            <p className="text-xs leading-relaxed text-stone-400">
              مطعم سريع متكامل يقدم وجبات الدجاج الكرسبي المقرمشة، البرجر المصنوع من اللحم البلدي الصافي 100%، وتشكيلة البيتزا الإيطالية بأفضل المكونات.
            </p>
            <div className="pt-2 text-[11px] text-amber-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>الدفع كاش عند الاستلام لجميع الطلبات</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">روابط سريعة</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('hero')}
                  className="hover:text-amber-400 transition-colors"
                >
                  الرئيسية
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('menu')}
                  className="hover:text-amber-400 transition-colors"
                >
                  قائمة الطعام (المنيو)
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenScannedMenu}
                  className="hover:text-amber-400 transition-colors text-amber-400/90 font-medium"
                >
                  المنيو الورقية الأصلية
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('location')}
                  className="hover:text-amber-400 transition-colors"
                >
                  موقع المطعم على الخريطة
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-red-400 transition-colors font-bold text-stone-300"
                >
                  لوحة تحكم صاحب المطعم
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Delivery & Branches */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">مناطق التوصيل والفروع</h4>
            <div className="space-y-2 text-xs">
              <p className="text-white font-bold">فرع السنطة وأبو الجهور (الرئيسي):</p>
              <p className="text-stone-400">
                P4G8+VFW, فوزي عبد القادر، أبو الجهور، السنطة (بجوار طلعت الشاذلي).
              </p>
              <p className="text-emerald-400 font-medium">
                توصيل سريع مخصص للسنطة وقرية أبو الجهور.
              </p>
              <p className="text-[11px] text-stone-400 pt-1">
                فروع أخرى: زفتى (عمارات السكة الحديد) · ميت غمر (بجوار مجلس المدينة).
              </p>
            </div>
          </div>

          {/* Col 4: Working Hours */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">مواعيد العمل والتواصل</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-stone-300">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>{restaurantInfo.openingHours}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-300">
                <Phone className="w-4 h-4 text-sky-400" />
                <span dir="ltr">{restaurantInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-300">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span dir="ltr">{restaurantInfo.whatsapp}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 mt-8 border-t border-stone-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right text-[11px] text-stone-400">
          <p>© {new Date().getFullYear()} مطعم YUM الرسمي. جميع الحقوق محفوظة.</p>
          <p className="flex items-center gap-1 justify-center">
            <span>صُنع بعناية وجودة عالية لمطعم YUM</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
