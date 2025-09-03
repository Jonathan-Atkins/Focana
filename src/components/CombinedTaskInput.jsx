import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export default function CombinedTaskInput({ 
  task, 
  setTask, 
  isActive, 
  onFocus,
  onTaskSubmit
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && task.trim()) {
      e.preventDefault();
      onTaskSubmit();
    }
  };

  return (
    <TooltipProvider>
      <div className="relative w-full max-w-[380px]">
        <Input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onFocus={onFocus}
          onKeyDown={handleKeyDown}
          placeholder="What are you focused on?"
          maxLength={120}
          className={`w-full text-left text-lg px-4 h-12 border-2 transition-all duration-300 pr-14 ${
            isActive 
              ? 'border-[#D97706] bg-[#FFFEF8] shadow-md ring-2 ring-[#D97706]/20' 
              : 'border-[#8B6F47]/30 bg-[#FFFEF8] hover:border-[#D97706]/50'
          }`}
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            color: '#5C4033',
          }}
        />
        {task.trim() && !isActive && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-lg"
                onClick={onTaskSubmit}
                aria-label="Start session"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Start Session</p></TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}