import React from "react";

export const DiamondIcon = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="50" y="0" width="70.7" height="70.7" transform="rotate(45 50 50)" rx="10" fill="url(#diamond-gradient)" />
    <defs>
      <linearGradient id="diamond-gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#9C6FFF" />
        <stop offset="100%" stopColor="#6F3FFF" />
      </linearGradient>
    </defs>
  </svg>
);

export const BaseGuildIcon = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="2" fill="none" />
    <circle cx="50" cy="50" r="30" stroke="white" strokeWidth="2" fill="none" />
    <circle cx="50" cy="50" r="20" stroke="white" strokeWidth="2" fill="none" />
    <circle cx="50" cy="50" r="10" fill="white" />
  </svg>
);

export const RoundsGrantIcon = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" fill="white" />
    <path d="M35 35 L65 35 L65 65 L35 65 Z" fill="#FF5E5B" stroke="#FF5E5B" strokeWidth="5" />
    <rect x="40" y="40" width="10" height="10" fill="white" />
    <rect x="50" y="50" width="10" height="10" fill="white" />
  </svg>
);

export const VerificationIcon = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" stroke="#4F46E5" strokeWidth="2" fill="none" />
    <circle cx="50" cy="50" r="30" stroke="#6366F1" strokeWidth="2" fill="none" />
    <circle cx="50" cy="50" r="20" stroke="#818CF8" strokeWidth="2" fill="none" />
    <circle cx="50" cy="50" r="10" stroke="#A5B4FC" strokeWidth="2" fill="#4F46E5" />
  </svg>
);

export const BaseLearningIcon = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="50" r="20" fill="#4F46E5" />
    <circle cx="50" cy="50" r="20" fill="#4F46E5" />
    <circle cx="70" cy="50" r="20" fill="#4F46E5" />
    <path d="M30 40 L30 60 L50 50 Z" fill="white" />
    <path d="M50 40 L50 60 L70 50 Z" fill="white" />
    <path d="M70 40 L70 60 L90 50 Z" fill="white" />
  </svg>
);

export const SunIcon = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="white" />
    <path d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
