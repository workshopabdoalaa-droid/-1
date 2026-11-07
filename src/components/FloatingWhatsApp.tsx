import React from 'react';
import { MessageSquare } from 'lucide-react';

interface FloatingWhatsAppProps {
  whatsappNumber: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ whatsappNumber }) => {
  const cleanNumber = whatsappNumber.replace(/\D/g, '');
  const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
    'مرحباً مطعم يَم (YUM)، أود الاستفسار عن الطلبات والمنيو.'
  )}`;

  return (
    <aside aria-label="WhatsApp Support" className="fixed bottom-6 right-6 z-40">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl shadow-emerald-950/60 transition-all duration-300 hover:scale-105 active:scale-95"
        title="تواصل معنا عبر واتساب"
      >
        <span className="w-5 h-5 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 fill-white text-emerald-600" />
        </span>
        <span className="text-xs font-black hidden sm:inline whitespace-nowrap">
          تواصل واتساب
        </span>
      </a>
    </aside>
  );
};
