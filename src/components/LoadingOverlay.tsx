import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "Measuring sentence rhythm...",
  "Checking vocabulary patterns...",
  "Running literary analysis...",
  "Almost there..."
];

export function LoadingOverlay({ isVisible }: { isVisible: boolean }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setMsgIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]/90 backdrop-blur-sm">
      <div className="flex flex-col items-center max-w-sm px-6 text-center space-y-6">
        {/* Spinner / Pulsing Dots */}
        <div className="flex space-x-2">
          <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        
        <div>
          <h3 className="text-xl font-serif text-[#f5f0e8] mb-2 tracking-tight">Analysing your prose...</h3>
          <div className="h-6 overflow-hidden relative w-64 mx-auto">
            {MESSAGES.map((msg, i) => (
              <p 
                key={i} 
                className={`text-zinc-400 text-sm absolute inset-0 transition-all duration-500 ease-in-out ${
                  i === msgIndex 
                    ? 'opacity-100 transform translate-y-0' 
                    : i < msgIndex 
                      ? 'opacity-0 transform -translate-y-4' 
                      : 'opacity-0 transform translate-y-4'
                }`}
              >
                {msg}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
