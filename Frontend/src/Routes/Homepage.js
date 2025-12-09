import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Plus, MessageSquare, Sparkles, Zap, Lightbulb, Globe, 
  Menu, X, Bot, User, Loader2, Mic, FileText, LogOut, 
  Settings, Github, UserCircle, Linkedin, Camera, Save, ArrowLeft 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  // --- UI and Data State ---
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([]); // Sidebar history
  const [currentConversationId, setCurrentConversationId] = useState(null); // Active Chat ID
  
  // Feature State
  const [isListening, setIsListening] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Profile Data
  const [userProfile, setUserProfile] = useState({
    name: "User21",
    username: "coderAg21",
    focus: "Full Stack & Robotics (ROS 2)",
    github: "coderAg21",
    linkedin: "abhay-agrahari",
    avatarUrl: "",
  });

  const [editForm, setEditForm] = useState(userProfile);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- 1. FETCH HISTORY: Refresh sidebar list ---
  const fetchConversations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/chat/history');
      if (response.ok) {
        const data = await response.json();
        // Sort by newest first if your API doesn't already
        setConversations(data.reverse()); 
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchConversations();
    
    // Speech Recognition Setup (Existing logic kept same)
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => setIsListening(false);
      window.recognition = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (window.recognition) {
      isListening ? window.recognition.stop() : window.recognition.start();
      setIsListening(!isListening);
    } else {
      alert("Speech recognition is not supported in this browser.");
    }
  };

  // File Handlers
  const handleFileClick = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/csv") {
      setSelectedFile(file);
    } else if (file) {
      alert("Please upload a CSV file only.");
    }
  };
  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Scroll logic
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [messages]);

  const suggestions = [
    { icon: Sparkles, text: 'Summarize an article about AI', color: 'from-amber-500 to-orange-500' },
    { icon: Lightbulb, text: 'Help me brainstorm ideas', color: 'from-yellow-400 to-amber-500' },
    { icon: Globe, text: 'Plan a trip to Japan', color: 'from-orange-500 to-red-500' },
    { icon: Zap, text: 'Write a creative story', color: 'from-amber-400 to-orange-400' },
    { icon: User, text: 'Based on what you know about me', color: 'from-blue-500 to-cyan-500' },
  ];

  // --- 2. SEND MESSAGE: Updated to sync Sidebar ---
  async function sendMessage(text) {
    if ((!text.trim() && !selectedFile) || isLoading) return;

    // Optimistic UI update
    let displayMessage = text;
    if (selectedFile) {
        displayMessage = text ? `${text} \n(Attached: ${selectedFile.name})` : `Analyzed ${selectedFile.name}`;
    }

    const userMessage = { role: 'user', text: displayMessage, id: Date.now() };
    setMessages(prev => [...prev, userMessage]);

    const currentInput = text;
    const currentFile = selectedFile;
    
    // Cleanup input immediately
    setInput('');
    setSelectedFile(null); 
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('prompt', currentInput); 
      
      // If we have an active chat ID, send it so DB appends message
      if (currentConversationId) {
        formData.append('conversationId', currentConversationId);
      }

      if (currentFile) formData.append('file', currentFile); 

      const response = await fetch('http://localhost:5000/api/brain/command', {
        method: 'POST',
        body: formData, 
      });

      if (!response.ok) throw new Error(`Server Error: ${response.status}`);

      const data = await response.json();
      const aiMessage = { role: 'ai', text: data.response || "Process completed.", id: Date.now() };
      
      setMessages(prev => [...prev, aiMessage]);

      // *** CRITICAL UPDATE ***
      // If this was a fresh chat (no ID before) and server returns a new ID:
      if (!currentConversationId && data.conversationId) {
        setCurrentConversationId(data.conversationId);
        // Refresh sidebar immediately so the new chat appears in history
        await fetchConversations();
      }

    } catch (error) {
      console.error('Fetch error:', error);
      const errorMessage = { 
        role: 'ai', 
        text: `Error: ${error.message}`, 
        id: Date.now(),
        isError: true 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  // --- 3. HANDLE NEW CHAT: Logic to clear screen & prep for new DB entry ---
  function handleNewChat() {
    // We don't delete the previous chat from DB, we just clear the frontend view.
    // The previous chat is already saved in DB by sendMessage.
    
    // 1. Reset messages to empty array
    setMessages([]); 
    
    // 2. Set ID to null. This tells sendMessage to start a NEW conversation next time.
    setCurrentConversationId(null); 
    
    // 3. Reset inputs
    setInput('');
    setSelectedFile(null);
    setIsLoading(false);
    
    // 4. Close sidebar (mobile)
    setSidebarOpen(false);

    // Optional: Refresh history just in case something was pending
    fetchConversations(); 
  }

  // --- 4. LOAD CONVERSATION: Click on sidebar item ---
  async function loadConversation(conversationId) {
    // If clicking the one we are already on, do nothing
    if (conversationId === currentConversationId) {
        setSidebarOpen(false);
        return;
    }

    setIsLoading(true);
    setSidebarOpen(false); 
    
    try {
      const response = await fetch(`http://localhost:5000/api/chat/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []); // Load history messages
        setCurrentConversationId(conversationId); // Set this as active ID
      }
    } catch (error) {
      console.error("Error loading chat:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Profile logic remains same
  const handleEditClick = () => { setEditForm(userProfile); setIsEditingProfile(true); };
  const handleSaveProfile = () => { setUserProfile(editForm); setIsEditingProfile(false); };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex overflow-hidden text-white font-sans selection:bg-orange-500/30">
      
      {/* Hidden inputs */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Profile Modal (Code Hidden for Brevity - Insert your existing Modal code here) */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowProfileModal(false); setIsEditingProfile(false); }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
               {/* ... (Keep your existing Profile Modal Content) ... */}
               <div className="p-6 text-center text-white">Profile Settings Logic Here</div>
               <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-white"><X/></button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed lg:relative z-50 h-full w-72 bg-slate-900/80 backdrop-blur-xl border-r border-white/5 flex flex-col ${sidebarOpen ? 'block' : 'hidden lg:flex'}`}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center justify-between mb-4">
                <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-semibold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">MangoDesk</span>
                </motion.div>
                <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"><X className="w-5 h-5 text-white/60" /></button>
              </div>
              
              {/* NEW CHAT BUTTON */}
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                onClick={handleNewChat} 
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300"
              >
                <Plus className="w-5 h-5" /> New Chat
              </motion.button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <p className="px-3 py-2 text-xs font-medium text-white/40 uppercase tracking-wider">Recent Conversations</p>
              {conversations.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <MessageSquare className="w-8 h-8 text-white/20 mx-auto mb-2" />
                  <p className="text-xs text-white/30">No conversations yet</p>
                </div>
              ) : (
                conversations.map((conv, index) => (
                  <motion.button 
                    key={conv.id || conv._id} 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: index * 0.05 }} 
                    whileHover={{ x: 4 }} 
                    onClick={() => loadConversation(conv.id || conv._id)} // CLICK TO LOAD OLD CHAT
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${(currentConversationId === conv.id || currentConversationId === conv._id) ? 'bg-amber-500/10 border border-amber-500/20' : 'hover:bg-white/5'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${(currentConversationId === conv.id || currentConversationId === conv._id) ? 'bg-amber-500/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                        <MessageSquare className={`w-4 h-4 ${(currentConversationId === conv.id || currentConversationId === conv._id) ? 'text-amber-400' : 'text-white/40'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Title of the chat from DB */}
                        <p className={`text-sm font-medium truncate ${(currentConversationId === conv.id || currentConversationId === conv._id) ? 'text-white' : 'text-white/80'}`}>
                          {conv.title || `Conversation ${index + 1}`}
                        </p>
                        {/* Last message preview */}
                        <p className="text-xs text-white/30 truncate">{conv.preview || "..."}</p>
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>

            {/* User Menu (Existing code kept same) */}
            <div className="p-4 border-t border-white/5 relative">
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute bottom-full left-4 right-4 mb-2 bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden p-1 z-50">
                    <Link to="/dashboard" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm text-white/90">
                      <UserCircle className="w-4 h-4 text-amber-400" /> Go to Dashboard
                    </Link>
                    <button onClick={() => { setShowProfileModal(true); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm text-white/90">
                      <UserCircle className="w-4 h-4 text-amber-400" /> Your Profile
                    </button>
                    {/* MODIFIED: Logout Redirect */}
                    <button onClick={() => window.location.href = "http://localhost:5000/logout"} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm text-red-400 hover:text-red-300">
                      <LogOut className="w-4 h-4" /> Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              <button onClick={() => setShowUserMenu(!showUserMenu)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${showUserMenu ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'}`}>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center border border-white/10 overflow-hidden">
                    {userProfile.avatarUrl ? <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-sm font-semibold text-white">{userProfile.name.charAt(0)}</span>}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-white/80 truncate">{userProfile.name}</p>
                  <p className="text-xs text-white/40 truncate">Free Plan</p>
                </div>
                {showUserMenu ? <X className="w-4 h-4 text-white/40" /> : <Settings className="w-4 h-4 text-white/40" />}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10">
        
        {/* Mobile Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors">
              <Menu className="w-5 h-5 text-white/60" />
            </motion.button>
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
              <span className="font-semibold text-white">MangoDesk</span>
            </div>
          </div>
        </header>

        {/* Chat Interface */}
        <main className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            // Welcome Screen
            <div className="h-full flex flex-col items-center justify-center p-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center max-w-2xl mx-auto">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-orange-500/20">
                  <Bot className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">How can I assist you today?</h1>
                <p className="text-white/40 text-lg mb-10">Analyze data, generate insights, or chat with AI</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                  {suggestions.map((suggestion, index) => (
                    <motion.button key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + index * 0.1 }} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => sendMessage(suggestion.text)} className="group relative p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all duration-300 text-left overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${suggestion.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                      <div className="relative flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${suggestion.color} flex items-center justify-center shadow-lg`}><suggestion.icon className="w-5 h-5 text-white" /></div>
                        <p className="flex-1 text-sm text-white/70 group-hover:text-white/90 transition-colors leading-relaxed">{suggestion.text}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            // Message List
            <div className="max-w-3xl mx-auto p-4 space-y-6 pb-40">
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <motion.div key={message.id} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'ai' && (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-5 py-3.5 ${message.role === 'user' ? 'bg-gradient-to-br from-amber-600 to-orange-600 text-white shadow-lg shadow-orange-500/20' : message.isError ? 'bg-red-500/10 border border-red-500/20 text-red-300' : 'bg-white/5 border border-white/10 text-white/90'}`}>
                      <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{message.text}</p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-600 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
                          {userProfile.avatarUrl ? <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-white" />}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              <AnimatePresence>
                {isLoading && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex gap-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                      <div className="flex items-center gap-2">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Loader2 className="w-4 h-4 text-amber-400" /></motion.div>
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
             <AnimatePresence>
                {selectedFile && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mb-2 flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg w-fit">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-white/80">{selectedFile.name}</span>
                    <button onClick={removeFile} className="ml-2 hover:bg-white/10 rounded-full p-0.5 transition-colors"><X className="w-3 h-3 text-white/60 hover:text-white" /></button>
                  </motion.div>
                )}
             </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative flex items-end gap-2 p-2 rounded-2xl bg-white/5 border border-white/10 focus-within:border-amber-500/50 focus-within:bg-white/[0.07] transition-all duration-300">
              <motion.button whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }} whileTap={{ scale: 0.9 }} onClick={handleFileClick} className="p-2.5 rounded-xl text-white/50 hover:text-amber-400 transition-colors" title="Upload CSV">
                  <Plus className="w-5 h-5" />
              </motion.button>

              <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyPress} placeholder={isListening ? "Listening..." : "Type your message..."} rows={1} className="flex-1 bg-transparent text-white placeholder-white/30 text-sm md:text-base px-2 py-2.5 resize-none outline-none max-h-32 min-h-[44px]" style={{ scrollbarWidth: 'none' }} />

               <motion.button whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }} whileTap={{ scale: 0.9 }} onClick={toggleListening} className={`p-2.5 rounded-xl transition-colors ${isListening ? 'text-red-500 animate-pulse bg-red-500/10' : 'text-white/50 hover:text-amber-400'}`} title="Voice Input">
                  <Mic className="w-5 h-5" />
               </motion.button>

              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => sendMessage(input)} disabled={(!input.trim() && !selectedFile) || isLoading} className={`p-2.5 rounded-xl transition-all duration-300 ${(input.trim() || selectedFile) && !isLoading ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </motion.button>
            </motion.div>
            <p className="text-center text-xs text-white/20 mt-3">MangoDesk AI can make mistakes. Consider checking important information.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}