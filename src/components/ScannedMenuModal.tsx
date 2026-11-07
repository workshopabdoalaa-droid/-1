import React from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronRight, ChevronLeft, Calendar, ShieldCheck } from 'lucide-react';
import { ScannedMenuSheet } from '../types';

interface ScannedMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheets: ScannedMenuSheet[];
}

export const ScannedMenuModal: React.FC<ScannedMenuModalProps> = ({
  isOpen,
  onClose,
  sheets,
}) => {
  if (!isOpen || sheets.length === 0) return null;

  const [activeIndex, setActiveIndex] = React.useState(0);
  const [zoomLevel, setZoomLevel] = React.useState(1);

  const currentSheet = sheets[activeIndex];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % sheets.length);
    setZoomLevel(1);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + sheets.length) % sheets.length);
    setZoomLevel(1);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/90 backdrop-blur-md flex flex-col justify-between text-right">
      {/* Top Bar */}
      <div className="p-4 bg-[#141212] border-b border-stone-800 flex items-center justify-between gap-4 z-10">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 text-center">
          <h3 className="text-sm sm:text-base font-black text-white truncate">
            {currentSheet.title}
          </h3>
          <div className="flex items-center justify-center gap-3 text-xs text-stone-400 mt-0.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>{currentSheet.date}</span>
            </span>
            <span>·</span>
            {currentSheet.priority === 'primary' ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>المنيو الرسمية الأحدث المعتمدة</span>
              </span>
            ) : (
              <span className="text-stone-400">صورة مرجعية سابقة</span>
            )}
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200"
            title="تصغير"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-stone-300 w-12 text-center tabular-nums">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200"
            title="تكبير"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200"
            title="إعادة ضبط"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Viewer Stage */}
      <div className="relative flex-1 overflow-auto flex items-center justify-center p-4">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          className="absolute right-4 z-10 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-all shadow-lg border border-stone-700"
          title="الصورة السابقة"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Zoomed Image */}
        <div
          className="transition-transform duration-200 origin-center max-w-full max-h-full flex items-center justify-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <img
            src={currentSheet.imageUrl}
            alt={currentSheet.title}
            className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl border border-stone-800"
          />
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="absolute left-4 z-10 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-all shadow-lg border border-stone-700"
          title="الصورة التالية"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Thumbnail Strip */}
      <div className="p-3 bg-[#121010] border-t border-stone-800 flex items-center justify-center gap-2 overflow-x-auto">
        {sheets.map((sheet, idx) => (
          <button
            key={sheet.id}
            onClick={() => {
              setActiveIndex(idx);
              setZoomLevel(1);
            }}
            className={`relative rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
              idx === activeIndex
                ? 'border-amber-500 scale-105'
                : 'border-stone-800 opacity-60 hover:opacity-100'
            }`}
          >
            <img src={sheet.imageUrl} alt={sheet.title} className="w-16 h-12 object-cover" />
            <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] text-white text-center truncate px-1">
              {sheet.date}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
