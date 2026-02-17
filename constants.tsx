
import React from 'react';

export const PIX_COLOR = '#32BCAD';
export const FIXED_FEE = 4.00;

export const Logo: React.FC<{ size?: number; showText?: boolean; variant?: 'horizontal' | 'icon' }> = ({ size = 32, showText = true, variant = 'horizontal' }) => (
  <div className="flex items-center gap-3">
    <div 
      className="flex items-center justify-center bg-[#32BCAD] rounded-[18px] shadow-lg shadow-pix/20 transform hover:scale-105 transition-transform cursor-pointer" 
      style={{ width: size * 1.4, height: size * 1.4 }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Modern Minimalist Duck Head */}
        <path d="M75 55C75 66.0457 66.0457 75 55 75C43.9543 75 35 66.0457 35 55C35 43.9543 43.9543 35 55 35C66.0457 35 75 43.9543 75 55Z" fill="white" />
        <path d="M25 45C25 45 35 40 45 40L55 45" stroke="white" strokeWidth="8" strokeLinecap="round" />
        <circle cx="62" cy="50" r="4" fill="#32BCAD" />
        <path d="M20 50C20 50 30 55 40 55" stroke="white" strokeWidth="8" strokeLinecap="round" />
      </svg>
    </div>
    {showText && variant === 'horizontal' && (
      <span className="text-2xl font-[900] tracking-tighter text-gray-900 leading-none">
        Pato<span className="text-pix">pay</span>
      </span>
    )}
  </div>
);
