import React from 'react';
import { motion } from 'framer-motion';
import { Home, AlertTriangle, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom'; // Assuming you use react-router
import Header from '../Components/Header';
import Footer from '../Components/Footer';

export default function Notfound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col overflow-hidden">
      <Header />

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center relative px-6 py-32">
        {/* Ambient Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3] 
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[100px]" 
          />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          {/* Icon Container */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 1.5, bounce: 0.5 }}
            className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-slate-800/50 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl shadow-orange-500/20"
          >
            <WifiOff className="w-10 h-10 text-amber-500" />
          </motion.div>

          {/* Glitch Text Effect */}
          <div className="relative mb-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-7xl md:text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/10 tracking-tighter"
            >
              502
            </motion.h1>
            <motion.div 
              animate={{ opacity: [0, 1, 0], x: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 0.2, repeatDelay: 3 }}
              className="absolute inset-0 text-7xl md:text-9xl font-bold text-amber-500/30 blur-sm pointer-events-none"
              aria-hidden="true"
            >
              502
            </motion.div>
          </div>

          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl font-semibold mb-4 text-white"
          >
            System Connection Lost
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/40 text-lg mb-10 max-w-md mx-auto leading-relaxed"
          >
            The server encountered a temporary error and could not complete your request. Our agents are already investigating the anomaly.
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 30px -10px rgba(245, 158, 11, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 font-medium text-white shadow-lg shadow-orange-500/20 flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Return Home
              </motion.button>
            </Link>
            
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-medium text-white transition-colors flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Report Issue
            </button>
          </motion.div>
        </div>

        {/* Floating Geometric Decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none opacity-20">
          <svg className="w-full h-full" viewBox="0 0 800 400">
            <motion.path
              d="M 0 200 Q 200 100 400 200 T 800 200"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </main>

      <Footer />
    </div>
  );
}
