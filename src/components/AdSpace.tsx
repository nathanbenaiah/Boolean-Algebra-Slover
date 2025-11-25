import React from 'react';

interface AdSpaceProps {
  size?: 'banner' | 'skyscraper' | 'rectangle' | 'leaderboard';
  position?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}

/**
 * Ad Space Component
 * Placeholder for advertisements with standard sizes
 * 
 * Sizes:
 * - banner: 728x90 (leaderboard)
 * - skyscraper: 160x600 (vertical)
 * - rectangle: 300x250 (medium rectangle)
 * - leaderboard: 728x90
 */
const AdSpace: React.FC<AdSpaceProps> = ({ 
  size = 'rectangle', 
  position = 'left',
  className = '' 
}) => {
  const sizeClasses = {
    banner: 'w-full h-[90px]',
    skyscraper: 'w-full max-w-[160px] xl:max-w-[200px] h-[600px]',
    rectangle: 'w-full max-w-[300px] h-[250px]',
    leaderboard: 'w-full h-[90px]'
  };

  const getAdDimensions = () => {
    switch (size) {
      case 'banner':
      case 'leaderboard':
        return '728 × 90';
      case 'skyscraper':
        return '160 × 600';
      case 'rectangle':
        return '300 × 250';
      default:
        return '300 × 250';
    }
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        bg-gradient-to-br from-gray-50 to-gray-100
        border-2 
        border-dashed 
        border-gray-300 
        rounded-lg 
        flex 
        items-center 
        justify-center
        transition-all 
        duration-300
        hover:border-blue-300
        hover:bg-gradient-to-br hover:from-blue-50 hover:to-gray-50
        shadow-sm
        hover:shadow-md
        ${className}
      `}
      style={{
        minHeight: size === 'skyscraper' ? '600px' : undefined,
        minWidth: size === 'skyscraper' ? '160px' : undefined
      }}
    >
      <div className="text-center p-4">
        <div className="text-gray-400 text-xs font-medium mb-1">
          Advertisement
        </div>
        <div className="text-gray-300 text-xs">
          {getAdDimensions()}
        </div>
        <div className="text-gray-400 text-[10px] mt-2">
          {position.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default AdSpace;

