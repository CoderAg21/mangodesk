import React from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Linkedin, 
  Github, 
  ArrowUp 
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-16">
          {/* Brand Column */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                MangoDesk
              </span>
            </div>
            <p className="text-white/40 mb-6 max-w-xs leading-relaxed">
              Agentic AI platform for enterprise data operations. Transform how you work with data.
            </p>
            <div className="flex gap-4">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <Icon className="w-5 h-5 text-white/60" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4 text-white/80">Product</h4>
            <ul className="space-y-3">
              {['Features', 'Pricing', 'Enterprise', 'Security', 'Roadmap'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-white/40 hover:text-white/80 transition-colors text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 text-white/80">Resources</h4>
            <ul className="space-y-3">
              {['Documentation', 'API Reference', 'Tutorials', 'Blog', 'Changelog'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-white/40 hover:text-white/80 transition-colors text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-white/80">Company</h4>
            <ul className="space-y-3">
              {['About', 'Careers', 'Press', 'Partners'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-white/40 hover:text-white/80 transition-colors text-sm">
                    {item}
                  </a>
                </li>
              ))}
              <li>
                {/* <Link to={createPageUrl('Team')} className="text-amber-400 hover:text-amber-300 transition-colors text-sm font-medium">Our Team →</Link> */}
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-white/80">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-white/40 text-sm">
                <Mail className="w-4 h-4" />
                hello@mangodesk.ai
              </li>
              <li className="flex items-center gap-2 text-white/40 text-sm">
                <Phone className="w-4 h-4" />
                +91 7007295932
              </li>
              <li className="flex items-start gap-2 text-white/40 text-sm">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                MNNIT Allahabad, India
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            © 2024 MangoDesk. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <a 
                key={item} 
                href="#" 
                className="text-sm text-white/30 hover:text-white/60 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll to Top */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25 z-50"
      >
        <ArrowUp className="w-5 h-5 text-white" />
      </motion.button>
    </footer>
  );
}