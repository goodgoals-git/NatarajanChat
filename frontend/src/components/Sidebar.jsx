import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Folder,
  LogOut,
  Settings,
  MoreVertical,
  Search
} from 'lucide-react';
import { chatApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const Sidebar = ({ currentThreadId, onSelectThread, onNewChat }) => {
  const [tree, setTree] = useState({});
  const [openFolders, setOpenFolders] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { logout, user } = useAuth();

  const fetchSidebar = async () => {
    try {
      const response = await chatApi.getSidebar();
      setTree(response.data.tree);
      // Open folders that have the current thread
      if (currentThreadId) {
        Object.entries(response.data.tree).forEach(([group, threads]) => {
          if (threads.some(t => t.threadId === currentThreadId)) {
            setOpenFolders(prev => ({ ...prev, [group]: true }));
          }
        });
      }
    } catch (err) {
      console.error('Failed to fetch sidebar tree', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSidebar();
  }, [currentThreadId]);

  const toggleFolder = (group) => {
    setOpenFolders(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const filteredTree = Object.entries(tree).reduce((acc, [group, threads]) => {
    const filteredThreads = threads.filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filteredThreads.length > 0) {
      acc[group] = filteredThreads;
    }
    return acc;
  }, {});

  return (
    <div className="w-80 h-screen glass-panel border-l-0 flex flex-col relative z-20">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-between gap-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl py-3 px-4 transition-all group shadow-inner border border-white/5"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            <span className="font-semibold text-sm">New Architecture</span>
          </div>
          <span className="text-[10px] bg-zinc-900 px-1.5 py-0.5 rounded border border-white/10 text-zinc-500 group-hover:text-zinc-300">⌘N</span>
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
          <input
            type="text"
            placeholder="Search clusters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/50 border border-border rounded-lg py-2 pl-10 pr-4 text-sm outline-none focus:border-zinc-700 transition-all placeholder:text-zinc-600"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 scroll-smooth">
        {isLoading ? (
          <div className="flex flex-col gap-4 p-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 bg-zinc-900/50 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          Object.entries(filteredTree).map(([group, threads]) => (
            <div key={group} className="space-y-1">
              <button
                onClick={() => toggleFolder(group)}
                className="w-full flex items-center gap-2 px-2 py-2 hover:bg-zinc-800/50 rounded-lg text-zinc-400 hover:text-zinc-200 transition-all group"
              >
                {openFolders[group] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <Folder className={cn("w-4 h-4 transition-colors", openFolders[group] ? "text-primary/70" : "text-zinc-500")} />
                <span className="text-xs font-bold uppercase tracking-widest truncate flex-1 text-left">
                  {group === 'uncategorized' ? 'Personal workspace' : group}
                </span>
                <span className="text-[10px] text-zinc-600 group-hover:text-zinc-400">{threads.length}</span>
              </button>

              <AnimatePresence>
                {openFolders[group] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-0.5 ml-4"
                  >
                    {threads.map(thread => (
                      <button
                        key={thread.threadId}
                        onClick={() => onSelectThread(thread)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all group relative",
                          currentThreadId === thread.threadId
                            ? "bg-primary/10 text-primary-foreground border border-primary/20"
                            : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                        )}
                      >
                        <MessageSquare className={cn("w-4 h-4", currentThreadId === thread.threadId ? "text-primary" : "text-zinc-600")} />
                        <span className="truncate flex-1 text-left">{thread.title}</span>
                        {currentThreadId === thread.threadId && (
                          <motion.div
                            layoutId="active-pill"
                            className="absolute left-0 w-1 h-4 bg-primary rounded-full"
                          />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-border bg-zinc-900/30 backdrop-blur-md">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800/50 transition-colors group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-primary/20">
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
          <div className="flex-1 truncate">
            <p className="text-xs font-semibold text-zinc-200 truncate">{user?.email}</p>
            <p className="text-[10px] text-zinc-500 font-medium tracking-tight">Professional Tier</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 hover:bg-zinc-700 rounded-md text-zinc-500 hover:text-red-400 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
