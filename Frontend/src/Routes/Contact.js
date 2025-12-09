import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// removed axios import
import { 
  Send, MapPin, ArrowRight, Github, Twitter, Linkedin, 
  Copy, Check, MessageSquare, Clock, Loader2 
} from 'lucide-react';
import Header from '../Components/Header';

// Optimized InputField
const InputField = ({ label, name, type = "text", placeholder, delay, value, onChange }) => {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay, duration: 0.5 }}
      className="relative mb-8"
    >
      <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${focused ? 'text-amber-400' : 'text-white/40'}`}>
        {label}
      </label>
      <div className="relative">
        {type === "textarea" ? (
          <textarea 
            name={name}
            value={value}
            onChange={onChange}
            rows="4"
            placeholder={placeholder}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all duration-300 resize-none"
          />
        ) : (
          <input 
            name={name}
            value={value}
            onChange={onChange}
            type={type}
            placeholder={placeholder}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all duration-300"
          />
        )}
        <div className={`absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 ${focused ? 'w-full opacity-100' : 'w-0 opacity-0'}`} />
      </div>
    </motion.div>
  );
};

const SocialLink = ({ icon: Icon, href, label }) => (
  <a 
    href={href}
    className="group flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300"
  >
    <div className="p-2 rounded-full bg-slate-900 group-hover:bg-amber-500/20 transition-colors">
      <Icon className="w-5 h-5 text-white/60 group-hover:text-amber-400 transition-colors" />
    </div>
    <span className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">{label}</span>
    <ArrowRight className="w-4 h-4 text-white/20 ml-auto group-hover:-rotate-45 transition-transform duration-300" />
  </a>
);

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [time, setTime] = useState('');
  
  // Form Logic
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('en-US', { 
        timeZone: 'Asia/Kolkata',
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Success Logic
      setStatus('success');
      setFormData({ firstName: '', lastName: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);

    } catch (error) {
      console.error("Submission Error:", error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText("hello@mangodesk.ai");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative selection:bg-amber-500/30">
      <Header />
      
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15]" />
        
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          style={{ willChange: "transform" }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[80px]" 
        />
        <motion.div 
          animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
          style={{ willChange: "transform" }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[100px]" 
        />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 pt-32 pb-32 lg:pt-48 relative z-10">
        
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          
          {/*Left Column */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-mono mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Replies within 2 hours
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter mb-8 leading-[0.9]">
              Let's build the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">
                impossible.
              </span>
            </h1>

            <p className="text-xl text-white/50 max-w-lg mb-12 leading-relaxed">
              Have a visionary idea? Found a bug in the matrix? Or just want to talk about the future of AI? The MangoDesk team is listening.
            </p>

            <div className="space-y-4 max-w-md mb-12">
              <SocialLink icon={Github} href="#" label="Follow us on GitHub" />
              <SocialLink icon={Twitter} href="#" label="Join the conversation" />
              <SocialLink icon={Linkedin} href="#" label="Connect on LinkedIn" />
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md inline-block min-w-[300px]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-white/10 shadow-lg">
                  <MapPin className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">MNNIT Allahabad</p>
                  <p className="text-xs text-white/40">Uttar Pradesh, India</p>
                </div>
              </div>
              <div className="h-px w-full bg-white/10 mb-4" />
              <div className="flex justify-between items-center gap-8">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-white/40" />
                  <span className="text-xs font-mono text-white/40">LOCAL TIME</span>
                </div>
                <span className="font-mono text-amber-400 font-bold tracking-widest">{time}</span>
              </div>
            </div>
          </motion.div>

          {/* --- Right Column: The Form --- */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
       
            <div className="relative bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 lg:p-12 overflow-hidden shadow-2xl shadow-black/50">
            
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-10">
                <div>
                  <h3 className="text-2xl font-bold mb-1 text-white">Send a Message</h3>
                  <p className="text-white/40 text-sm">We'll get back to you via email.</p>
                </div>
                <button 
                  onClick={copyEmail}
                  className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium border border-white/5"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-white/50" />}
                  <span className={copied ? "text-emerald-400" : "text-white/50"}>
                    {copied ? "Copied!" : "Copy Email"}
                  </span>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-6">
                  <InputField 
                    label="First Name" name="firstName" placeholder="Jane" delay={0.3} 
                    value={formData.firstName} onChange={handleInputChange} 
                  />
                  <InputField 
                    label="Last Name" name="lastName" placeholder="Doe" delay={0.3} 
                    value={formData.lastName} onChange={handleInputChange} 
                  />
                </div>
                <InputField 
                  label="Email Address" name="email" type="email" placeholder="jane@company.com" delay={0.4} 
                  value={formData.email} onChange={handleInputChange}
                />
                <InputField 
                  label="Your Message" name="message" type="textarea" placeholder="Tell us about your data challenges..." delay={0.5} 
                  value={formData.message} onChange={handleInputChange}
                />

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 30px -10px rgba(245, 158, 11, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  disabled={status === 'loading'}
                  className="w-full py-5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl font-bold text-white shadow-lg shadow-orange-500/20 flex items-center justify-center gap-3 group mt-4 relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10">
                    {status === 'loading' ? 'Sending...' : status === 'success' ? 'Sent!' : status === 'error' ? 'Failed' : 'Send Message'}
                  </span>
                  
                  {status === 'loading' ? (
                    <Loader2 className="w-4 h-4 relative z-10 animate-spin" />
                  ) : status === 'success' ? (
                    <Check className="w-4 h-4 relative z-10" />
                  ) : (
                    <Send className="w-4 h-4 relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </motion.button>

                {status === 'error' && (
                  <p className="text-red-400 text-xs mt-3 text-center">Something went wrong. Please try again.</p>
                )}
              </form>

              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none transform rotate-12">
                <MessageSquare className="w-48 h-48 text-white" />
              </div>
            </div>

            <motion.div
              animate={{ rotate: 360 }}
              style={{ willChange: "transform" }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-12 -right-12 w-32 h-32 hidden lg:flex items-center justify-center pointer-events-none"
            >
              <svg viewBox="0 0 100 100" width="120" height="120">
                <defs>
                  <path id="circle" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                </defs>
                <text fontSize="11" fill="#fbbf24" fontWeight="bold" letterSpacing="1.2">
                  <textPath xlinkHref="#circle">
                    OPEN FOR COLLABORATION • 2025 •
                  </textPath>
                </text>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-2 h-2 bg-amber-500 rounded-full" />
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>

      {/* --- Infinite Marquee Footer --- */}
      <div className="absolute bottom-0 w-full border-t border-white/5 bg-slate-900/50 backdrop-blur-md overflow-hidden py-4">
        <motion.div 
          animate={{ x: [0, -1000] }}
          style={{ willChange: "transform" }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap gap-8"
        >
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 opacity-30 hover:opacity-100 transition-opacity duration-500 cursor-default select-none">
              <span className="text-4xl font-bold font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                MANGODESK
              </span>
              <span className="text-white/20 text-2xl">✦</span>
              <span className="text-4xl font-bold font-mono tracking-tighter stroke-text text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>
                START FREE TRIAL
              </span>
              <span className="text-white/20 text-2xl">✦</span>
              <span className="text-4xl font-bold font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                EXPLORE SOLUTIONS
              </span>
              <span className="text-white/20 text-2xl">✦</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}