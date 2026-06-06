import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';

const Message = ({ role, content, timestamp }) => {
  const isAssistant = role === 'assistant';
  const [displayedContent, setDisplayedContent] = useState(isAssistant ? '' : content);
  const [isTyping, setIsTyping] = useState(isAssistant);

  useEffect(() => {
    if (isAssistant && isTyping) {
      let index = 0;
      const interval = setInterval(() => {
        if (index < content.length) {
          setDisplayedContent((prev) => prev + content[index]);
          index++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
        }
      }, 10); // Speed of typewriter animation

      return () => clearInterval(interval);
    }
  }, [content, isAssistant]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full gap-4 p-6 transition-colors",
        isAssistant ? "bg-zinc-900/30" : "bg-transparent"
      )}
    >
      <div className="flex-shrink-0">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shadow-lg",
          isAssistant
            ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/20"
            : "bg-zinc-800 text-zinc-400 shadow-black/20"
        )}>
          {isAssistant ? <Cpu className="w-5 h-5" /> : <User className="w-5 h-5" />}
        </div>
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs font-bold uppercase tracking-widest",
            isAssistant ? "text-indigo-400" : "text-zinc-500"
          )}>
            {isAssistant ? 'NatarajanAI' : 'Authorized User'}
          </span>
          <span className="text-[10px] text-zinc-600 font-medium">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className={cn(
          "text-sm leading-relaxed whitespace-pre-wrap break-words",
          isAssistant ? "text-zinc-200" : "text-zinc-300"
        )}>
          {displayedContent}
          {isTyping && (
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-1.5 h-4 ml-1 bg-primary align-middle"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Message;
