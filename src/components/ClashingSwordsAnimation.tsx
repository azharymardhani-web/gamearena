import React, { useEffect, useState, useRef } from 'react';
import { soundEngine } from '../utils/soundEngine';

interface ClashingSwordsAnimationProps {
  size?: 'sm' | 'md' | 'lg';
  roundText?: string;
  timeLeft?: number;
  triggerClashHit?: boolean;
  interactiveSound?: boolean;
}

export const ClashingSwordsAnimation: React.FC<ClashingSwordsAnimationProps> = ({
  size = 'md',
  roundText,
  timeLeft,
  triggerClashHit = false,
  interactiveSound = false,
}) => {
  const [clashCount, setClashCount] = useState(0);
  const [isStriking, setIsStriking] = useState(false);
  const lastSoundRef = useRef<number>(0);

  // Play clash sound on periodic strike if interactiveSound is enabled
  useEffect(() => {
    const interval = setInterval(() => {
      setIsStriking(true);
      setClashCount((c) => c + 1);

      if (interactiveSound) {
        const now = Date.now();
        if (now - lastSoundRef.current > 750) {
          lastSoundRef.current = now;
          soundEngine.playSwordClash();
        }
      }

      const timer = setTimeout(() => setIsStriking(false), 280);
      return () => clearTimeout(timer);
    }, 1100);

    return () => clearInterval(interval);
  }, [interactiveSound]);

  // Trigger extra clash strike when triggerClashHit changes
  useEffect(() => {
    if (triggerClashHit) {
      setIsStriking(true);
      setClashCount((c) => c + 1);
      soundEngine.playSwordClash();
      const timer = setTimeout(() => setIsStriking(false), 350);
      return () => clearTimeout(timer);
    }
  }, [triggerClashHit]);

  // Size styling dimensions
  const dims = {
    sm: { width: 120, height: 60, scale: 0.65 },
    md: { width: 180, height: 86, scale: 0.95 },
    lg: { width: 240, height: 110, scale: 1.25 },
  }[size];

  return (
    <div className="relative flex flex-col items-center justify-center select-none overflow-visible">
      {/* Container with dynamic perspective & glowing combat aura */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: `${dims.width}px`, height: `${dims.height}px` }}
      >
        {/* Radial Combat Flash Shockwave on Impact */}
        <div
          className={`absolute rounded-full transition-all duration-300 pointer-events-none ${
            isStriking
              ? 'w-24 h-24 bg-gradient-to-r from-amber-300 via-rose-400 to-amber-200 opacity-90 scale-125 blur-xs'
              : 'w-10 h-10 bg-amber-500/20 opacity-30 scale-90 blur-md'
          }`}
        />

        {/* Dynamic Clashing Spark Particles */}
        {isStriking && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            {/* Spark Rays in 8 cardinal and diagonal directions */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
              <div
                key={`spark-${idx}-${clashCount}`}
                className="absolute w-1 h-3 rounded-full bg-amber-200 animate-ping shadow-[0_0_8px_#fde047]"
                style={{
                  transform: `rotate(${angle}deg) translateY(-${16 + (idx % 3) * 6}px)`,
                  animationDuration: '320ms',
                }}
              />
            ))}
            {/* Golden Starburst Impact Ring */}
            <div className="w-10 h-10 rounded-full border-2 border-yellow-200 animate-ping opacity-90" />
            <div className="w-14 h-14 rounded-full border border-rose-300 animate-ping opacity-75" />
          </div>
        )}

        {/* SVG Clashing Swords (Left Cyan/Azure Saber vs Right Crimson/Gold Broadsword) */}
        <svg
          viewBox="0 0 200 100"
          className="w-full h-full overflow-visible drop-shadow-md"
          aria-hidden="true"
        >
          <defs>
            {/* Left Sword Blade Gradient (Cyber Cyan / Frost Steel) */}
            <linearGradient id="swordBladeLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="45%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            {/* Right Sword Blade Gradient (Fiery Crimson / Magma Steel) */}
            <linearGradient id="swordBladeRight" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="45%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>

            {/* Golden Hilt & Pommel Gradient */}
            <linearGradient id="swordGoldHilt" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            {/* Spark Glow Filter */}
            <filter id="clashGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* LEFT SWORD (Swings down & strikes inward) */}
          <g
            className="transition-transform duration-100 ease-out origin-center"
            style={{
              transform: isStriking
                ? 'rotate(38deg) translate(8px, -4px) scale(1.06)'
                : 'rotate(24deg) translate(-2px, -8px)',
              transformOrigin: '55px 75px',
            }}
          >
            {/* Pommel */}
            <circle cx="28" cy="85" r="4.5" fill="url(#swordGoldHilt)" stroke="#0f172a" strokeWidth="1" />
            {/* Grip / Handle */}
            <rect
              x="26"
              y="68"
              width="4.5"
              height="15"
              rx="1.5"
              fill="#1e293b"
              stroke="#38bdf8"
              strokeWidth="0.8"
            />
            {/* Crossguard */}
            <path
              d="M 16 68 Q 28 66 40 68 Q 28 72 16 68 Z"
              fill="url(#swordGoldHilt)"
              stroke="#0f172a"
              strokeWidth="1"
            />
            {/* Blade */}
            <path
              d="M 26 68 L 26 22 L 28.5 10 L 31 22 L 31 68 Z"
              fill="url(#swordBladeLeft)"
              stroke="#0f172a"
              strokeWidth="1"
              filter="url(#clashGlow)"
            />
            {/* Fuller / Edge Highlight Line */}
            <line x1="28.5" y1="20" x2="28.5" y2="64" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
            {/* Energy Aura trail on strike */}
            {isStriking && (
              <path
                d="M 24 16 Q 16 26 22 45"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.85"
              />
            )}
          </g>

          {/* RIGHT SWORD (Swings down & strikes inward against Left Sword) */}
          <g
            className="transition-transform duration-100 ease-out origin-center"
            style={{
              transform: isStriking
                ? 'rotate(-38deg) translate(-8px, -4px) scale(1.06)'
                : 'rotate(-24deg) translate(2px, -8px)',
              transformOrigin: '145px 75px',
            }}
          >
            {/* Pommel */}
            <circle cx="172" cy="85" r="4.5" fill="url(#swordGoldHilt)" stroke="#0f172a" strokeWidth="1" />
            {/* Grip / Handle */}
            <rect
              x="169.5"
              y="68"
              width="4.5"
              height="15"
              rx="1.5"
              fill="#1e293b"
              stroke="#f43f5e"
              strokeWidth="0.8"
            />
            {/* Crossguard */}
            <path
              d="M 160 68 Q 172 66 184 68 Q 172 72 160 68 Z"
              fill="url(#swordGoldHilt)"
              stroke="#0f172a"
              strokeWidth="1"
            />
            {/* Blade */}
            <path
              d="M 169 68 L 169 22 L 171.5 10 L 174 22 L 174 68 Z"
              fill="url(#swordBladeRight)"
              stroke="#0f172a"
              strokeWidth="1"
              filter="url(#clashGlow)"
            />
            {/* Fuller / Edge Highlight Line */}
            <line x1="171.5" y1="20" x2="171.5" y2="64" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
            {/* Energy Aura trail on strike */}
            {isStriking && (
              <path
                d="M 176 16 Q 184 26 178 45"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.85"
              />
            )}
          </g>

          {/* Collision Flash Star at the crossing point (center: x=100, y=42) */}
          {isStriking ? (
            <g transform="translate(100, 42)">
              {/* Central Diamond Clash Spark */}
              <polygon
                points="0,-16 4,-4 16,0 4,4 0,16 -4,4 -16,0 -4,-4"
                fill="#ffffff"
                stroke="#fbbf24"
                strokeWidth="1.5"
                filter="url(#clashGlow)"
              />
              <circle cx="0" cy="0" r="5" fill="#fef08a" />
            </g>
          ) : (
            <g transform="translate(100, 42)">
              <circle cx="0" cy="0" r="3.5" fill="#fbbf24" opacity="0.65" />
            </g>
          )}
        </svg>
      </div>

      {/* Dual Badges: Round / Timer Status Under Clashing Swords */}
      {roundText && (
        <div className="mt-1 flex items-center gap-1.5 z-10">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-rose-500/80 text-amber-300 font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            <span>{roundText}</span>
            {timeLeft !== undefined && (
              <span className="text-white ml-0.5">({timeLeft}s)</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};
