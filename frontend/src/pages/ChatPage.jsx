import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  Zap,
  ShieldCheck,
  RefreshCcw,
  Maximize2,
  Minimize2,
  Command,
  Cpu
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Message from '../components/Message';
import { chatApi } from '../services/api';
import { cn } from '../lib/utils';

const ChatPage = () => {
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);
    setIsSyncing(true);

    const threadId = currentThreadId || `thread_${Date.now()}`;
    if (!currentThreadId) setCurrentThreadId(threadId);

    try {
      // 1. Sync with backend to get categorization/path updates and save history
      const syncResponse = await chatApi.syncThread(threadId, newMessages, input);

      // 2. Simulate AI response (In a real scenario, this might come from another endpoint or the sync response)
      // Since the backend provided is a "gateway", we simulate the assistant logic if not explicitly provided
      setTimeout(() => {
        const aiMessage = {
          role: 'assistant',
          content: `I have processed your request within the ${syncResponse.data.thread.groupName} cluster. Analysis complete. Protocol synchronized.`,
          timestamp: new Date().toISOString()
        };
        const finalMessages = [...newMessages, aiMessage];
        setMessages(finalMessages);

        // Final sync with assistant reply
        chatApi.syncThread(threadId, finalMessages);

        setIsTyping(false);
        setIsSyncing(false);
      }, 1500);

    } catch (err) {
      console.error('Handshake failure during sync', err);
      setIsSyncing(false);
      setIsTyping(false);
    }
  };

  const selectThread = (thread) => {
    setCurrentThreadId(thread.threadId);
    setMessages(thread.messages || []);
  };

  const startNewChat = () => {
    setCurrentThreadId(null);
    setMessages([]);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar
        currentThreadId={currentThreadId}
        onSelectThread={selectThread}
        onNewChat={startNewChat}
      />

      <main className="flex-1 flex flex-col relative">
        {/* Top Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-background/50 backdrop-blur-xl z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Quantum Encrypted</span>
            </div>
            <div className="h-4 w-[1px] bg-border" />
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full animate-pulse", isSyncing ? "bg-amber-500" : "bg-emerald-500")} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                {isSyncing ? 'Syncing core...' : 'Core Synchronized'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-zinc-500 hover:text-white transition-colors">
              <RefreshCcw className="w-4 h-4" />
            </button>
            <button className="text-zinc-500 hover:text-white transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Chat History */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto scroll-smooth pb-32"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 bg-gradient-to-br from-primary via-accent to-secondary rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-primary/20 rotate-12"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold gradient-text mb-4">Initialize Intelligence</h2>
              <p className="text-zinc-500 max-w-sm text-sm leading-relaxed">
                NatarajanAI Reformed is ready to assist. Deploy a prompt to begin computational processing.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-12 w-full max-w-xl">
                {[
                  { icon: Zap, label: 'Compute Complex Logic', desc: 'Advanced algorithmic reasoning' },
                  { icon: Command, label: 'Cluster References', desc: 'Cross-chat semantic grouping' }
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(item.label)}
                    className="p-4 rounded-2xl glass-panel text-left hover:border-primary/50 transition-all group"
                  >
                    <item.icon className="w-5 h-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-bold text-zinc-200">{item.label}</p>
                    <p className="text-[10px] text-zinc-500">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full">
              {messages.map((msg, i) => (
                <Message key={i} {...msg} />
              ))}
              {isTyping && (
                <div className="p-6 flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" />
                  </div>
                  <div className="flex gap-1 items-center mt-3">
                    <span className="w-1 h-1 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1 h-1 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1 h-1 bg-zinc-600 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-background via-background to-transparent pointer-events-none">
          <div className="max-w-4xl mx-auto w-full pointer-events-auto">
            <form
              onSubmit={handleSendMessage}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity" />
              <div className="relative flex items-center bg-zinc-900/90 border border-border rounded-2xl p-2 pl-6 backdrop-blur-xl">
                <input
                  type="text"
                  placeholder="Deploy command or ask a question..."
                  className="flex-1 bg-transparent outline-none py-3 text-sm placeholder:text-zinc-600"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="bg-primary hover:bg-primary/90 text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:grayscale"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
            <p className="text-[10px] text-center mt-4 text-zinc-600 font-medium tracking-tight">
              NatarajanAI Reformed v1.0.0 — Synchronized with MongoDB Atlas Cloud
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
