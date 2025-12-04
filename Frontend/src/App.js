import React, { useState } from 'react';
import './App.css'; 

// Small icon components
const MenuIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const SendIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

// LOGO
function Logo() {
  return (
    <div className="logo">
      <div className="logo-circle">G</div>
      <div className="logo-text">Clone</div>
    </div>
  );
}

// SIDEBAR
function Sidebar({ onNewChat }) {
  return (
    <aside className="sidebar">
      <Logo />
      <button onClick={onNewChat} className="newchat-btn">New Chat</button>

      <div className="recent-title">Recent</div>
      <div className="recent-list">
        <div className="recent-item">Trip to Kyoto</div>
        <div className="recent-item">Project ideas</div>
      </div>
    </aside>
  );
}

// CHAT BUBBLE
function ChatBubble({ text, role }) {
  const isUser = role === 'user';
  return (
    <div className={isUser ? 'bubble-container user' : 'bubble-container ai'}>
      <div className={isUser ? 'bubble user-bubble' : 'bubble ai-bubble'}>{text}</div>
    </div>
  );
}

// CHAT AREA
function ChatArea({ messages, onUsePrompt }) {
  const suggestions = [
    'Summarize an article about renewable energy',
    'Help me brainstorm side project ideas',
    'Plan a 7-day trip to Japan',
  ];

  if (messages.length === 0) {
    return (
      <div className="empty-screen">
        <h2 className="empty-title">Hello — how can I help?</h2>
        <p className="empty-sub">Click a suggestion or type your message below.</p>

        <div className="suggestion-grid">
          {suggestions.map((s) => (
            <button key={s} onClick={() => onUsePrompt(s)} className="suggestion-card">{s}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area">
      {messages.map((m, i) => (
        <ChatBubble key={i} {...m} />
      ))}
    </div>
  );
}

// MAIN APP
export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  function sendMessage(text) {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');

    // Fake AI response
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'ai', text: `I got: "${text}" — here's a helpful reply.` }]);
    }, 700);
  }

  function handleUsePrompt(prompt) {
    sendMessage(prompt);
  }

  function handleNewChat() {
    setMessages([]);
    setInput('');
  }

  return (
    <div className="app-container">
      <Sidebar onNewChat={handleNewChat} />

      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-btn"><MenuIcon className="icon" /></button>
            <Logo />
          </div>
          <div className="topbar-right">Simple UI Clone</div>
        </header>

        <main className="main-chat">
          <ChatArea messages={messages} onUsePrompt={handleUsePrompt} />
        </main>

        <footer className="input-area">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage(input);
              }
            }}
            placeholder="Type a message..."
            className="chat-input"
          />
          <button
            onClick={() => sendMessage(input)}
            className="send-btn"
            disabled={!input.trim()}
          >
            <SendIcon className="icon" />
          </button>
        </footer>
      </div>
    </div>
  );
}