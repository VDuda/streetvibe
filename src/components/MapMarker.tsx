'use client';

interface MapMarkerProps {
  color?: string;
  size?: number;
  isSelected?: boolean;
}

export function MapMarker({ color = 'red', size = 16, isSelected = false }: MapMarkerProps) {
  return (
    <div className="relative">
      <div
        className={`rounded-full border-2 border-white transition-all duration-200 hover:scale-110 ${
          isSelected ? 'animate-pulse' : ''
        }`}
        style={{ 
          backgroundColor: color, 
          boxShadow: isSelected 
            ? '0 0 0 3px rgba(59, 130, 246, 0.5), 0 0 0 1px rgba(0,0,0,0.5)' 
            : '0 0 0 1px rgba(0,0,0,0.5)',
          width: `${size}px`,
          height: `${size}px`
        }}
      />
      {isSelected && (
        <div
          className="absolute inset-0 rounded-full border-2 border-blue-500 animate-ping"
          style={{
            width: `${size + 8}px`,
            height: `${size + 8}px`,
            left: '-4px',
            top: '-4px'
          }}
        />
      )}
    </div>
  );
}
