import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Upload, 
  Bot, 
  Zap, 
  Play, 
  ArrowRight,
  Database,
  LineChart,
  Shield,
  Cpu,
  Layers,
  Users,
  CheckCircle,
} from 'lucide-react';



export default function Hero() {
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [activeFeature, setActiveFeature] = useState(0);
  
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });
  // const isFeaturesInView = useInView(featuresRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const toggleVoice = () => {
    if (!isListening) {
      setIsListening(true);
      setVoiceText('Listening...');
      setTimeout(() => {
        setVoiceText('"Analyze Q4 sales performance across all regions"');
        setTimeout(() => {
          setIsListening(false);
          setVoiceText('');
        }, 3000);
      }, 2000);
    } else {
      setIsListening(false);
      setVoiceText('');
    }
  };

  const features = [
    { 
      icon: Mic, 
      title: 'Voice Control', 
      desc: 'Command your data with natural speech. Our AI understands context and executes complex operations instantly.',
      color: 'from-violet-500 to-purple-600'
    },
    { 
      icon: Database, 
      title: 'Smart Data Ingestion', 
      desc: 'Upload any format—CSV, JSON, SQL dumps, APIs. Our agents automatically structure and optimize your data.',
      color: 'from-cyan-500 to-blue-600'
    },
    { 
      icon: Cpu, 
      title: 'Agentic AI Operations', 
      desc: 'Autonomous AI agents that learn your workflows, predict needs, and execute multi-step operations.',
      color: 'from-amber-500 to-orange-600'
    },
    { 
      icon: Shield, 
      title: 'Enterprise Security', 
      desc: 'SOC 2 Type II certified. End-to-end encryption. Your data never leaves your secure environment.',
      color: 'from-emerald-500 to-green-600'
    },
  ];

  const testimonials = [
    {
      quote: "MangoDesk transformed how we handle data. What took days now happens in seconds.",
      author: "Sarah Chen",
      role: "CTO, TechCorp",
      avatar: "S"
    },
    {
      quote: "The voice control feature is revolutionary. Our team adoption rate hit 95% in week one.",
      author: "Marcus Johnson",
      role: "VP Operations, DataFlow",
      avatar: "M"
    },
    {
      quote: "Finally, an AI tool that actually understands enterprise complexity.",
      author: "Elena Vasquez",
      role: "Head of Analytics, GlobalFin",
      avatar: "E"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-x-hidden">
      {/* Ambient Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ 
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-3xl" 
        />
      </div>

   

      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 mb-6"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-400">Introducing Agentic AI 2.0</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              >
                <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                  Your Data, 
                </span>
                <br />
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                  Intelligent Operations
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-white/50 mb-8 max-w-lg leading-relaxed"
              >
                MangoDesk's agentic AI transforms how enterprises manipulate data. 
                Voice-controlled, self-learning, infinitely scalable.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(251, 146, 60, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl font-semibold shadow-xl shadow-orange-500/25 flex items-center justify-center gap-3"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.95 }}
                  className="group px-8 py-4 border border-white/20 rounded-2xl font-semibold flex items-center justify-center gap-3 hover:border-white/40 transition-all"
                >
                  <Play className="w-5 h-5" />
                  Watch Demo
                </motion.button>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-12 pt-8 border-t border-white/5"
              >
                <p className="text-xs text-white/30 mb-4 uppercase tracking-wider">Trusted by industry leaders</p>
              </motion.div>
            </motion.div>

            {/* Right Content - Interactive Demo */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-3xl blur-3xl" />
                
                {/* Main Card */}
                <motion.div 
                  className="relative bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 lg:p-8 overflow-hidden"
                  whileHover={{ borderColor: 'rgba(251, 146, 60, 0.3)' }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">MangoDesk AI</p>
                        <p className="text-xs text-white/40">Ready for commands</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs text-emerald-400">Live</span>
                    </div>
                  </div>

                  {/* Voice Control Area */}
                  <motion.div 
                    className={`relative p-6 rounded-2xl mb-6 transition-all duration-500 ${
                      isListening 
                        ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30' 
                        : 'bg-white/5 border border-white/10'
                    }`}
                    animate={isListening ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <div className="flex items-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleVoice}
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          isListening 
                            ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-orange-500/40' 
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        {isListening ? (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                          >
                            <Mic className="w-7 h-7 text-white" />
                          </motion.div>
                        ) : (
                          <MicOff className="w-7 h-7 text-white/60" />
                        )}
                      </motion.button>
                      <div className="flex-1">
                        <p className="text-sm text-white/40 mb-1">
                          {isListening ? 'Listening...' : 'Click to speak'}
                        </p>
                        <AnimatePresence mode="wait">
                          {voiceText ? (
                            <motion.p
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="text-white font-medium"
                            >
                              {voiceText}
                            </motion.p>
                          ) : (
                            <p className="text-white/20 text-sm italic">
                              "Show me revenue trends for Q4..."
                            </p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Voice Wave Animation */}
                    {isListening && (
                      <motion.div 
                        className="flex items-center justify-center gap-1 mt-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {[...Array(12)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1 bg-gradient-to-t from-amber-500 to-orange-400 rounded-full"
                            animate={{ 
                              height: [8, Math.random() * 32 + 8, 8],
                            }}
                            transition={{ 
                              repeat: Infinity, 
                              duration: 0.5,
                              delay: i * 0.05,
                              ease: "easeInOut"
                            }}
                          />
                        ))}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Upload Area */}
                  <motion.div
                    whileHover={{ scale: 1.02, borderColor: 'rgba(251, 146, 60, 0.5)' }}
                    className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 hover:bg-white/5"
                  >
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-cyan-400" />
                    </div>
                    <p className="font-medium mb-1">Upload Your Data</p>
                    <p className="text-sm text-white/40">CSV, JSON, Excel, SQL dumps supported</p>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="py-24 lg:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span 
              className="inline-block px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              Powerful Capabilities
            </motion.span>
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Enterprise-Grade AI Features
              </span>
            </h2>
            <p className="text-white/40 max-w-2xl mx-auto text-lg">
              Everything you need to transform your data operations with intelligent automation
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, borderColor: 'rgba(255,255,255,0.2)' }}
                onMouseEnter={() => setActiveFeature(i)}
                className={`relative p-8 rounded-3xl border transition-all duration-500 cursor-pointer overflow-hidden ${
                  activeFeature === i 
                    ? 'bg-white/[0.08] border-white/20' 
                    : 'bg-white/[0.02] border-white/5'
                }`}
              >
                {/* Background Glow */}
                <AnimatePresence>
                  {activeFeature === i && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5`}
                    />
                  )}
                </AnimatePresence>

                <div className="relative z-10 flex gap-6">
                  <motion.div 
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg flex-shrink-0`}
                    animate={activeFeature === i ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-white/50 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>

                {/* Active Indicator */}
                <motion.div
                  className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.color}`}
                  initial={{ width: '0%' }}
                  animate={{ width: activeFeature === i ? '100%' : '0%' }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-24 lg:py-32 px-6 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
                Seamless Integration
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Connect Your Entire<br />
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Data Ecosystem
                </span>
              </h2>
              <p className="text-white/50 text-lg mb-8 leading-relaxed">
                Upload data from any source. Our AI agents automatically understand structure, 
                relationships, and optimal operations for your specific use case.
              </p>

              <div className="space-y-4">
                {[
                  'Automatic schema detection & optimization',
                  'Natural language query interface',
                  'Predictive analytics & insights'
                ].map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className="text-white/70">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Floating Data Cards */}
              <div className="relative h-[500px]">
                {[
                  { label: 'Sales Data', icon: LineChart, position: 'top-0 left-0', delay: 0 },
                  { label: 'Customer DB', icon: Users, position: 'top-12 right-0', delay: 0.1 },
                  { label: 'Analytics', icon: Database, position: 'bottom-24 left-8', delay: 0.2 },
                  { label: 'Reports', icon: Layers, position: 'bottom-0 right-12', delay: 0.3 },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: item.delay }}
                    whileHover={{ scale: 1.05, zIndex: 10 }}
                    animate={{ 
                      y: [0, -10, 0],
                    }}
                    className={`absolute ${item.position} bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/10 p-5 cursor-pointer hover:border-cyan-500/30 transition-colors`}
                    style={{ 
                      animationDelay: `${i * 0.5}s`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs text-white/40">Connected</p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Central Hub */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 w-32 h-32 rounded-full border-2 border-dashed border-cyan-500/30"
                    />
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/30 m-4">
                      <Bot className="w-12 h-12 text-white" />
                    </div>
                  </div>
                </motion.div>

                {/* Connection Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgba(6, 182, 212, 0.5)" />
                      <stop offset="100%" stopColor="rgba(251, 146, 60, 0.5)" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 lg:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
              Customer Stories
            </span>
            <h2 className="text-3xl lg:text-5xl font-bold">
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Loved by Data Teams
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white/[0.03] backdrop-blur-sm rounded-3xl border border-white/5 p-8 hover:border-white/10 transition-all duration-300"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <Sparkles key={j} className="w-4 h-4 text-amber-400" />
                  ))}
                </div>
                <p className="text-white/70 mb-8 leading-relaxed italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <span className="text-lg font-bold">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-white/40">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-purple-500/20 border border-white/10 p-12 lg:p-16 text-center"
          >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-purple-500/10" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
            />

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/30"
              >
                <Zap className="w-10 h-10 text-white" />
              </motion.div>
              
              <h2 className="text-3xl lg:text-5xl font-bold mb-6">
                Ready to Transform Your
                <br />
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Data Operations?
                </span>
              </h2>
              <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
                Join 500+ enterprises already using MangoDesk to supercharge their data workflows.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 30px 60px rgba(251, 146, 60, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="group px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl font-semibold shadow-xl shadow-orange-500/25 flex items-center justify-center gap-3"
                >
                  Login
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 border border-white/20 rounded-2xl font-semibold hover:bg-white/5 transition-all"
                >
                  Contact Us
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

  
    </div>
  );
}