import React, { useState } from 'react';
import { Sparkles, ArrowRightLeft } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  title?: string;
  className?: string;
  lightTheme?: boolean;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  title,
  className = '',
  lightTheme = false
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [activeMode, setActiveMode] = useState<'slider' | 'before' | 'after'>('slider');

  const handleMove = (clientX: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging && activeMode !== 'slider') return;
    const rect = e.currentTarget.getBoundingClientRect();
    handleMove(e.touches[0].clientX, rect);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging && activeMode !== 'slider') return;
    const rect = e.currentTarget.getBoundingClientRect();
    handleMove(e.clientX, rect);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Mode Controls */}
      <div className={`flex items-center justify-between gap-2 p-1 rounded-xl text-[10px] font-bold ${
        lightTheme 
          ? 'bg-blue-50/80 text-slate-700 border border-blue-100/60' 
          : 'bg-slate-900/90 text-white'
      }`}>
        <span className={`flex items-center gap-1 px-2 truncate ${lightTheme ? 'text-slate-600' : 'text-slate-300'}`}>
          <Sparkles className="w-3 h-3 text-[#0284C7]" />
          Before & After Lab Compare
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setActiveMode('slider')}
            className={`px-2 py-0.5 rounded-lg transition-all ${
              activeMode === 'slider'
                ? 'bg-[#0284C7] text-white shadow-sm'
                : lightTheme 
                  ? 'text-slate-400 hover:text-slate-700' 
                  : 'text-slate-400 hover:text-white'
            }`}
          >
            Interactive
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('before')}
            className={`px-2 py-0.5 rounded-lg transition-all ${
              activeMode === 'before'
                ? 'bg-rose-600 text-white shadow-sm'
                : lightTheme 
                  ? 'text-slate-400 hover:text-slate-700' 
                  : 'text-slate-400 hover:text-white'
            }`}
          >
            Before
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('after')}
            className={`px-2 py-0.5 rounded-lg transition-all ${
              activeMode === 'after'
                ? 'bg-emerald-600 text-white shadow-sm'
                : lightTheme 
                  ? 'text-slate-400 hover:text-slate-700' 
                  : 'text-slate-400 hover:text-white'
            }`}
          >
            After
          </button>
        </div>
      </div>

      {/* Comparison Frame */}
      <div
        className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden select-none cursor-ew-resize group border ${
          lightTheme 
            ? 'bg-slate-50 border-blue-100/60' 
            : 'bg-slate-950 border-slate-800'
        }`}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
      >
        {activeMode === 'before' ? (
          <div className="w-full h-full relative">
            <img
              src={beforeImage}
              alt={title ? `${title} Before` : 'Before Repair'}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-rose-600 text-white font-black text-[9px] uppercase tracking-wider rounded-lg shadow-md">
              BEFORE REPAIR (Damaged)
            </span>
          </div>
        ) : activeMode === 'after' ? (
          <div className="w-full h-full relative">
            <img
              src={afterImage}
              alt={title ? `${title} After` : 'After Repair'}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider rounded-lg shadow-md">
              AFTER REPAIR (Restored)
            </span>
          </div>
        ) : (
          <>
            {/* After Image (Background layer) */}
            <img
              src={afterImage}
              alt={title ? `${title} After` : 'After Repair'}
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-600/90 backdrop-blur-sm text-white font-black text-[9px] uppercase tracking-wider rounded-lg shadow-md z-10">
              AFTER
            </span>

            {/* Before Image (Clipped overlay layer) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={beforeImage}
                alt={title ? `${title} Before` : 'Before Repair'}
                className="absolute top-0 left-0 h-full object-cover max-w-none"
                style={{ width: '100%', height: '100%' }}
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-3 left-3 px-2 py-0.5 bg-rose-600/90 backdrop-blur-sm text-white font-black text-[9px] uppercase tracking-wider rounded-lg shadow-md z-10 whitespace-nowrap">
                BEFORE
              </span>
            </div>

            {/* Divider Line & Drag Handle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)] z-20 flex items-center justify-center pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center border-2 border-[#0284C7] transform -translate-x-1/2 group-hover:scale-110 transition-transform">
                <ArrowRightLeft className="w-4 h-4 text-[#0284C7]" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
