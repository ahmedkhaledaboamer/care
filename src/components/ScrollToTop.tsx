import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
export function ScrollToTop() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? scrollTop / docHeight * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
      setVisible(scrollTop > 300);
    };
    update();
    window.addEventListener('scroll', update, {
      passive: true
    });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  // Circle ring math
  const size = 56;
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress / 100 * circumference;
  return (
    <AnimatePresence>
      {visible &&
      <motion.button
        initial={{
          opacity: 0,
          scale: 0.6,
          y: 20
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }}
        exit={{
          opacity: 0,
          scale: 0.6,
          y: 20
        }}
        transition={{
          duration: 0.25
        }}
        onClick={handleClick}
        aria-label={`Scroll to top — ${Math.round(progress)}% scrolled`}
        className="fixed bottom-6 end-6 z-50 group">
        
          <div
          className="relative"
          style={{
            width: size,
            height: size
          }}>
          
            {/* Track + progress ring */}
            <svg
            width={size}
            height={size}
            className="absolute inset-0 -rotate-90 rtl:rotate-90">
            
              <defs>
                <linearGradient
                id="scrollProgressGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%">
                
                  <stop offset="0%" stopColor="#70A426" />
                  <stop offset="100%" stopColor="#125697" />
                </linearGradient>
              </defs>
              <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(10, 46, 82, 0.12)"
              strokeWidth={stroke}
              fill="none" />
            
              <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#scrollProgressGradient)"
              strokeWidth={stroke}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{
                transition: 'stroke-dashoffset 120ms linear'
              }} />
            
            </svg>

            {/* Inner button */}
            <div className="absolute inset-1.5 rounded-full bg-white shadow-lg flex flex-col items-center justify-center text-brand-dark group-hover:bg-gradient-to-br group-hover:from-brand-gold group-hover:to-brand-goldLight group-hover:text-white transition-colors">
              <ArrowUp className="w-3.5 h-3.5 mb-0.5" />
              <span className="text-[9px] font-bold tabular-nums leading-none">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </motion.button>
      }
    </AnimatePresence>);

}