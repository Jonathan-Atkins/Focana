
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Brain, X, Play, Pause, Square, RotateCcw, Minimize2, History } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FocusSession } from "@/api/entities";

// Default to card mode unless explicitly disabled
const isCardMode = import.meta.env.VITE_CARD_MODE !== 'false';

import DistractionJar from "../components/DistractionJar";
import StatusBar from "../components/StatusBar";
import SessionNotesModal from "../components/SessionNotesModal";
import TaskPreviewModal from "../components/TaskPreviewModal";
import ContextBox from "../components/ContextBox";
import IncognitoMode from "../components/IncognitoMode";
import CombinedTaskInput from "../components/CombinedTaskInput";
import HistoryModal from "../components/HistoryModal";
import StartSessionModal from "../components/StartSessionModal";

export default function AnchorApp() {
  // Core state
  const [task, setTask] = useState('');
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('freeflow');
  const [initialTime, setInitialTime] = useState(0);
  const [isTimerVisible, setIsTimerVisible] = useState(false);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  
  // Distraction Jar state
  const [distractionJarOpen, setDistractionJarOpen] = useState(false);
  const [thoughts, setThoughts] = useState([]);
  
  // History modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  // Session history
  const [sessions, setSessions] = useState([]);
  
  // Focus state
  const [isNoteFocused, setIsNoteFocused] = useState(false);
  
  // Session notes state
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [contextNotes, setContextNotes] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState(null);
  
  // Task preview state
  const [showTaskPreview, setShowTaskPreview] = useState(false);
  const [previewSession, setPreviewSession] = useState(null);
  
  // Incognito mode state
  const [isIncognito, setIsIncognito] = useState(false);
  
  const timerRef = useRef(null);
  const sessionToSave = useRef(null);

  // Draggable window state
  const dragRef = useRef(null);
  const handleRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  // Set initial centered position for the draggable window
  useEffect(() => {
    if (dragRef.current) {
        const { width, height } = dragRef.current.getBoundingClientRect();
        const initialX = (window.innerWidth - width) / 2;
        const initialY = (window.innerHeight - height) / 2;
        setPosition({ x: initialX, y: initialY });
    }
  }, []);

  // Keep Electron window in sync with card size
  useEffect(() => {
    if (!isCardMode || !window.electronAPI?.setCardBounds || !dragRef.current) return;

    const sendBounds = (width, height) => {
      if (width > 0 && height > 0) {
        window.electronAPI.setCardBounds({
          width: Math.round(width),
          height: Math.round(height),
        });
      }
    };

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        sendBounds(width, height);
      }
    });

    observer.observe(dragRef.current);
    requestAnimationFrame(() => {
      const rect = dragRef.current.getBoundingClientRect();
      sendBounds(rect.width, rect.height);
    });

    return () => observer.disconnect();
  }, []);

  // Handle dragging logic
  useEffect(() => {
    const onMouseDown = (e) => {
        if (handleRef.current && handleRef.current.contains(e.target)) {
            const targetTagName = e.target.tagName;
            if (targetTagName === 'BUTTON' || targetTagName === 'INPUT' || e.target.closest('button') || e.target.closest('input')) {
                return;
            }
            isDraggingRef.current = true;
            const rect = dragRef.current.getBoundingClientRect();
            offsetRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
            document.body.style.cursor = 'grabbing';
            e.preventDefault();
        }
    };

    const onMouseUp = () => {
        isDraggingRef.current = false;
        document.body.style.cursor = '';
    };

    const onMouseMove = (e) => {
        if (isDraggingRef.current) {
            setPosition({
                x: e.clientX - offsetRef.current.x,
                y: e.clientY - offsetRef.current.y,
            });
        }
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousemove', onMouseMove);

    return () => {
        document.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mousemove', onMouseMove);
        document.body.style.cursor = '';
    };
  }, []);

  // Load session history on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const data = await FocusSession.list('-created_date', 50);
    setSessions(data);
  };

  // State is kept in memory for the duration of the session

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime(prevTime => {
          if (mode === 'timed' && prevTime <= 1) {
            setIsRunning(false);
            sessionToSave.current = {
              duration: (initialTime - prevTime + 1) / 60,
              completed: true,
            };
            setShowNotesModal(true);
            return 0;
          }
          return mode === 'freeflow' ? prevTime + 1 : prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, mode, initialTime]);

  const handlePlay = () => task.trim() && setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  
  const handleStop = () => {
    setIsRunning(false);
    sessionToSave.current = {
      duration: mode === 'freeflow' ? time / 60 : (initialTime - time) / 60,
      completed: false,
    };
    setShowNotesModal(true);
  };
  
  const handleClear = () => {
    setIsRunning(false);
    setTime(0);
    setTask('');
    setInitialTime(0);
    setContextNotes('');
    setCurrentSessionId(null);
    setIsTimerVisible(false);
    setIsIncognito(false);
  };

  const handleTaskSubmit = () => {
    if (task.trim()) {
      setIsStartModalOpen(true);
    }
  };

  const handleStartSession = (selectedMode, minutes) => {
    setMode(selectedMode);
    
    if (selectedMode === 'freeflow') {
      setTime(0);
      setInitialTime(0);
    } else {
      const seconds = minutes * 60;
      setTime(seconds);
      setInitialTime(seconds);
    }

    setIsTimerVisible(true);
    setIsRunning(true);
    setIsStartModalOpen(false);
    
    setTimeout(() => setIsIncognito(true), 100);
  };
  
  const handleSaveSessionNotes = async (notes) => {
    await saveSessionWithNotes(notes);
    setShowNotesModal(false);
    handleClear();
  };

  const handleSkipSessionNotes = () => {
    saveSessionWithNotes('');
    setShowNotesModal(false);
    handleClear();
  };

  const saveSessionWithNotes = async (notes) => {
    if (!task.trim() || !sessionToSave.current) return;
    
    const { duration, completed } = sessionToSave.current;

    if (duration > 0.1) {
      const sessionData = {
        task: task.trim(),
        duration_minutes: duration,
        mode,
        completed,
        notes: notes || undefined
      };

      try {
        await FocusSession.create(sessionData);
        await loadSessions();
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }
    
    sessionToSave.current = null;
  };

  const handleUseTask = (session) => {
    setTask(session.task);
    setTime(0);
    setInitialTime(0);
    setIsRunning(false);
    setContextNotes(session.notes || '');
    setCurrentSessionId(session.id);
    setShowHistoryModal(false);
    setIsTimerVisible(true);
  };

  const handleUpdateTaskNotes = async (sessionId, newNotes) => {
    try {
      await FocusSession.update(sessionId, { notes: newNotes });
      await loadSessions();
      
      if (previewSession && previewSession.id === sessionId) {
        setPreviewSession({...previewSession, notes: newNotes});
      }
      
      if (currentSessionId === sessionId) {
        setContextNotes(newNotes);
      }
    } catch (error) {
      console.error('Error updating session notes:', error);
    }
  };

  const handleUpdateContextNotes = async (newNotes) => {
    setContextNotes(newNotes);
    
    if (currentSessionId && newNotes !== contextNotes) {
      try {
        await FocusSession.update(currentSessionId, { notes: newNotes });
        await loadSessions();
      } catch (error) {
        console.error('Error updating session notes:', error);
      }
    }
  };

  const addThought = (thoughtText) => setThoughts(prev => [...prev, { text: thoughtText, completed: false }]);
  const removeThought = (index) => setThoughts(prev => prev.filter((_, i) => i !== index));
  const toggleThought = (index) => {
    const newThoughts = [...thoughts];
    newThoughts[index].completed = !newThoughts[index].completed;
    setThoughts(newThoughts);
  };
  const clearCompletedThoughts = () => setThoughts(prev => prev.filter(t => !t.completed));

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isIncognito) {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-[#FFF9E6] p-4 font-sans overflow-hidden">
           <div
              ref={dragRef}
              style={{
                position: 'absolute',
                top: `${position.y}px`,
                left: `${position.x}px`,
                touchAction: 'none'
              }}
            >
              <div ref={handleRef} className="cursor-grab">
                 <IncognitoMode
                    task={task}
                    isRunning={isRunning}
                    time={time}
                    onDoubleClick={() => setIsIncognito(false)}
                    onOpenDistractionJar={() => setDistractionJarOpen(true)}
                    thoughtCount={thoughts.length}
                    onPlay={handlePlay}
                    onPause={handlePause}
                  />
              </div>
            </div>
          
          <DistractionJar isOpen={distractionJarOpen} onClose={() => setDistractionJarOpen(false)} thoughts={thoughts} onAddThought={addThought} onRemoveThought={removeThought} onToggleThought={toggleThought} onClearCompleted={clearCompletedThoughts} />
          
          <SessionNotesModal
            isOpen={showNotesModal}
            onClose={handleSkipSessionNotes}
            onSave={handleSaveSessionNotes}
            sessionDuration={sessionToSave.current?.duration || 0}
            taskName={task}
          />
          
          <TaskPreviewModal
            isOpen={showTaskPreview}
            onClose={() => setShowTaskPreview(false)}
            session={previewSession}
            onUseTask={handleUseTask}
            onUpdateNotes={handleUpdateTaskNotes}
          />
           <HistoryModal
              isOpen={showHistoryModal}
              onClose={() => setShowHistoryModal(false)}
              sessions={sessions}
              onUseTask={handleUseTask}
            />
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className={isCardMode ? 'w-full h-full font-sans overflow-hidden' : 'min-h-screen bg-[#FFF9E6] p-4 font-sans overflow-hidden'}>
        <div
          ref={dragRef}
          className="w-full max-w-sm bg-[#FFFEF8]/80 backdrop-blur-sm rounded-2xl shadow-2xl shadow-amber-900/10 border border-[#8B6F47]/20 p-4 space-y-4"
          style={{
            position: 'absolute',
            top: isCardMode ? 0 : `${position.y}px`,
            left: isCardMode ? 0 : `${position.x}px`,
            touchAction: 'none'
          }}
        >
          
          <div 
            ref={handleRef}
            className="flex items-center justify-between"
            style={{ cursor: 'grab' }}
          >
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#D97706]" />
              <h1 className="text-md font-bold text-[#5C4033]">Anchor</h1>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => setShowHistoryModal(true)} size="sm" variant="ghost" className="h-8 w-8 p-0 text-[#8B6F47] hover:bg-[#FFF9E6]">
                    <History className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>View Session History</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => setDistractionJarOpen(true)} size="sm" variant="ghost" className="h-8 w-8 p-0 text-[#8B6F47] hover:bg-[#FFF9E6]">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5.5 4h13A1.5 1.5 0 0 1 20 5.5v1A1.5 1.5 0 0 1 18.5 8H5.5A1.5 1.5 0 0 1 4 6.5v-1A1.5 1.5 0 0 1 5.5 4Z"/><path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/></svg>
                    {thoughts.length > 0 && <span className="text-xs ml-1">{thoughts.length}</span>}
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Open Distraction Jar</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => setIsIncognito(true)} size="icon" variant="ghost" className="h-8 w-8 text-[#8B6F47] hover:bg-[#FFF9E6]">
                    <Minimize2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Compact Mode</p></TooltipContent>
              </Tooltip>
               <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-[#8B6F47] hover:bg-[#FFF9E6]">
                    <X className="w-4 h-4" />
                  </Button>
                  </TooltipTrigger>
                <TooltipContent><p>Close (Placeholder)</p></TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <CombinedTaskInput
              task={task}
              setTask={setTask}
              isActive={isNoteFocused || isRunning}
              onFocus={() => setIsNoteFocused(true)}
              onTaskSubmit={handleTaskSubmit}
            />

            {contextNotes && (
              <ContextBox
                notes={contextNotes}
                onUpdateNotes={handleUpdateContextNotes}
                onDismiss={() => setContextNotes('')}
                isSessionActive={isRunning}
              />
            )}

            <div className="flex items-center justify-center gap-4 w-full min-h-[124px]">
              {isTimerVisible ? (
                <div className="flex-1 flex flex-col items-center">
                  <div className={`text-5xl font-bold transition-colors duration-300 ${isRunning ? 'text-[#D97706]' : 'text-[#8B6F47]'}`}>
                    {formatTime(time)}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {!isRunning ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button onClick={handlePlay} disabled={!task.trim()} size="icon" className="w-12 h-12 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-full"><Play className="w-6 h-6" /></Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Resume Timer</p></TooltipContent>
                        </Tooltip>
                    ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button onClick={handlePause} size="icon" className="w-12 h-12 bg-[#D97706] hover:bg-[#5C4033] text-white rounded-full"><Pause className="w-6 h-6" /></Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Pause Timer</p></TooltipContent>
                        </Tooltip>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={handleStop} disabled={!task.trim()} size="icon" variant="outline" className="w-12 h-12 border-[#8B6F47]/30 text-[#8B6F47] hover:bg-[#FFF9E6] rounded-full"><Square className="w-6 h-6" /></Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Stop & Save Session</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={handleClear} size="icon" variant="ghost" className="w-12 h-12 text-[#8B6F47] hover:bg-[#FFF9E6] rounded-full"><RotateCcw className="w-6 h-6" /></Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Clear Current Task & Timer</p></TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-full pt-4">
                  <p className="text-md text-[#8B6F47]">Enter a task to begin your focus session.</p>
                  <p className="text-sm text-[#8B6F47]/70 mt-2">
                    Press enter or click the arrow to set your session type.
                  </p>
                </div>
              )}
            </div>

            <StatusBar task={task} isRunning={isRunning} time={time} />
          </div>
        </div>

        <DistractionJar isOpen={distractionJarOpen} onClose={() => setDistractionJarOpen(false)} thoughts={thoughts} onAddThought={addThought} onRemoveThought={removeThought} onToggleThought={toggleThought} onClearCompleted={clearCompletedThoughts} />
        
        <SessionNotesModal
          isOpen={showNotesModal}
          onClose={handleSkipSessionNotes}
          onSave={handleSaveSessionNotes}
          sessionDuration={sessionToSave.current?.duration || 0}
          taskName={task}
        />
        
        <TaskPreviewModal
          isOpen={showTaskPreview}
          onClose={() => setShowTaskPreview(false)}
          session={previewSession}
          onUseTask={handleUseTask}
          onUpdateNotes={handleUpdateTaskNotes}
        />

        <HistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          sessions={sessions}
          onUseTask={handleUseTask}
        />

        <StartSessionModal
          isOpen={isStartModalOpen}
          onClose={() => setIsStartModalOpen(false)}
          task={task}
          onStart={handleStartSession}
        />
      </div>
    </TooltipProvider>
  );
}
