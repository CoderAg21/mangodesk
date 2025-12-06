import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Users, 
  Globe, 
  Award, 
  Zap, 
  Code, 
  Heart, 
  ArrowUpRight,
  Target,
  Sparkles,
  Github,
  Linkedin,
  Twitter
} from 'lucide-react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';

const StatCard = ({ label, value, icon: Icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="relative group"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-rose-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
    <div className="relative p-6 bg-slate-900/50 border border-white/10 rounded-2xl backdrop-blur-sm overflow-hidden group-hover:border-white/20 transition-all">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className="w-16 h-16 text-white" />
      </div>
      <h3 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-2">
        {value}
      </h3>
      <p className="text-white/50 font-medium">{label}</p>
    </div>
  </motion.div>
);

const TeamMember = ({ name, role, image, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -10 }}
    className="group relative"
  >
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-rose-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative overflow-hidden rounded-3xl aspect-[3/4] mb-4 border border-white/5 group-hover:border-white/20 transition-colors">
      <img 
        src={image} 
        alt={name}
        className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110"
      />
      
      {/* Social Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
        <div className="flex gap-4 justify-center">
          <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <Linkedin className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <Twitter className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <Github className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
    <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
    <p className="text-amber-400/80 text-sm font-medium">{role}</p>
  </motion.div>
);

export default function About() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-950 text-white overflow-hidden selection:bg-rose-500/30">
      <Header></Header>
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-rose-500/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[120px]" 
        />
      </div>

      {/* Header Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
          >
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-medium text-white/80">The Story of MangoDesk</span>
          </motion.div>
          
          <h1 className="text-5xl lg:text-8xl font-bold tracking-tight mb-8">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="block bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent"
            >
              Building the
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="block bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 bg-clip-text text-transparent pb-4"
            >
              Digital Brain
            </motion.span>
          </h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto text-xl text-white/50 leading-relaxed"
          >
            We're a collective of engineers, designers, and dreamers obsessed with one question: 
            <span className="text-white"> What if your data could talk back?</span>
          </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <StatCard icon={Users} value="0k+" label="Daily Active Users" delay={0} />
            <StatCard icon={Globe} value="0+" label="Countries Served" delay={0.1} />
            <StatCard icon={Zap} value="0B" label="Queries Processed" delay={0.2} />
            <StatCard icon={Award} value="#null" label="Product of the Month" delay={0.3} />
          </div>
        </div>
      </section>

  

      {/* Team Section */}
 <section className="py-32 px-6 bg-gradient-to-b from-slate-900/50 to-slate-950">
  <div className="max-w-7xl mx-auto">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-16"
    >
      <span className="inline-block px-4 py-1.5 rounded-full bg-slate-800 border border-white/10 text-white/60 text-sm font-mono font-medium mb-6">
        Commit. Push. Deploy.
      </span>
      <h2 className="text-4xl lg:text-6xl font-bold mb-6">
        The <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Core Team</span>
      </h2>
      <p className="text-white/50 max-w-2xl mx-auto text-lg">
        We are a squad of passionate developers building the tools we wish we had. 
        No corporate fluff—just clean code and shipping features.
      </p>
    </motion.div>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      {[
        {
          name: "Abhay Agrahari",
          role: "Web Developer",
          githubUser: "coderAg21",
          linkedin: "#",
          instagram: "#",
          gradient: "from-amber-400 to-orange-600"
        },
        {
          name: "Dhairya Gupta",
          role: "Web Developer",
          githubUser: "dhairya0910",
          linkedin: "#",
          instagram: "#",
          gradient: "from-purple-400 to-pink-600"
        },
        {
          name: "Anshu Raj",
          role: "Web Developer",
          githubUser: "anoshum",
          linkedin: "#",
          instagram: "#",
          gradient: "from-cyan-400 to-blue-600"
        },
        {
          name: "Aviral Tiwari",
          role: "Web Developer",
          githubUser: "Aviral580",
          linkedin: "#",
          instagram: "#",
          gradient: "from-emerald-400 to-green-600"
        }
      ].map((member, i) => (
        <motion.div
          key={member.name}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          whileHover={{ y: -10 }}
          className="group relative"
        >
          {/* Dynamic Glow Effect based on member's color */}
          <div className={`absolute inset-0 bg-gradient-to-b ${member.gradient} rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />
          
          <div className="relative overflow-hidden rounded-3xl aspect-[3/4] mb-4 border border-white/5 group-hover:border-white/20 transition-colors bg-slate-900">
            {/* Fetching Image directly from GitHub */}
            <img 
              src={`https://github.com/${member.githubUser}.png`}
              alt={member.name}
              className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110"
            />
            
            {/* Social Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
              <div className="flex gap-3 justify-center">
                <a href={`https://github.com/${member.githubUser}`} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/10 hover:bg-white/20 hover:text-white transition-colors text-white/70">
                  <Github className="w-5 h-5" />
                </a>
                <a href={member.linkedin} className="p-2 rounded-full bg-white/10 hover:bg-white/20 hover:text-white transition-colors text-white/70">
                  <Linkedin className="w-5 h-5" />
                </a>
                {/* Replaced Twitter with Instagram per your data */}
                <a href={member.instagram} className="p-2 rounded-full bg-white/10 hover:bg-white/20 hover:text-white transition-colors text-white/70">
                   {/* Using a generic globe or camera icon if Lucide doesn't have Instagram, or stick to Lucide's Camera */}
                   <Globe className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="text-center group-hover:transform group-hover:translate-y-[-4px] transition-transform duration-300">
            <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
            <span className={`text-sm font-medium bg-gradient-to-r ${member.gradient} bg-clip-text text-transparent`}>
              {member.role}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
</section>

      {/* Values / Culture Grid */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <span className="text-cyan-400 font-bold tracking-wider text-sm uppercase">Our DNA</span>
              <h2 className="text-4xl font-bold mt-4 mb-6">Built on Unbreakable Principles</h2>
              <p className="text-white/50 leading-relaxed mb-8">
                We don't just write code; we craft experiences. Every feature we ship is tested against our three core pillars of excellence.
              </p>
              <button className="flex items-center gap-2 text-white font-semibold hover:gap-4 transition-all">
                {/* See Open Positions <ArrowUpRight className="w-4 h-4" /> */}
              </button>
            </motion.div>

            <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
              {[
  { 
    icon: Target, 
    title: "Focus on Fundamentals", 
    desc: "No bloat. We are currently prioritizing a rock-solid architecture and core utility over fancy, unnecessary features." 
  },
  { 
    icon: Code, 
    title: "Active Development", 
    desc: "We are in the lab. We push commits daily, break things often, and refactor constantly to find the best solutions." 
  },
  { 
    icon: Heart, 
    title: "Built by Engineers", 
    desc: "We're scratching our own itch. This isn't just a product; it's the tool we wish we had, built the way we want it to work." 
  },
  { 
    icon: Zap, 
    title: "Work in Progress", 
    desc: "We're building in public. Expect bugs, expect changes, and expect a team that listens to feedback and adapts instantly." 
  }
].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center mb-6 border border-white/10">
                    <item.icon className="w-6 h-6 text-rose-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recruitment CTA */}
   <section className="py-24 px-6">
  <div className="max-w-5xl mx-auto">
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="relative rounded-[3rem] overflow-hidden bg-slate-900 border border-white/10 p-12 lg:p-24 text-center group"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      
      {/* Amber/Construction Glow Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Animated Gradient Blob */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3] 
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/20 rounded-full blur-[100px]" 
      />
      
      <div className="relative z-10">
        <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-mono font-medium mb-8">
          ● Beta Access Open
        </span>

        <h2 className="text-4xl lg:text-6xl font-bold mb-8 text-white">
          Want to see the <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            source code?
          </span>
        </h2>
        
        <p className="text-white/60 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
          We're building in public. Join our Discord to see daily changelogs, break our staging environment, and help shape the roadmap.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-orange-500/25 hover:scale-105 transition-all duration-300">
            Join Waitlist
          </button>
          
          <button className="px-8 py-4 bg-slate-800 text-white border border-white/10 rounded-xl font-bold hover:bg-slate-700 hover:border-white/20 transition-all flex items-center justify-center gap-2">
            <Github className="w-5 h-5" />
            Star on GitHub
          </button>
        </div>
      </div>
    </motion.div>
  </div>
</section>
      <Footer></Footer>
    </div>
  );
}

