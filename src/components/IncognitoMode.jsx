import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause } from 'lucide-react';

export default function IncognitoMode({ 
  task, 
  isRunning, 
  time, 
  onDoubleClick,
  onOpenDistractionJar,
  thoughtCount = 0,
  onPlay,
  onPause
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    if (task && task.trim()) {
      return task;
    }
    return 'Ready to focus';
  };

  const getTaskColor = () => {
    if (isRunning) return 'text-[#5C4033]'; // Dark coffee text when running
    return 'text-[#8B6F47]'; // Lighter coffee text when paused/idle
  };
  
  const getTimerColor = () => {
    return isRunning ? 'text-[#D97706]' : 'text-[#8B6F47]';
  };

  return (
    <div 
      className="bg-[#FFFEF8]/90 backdrop-blur-sm rounded-full shadow-lg border border-black/5"
      onDoubleClick={onDoubleClick}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-2 cursor-pointer">
        {/* Clickable area for expanding */}
        <div className="group relative flex-1 flex items-center justify-between mr-3 gap-6">
          {/* Task on the left - now shows full text */}
          <span 
            className={`text-sm font-medium transition-colors duration-300 ${getTaskColor()}`}
          >
            {getStatusText()}
          </span>
          
          {/* Timer in the middle */}
          <span 
            className={`text-lg font-mono font-bold transition-colors duration-300 ${getTimerColor()}`}
          >
            {formatTime(time)}
          </span>

          {/* Unified Hint on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 rounded-full pointer-events-none">
            <p className="text-xs text-white font-bold tracking-wide whitespace-nowrap drop-shadow-sm">
              Double-click to expand
            </p>
          </div>
        </div>
        
        {/* Right-side controls */}
        <div className="flex items-center gap-1 z-10 flex-shrink-0">
          {/* Play/Pause Button */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              isRunning ? onPause() : onPlay();
            }}
            size="icon"
            variant="ghost"
            className="h-7 w-7 p-0 text-[#8B6F47] hover:text-[#5C4033] hover:bg-[#FFF9E6]/70 rounded-full transition-all duration-200"
            title={isRunning ? "Pause Timer" : "Resume Timer"}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>

          {/* Distraction Jar Icon on the far right */}
          <Button
            onClick={(e) => {
              e.stopPropagation(); // Prevent double-click from triggering
              onOpenDistractionJar();
            }}
            size="icon"
            variant="ghost"
            className="h-7 w-7 p-0 text-[#8B6F47] hover:text-[#5C4033] hover:bg-[#FFF9E6]/70 rounded-full transition-all duration-200 z-10 relative flex-shrink-0"
            title="Open Distraction Jar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5.5 4h13A1.5 1.5 0 0 1 20 5.5v1A1.5 1.5 0 0 1 18.5 8H5.5A1.5 1.5 0 0 1 4 6.5v-1A1.5 1.5 0 0 1 5.5 4Z"/><path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/></svg>
            {thoughtCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#F59E0B] text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                {thoughtCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}