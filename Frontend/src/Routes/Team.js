import { motion } from 'framer-motion';
import { Github, Linkedin, Instagram, Terminal} from 'lucide-react';
import Header from '../Components/Header'; 
import Footer from '../Components/Footer'; 

const teamMembers = [
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
    githubUser: "dhairya0910", // Placeholder
    linkedin: "#",
    instagram: "#",
    gradient: "from-purple-400 to-pink-600"
  },
  {
    name: "Anshu Raj",
    role: "Web Developer",
    githubUser: "anoshum", // Placeholder
    linkedin: "#",
    instagram: "#",
    gradient: "from-cyan-400 to-blue-600"
  },
 
  {
    name: "Aviral Tiwari",
    role: "Web Developer",
    githubUser: "Aviral580", // Placeholder
    linkedin: "#",
    instagram: "#",
    gradient: "from-emerald-400 to-green-600"
  }
];

export default function Team() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-x-hidden">
      <Header />

      {/* Background Ambient Light */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div 
          animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[120px]" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <main className="relative z-10 pt-32 pb-24 px-6 max-w-7xl mx-auto">
        
        {/* Page Title */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <Terminal className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-100/60">The Visionaries</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Meet the <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Squad</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 max-w-2xl mx-auto text-lg"
          >
            The minds behind MangoDesk. We are a collective of engineers, designers, and thinkers building the next generation of Agentic AI.
          </motion.p>
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <TeamCard key={index} member={member} index={index} />
          ))}
        </div>

      </main>

      <Footer />
    </div>
  );
}

function TeamCard({ member, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group relative"
    >
     
      <div className="relative h-full bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden transition-all duration-500 group-hover:border-white/20 group-hover:shadow-[0_0_40px_-10px_rgba(245,158,11,0.2)]">
        
       
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b ${member.gradient} mix-blend-overlay pointer-events-none`} />
        
        <div className="p-6 flex flex-col items-center">
          
         
          <div className="relative mb-6">
           
            <div className={`absolute -inset-1 rounded-full bg-gradient-to-r ${member.gradient} opacity-20 group-hover:opacity-100 blur transition-all duration-500`} />
            <div className="relative w-32 h-32 rounded-full p-1 bg-slate-950 border border-white/10 overflow-hidden group-hover:scale-105 transition-transform duration-500">
              <img 
                src={`https://github.com/${member.githubUser}.png`} 
                alt={member.name}
                className="w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              />
            </div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-3 border border-dashed border-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
          </div>

         
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
            {member.name}
          </h3>
          <p className="text-sm text-white/40 font-medium mb-6 uppercase tracking-wider">
            {member.role}
          </p>

     
          <div className="flex items-center gap-3 w-full justify-center pt-6 border-t border-white/5">
            <SocialIcon 
              href={member.linkedin} 
              icon={Linkedin} 
              delay={0} 
              color="hover:text-blue-400"
            />
            <SocialIcon 
              href={member.instagram} 
              icon={Instagram} 
              delay={0.1} 
              color="hover:text-pink-400"
            />
            <SocialIcon 
              href={`https://github.com/${member.githubUser}`} 
              icon={Github} 
              delay={0.2} 
              color="hover:text-white"
            />
          </div>
        </div>

        {/* 6. Bottom Glow Bar */}
        <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${member.gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
      </div>
    </motion.div>
  );
}

function SocialIcon({ href, icon: Icon, delay, color }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -3, scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/50 transition-all duration-300 hover:bg-white/10 ${color}`}
    >
      <Icon className="w-5 h-5" />
    </motion.a>
  );
}