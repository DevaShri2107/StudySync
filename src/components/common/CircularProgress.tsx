import React from 'react';

interface CircularProgressProps {
  value: number; // 0 to 100
  size?: number; // width/height in px
  strokeWidth?: number;
  showLabel?: boolean;
  sublabel?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 120,
  strokeWidth = 10,
  showLabel = true,
  sublabel
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  // Determine color based on prompt rules: Green > 75%, Yellow 60–75%, Red < 60%
  let strokeColor = '#22c55e'; // Green
  let textColor = 'text-green-600 dark:text-green-400';
  let badgeBg = 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';

  if (clampedValue < 60) {
    strokeColor = '#ef4444'; // Red
    textColor = 'text-red-600 dark:text-red-400';
    badgeBg = 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
  } else if (clampedValue <= 75) {
    strokeColor = '#eab308'; // Yellow
    textColor = 'text-amber-600 dark:text-amber-400';
    badgeBg = 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-200 dark:text-slate-700"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.3s' }}
          />
        </svg>
        {showLabel && (
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className={`text-2xl font-bold tracking-tight ${textColor}`}>
              {clampedValue}%
            </span>
            {sublabel && (
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {sublabel}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
