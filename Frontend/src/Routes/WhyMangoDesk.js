import React, { useRef } from 'react';
import { motion, useScroll} from 'framer-motion';
import { 
  Zap, 
  Brain, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  Puzzle,
  ArrowRight,
  X,
  Check,
  Workflow,
  Sparkles
} from 'lucide-react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';

// Reusable Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function WhyMangoDesk() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-950 text-white overflow-hidden relative selection:bg-amber-500/30">
      <Header></Header>
      {/* Background Ambient Elements (Consistent with Home, but shifted) */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-600/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px]" 
        />
      </div>

      {/* --- Section 1: The Philosophy / Header --- */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-white/10 backdrop-blur-md mb-8">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <span className="text-sm font-medium text-slate-300">The Future of Intelligence</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
              Stop Analyzing. <br />
              <span className="bg-gradient-to-r from-amber-200 via-orange-400 to-amber-600 bg-clip-text text-transparent">
                Start Commanding.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Traditional Business Intelligence is passive. MangoDesk is agentic. 
              We don't just show you what happened; we help you execute on what needs to happen next.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- Section 2: The Evolution (Old Way vs New Way) --- */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          
          
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* The Old Way */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-red-500/5 blur-3xl -z-10" />
              <div className="p-8 rounded-3xl border border-white/5 bg-slate-900/40 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-red-400" />
                  The Old Way
                </h3>
                <ul className="space-y-4">
                  {[
                    "Hours spent cleaning CSV files",
                    "Learning complex SQL syntax",
                    "Waiting days for analyst reports",
                    "Static dashboards that expire instantly"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-400">
                      <X className="w-5 h-5 text-red-500/50 mt-1 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* The MangoDesk Way */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-600/20 blur-3xl -z-10" />
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900/80 to-slate-950/90 shadow-2xl shadow-orange-900/20 backdrop-blur-xl"
              >
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-amber-400">
                  <Zap className="w-6 h-6" />
                  The MangoDesk Era
                </h3>
                <ul className="space-y-4">
                  {[
                    "Instant ingestion of messy data",
                    "Natural Language commands (Voice/Text)",
                    "Real-time actionable insights",
                    "Agents that predict your next question"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-white">
                      <div className="mt-1 rounded-full bg-amber-500/20 p-1">
                        <Check className="w-3 h-3 text-amber-400" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- Section 3: Core Pillars (Grid) --- */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
           <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             variants={fadeInUp}
             className="mb-16"
           >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Built for the <br/><span className="text-amber-500">Speed of Thought</span></h2>
            <p className="text-slate-400 max-w-xl text-lg">
              We abstracted the complexity of data engineering so you can focus on the business logic.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Brain,
                title: "Cognitive Processing",
                desc: "Our AI doesn't just match keywords. It understands intent, context, and business jargon specific to your industry."
              },
              {
                icon: Workflow,
                title: "Self-Healing Pipelines",
                desc: "If a data source changes format, our agents adapt automatically. No more broken dashboards on Monday mornings."
              },
              {
                icon: Puzzle,
                title: "Agnostic Integration",
                desc: "Salesforce, Snowflake, Notion, or a loose Excel sheet. MangoDesk unifies them into a single truth source."
              }
            ].map((card, i) => (
              <motion.div 
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-amber-500/30 hover:bg-white/[0.06] transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <card.icon className="w-6 h-6 text-amber-400" />
                </div>
                <h4 className="text-xl font-semibold mb-3">{card.title}</h4>
                <p className="text-slate-400 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- Section 4: The Impact Visualization --- */}
      <section className="py-24 px-6 bg-slate-900/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1 relative"
            >
                
              {/* Abstract Representation of Data Clarity */}
              <div className="relative aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-purple-600 rounded-full opacity-20 blur-3xl animate-pulse" />
                <div className="relative z-10 grid grid-cols-2 gap-4 h-full">
                   <div className="bg-slate-800/80 backdrop-blur border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                      <TrendingUp className="w-8 h-8 text-green-400 mb-4" />
                      <div>
                        <div className="text-3xl font-bold text-white">300%</div>
                        <div className="text-sm text-slate-400">Faster Reporting</div>
                      </div>
                   </div>
                   <div className="bg-slate-800/80 backdrop-blur border border-white/10 rounded-2xl p-6 flex flex-col justify-between mt-8">
                      <Clock className="w-8 h-8 text-blue-400 mb-4" />
                      <div>
                        <div className="text-3xl font-bold text-white">20hrs</div>
                        <div className="text-sm text-slate-400">Saved Weekly</div>
                      </div>
                   </div>
                   <div className="bg-slate-800/80 backdrop-blur border border-white/10 rounded-2xl p-6 flex flex-col justify-between -mt-8">
                      <ShieldCheck className="w-8 h-8 text-amber-400 mb-4" />
                      <div>
                        <div className="text-3xl font-bold text-white">100%</div>
                        <div className="text-sm text-slate-400">Data Governance</div>
                      </div>
                   </div>
                   <div className="bg-slate-800/80 backdrop-blur border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                      <Sparkles className="w-8 h-8 text-purple-400 mb-4" />
                      <div>
                        <div className="text-3xl font-bold text-white">Zero</div>
                        <div className="text-sm text-slate-400">SQL Required</div>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>

            <div className="order-1 lg:order-2">
              <motion.span 
                initial={{ opacity: 0 }} 
                whileInView={{ opacity: 1 }}
                className="text-amber-500 font-medium tracking-wide uppercase text-sm"
              >
                Return on Intelligence
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-5xl font-bold mt-4 mb-6 leading-tight"
              >
                The ROI of <br/>
                <span className="text-white">Autonomy</span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg text-slate-400 mb-8 leading-relaxed"
              >
                When you remove the technical barrier between a question and an answer, your entire organization moves faster. 
                Teams stop arguing about whose spreadsheet is correct and start making decisions based on unified, live data.
              </motion.p>
              <motion.button
                 initial={{ opacity: 0, x: 20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.3 }}
                 className="flex items-center gap-2 text-white font-semibold group hover:text-amber-400 transition-colors"
              >
                Calculate your savings <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 5: Final CTA --- */}
      <section className="py-32 px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 rounded-[3rem] p-12 relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-amber-500/10 blur-[100px]" />
          
          <h2 className="text-4xl md:text-6xl font-bold mb-8 relative z-10">
            Ready to delete your <br />
            <span className="text-slate-600 line-through decoration-amber-500/50">dashboards?</span>
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto relative z-10">
            Join the enterprise revolution. Experience data that talks back.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <button className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20">
              Start Free Trial
            </button>
            <button className="px-8 py-4 bg-transparent border border-white/10 hover:bg-white/5 rounded-xl font-semibold transition-all">
              Talk to Sales
            </button>
          </div>
        </motion.div>
      </section>
      <Footer></Footer>
    </div>
  );
}