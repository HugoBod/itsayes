import React from 'react';

const MICRO_HEART_PATTERN = [
  [0,1,0,1,0],
  [1,1,1,1,1],
  [1,1,1,1,1],
  [0,1,1,1,0],
  [0,0,1,0,0],
];

export const PixelHeartMicro: React.FC<{className?: string, color?: string}> = ({ className = '', color = 'bg-black' }) => {
  return (
    <div 
      className={`inline-grid gap-px ${className}`}
      style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}
    >
      {MICRO_HEART_PATTERN.flat().map((pixel, index) => (
        <div
          key={index}
          className={`
            w-1 h-1 
            ${pixel === 1 ? color : 'bg-transparent'}
          `}
        />
      ))}
    </div>
  );
};