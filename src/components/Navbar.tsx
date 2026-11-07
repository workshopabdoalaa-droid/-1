import React from 'react';
import { ShoppingBag, Phone, MapPin, Shield, Menu as MenuIcon, X } from 'lucide-react';
import { RestaurantInfo } from '../types';

interface NavbarProps {
  restaurantInfo: RestaurantInfo;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onOpenScannedMenu: () => void;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  restaurantInfo,
  cartCount,
  onOpenCart,
  onOpenAdmin,
  onOpenScannedMenu,
  activeSection,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { id: 'hero', label: 'الرئيسية' },
    { id: 'menu', label: 'قائمة الطعام' },
    { id: 'offers', label: 'العروض' },
    { id: 'location', label: 'موقع المطعم' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#121010]/95 backdrop-blur-md border-b border-[#2a2421]">
      {/* Slim Top Announcement */}
      {restaurantInfo.announcement && (
        <div className="bg-gradient-to-r from-red-900 via-amber-700 to-red-900 text-amber-100 text-xs py-1.5 px-4 text-center font-medium border-b border-red-800/40">
          <span>{restaurantInfo.announcement}</span>
        </div>
      )}

      {/* Main Top Bar Contract: Zone 1 (Brand) - Zone 2 (Nav Links) - Zone 3 (CTA & Cart) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onNavigate('hero')}
          className="flex items-center gap-3 text-right group shrink-0 focus-visible:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center font-black text-white text-xl tracking-tighter shadow-md shadow-red-900/30 group-hover:scale-105 transition-transform">
            YUM
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              مطعم يَم <span className="text-amber-500 text-xs font-bold uppercase tracking-wider">YUM</span>
            </span>
            <span className="text-[11px] text-stone-400 font-medium">السنطة · أبو الجهور</span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-stone-300">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeSection === link.id ? 'text-amber-400 font-bold border-b-2 border-amber-500' : ''
              }`}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={onOpenScannedMenu}
            className="text-stone-300 hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            المنيو الورقية الأصلية
          </button>
        </nav>

        {/* Zone 3: Actions (Cart & Admin) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Admin shortcut */}
          <button
            onClick={onOpenAdmin}
            title="لوحة تحكم صاحب المطعم"
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800/60 rounded-lg transition-colors border border-stone-800"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-700/25 active:scale-95 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">السلة</span>
            {cartCount > 0 && (
              <span className="bg-amber-400 text-black text-xs font-black px-2 py-0.5 rounded-full tabular-nums">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-800 bg-[#141212] px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className="block w-full text-right px-3 py-2 text-sm font-bold text-stone-200 hover:bg-stone-800 rounded-lg"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => {
              onOpenScannedMenu();
              setMobileMenuOpen(false);
            }}
            className="block w-full text-right px-3 py-2 text-sm font-bold text-amber-400 hover:bg-stone-800 rounded-lg"
          >
            📄 تصفح المنيو الورقية الأصلية
          </button>
          <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
            <span>السنطة: 01061119339</span>
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="text-amber-500 underline"
            >
              لوحة التحكم
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
