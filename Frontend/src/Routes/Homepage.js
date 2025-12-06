import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, MessageSquare, Sparkles, Zap, Lightbulb, Globe, ChevronLeft, Menu, X, Bot, User, Loader2 } from 'lucide-react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const suggestions = [
    { icon: Sparkles, text: 'Summarize an article about AI', color: 'from-amber-500 to-orange-500' },
    { icon: Lightbulb, text: 'Help me brainstorm ideas', color: 'from-yellow-400 to-amber-500' },
    { icon: Globe, text: 'Plan a trip to Japan', color: 'from-orange-500 to-red-500' },
    { icon: Zap, text: 'Write a creative story', color: 'from-amber-400 to-orange-400' },
  ];

  async function sendMessage(text) {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: 'user', text, id: Date.now() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    // If this is the first message of a new conversation, create a conversation
    if (messages.length === 0 && !currentConversationId) {
      const newConvId = Date.now();
      const conversationTitle = text.length > 40 ? text.substring(0, 40) + '...' : text;
      const newConversation = {
        id: newConvId,
        title: conversationTitle,
        preview: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        messages: updatedMessages
      };
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversationId(newConvId);
    }

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const aiResponseText = data.response || "I apologize, but I couldn't generate a response.";

      const aiMessage = { role: 'ai', text: aiResponseText, id: Date.now() };
      const finalMessages = [...updatedMessages, aiMessage];
      
      setMessages(finalMessages);

      // Update the conversation with the new message
      if (currentConversationId) {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === currentConversationId 
              ? { ...conv, messages: finalMessages, preview: aiResponseText.substring(0, 50) + (aiResponseText.length > 50 ? '...' : '') }
              : conv
          )
        );
      }
    } catch (error) {
      console.error('Fetch error:', error);
      const errorMessage = { 
        role: 'ai', 
        text: 'Unable to connect to the server. Please check your connection and try again.', 
        id: Date.now(),
        isError: true 
      };
      const finalMessages = [...updatedMessages, errorMessage];
      
      setMessages(finalMessages);

      // Update conversation with error message
      if (currentConversationId) {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === currentConversationId 
              ? { ...conv, messages: finalMessages }
              : conv
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleNewChat() {
    setMessages([]);
    setInput('');
    setIsLoading(false);
    setCurrentConversationId(null);
    setSidebarOpen(false);
  }

  function loadConversation(conversationId) {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setMessages(conversation.messages || []);
      setCurrentConversationId(conversationId);
      setSidebarOpen(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex overflow-hidden text-white">
      {/* Ambient background effects (Matched to Team Page) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed lg:relative z-50 h-full w-72 bg-slate-900/80 backdrop-blur-xl border-r border-white/5 flex flex-col ${
              sidebarOpen ? 'block' : 'hidden lg:flex'
            }`}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  className="flex items-center gap-3"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layers w-6 h-6 text-white" aria-hidden="true"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"></path><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"></path><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"></path></svg>
                  </div>
                  <span className="text-xl font-semibold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                    MangoDesk
                  </span>
                </motion.div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                New Chat
              </motion.button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <p className="px-3 py-2 text-xs font-medium text-white/40 uppercase tracking-wider">
                Recent Conversations
              </p>
              {conversations.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <MessageSquare className="w-8 h-8 text-white/20 mx-auto mb-2" />
                  <p className="text-xs text-white/30">No conversations yet</p>
                  <p className="text-xs text-white/20 mt-1">Start chatting to see your history</p>
                </div>
              ) : (
                conversations.map((conv, index) => (
                  <motion.button
                    key={conv.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                    onClick={() => loadConversation(conv.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${
                      currentConversationId === conv.id 
                        ? 'bg-amber-500/10 border border-amber-500/20' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        currentConversationId === conv.id
                          ? 'bg-amber-500/20'
                          : 'bg-white/5 group-hover:bg-white/10'
                      }`}>
                        <MessageSquare className={`w-4 h-4 ${
                          currentConversationId === conv.id 
                            ? 'text-amber-400' 
                            : 'text-white/40'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          currentConversationId === conv.id 
                            ? 'text-white' 
                            : 'text-white/80'
                        }`}>{conv.title}</p>
                        <p className="text-xs text-white/30 truncate">{conv.preview}</p>
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-white/5">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center border border-white/10">
                  <span className="text-sm font-semibold text-white">U</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/80">User</p>
                  {/* <p className="text-xs text-white/40">Free Plan</p> */}
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Menu className="w-5 h-5 text-white/60" />
            </motion.button>
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">NexusAI</span>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-2xl mx-auto"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-orange-500/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layers w-6 h-6 text-white" aria-hidden="true"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"></path><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"></path><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"></path></svg>
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                  How can I assist you today?
                </h1>
                <p className="text-white/40 text-lg mb-10">
                  Choose a suggestion or type your own message below
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => sendMessage(suggestion.text)}
                      className="group relative p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all duration-300 text-left overflow-hidden"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${suggestion.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                      <div className="relative flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${suggestion.color} flex items-center justify-center shadow-lg`}>
                          <suggestion.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="flex-1 text-sm text-white/70 group-hover:text-white/90 transition-colors leading-relaxed">
                          {suggestion.text}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto p-4 space-y-6">
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'ai' && (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layers w-6 h-6 text-white" aria-hidden="true"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"></path><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"></path><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"></path></svg>
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-5 py-3.5 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-amber-600 to-orange-600 text-white shadow-lg shadow-orange-500/20'
                          : message.isError
                          ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                          : 'bg-white/5 border border-white/10 text-white/90'
                      }`}
                    >
                      <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                        {message.text}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-600 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading Indicator */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex gap-4"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layers w-6 h-6 text-white" aria-hidden="true"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"></path><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"></path><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"></path></svg>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Loader2 className="w-4 h-4 text-amber-400" />
                        </motion.div>
                        <span className="text-sm text-white/50">Thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Input Area */}
        <footer className="p-4 border-t border-white/5 bg-slate-900/50 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative flex items-end gap-3 p-2 rounded-2xl bg-white/5 border border-white/10 focus-within:border-amber-500/50 focus-within:bg-white/[0.07] transition-all duration-300"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 bg-transparent text-white placeholder-white/30 text-sm md:text-base px-3 py-2 resize-none outline-none max-h-32 min-h-[44px]"
                style={{ scrollbarWidth: 'none' }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  input.trim() && !isLoading
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40'
                    : 'bg-white/5 text-white/20 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </motion.button>
            </motion.div>
            <p className="text-center text-xs text-white/20 mt-3">
              NexusAI can make mistakes. Consider checking important information.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}