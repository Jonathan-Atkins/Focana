import React from 'react';

export default function StatusBar({ task, isRunning, time, isMinimal = false }) {
  const getStatusText = () => {
    if (isRunning && task) {
      const minutes = Math.floor(time / 60);
      return `${task}`;
    }
    
    if (task && !isRunning) {
      return `${task}`;
    }
    
    return 'Ready to focus';
  };

  const getStatusColor = () => {
    if (isRunning) return '#D97706'; // Deep amber when active
    if (task) return '#F59E0B'; // Primary yellow when ready
    return '#8B6F47'; // Coffee brown when idle
  };

  const shouldPulse = !task && !isRunning;

  return (
    <div className={`${isMinimal ? 'p-4' : 'mt-6 p-3'} bg-[#FFF9E6] rounded-lg border border-[#8B6F47]/20 ${
      shouldPulse ? 'animate-pulse' : ''
    }`}>
      <div className="flex items-center justify-center">
        <span 
          className={`${isMinimal ? 'text-lg' : 'text-sm'} font-medium transition-colors duration-300 text-center`}
          style={{ color: getStatusColor() }}
        >
          {getStatusText()}
        </span>
      </div>
    </div>
  );
}