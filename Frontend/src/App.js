import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Routes/Dashboard";
import Notfound from "./Routes/Notfound";
import Homepage from "./Routes/Homepage";

function App() {
  return (

    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* <Route path="*" element={<Notfound />} /> */}
      </Routes>
    </Router>
  );
}

<<<<<<< HEAD
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
    // <Dashboard>
    // </Dashboard>
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
=======
export default App;
>>>>>>> 4f88a26e6619216f34d160978a03f765ba311de3
