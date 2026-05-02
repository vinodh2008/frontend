import React from 'react';

const Logo = ({ settings, size = 'medium', dark = false }) => {
  // If admin uploaded a logo, use it
  if (settings?.logoUrl) {
    const sizeClasses = {
      small: 'h-8',
      medium: 'h-12',
      large: 'h-24'
    };
    return (
      <img 
        src={settings.logoUrl} 
        alt="Kakinada Rajesh Fashion Store" 
        className={`${sizeClasses[size]} object-contain`} 
      />
    );
  }

  // Otherwise, use the styled text logo
  const wrapperClasses = `
    inline-flex flex-col items-center justify-center 
    rounded-lg border-2 
    ${dark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}
  `;

  const sizeStyles = {
    small: { padding: 'px-2 py-1', krf: 'text-xl', subtitle: 'text-[8px]' },
    medium: { padding: 'px-4 py-2', krf: 'text-3xl', subtitle: 'text-[10px]' },
    large: { padding: 'px-8 py-4', krf: 'text-6xl', subtitle: 'text-sm' }
  };

  const currentSize = sizeStyles[size] || sizeStyles.medium;

  return (
    <div className={`${wrapperClasses} ${currentSize.padding}`}>
      <div className={`font-black tracking-tighter leading-none ${currentSize.krf}`}>
        <span className="text-secondary">K</span>
        <span className={dark ? 'text-white' : 'text-slate-900'}>R</span>
        <span className="text-secondary">F</span>
      </div>
      <div className={`font-light tracking-widest uppercase mt-1 ${dark ? 'text-slate-400' : 'text-slate-500'} ${currentSize.subtitle}`}>
        Rajesh Fashion
      </div>
    </div>
  );
};

export default Logo;
