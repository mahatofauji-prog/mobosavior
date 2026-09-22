import { useState } from 'react';
import { Wrench } from 'lucide-react';

interface LogoProps {
  className?: string;
  logoUrl?: string;
  brandName?: string;
  showText?: boolean;
  isDark?: boolean;
}

export default function Logo({
  className = 'w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-15 lg:h-15',
  logoUrl = '/assets/images/mobo_savior_logo.png',
  brandName = 'MOBO SAVIOR',
  showText = true,
  isDark = false
}: LogoProps) {
  const [imageError, setImageError] = useState(false);
  const activeLogoUrl = logoUrl && logoUrl.trim() !== '' ? logoUrl : '/assets/images/mobo_savior_logo.png';

  // Premium rich RED with a subtle glossy gradient and elegant soft red outer glow
  const moboStyle = {
    background: 'linear-gradient(180deg, #FF4D6D 0%, #E11D48 60%, #BE123C 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 5px rgba(225, 29, 72, 0.25)',
    filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.05))'
  };

  // Elegant soft BLUE with a gentle luminous gradient and soft blue glow
  const saviorStyle = {
    background: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 60%, #0369A1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 5px rgba(2, 132, 199, 0.25)',
    filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.05))'
  };

  // Bright warm GOLD with a metallic-light gradient and elegant subtle gold glow
  const taglineStyle = {
    background: 'linear-gradient(180deg, #FBBF24 0%, #D97706 70%, #B45309 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 4px rgba(217, 119, 6, 0.2)',
    filter: 'drop-shadow(0px 0.5px 0.5px rgba(0,0,0,0.05))'
  };

  return (
    <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 select-none group text-left min-w-0">
      {/* Round Shape Logo Frame (Left Logo Icon) */}
      <div 
        className={`relative flex-shrink-0 ${className} rounded-full overflow-hidden border transition-all duration-300 shadow-sm flex items-center justify-center bg-white ${
          isDark 
            ? 'border-sky-400/40 ring-2 ring-sky-500/20 group-hover:border-sky-300' 
            : 'border-[#0284C7]/30 ring-2 ring-[#0284C7]/10 group-hover:border-[#0284C7] group-hover:ring-[#0284C7]/20'
        }`}
      >
        {!imageError ? (
          <img
            src={activeLogoUrl}
            alt={brandName}
            className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-105"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#E0F2FE] text-[#0284C7] rounded-full">
            <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-[#0284C7]" />
          </div>
        )}
      </div>

      {/* Brand Text Block with "MOBO SAVIOR" and Crisp Tagline */}
      {showText && (
        <div className="flex flex-col text-left leading-none justify-center min-w-0 overflow-hidden">
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap xs:flex-nowrap">
            <span 
              style={moboStyle}
              className="font-black text-xs xs:text-sm sm:text-xl lg:text-2xl tracking-tight font-sans select-none"
            >
              MOBO
            </span>
            <span 
              style={saviorStyle}
              className="font-black text-xs xs:text-sm sm:text-xl lg:text-2xl tracking-tight font-sans select-none"
            >
              SAVIOR
            </span>
          </div>
          
          {/* Tagline directly underneath without any thick dark/metallic box - clean, golden and highly readable */}
          <div className="mt-0.5 xs:mt-1 flex items-center overflow-hidden">
            <span 
              style={taglineStyle}
              className="text-[5.5px] xs:text-[6.5px] sm:text-[9px] font-black tracking-wider uppercase leading-tight truncate w-full block"
            >
              PURULIA KA TRUSTED MOBILE REPAIRING SHOP
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
