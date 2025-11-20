import React, { useState } from 'react';

interface PrivacyMaskProps {
  children: React.ReactNode;
  enabled: boolean;
  className?: string;
  placeholderType?: 'text' | 'block' | 'mini';
}

export const PrivacyMask: React.FC<PrivacyMaskProps> = ({ 
  children, 
  enabled, 
  className = '',
  placeholderType = 'text'
}) => {
  const [isPeeking, setIsPeeking] = useState(false);

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  const handleStartPeek = () => setIsPeeking(true);
  const handleEndPeek = () => setIsPeeking(false);

  return (
    <div
      className={`relative cursor-pointer select-none group transition-all duration-300 ${className}`}
      onMouseDown={handleStartPeek}
      onMouseUp={handleEndPeek}
      onMouseLeave={handleEndPeek}
      onTouchStart={handleStartPeek}
      onTouchEnd={handleEndPeek}
    >
      {/* 
         Always render the children with opacity transition. 
         If masked (!isPeeking), opacity is 0 but it still takes up space in the DOM.
      */}
      <div 
        className={`transition-opacity duration-200 ease-in-out ${isPeeking ? 'opacity-100 blur-none' : 'opacity-0'}`}
      >
        {children}
      </div>

      {/* The Mask Overlay */}
      {!isPeeking && (
        <div className="absolute inset-0 flex items-center z-10 pointer-events-none">
          <div className={`w-full flex items-center ${placeholderType === 'text' ? 'justify-start' : 'justify-center'} animate-in fade-in duration-300`}>
             <span className={`font-mono font-black text-slate-300 tracking-widest ${placeholderType === 'mini' ? 'text-sm' : 'text-2xl'}`}>
                ■■■■■
             </span>
          </div>
        </div>
      )}
    </div>
  );
};