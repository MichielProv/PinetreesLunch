/* components/Loaders.tsx */
import React from "react";

type Props = {
  size?: number;
  className?: string;
  label?: string;
};

/* 1) Cloche (serving dome) wobble + steam */
export const ClocheLoader: React.FC<Props> = ({ size = 64, className = "", label = "Loading" }) => {
  return (
    <div className={`inline-flex flex-col items-center ${className}`} role="status" aria-label={label} aria-live="polite">
      <svg width={size} height={size} viewBox="0 0 64 64" className="block" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="32" cy="54" rx="18" ry="4" fill="currentColor" opacity="0.15" className="hl-shadow" />
        <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7">
          <path d="M22 18 C20 14, 24 12, 22 8" className="hl-steam hl-steam-1" />
          <path d="M32 18 C30 14, 34 12, 32 8" className="hl-steam hl-steam-2" />
          <path d="M42 18 C40 14, 44 12, 42 8" className="hl-steam hl-steam-3" />
        </g>
        <g className="hl-wobble" transform="translate(0,0)">
          <path d="M10 38 a22 22 0 0 1 44 0" fill="currentColor" opacity="0.10"/>
          <path d="M12 38 a20 20 0 0 1 40 0" fill="currentColor" opacity="0.20"/>
          <path d="M14 38 a18 18 0 0 1 36 0" fill="currentColor" opacity="0.25"/>
          <path d="M16 38 a16 16 0 0 1 32 0" fill="currentColor" opacity="0.30"/>
          <path d="M18 38 a14 14 0 0 1 28 0" fill="currentColor" opacity="0.35"/>
          <circle cx="32" cy="18" r="3" fill="currentColor" />
          <rect x="10" y="38" width="44" height="4" rx="2" fill="currentColor"/>
        </g>
      </svg>
      <style jsx>{`
        @keyframes hl-wobble-kf {
          0%   { transform: translateY(0) rotate(0deg); }
          25%  { transform: translateY(-1px) rotate(-1.2deg); }
          50%  { transform: translateY(0) rotate(0.8deg); }
          75%  { transform: translateY(-0.5px) rotate(-0.6deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        @keyframes hl-shadow-kf {
          0%, 100% { transform: scaleX(1); opacity: 0.15; }
          50%      { transform: scaleX(0.92); opacity: 0.10; }
        }
        @keyframes hl-steam-kf {
          0%   { transform: translateY(6px); opacity: 0.0; }
          20%  { opacity: 0.5; }
          70%  { opacity: 0.7; }
          100% { transform: translateY(-6px); opacity: 0.0; }
        }
        .hl-wobble { transform-origin: 32px 38px; animation: hl-wobble-kf 1.2s ease-in-out infinite; }
        .hl-shadow { transform-origin: 32px 54px; animation: hl-shadow-kf 1.2s ease-in-out infinite; }
        .hl-steam { animation: hl-steam-kf 1.6s ease-in-out infinite; }
        .hl-steam-1 { animation-delay: 0s; }
        .hl-steam-2 { animation-delay: 0.25s; }
        .hl-steam-3 { animation-delay: 0.5s; }
        @media (prefers-reduced-motion: reduce) {
          .hl-wobble, .hl-shadow, .hl-steam { animation: none !important; }
        }
      `}</style>
    </div>
  );
};

/* 2) Mug with rising steam */
export const MugSteamLoader: React.FC<Props> = ({ size = 64, className = "", label = "Brewing…" }) => {
  return (
    <div className={`inline-flex flex-col items-center ${className}`} role="status" aria-label={label}>
      <svg width={size} height={size} viewBox="0 0 64 64" className="block" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="28" cy="54" rx="14" ry="4" fill="currentColor" opacity="0.12" className="ms-shadow" />
        <rect x="14" y="22" width="28" height="24" rx="5" fill="currentColor" opacity="0.2"/>
        <rect x="16" y="24" width="24" height="20" rx="4" fill="currentColor" opacity="0.35"/>
        <path d="M42 28 a7 7 0 1 1 0 12" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.8"/>
        <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M24 18 C22 14, 26 12, 24 8" className="ms-steam ms-s1"/>
          <path d="M30 18 C28 14, 32 12, 30 8" className="ms-steam ms-s2"/>
          <path d="M36 18 C34 14, 38 12, 36 8" className="ms-steam ms-s3"/>
        </g>
      </svg>
      <style jsx>{`
        @keyframes ms-steam-kf {
          0%   { transform: translateY(6px); opacity: 0.0; }
          20%  { opacity: 0.5; }
          70%  { opacity: 0.75; }
          100% { transform: translateY(-6px); opacity: 0.0; }
        }
        @keyframes ms-shadow-kf {
          0%,100% { transform: scaleX(1); opacity: 0.12; }
          50%     { transform: scaleX(0.9); opacity: 0.08; }
        }
        .ms-steam { animation: ms-steam-kf 1.4s ease-in-out infinite; }
        .ms-s1 { animation-delay: 0s; }
        .ms-s2 { animation-delay: 0.2s; }
        .ms-s3 { animation-delay: 0.4s; }
        .ms-shadow { animation: ms-shadow-kf 1.4s ease-in-out infinite; transform-origin: 28px 54px; }
        @media (prefers-reduced-motion: reduce) {
          .ms-steam, .ms-shadow { animation: none !important; }
        }
      `}</style>
    </div>
  );
};

/* 3) Cutlery pulse (fork + knife, subtle heartbeat) */
export const CutleryPulseLoader: React.FC<Props> = ({ size = 64, className = "", label = "Preparing…" }) => {
  return (
    <div className={`inline-flex flex-col items-center ${className}`} role="status" aria-label={label}>
      <svg width={size} height={size} viewBox="0 0 64 64" className="block" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="3" strokeDasharray="6 8" opacity="0.4" className="cp-ring"/>
        <g className="cp-pulse" transform="translate(0,0)" fill="currentColor">
          <rect x="20" y="14" width="4" height="20" rx="2"/>
          <rect x="26" y="14" width="4" height="20" rx="2"/>
          <rect x="32" y="14" width="4" height="20" rx="2"/>
          <rect x="26" y="34" width="4" height="16" rx="2"/>
        </g>
        <g className="cp-pulse cp-delay" fill="currentColor">
          <rect x="40" y="16" width="4" height="28" rx="2"/>
          <path d="M44 16 C52 24, 52 30, 44 32 Z" fill="currentColor" opacity="0.85"/>
        </g>
      </svg>
      <style jsx>{`
        @keyframes cp-rotate-kf { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes cp-pulse-kf { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.85; } }
        .cp-ring { transform-origin: 32px 32px; animation: cp-rotate-kf 1.2s linear infinite; }
        .cp-pulse { animation: cp-pulse-kf 1.1s ease-in-out infinite; }
        .cp-delay { animation-delay: 0.2s; }
        @media (prefers-reduced-motion: reduce) {
          .cp-ring, .cp-pulse { animation: none !important; }
        }
      `}</style>
    </div>
  );
};

/* 4) Plate spinner (dashed rim spins, subtle inner plate) */
export const PlateSpinLoader: React.FC<Props> = ({ size = 64, className = "", label = "Plating…" }) => {
  return (
    <div className={`inline-flex flex-col items-center ${className}`} role="status" aria-label={label}>
      <svg width={size} height={size} viewBox="0 0 64 64" className="block" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="3" opacity="0.15"/>
        <circle cx="32" cy="32" r="18" stroke="currentColor" strokeWidth="2" opacity="0.15"/>
        <circle cx="32" cy="32" r="21" stroke="currentColor" strokeWidth="3" strokeDasharray="5 10" className="ps-spin"/>
        <circle cx="32" cy="32" r="2" fill="currentColor" opacity="0.8"/>
      </svg>
      <style jsx>{`
        @keyframes ps-spin-kf { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .ps-spin { transform-origin: 32px 32px; animation: ps-spin-kf 1s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .ps-spin { animation: none !important; }
        }
      `}</style>
    </div>
  );
};

export default ClocheLoader;
