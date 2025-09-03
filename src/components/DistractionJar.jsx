import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Copy } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function DistractionJar({ 
  isOpen, 
  onClose, 
  thoughts, 
  onAddThought, 
  onRemoveThought,
  onToggleThought,
  onClearCompleted 
}) {
  const [newThought, setNewThought] = useState('');

  const handleAdd = () => {
    if (newThought.trim()) {
      onAddThought(newThought.trim());
      setNewThought('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  const copyAllToClipboard = () => {
    const textToCopy = thoughts.map(t => `- ${t.text}`).join('\n');
    navigator.clipboard.writeText(textToCopy);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-[#FFFEF8] border-[#D97706] shadow-2xl rounded-lg">
        <TooltipProvider>
          <DialogHeader>
            <DialogTitle className="text-[#5C4033] font-semibold text-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M5.5 4h13A1.5 1.5 0 0 1 20 5.5v1A1.5 1.5 0 0 1 18.5 8H5.5A1.5 1.5 0 0 1 4 6.5v-1A1.5 1.5 0 0 1 5.5 4Z"/><path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/></svg>
              Distraction Jar
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Textarea
                value={newThought}
                onChange={(e) => setNewThought(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Capture a thought... (Enter to add)"
                className="flex-1 min-h-[40px] text-base border-[#8B6F47]/30 text-[#5C4033] bg-white"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleAdd}
                    size="icon"
                    className="bg-[#F59E0B] hover:bg-[#D97706] text-white shrink-0"
                    disabled={!newThought.trim()}
                    aria-label="Add Thought"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Add thought</p></TooltipContent>
              </Tooltip>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 -mr-2">
              {thoughts.map((thought, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 bg-[#FFF9E6] rounded-md border border-transparent hover:border-[#F59E0B]/50 transition-colors"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <Checkbox id={`thought-${index}`} checked={thought.completed} onCheckedChange={() => onToggleThought(index)} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent><p>Mark as {thought.completed ? 'incomplete' : 'complete'}</p></TooltipContent>
                  </Tooltip>
                  <label 
                    htmlFor={`thought-${index}`}
                    className={`flex-1 text-sm cursor-pointer ${thought.completed ? 'line-through text-[#8B6F47]' : 'text-[#5C4033]'}`}>
                    {thought.text}
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                          onClick={() => onRemoveThought(index)}
                          size="icon"
                          variant="ghost"
                          className="p-1 h-auto text-[#8B6F47] hover:text-[#5C4033] hover:bg-red-100 rounded-full"
                          aria-label="Remove Thought"
                        >
                          <Trash2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Delete thought</p></TooltipContent>
                  </Tooltip>
                </div>
              ))}
               {thoughts.length === 0 && <p className="text-center text-sm text-[#8B6F47] py-4">No thoughts parked yet.</p>}
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
             <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" className="text-[#8B6F47]" onClick={onClearCompleted}>Clear Completed</Button>
                </TooltipTrigger>
                <TooltipContent><p>Remove all completed thoughts</p></TooltipContent>
              </Tooltip>
              <div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="mr-2" onClick={copyAllToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy All
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Copy all thoughts to clipboard</p></TooltipContent>
                </Tooltip>
                <DialogClose asChild>
                  <Button type="button" className="bg-[#F59E0B] hover:bg-[#D97706] text-white">
                    Close
                  </Button>
                </DialogClose>
              </div>
          </DialogFooter>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
}