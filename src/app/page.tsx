"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate, AnimatePresence, useInView } from "framer-motion";
import { Terminal, Cloud, Server, Database, Shield, ArrowUpRight, Activity, MapPin, Code2, Globe, GitBranch, ChevronRight, Mail, Link, MessageCircle, Box, Network, Zap, Download, Phone, FileText } from "lucide-react";
import Lenis from 'lenis';
import dynamic from 'next/dynamic';

const GitHubCalendar = dynamic(() => import('react-github-calendar').then((mod) => mod.GitHubCalendar), { ssr: false });

// --- SMOOTH SCROLL HOOK ---
function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);
}

// --- MAGNETIC BUTTON COMPONENT ---
const MagneticButton = ({ children, className = "", href, target }: { children: React.ReactNode, className?: string, href?: string, target?: string }) => {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;
  const Wrapper = href ? motion.a : motion.button;
  
  return (
    <Wrapper
      ref={ref}
      href={href}
      target={target}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
    >
      {children}
    </Wrapper>
  );
};

// --- GLOWING BENTO CARD WRAPPER WITH 3D HOVER ---
const BentoCard = ({ children, className = "", delay = 0, onClick, initial, whileInView, viewport }: { children: React.ReactNode, className?: string, delay?: number, onClick?: () => void, initial?: any, whileInView?: any, viewport?: any }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      onClick={onClick}
      initial={initial || { opacity: 0, y: 40, scale: 0.95 }}
      whileInView={whileInView || { opacity: 1, y: 0, scale: 1 }}
      viewport={viewport || { once: false, margin: "-50px" }}
      whileHover={{ scale: 0.98, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      className={`group relative rounded-3xl md:rounded-[2rem] bg-white/[0.03] border border-white/10 overflow-hidden backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] hover:border-white/20 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 group-hover:opacity-100 z-0 hidden md:block"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              500px circle at ${mouseX}px ${mouseY}px,
              rgba(255, 255, 255, 0.12),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative z-10 w-full h-full p-5 md:p-6 flex flex-col justify-center">
        {children}
      </div>
    </motion.div>
  );
};

// --- AUTOMATIC TERMINAL WIDGET ---
let terminalIdCounter = 0;

const TerminalWidget = () => {
  const [lines, setLines] = useState<{id: string, node: React.ReactNode}[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [lines]);
  
  useEffect(() => {
    let isMounted = true;
    const sequence = async () => {
      const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
      const addLine = (node: React.ReactNode) => {
        if(isMounted) setLines(prev => [...prev, { id: String(++terminalIdCounter), node }]);
      };

      while (isMounted) {
        if (isMounted) setLines([]);
        
        await wait(1000);
        addLine(<div className="text-white">&gt; whoami</div>);
        await wait(400);
        addLine(<div className="text-green-400">Hari Patel - DevOps Engineer</div>);
        
        await wait(1500);
        addLine(<div className="text-white">&gt; location</div>);
        await wait(400);
        addLine(<div className="text-green-400">Rajkot, Gujarat, India</div>);
        
        await wait(1500);
        addLine(<div className="text-white">&gt; status</div>);
        await wait(400);
        addLine(<div className="text-green-400">Ready to deploy 🚀</div>);
        
        await wait(1500);
        addLine(
          <div className="flex items-center text-white mt-4">
            <span className="mr-2 text-green-400">~%</span>
            <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-4 bg-white/50" />
          </div>
        );

        await wait(3500);
        
        if (isMounted) {
          setLines(prev => {
            const newLines = [...prev];
            newLines.pop(); // remove blinking cursor
            newLines.push({ id: String(++terminalIdCounter), node: <div className="text-white">&gt; clear</div> });
            return newLines;
          });
        }
        
        await wait(600);
      }
    };
    sequence();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="h-full flex flex-col font-mono text-xs md:text-sm">
      <div className="flex gap-1.5 md:gap-2 mb-4 items-center">
        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
        <span className="text-white/30 text-[10px] md:text-xs ml-2">root@hari-patel</span>
      </div>
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col justify-start space-y-2 mb-2 pt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <AnimatePresence>
          {lines.map((line) => (
            <motion.div 
              key={line.id} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)", transition: { duration: 0.3 } }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              {line.node}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- FAKE REALTIME CHART ---
const LiveChartWidget = () => {
  const [bars, setBars] = useState(Array(15).fill(50));
  
  useEffect(() => {
    const interval = setInterval(() => {
      setBars(prev => [...prev.slice(1), Math.floor(Math.random() * 60) + 20]);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div>
        <h3 className="text-white/50 text-[10px] md:text-sm mb-1 font-mono uppercase tracking-wider">Cluster Traffic</h3>
        <div className="text-3xl md:text-4xl font-light text-white">42,892 <span className="text-[10px] md:text-sm text-green-400">req/s</span></div>
      </div>
      <div className="flex items-end gap-0.5 md:gap-1 h-16 md:h-24 w-full mt-4">
        {bars.map((h, i) => (
          <motion.div 
            key={i}
            animate={{ height: `${h}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex-1 bg-gradient-to-t from-blue-500/20 to-blue-400/80 rounded-sm"
          />
        ))}
      </div>
    </div>
  );
};

// --- TIMELINE ITEM FOR MOBILE SCROLL EFFECTS ---
const TimelineItem = ({ exp, i }: { exp: any, i: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInCenter = useInView(ref, { margin: "-45% 0px -45% 0px" });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: i % 2 === 0 ? 50 : -50, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      viewport={{ once: false, margin: "-50px" }} // Re-trigger slide animation on scroll
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} // Smooth, elegant ease-out
      data-active={isInCenter && isMobile}
      className={`relative mb-12 md:mb-24 flex flex-col md:flex-row items-start md:items-center ${i % 2 === 0 ? 'md:flex-row-reverse' : ''} cursor-crosshair group/exp`}
    >
      {/* Invisible center tracker for mobile active state */}
      <div ref={ref} className="absolute top-1/2 left-0 w-full h-1 pointer-events-none" />
      {/* Node */}
      <div className="absolute left-[-5px] md:left-1/2 top-1.5 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-10 flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className={`w-2.5 h-2.5 md:w-4 md:h-4 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,1)] border-2 border-black transition-all duration-300 relative z-10 ${exp.nodeColor}`}
        ></motion.div>
        {/* Ping effect on hover */}
        <div className={`absolute w-full h-full rounded-full opacity-0 group-hover/exp:opacity-100 group-data-[active=true]/exp:opacity-100 group-hover/exp:animate-ping group-data-[active=true]/exp:animate-ping transition-opacity duration-300 ${exp.bgGlow}`} />
      </div>
      
      <div className={`w-full md:w-1/2 pl-6 md:pl-0 ${i % 2 === 0 ? 'md:pr-16 text-left md:text-right' : 'md:pl-16 text-left'} relative`} >
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-0 group-hover/exp:opacity-10 group-data-[active=true]/exp:opacity-10 blur-[60px] rounded-full pointer-events-none transition-opacity duration-500 ${exp.bgGlow}`} />
        
        {/* Terminal Style Year */}
        <div className={`font-mono text-[10px] md:text-xs text-white/50 mb-1.5 md:mb-2 transition-colors duration-300 flex items-center ${i % 2 === 0 ? 'md:justify-end' : ''}`}>
          <span className="opacity-0 group-hover/exp:opacity-100 group-data-[active=true]/exp:opacity-100 text-emerald-400 transition-opacity duration-300 font-bold mr-2 hidden group-hover/exp:inline-block group-data-[active=true]/exp:inline-block">{">"}</span> 
          <span className="group-hover/exp:text-white/90 group-data-[active=true]/exp:text-white/90 group-hover/exp:tracking-wider group-data-[active=true]/exp:tracking-wider transition-all duration-300">{exp.year}</span>
          <motion.span 
            animate={{ opacity: [0, 1, 0] }} 
            transition={{ repeat: Infinity, duration: 0.8 }} 
            className="hidden group-hover/exp:inline-block group-data-[active=true]/exp:inline-block w-1.5 h-3 bg-emerald-400 ml-2 opacity-0 group-hover/exp:opacity-100 group-data-[active=true]/exp:opacity-100"
          />
        </div>
        <h3 className={`text-xl md:text-2xl font-semibold mb-1 bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent transition-all duration-300 ${exp.colorFrom} ${exp.colorTo}`}>{exp.role}</h3>
        <div className="text-sm md:text-base text-white/70 font-medium mb-3 md:mb-4 transition-colors duration-300 group-hover/exp:text-white group-data-[active=true]/exp:text-white">{exp.company}</div>
        <p className="text-white/40 leading-relaxed text-xs md:text-sm transition-colors duration-300 group-hover/exp:text-white/70 group-data-[active=true]/exp:text-white/70">{exp.desc}</p>
      </div>
    </motion.div>
  );
};

export default function BentoPortfolio() {
  useSmoothScroll();
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  
  // Auto-scroll for GitHub Calendar on mobile
  const calendarScrollRef = useRef<HTMLDivElement>(null);
  const isCalendarHovered = useRef(false);
  
  useEffect(() => {
    const container = calendarScrollRef.current;
    if (!container) return;

    let animationFrameId: number;
    let direction = 1;
    let speed = 0.6;
    let currentScroll = 0;

    const scroll = () => {
      if (container.scrollWidth > container.clientWidth && !isCalendarHovered.current) {
        // Sync our internal tracker if user manually scrolled
        if (Math.abs(currentScroll - container.scrollLeft) > 2) {
          currentScroll = container.scrollLeft;
        }
        
        currentScroll += speed * direction;
        container.scrollLeft = currentScroll;
        
        if (currentScroll >= container.scrollWidth - container.clientWidth - 1) {
          direction = -1;
        } else if (currentScroll <= 0) {
          direction = 1;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    const timeout = setTimeout(() => {
      animationFrameId = requestAnimationFrame(scroll);
    }, 3000); // Wait for entry animations

    return () => {
      clearTimeout(timeout);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Parallax values
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const yTimeline = useTransform(scrollYProgress, [0, 1], [0, -100]);

  // Staggered text for hero
  const heroText = "Architecting scalable, self-healing cloud infrastructure.".split(" ");

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden selection:bg-white selection:text-black">
      
      {/* Scroll Progress Bar */}
      <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-1 bg-white origin-left z-50 mix-blend-difference" />

      {/* Top Navbar */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-0 w-full z-40 bg-[#050505]/60 backdrop-blur-xl border-b border-white/5 py-4 px-4 md:px-12 flex justify-between items-center"
      >
        <div className="font-bold text-lg md:text-xl tracking-tighter flex items-center gap-2">
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="w-6 h-6 rounded bg-white text-black flex items-center justify-center cursor-pointer"
          >
            H
          </motion.div>
          HARI PATEL
        </div>
        <div className="hidden lg:flex gap-8 text-xs font-semibold text-white/50 uppercase tracking-widest">
          <a href="#about" className="hover:text-white transition-colors hover:tracking-[0.2em] duration-300">About</a>
          <a href="#experience" className="hover:text-white transition-colors hover:tracking-[0.2em] duration-300">Experience</a>
          <a href="#projects" className="hover:text-white transition-colors hover:tracking-[0.2em] duration-300">Projects</a>
        </div>
        <MagneticButton href="#contact" className="px-4 py-2 md:px-5 md:py-2.5 rounded-full bg-white text-black hover:bg-gray-200 transition-colors text-xs md:text-sm font-medium">
          Contact
        </MagneticButton>
      </motion.header>

      <div className="pt-24 md:pt-32 pb-0 md:pb-12 px-4 md:px-8 lg:px-12 relative z-10">
        
        {/* HERO BENTO GRID (WITH PARALLAX) */}
        <motion.section style={{ y: yHero }} id="about" className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 md:auto-rows-[220px]">
          
          <BentoCard delay={0.1} className="min-h-[320px] md:min-h-0 md:col-span-2 lg:col-span-2 md:row-span-2 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/10 via-white/[0.02] to-transparent">
            <div className="h-full flex flex-col justify-between">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white text-black flex items-center justify-center mb-6 cursor-pointer"
              >
                <Terminal className="w-6 h-6 md:w-8 md:h-8" />
              </motion.div>
              <div>
                <h1 className="text-[1.75rem] leading-[1.1] sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-4 md:mb-6 flex flex-wrap gap-2">
                  {heroText.map((word, i) => (
                    <motion.span 
                      key={i}
                      initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ delay: 0.2 + (i * 0.1), duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                  className="text-white/50 text-sm md:text-lg max-w-md mt-4"
                >
                  I'm <span className="font-semibold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]">Hari Patel</span>, a results-driven DevOps Engineer focused on reliability, observability, and efficiency. I don't just use tools—I build automated workflows that reduce toil and empower development teams to ship faster securely.
                </motion.p>
              </div>
            </div>
          </BentoCard>

          <BentoCard delay={0.2} className="min-h-[250px] md:min-h-0 md:col-span-2 lg:col-span-2 bg-[#0a0a0a]">
            <TerminalWidget />
          </BentoCard>

          <BentoCard delay={0.3} className="min-h-[180px] md:min-h-0 md:col-span-1 lg:col-span-1">
            <LiveChartWidget />
          </BentoCard>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ scale: 0.98 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="group relative rounded-3xl md:rounded-[2rem] bg-white/[0.03] border border-white/10 overflow-hidden backdrop-blur-md shadow-2xl min-h-[200px] md:min-h-0 md:col-span-1 lg:col-span-1 flex flex-col items-center justify-center cursor-pointer"
          >
            <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-center bg-no-repeat bg-cover opacity-20 filter invert group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative flex items-center justify-center">
                 <div className="absolute w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500/20 animate-ping" />
                 <MapPin className="text-blue-400 w-6 h-6 md:w-8 md:h-8 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
              </div>
              <span className="mt-2 md:mt-4 font-mono text-xs md:text-sm tracking-widest text-blue-300">Rajkot, IN</span>
            </div>
          </motion.div>

          <BentoCard delay={0.5} className="min-h-[180px] md:min-h-0 md:col-span-2 lg:col-span-2 overflow-hidden">
            <h3 className="text-white/50 text-[10px] md:text-sm mb-2 md:mb-3 font-mono uppercase tracking-wider text-center md:text-left">Tech Arsenal</h3>
            <div className="grid grid-cols-4 md:grid-cols-4 gap-y-2 md:gap-y-4 gap-x-2 md:gap-8 justify-items-center">
              {[
                { icon: Cloud, name: "AWS", color: "group-hover/tech:text-[#FF9900]", glow: "group-hover/tech:drop-shadow-[0_0_15px_rgba(255,153,0,0.6)]" },
                { icon: Server, name: "K8s", color: "group-hover/tech:text-[#326CE5]", glow: "group-hover/tech:drop-shadow-[0_0_15px_rgba(50,108,229,0.6)]" },
                { icon: Database, name: "Terraform", color: "group-hover/tech:text-[#7B42BC]", glow: "group-hover/tech:drop-shadow-[0_0_15px_rgba(123,66,188,0.6)]" },
                { icon: Shield, name: "Security", color: "group-hover/tech:text-red-500", glow: "group-hover/tech:drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]" },
                { icon: Activity, name: "Grafana", color: "group-hover/tech:text-[#F46800]", glow: "group-hover/tech:drop-shadow-[0_0_15px_rgba(244,104,0,0.6)]" },
                { icon: Code2, name: "CI/CD", color: "group-hover/tech:text-emerald-400", glow: "group-hover/tech:drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]" },
                { icon: Box, name: "Docker", color: "group-hover/tech:text-[#2496ED]", glow: "group-hover/tech:drop-shadow-[0_0_15px_rgba(36,150,237,0.6)]" },
                { icon: Network, name: "Nginx", color: "group-hover/tech:text-[#009639]", glow: "group-hover/tech:drop-shadow-[0_0_15px_rgba(0,150,57,0.6)]" }
              ].map((tech, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center gap-1.5 md:gap-2 group/tech cursor-pointer"
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 3, delay: i * 0.2, ease: "easeInOut" }}
                    className="flex flex-col items-center gap-1.5 md:gap-2"
                  >
                    <tech.icon className={`w-6 h-6 md:w-8 md:h-8 text-white/40 transition-all duration-300 ${tech.color} ${tech.glow}`} />
                    <span className={`text-[10px] uppercase font-mono text-white/40 transition-colors duration-300 ${tech.color}`}>{tech.name}</span>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </BentoCard>

          <BentoCard delay={0.6} className="min-h-[120px] md:min-h-0 md:col-span-1 lg:col-span-1 bg-emerald-500/10 border-emerald-500/20">
            <div className="h-full flex flex-col justify-between">
               <div className="flex items-center justify-between">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-500/20 flex items-center justify-center"
                  >
                    <Globe className="text-emerald-400 w-4 h-4 md:w-5 md:h-5" />
                  </motion.div>
                  <div className="px-2 py-1 md:px-3 md:py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] md:text-xs font-mono font-bold flex items-center gap-1.5 md:gap-2">
                     <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                     AVAILABLE
                  </div>
               </div>
               <div className="mt-4 md:mt-0">
                  <h3 className="text-sm md:text-lg font-semibold text-white">Open to Work</h3>
                  <p className="text-emerald-400/80 text-xs md:text-sm mt-0.5 md:mt-1">Actively looking for roles.</p>
               </div>
            </div>
          </BentoCard>

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-[120px] md:min-h-0 md:col-span-1 lg:col-span-1 flex rounded-3xl md:rounded-[2rem] bg-white/[0.03] border border-white/10 overflow-hidden backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
          >
            <div 
              onClick={() => window.open('https://github.com/hkPateL26', '_blank')}
              className="flex-1 border-r border-white/10 flex flex-col items-center justify-center hover:bg-white/5 transition-colors group cursor-pointer"
            >
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="flex flex-col items-center"
              >
                <GitBranch className="w-8 h-8 md:w-12 md:h-12 text-white/40 group-hover:text-white group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-all duration-300 mb-2" />
                <span className="text-[10px] md:text-xs font-semibold tracking-widest uppercase text-white/40 group-hover:text-white transition-colors duration-300">GitHub</span>
              </motion.div>
            </div>
            <div 
              onClick={() => window.open('https://www.linkedin.com/in/hari-patel2h6/', '_blank')}
              className="flex-1 flex flex-col items-center justify-center hover:bg-[#0077b5]/10 transition-colors group cursor-pointer"
            >
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 4, delay: 2, ease: "easeInOut" }}
                className="flex flex-col items-center"
              >
                <Link className="w-8 h-8 md:w-12 md:h-12 text-white/40 group-hover:text-[#0077b5] group-hover:drop-shadow-[0_0_15px_rgba(0,119,181,0.6)] transition-all duration-300 mb-2" />
                <span className="text-[10px] md:text-xs font-semibold tracking-widest uppercase text-white/40 group-hover:text-[#0077b5] transition-colors duration-300">LinkedIn</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.section>

        {/* EXPERIENCE TIMELINE (WITH PARALLAX) */}
        <motion.section id="experience" className="max-w-4xl mx-auto mt-16 relative z-20">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-2 md:mb-4 tracking-tight">Experience & Education</h2>
            <p className="text-sm md:text-base text-white/50">My academic and professional journey.</p>
          </div>

          <div className="relative border-l border-white/10 ml-4 md:ml-0 md:border-none">
            {/* Center pipeline for Desktop */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2 overflow-hidden">
              <motion.div 
                initial={{ height: 0 }}
                whileInView={{ height: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="w-full h-full bg-gradient-to-b from-white/30 to-transparent origin-top"
              />
              <motion.div 
                animate={{ y: ["-100vh", "100vh"] }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="absolute top-0 w-[3px] -ml-[1px] h-32 bg-gradient-to-b from-transparent via-emerald-400 to-transparent blur-[2px]"
              />
              <motion.div 
                animate={{ y: ["-100vh", "100vh"] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "linear", delay: 1.5 }}
                className="absolute top-0 w-[3px] -ml-[1px] h-20 bg-gradient-to-b from-transparent via-blue-400 to-transparent blur-[2px]"
              />
            </div>
            
            {[
              { year: "APRIL 2026 - PRESENT", role: "DevOps Engineer", company: "Shreeji i-Tech // Rajkot, Gujarat", desc: "Architecting and maintaining cloud infrastructure. Automating CI/CD pipelines to streamline deployments, managing containerized applications, and ensuring high availability for critical services.", colorFrom: "group-hover/exp:from-emerald-400 group-data-[active=true]/exp:from-emerald-400", colorTo: "group-hover/exp:to-emerald-200 group-data-[active=true]/exp:to-emerald-200", nodeColor: "group-hover/exp:bg-emerald-400 group-data-[active=true]/exp:bg-emerald-400 group-hover/exp:shadow-[0_0_20px_rgba(52,211,153,1)] group-data-[active=true]/exp:shadow-[0_0_20px_rgba(52,211,153,1)] group-hover/exp:border-emerald-200 group-data-[active=true]/exp:border-emerald-200", bgGlow: "bg-emerald-500" },
              { year: "2026 - PRESENT", role: "Master of Computer Applications (MCA)", company: "IGNOU", desc: "Pursuing advanced studies with a specialized focus on DevOps, cloud computing, and modern CI/CD architectures.", colorFrom: "group-hover/exp:from-blue-400 group-data-[active=true]/exp:from-blue-400", colorTo: "group-hover/exp:to-blue-200 group-data-[active=true]/exp:to-blue-200", nodeColor: "group-hover/exp:bg-blue-400 group-data-[active=true]/exp:bg-blue-400 group-hover/exp:shadow-[0_0_20px_rgba(96,165,250,1)] group-data-[active=true]/exp:shadow-[0_0_20px_rgba(96,165,250,1)] group-hover/exp:border-blue-200 group-data-[active=true]/exp:border-blue-200", bgGlow: "bg-blue-500" },
              { year: "JANUARY 2026 - MARCH 2026", role: "AI / ML Developer Intern", company: "Shreeji i-Tech // Rajkot, Gujarat", desc: "Worked on building scalable web applications using Next.js and FastAPI. Managed real-time data with Supabase and optimized image assets via Cloudinary.", colorFrom: "group-hover/exp:from-purple-400 group-data-[active=true]/exp:from-purple-400", colorTo: "group-hover/exp:to-purple-200 group-data-[active=true]/exp:to-purple-200", nodeColor: "group-hover/exp:bg-purple-400 group-data-[active=true]/exp:bg-purple-400 group-hover/exp:shadow-[0_0_20px_rgba(192,132,252,1)] group-data-[active=true]/exp:shadow-[0_0_20px_rgba(192,132,252,1)] group-hover/exp:border-purple-200 group-data-[active=true]/exp:border-purple-200", bgGlow: "bg-purple-500" },
              { year: "2022 - 2026", role: "Bachelor of Computer Science", company: "Saurashtra University // Rajkot, Gujarat", desc: "Focusing on Advanced Web Technologies, Database Management, and Software Engineering. Consistently maintaining a strong CGPA and participating in various tech fests.", colorFrom: "group-hover/exp:from-orange-400 group-data-[active=true]/exp:from-orange-400", colorTo: "group-hover/exp:to-orange-200 group-data-[active=true]/exp:to-orange-200", nodeColor: "group-hover/exp:bg-orange-400 group-data-[active=true]/exp:bg-orange-400 group-hover/exp:shadow-[0_0_20px_rgba(251,146,60,1)] group-data-[active=true]/exp:shadow-[0_0_20px_rgba(251,146,60,1)] group-hover/exp:border-orange-200 group-data-[active=true]/exp:border-orange-200", bgGlow: "bg-orange-500" }
            ].map((exp, i) => (
              <TimelineItem key={i} exp={exp} i={i} />
            ))}
          </div>
        </motion.section>

        {/* GITHUB CALENDAR SECTION */}
        <section className="max-w-5xl mx-auto mt-6 md:mt-16 relative z-30 px-4 sm:px-6 md:px-0">
          <div className="mb-8 border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <GitBranch className="w-8 h-8 text-emerald-400" />
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-2 tracking-tight">Open Source Activity</h2>
                <p className="text-sm md:text-base text-white/50">My real-time GitHub contribution telemetry.</p>
              </div>
            </div>
            
            {/* Live Indicator */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-fit">
              <div className="relative flex items-center justify-center w-2 h-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 relative z-10"></div>
              </div>
              <span className="text-emerald-400 text-xs font-mono font-semibold tracking-wider">LIVE SYNC</span>
            </div>
          </div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0, y: 50, filter: "blur(10px)" },
              visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } }
            }}
            className="relative group"
          >
            {/* Animated Glow Behind */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-emerald-500/20 rounded-[32px] blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-1000" />
            
            {/* Dashboard Container */}
            <div className="relative p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-[32px] bg-[#0A0A0A]/90 border border-white/10 backdrop-blur-xl overflow-hidden">
              
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-8 border-b border-white/5 pb-4 group/header">
                 <div className="flex gap-1.5 sm:gap-2">
                   <motion.div whileHover={{ scale: 1.5 }} className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/80 cursor-pointer"></motion.div>
                   <motion.div whileHover={{ scale: 1.5 }} className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80 cursor-pointer"></motion.div>
                   <motion.div whileHover={{ scale: 1.5 }} className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/80 cursor-pointer"></motion.div>
                 </div>
                 <div className="font-mono text-[8px] sm:text-[10px] md:text-xs text-white/30 flex items-center gap-1 sm:gap-2 group-hover/header:text-emerald-400 transition-colors duration-300">
                   <Activity className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-emerald-500 group-hover/header:animate-spin" />
                   <span className="typing-effect">
                     github.com/hkPateL26
                   </span>
                 </div>
              </div>

              {/* Floating Particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: ["100%", "-100%"],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: (i % 3) * 2 + 5,
                      repeat: Infinity,
                      ease: "linear",
                      delay: (i % 5) * 1.5,
                    }}
                    className="absolute w-1 h-1 bg-emerald-500/50 rounded-full"
                    style={{ left: `${(i * 20 + 10)}%` }}
                  />
                ))}
              </div>

              {/* Grid Background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

              {/* Scanning Laser */}
              <motion.div 
                animate={{ y: ["0%", "300%", "0%"] }}
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                className="absolute left-0 right-0 top-0 h-32 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent pointer-events-none z-0"
              />

              {/* Calendar Wrapper */}
              <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                  display: none;
                }
                .hide-scrollbar {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
                @keyframes typing {
                  from { max-width: 0 }
                  to { max-width: 100% }
                }
                @keyframes blink-caret {
                  from, to { border-color: transparent }
                  50% { border-color: #10b981; }
                }
                .typing-effect {
                  display: inline-block;
                  overflow: hidden;
                  white-space: nowrap;
                  border-right: 2px solid #10b981;
                  animation: typing 3.5s steps(30, end) infinite, blink-caret 0.75s step-end infinite;
                }
              `}</style>
              <div 
                ref={calendarScrollRef}
                onMouseEnter={() => isCalendarHovered.current = true}
                onMouseLeave={() => isCalendarHovered.current = false}
                onTouchStart={() => isCalendarHovered.current = true}
                onTouchEnd={() => {
                   // Short delay before resuming auto-scroll after touch
                   setTimeout(() => isCalendarHovered.current = false, 1500);
                }}
                className="overflow-x-auto hide-scrollbar flex justify-start md:justify-center relative z-10 w-full pb-4"
              >
                <div className="min-w-fit transform transition-transform duration-500 group-hover:scale-[1.01] px-1 sm:px-4 md:px-8">
                  <GitHubCalendar 
                    username="hkPateL26" 
                    colorScheme="dark" 
                    blockSize={15}
                    blockMargin={5}
                    fontSize={14}
                    theme={{
                      light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
                      dark: ['#161b22', '#064e3b', '#065f46', '#059669', '#10b981'],
                    }}
                    renderBlock={(block, activity) => {
                      // Deterministic pseudo-random delay based on the date string
                      const pseudoRandom = (activity.date.charCodeAt(activity.date.length - 1) * activity.date.charCodeAt(activity.date.length - 2) * 17) % 1500 / 1000;
                      
                      return (
                        <motion.rect
                          {...(block.props as any)}
                          key={activity.date}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: false, margin: "20px" }}
                          transition={{
                            duration: 0.4,
                            delay: pseudoRandom * 0.5, // Faster delay so it doesn't stay hidden long when scrolling
                            ease: "backOut"
                          }}
                          className={`${block.props.className} hover:stroke-emerald-400 hover:stroke-2 hover:z-50 transition-all duration-200 cursor-crosshair`}
                        />
                      );
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* DETAILED PROJECTS SECTION */}
        <section id="projects" className="max-w-7xl mx-auto mt-6 md:mt-16 relative z-30 bg-[#050505]">
          <div className="mb-8 md:mb-12 flex flex-col justify-start border-b border-white/10 pb-4 md:pb-6 gap-3 md:gap-0 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-2 md:mb-4 tracking-tight">Featured Deployments</h2>
                <p className="text-sm md:text-base text-white/50">Large-scale systems I've built and maintained.</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 text-[10px] uppercase font-mono tracking-widest font-bold">Live Pipelines</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {[
              {
                title: "Enterprise CI/CD Infrastructure",
                tech: ["GitHub Actions", "Docker", "CI/CD", "Ubuntu"],
                desc: "Replaced manual server deployments with a fully automated GitOps pipeline. Achieved zero-touch deployments where developer commits instantly trigger builds, testing, and live server updates, drastically reducing time-to-market.",
                metrics: "Zero-Touch Deploy • 80% Faster",
                link: "https://shreejiitech.com/"
              },
              {
                title: "Automated Deployment for Healthcare",
                tech: ["Docker", "CI/CD", "Automation", "APIs"],
                desc: "Containerized the frontend, admin, and backend APIs for a critical blood donation platform. Configured automated delivery pipelines ensuring seamless production updates without manual server intervention or downtime.",
                metrics: "Zero Downtime • High Availability",
                link: "https://eraktsetu.org/"
              },
              {
                title: "Containerized Web Services Pipeline",
                tech: ["GitHub Actions", "Docker Compose", "GitOps"],
                desc: "Engineered robust CI/CD workflows for the Croplify AgriTech platform. Handled multiple environments (Admin, API, Frontend) by implementing continuous delivery practices, eliminating manual SSH pulls and mitigating deployment errors.",
                metrics: "100% Automated • Error-Free",
                link: "https://croplify.shreejiitech.com/"
              },
              {
                title: "Continuous Delivery for Internal Tools",
                tech: ["CD Automation", "Docker", "Shell Scripting"],
                desc: "Designed and maintained automated pipelines for internal corporate operating systems. Ensured strict parity between local development and production environments through Dockerized artifacts and automated push-to-deploy workflows.",
                metrics: "Dev/Prod Parity • Instant Sync",
                link: "https://cos.shreejiitech.com/"
              }
            ].map((proj, i) => (
              <BentoCard 
                key={i} 
                delay={0.1 * i} 
                onClick={() => window.open(proj.link, '_blank')} 
                initial={{ opacity: 0, x: i % 2 === 0 ? -100 : 100, rotateY: i % 2 === 0 ? -30 : 30, filter: "blur(20px)", scale: 0.8 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0, filter: "blur(0px)", scale: 1 }}
                className="group cursor-pointer relative overflow-hidden"
              >
                {/* Live CI/CD Pipeline Scanning Animation */}
                <motion.div 
                  className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent skew-x-12 z-0 pointer-events-none"
                  animate={{ x: ["-100%", "50%"] }}
                  transition={{ repeat: Infinity, duration: 4 + i, ease: "linear", delay: i * 0.5 }}
                />
                
                <div className="flex flex-col h-full justify-between relative z-10">
                  <div>
                    <div className="flex gap-2 mb-4 md:mb-6 flex-wrap">
                      {proj.tech.map((t, idx) => (
                        <motion.span 
                          key={idx} 
                          animate={{ y: [0, -2, 0] }}
                          transition={{ repeat: Infinity, duration: 2.5, delay: idx * 0.15, ease: "easeInOut" }}
                          className="px-2 py-1 md:px-3 md:py-1 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-xs font-mono text-white/70"
                        >
                          {t}
                        </motion.span>
                      ))}
                    </div>
                    <motion.h3 
                      className="text-xl md:text-3xl font-semibold text-white mb-3 md:mb-4 group-hover:translate-x-2 transition-transform duration-300"
                    >
                      {proj.title}
                    </motion.h3>
                    <p className="text-white/50 leading-relaxed mb-6 md:mb-8 text-xs md:text-base">{proj.desc}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 md:pt-6 border-t border-white/10 gap-4 sm:gap-0">
                    <div className="flex items-center gap-2 text-green-400 font-mono text-[10px] md:text-xs">
                      <Activity className="w-3 h-3 md:w-3.5 md:h-3.5" /> {proj.metrics}
                    </div>
                    <motion.div 
                      whileHover={{ scale: 1.2, rotate: 45 }}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors self-start sm:self-auto"
                    >
                      <ArrowUpRight className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                    </motion.div>
                  </div>
                </div>
              </BentoCard>
            ))}
          </div>
        </section>

        {/* OBSERVABILITY & MONITORING SECTION */}
        <section className="max-w-7xl mx-auto mt-6 md:mt-16 relative z-30 px-4 md:px-0">
          <div className="mb-8 border-b border-white/10 pb-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-2 tracking-tight">Observability & Monitoring</h2>
            <p className="text-sm md:text-base text-white/50">Real-time telemetry and dashboarding with Grafana & Prometheus.</p>
          </div>

          <BentoCard className="overflow-hidden group border-white/10" initial={{ opacity: 0, y: 50, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }}>
            <div className="flex flex-col lg:flex-row min-h-[400px] gap-8 lg:gap-12">
              
              {/* Left Side: Text and Skills */}
              <div className="lg:w-1/3 flex flex-col justify-center relative z-10">
                <Activity className="w-8 h-8 md:w-10 md:h-10 text-emerald-400 mb-4 md:mb-6" />
                <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-white">Eyes on the Infrastructure</h3>
                <p className="text-white/50 text-sm md:text-base leading-relaxed mb-8">
                  Configuring robust monitoring stacks is critical for DevOps. I build centralized, real-time dashboards using Grafana and Prometheus to track cluster health, analyze metrics, and set up automated anomaly detection alerts.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Grafana", "Prometheus", "Alertmanager"].map(tech => (
                    <span key={tech} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/70">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Side: Fake Grafana Dashboard */}
              <div className="lg:w-2/3 relative flex items-center justify-center">
                <div className="w-full bg-[#050505] rounded-2xl border border-white/10 relative overflow-hidden flex flex-col gap-3 md:gap-6 shadow-2xl p-4 md:p-6">
                  {/* Subtle Background Glow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 blur-[100px] pointer-events-none" />

                  {/* Background Grid Pattern */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                
                {/* Dashboard Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-3 relative z-10 border-b border-white/10 pb-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-white/70 font-mono text-[11px] md:text-sm font-semibold">
                       <Activity className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-400" />
                       US-EAST-CLUSTER
                    </div>
                    <div className="text-white/40 font-mono text-[9px] md:text-xs flex items-center gap-2">
                       <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-emerald-500"></span>
                       </span>
                       LIVE TELEMETRY ACTIVE
                    </div>
                  </div>
                  <div className="text-white/30 font-mono text-[9px] md:text-xs bg-white/5 px-2 py-1 rounded">Grafana v10.2</div>
                </div>

                {/* Dashboard Widgets */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 relative z-10">
                  {/* Widget 1 */}
                  <div className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 rounded-lg p-2.5 md:p-4 flex flex-col justify-between h-[70px] md:h-[90px] shadow-lg">
                    <span className="text-white/40 text-[7px] md:text-[10px] uppercase font-mono tracking-wider">CPU Usage</span>
                    <div className="flex items-end justify-between">
                       <span className="text-base md:text-2xl font-semibold text-white">24<span className="text-[10px] md:text-sm text-white/50">%</span></span>
                       <span className="text-[8px] md:text-[10px] text-emerald-400 font-mono">Stable</span>
                    </div>
                  </div>
                  {/* Widget 2 */}
                  <div className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 rounded-lg p-2.5 md:p-4 flex flex-col justify-between h-[70px] md:h-[90px] shadow-lg">
                    <span className="text-white/40 text-[7px] md:text-[10px] uppercase font-mono tracking-wider">Memory</span>
                    <div className="flex items-end justify-between">
                       <span className="text-base md:text-2xl font-semibold text-white">4.2<span className="text-[10px] md:text-sm text-white/50">GB</span></span>
                       <span className="text-[8px] md:text-[10px] text-emerald-400 font-mono">32%</span>
                    </div>
                  </div>
                  {/* Widget 3 */}
                  <div className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 rounded-lg p-2.5 md:p-4 flex flex-col justify-between h-[70px] md:h-[90px] shadow-lg">
                    <span className="text-white/40 text-[7px] md:text-[10px] uppercase font-mono tracking-wider">Active Nodes</span>
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-base md:text-2xl font-semibold text-white">16</span>
                        <span className="text-[8px] md:text-xs text-white/30">/ 16</span>
                      </div>
                      <span className="text-[8px] md:text-[10px] text-emerald-400 font-mono">Online</span>
                    </div>
                  </div>
                  {/* Widget 4 */}
                  <div className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 rounded-lg p-2.5 md:p-4 flex flex-col justify-between h-[70px] md:h-[90px] shadow-lg">
                    <span className="text-white/40 text-[7px] md:text-[10px] uppercase font-mono tracking-wider">Error Rate</span>
                    <div className="flex items-end justify-between">
                       <span className="text-base md:text-2xl font-semibold text-white">0.0<span className="text-[10px] md:text-sm text-white/50">%</span></span>
                       <span className="text-[8px] md:text-[10px] text-emerald-400 font-mono">OK</span>
                    </div>
                  </div>
                </div>

                {/* Main Chart Area */}
                <div className="w-full bg-gradient-to-b from-white/[0.02] to-transparent border border-white/10 rounded-lg p-3 md:p-4 relative z-10 shadow-lg mt-1">
                  <div className="flex justify-between items-center mb-4 relative z-10">
                    <span className="text-white/50 text-[10px] uppercase font-mono tracking-wider flex items-center gap-2">
                      <Zap className="w-3 h-3 text-emerald-400" /> Network Traffic (Req/sec)
                    </span>
                  </div>
                  
                  {/* High Density Thin Bar Chart */}
                  <div className="w-full flex items-end gap-[2px] md:gap-[3px] px-1 pb-1 overflow-hidden h-[80px] md:h-[120px]">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <motion.div 
                        key={i}
                        className="flex-1 bg-emerald-500/20 rounded-t-[1px] relative overflow-hidden"
                        initial={{ height: "10%" }}
                        animate={{ height: [`${(i * 13) % 20 + 10}%`, `${(i * 27) % 70 + 30}%`, `${(i * 13) % 20 + 10}%`] }}
                        transition={{ repeat: Infinity, duration: 1.5 + (i % 5) * 0.2, ease: "easeInOut", delay: (i % 10) * 0.05 }}
                      >
                         {/* Bright top cap */}
                         <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
                      </motion.div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
            </div>
          </BentoCard>
        </section>

        {/* DEVSECOPS SECTION */}
        <section className="max-w-7xl mx-auto mt-6 md:mt-16 relative z-30 px-4 md:px-0">
          <div className="mb-8 border-b border-white/10 pb-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-2 tracking-tight">Security & DevSecOps</h2>
            <p className="text-sm md:text-base text-white/50">Proactive threat mitigation and secure pipelines.</p>
          </div>

          <BentoCard className="overflow-hidden group border-white/10" initial={{ opacity: 0, y: 50, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }}>
            <div className="flex flex-col lg:flex-row min-h-[400px] gap-8 lg:gap-12">
              
              {/* Left Side: Text and Skills */}
              <div className="lg:w-1/3 flex flex-col justify-center relative z-10">
                <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="w-fit">
                  <Shield className="w-8 h-8 md:w-10 md:h-10 text-red-500 mb-4 md:mb-6" />
                </motion.div>
                <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-white">Fortified Pipelines</h3>
                <p className="text-white/50 text-sm md:text-base leading-relaxed mb-8">
                  Security isn't an afterthought. I integrate automated vulnerability scanning directly into the CI/CD pipeline, ensuring container images and code dependencies are continuously audited. Combined with Zero Trust principles and secure secret management, I prevent threats before they reach production.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Trivy", "SonarQube", "Vault", "IAM"].map(tech => (
                    <span key={tech} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/70">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Side: Visual */}
              <div className="lg:w-2/3 relative flex items-center justify-center">
                <div className="w-full bg-[#050505] rounded-2xl border border-red-500/20 relative overflow-hidden flex flex-col shadow-[0_0_50px_rgba(239,68,68,0.05)] p-4 md:p-6 hover:border-red-500/40 transition-colors duration-500">
                  
                  {/* Scanning Laser Line */}
                  <motion.div 
                    className="absolute left-0 w-full h-[1px] bg-red-500/50 shadow-[0_0_15px_rgba(239,68,68,1)] z-30 pointer-events-none"
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  />

                  {/* Subtle Background Glow */}
                  <motion.div 
                    animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.8, 1.2, 0.8] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/10 blur-[100px] pointer-events-none" 
                  />
                  
                  {/* Grid */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                  {/* Header */}
                  <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4 md:mb-6 relative z-10">
                    <div className="flex items-center gap-2 text-white/80 font-mono text-xs md:text-sm">
                      <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        <Shield className="w-4 h-4 text-red-500" />
                      </motion.div>
                      SECURITY_AUDIT_REPORT
                    </div>
                    <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="text-[10px] font-mono text-red-400 bg-red-500/10 px-2 py-1 rounded">Scanning...</motion.div>
                  </div>

                  {/* Scan Results */}
                  <div className="flex flex-col gap-3 relative z-10 mb-4 md:mb-6">
                    <div className="bg-white/[0.02] border border-white/5 rounded p-3 flex justify-between items-center group-hover:bg-white/[0.04] transition-colors relative overflow-hidden">
                      <motion.div className="absolute left-0 top-0 bottom-0 bg-red-500/10 z-0" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
                      <span className="text-xs md:text-sm text-white/60 font-mono flex items-center gap-2 relative z-10"><span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]"></span> CRITICAL</span>
                      <span className="font-mono text-sm font-bold text-white relative z-10">0</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded p-3 flex justify-between items-center group-hover:bg-white/[0.04] transition-colors relative overflow-hidden">
                      <motion.div className="absolute left-0 top-0 bottom-0 bg-orange-500/10 z-0" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }} />
                      <span className="text-xs md:text-sm text-white/60 font-mono flex items-center gap-2 relative z-10"><span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,1)]"></span> HIGH</span>
                      <span className="font-mono text-sm font-bold text-white relative z-10">0</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded p-3 flex justify-between items-center group-hover:bg-white/[0.04] transition-colors relative overflow-hidden">
                      <motion.div className="absolute left-0 top-0 bottom-0 bg-yellow-500/10 z-0" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
                      <span className="text-xs md:text-sm text-white/60 font-mono flex items-center gap-2 relative z-10"><span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,1)]"></span> MEDIUM</span>
                      <span className="font-mono text-sm font-bold text-white relative z-10">2</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mt-auto pt-4 border-t border-white/10 relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                       <span className="text-[10px] md:text-xs font-mono text-green-400 tracking-wider">PASSED: DEPLOYMENT SECURE</span>
                    </div>
                    <Shield className="w-4 h-4 md:w-5 md:h-5 text-green-500/50" />
                  </div>

                </div>
              </div>

            </div>
          </BentoCard>
        </section>

      </div>

      {/* FOOTER / CONTACT */}
      <footer id="contact" className="border-t border-white/10 bg-[#020202] pt-8 md:pt-16 pb-8 md:pb-12 px-6 relative overflow-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-white/[0.02] rounded-[100%] blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter mb-4 md:mb-8"
          >
            Ready to scale?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-white/50 text-sm md:text-xl mb-8 md:mb-12 px-4"
          >
            I'm currently open for new opportunities. Let's build something robust together.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-2 md:flex md:flex-wrap justify-center gap-3 md:gap-6 mb-6 md:mb-12 px-4 w-full max-w-3xl mx-auto"
          >
            <MagneticButton href="mailto:haripatel267998@gmail.com" className="col-span-2 md:col-span-1 w-full md:w-auto px-4 py-3 md:px-8 md:py-4 rounded-full bg-white text-black font-semibold hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-shadow flex items-center justify-center gap-2 text-sm md:text-base">
              <Mail className="w-4 h-4 md:w-5 md:h-5" /> Get In Touch
            </MagneticButton>
            <MagneticButton href="https://wa.me/919974442291" target="_blank" className="w-full md:w-auto px-2 py-3 md:px-8 md:py-4 rounded-full border border-green-500/30 text-green-400 font-semibold hover:bg-green-500/10 transition-colors flex items-center justify-center gap-1.5 md:gap-2 text-xs sm:text-sm md:text-base">
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5" /> WhatsApp
            </MagneticButton>
            <MagneticButton href="/hari-patel-resume.pdf" target="_blank" className="w-full md:w-auto px-2 py-3 md:px-8 md:py-4 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5 md:gap-2 text-xs sm:text-sm md:text-base">
              <FileText className="w-4 h-4 md:w-5 md:h-5" /> Resume
            </MagneticButton>
            <MagneticButton href="https://www.linkedin.com/in/hari-patel2h6/" target="_blank" className="w-full md:w-auto px-2 py-3 md:px-8 md:py-4 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5 md:gap-2 text-xs sm:text-sm md:text-base">
              <Link className="w-4 h-4 md:w-5 md:h-5" /> LinkedIn
            </MagneticButton>
            <MagneticButton href="https://github.com/hkPateL26" target="_blank" className="w-full md:w-auto px-2 py-3 md:px-8 md:py-4 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5 md:gap-2 text-xs sm:text-sm md:text-base">
              <GitBranch className="w-4 h-4 md:w-5 md:h-5" /> GitHub
            </MagneticButton>
          </motion.div>

          <div className="flex flex-col items-center pt-6 border-t border-white/10 text-[10px] md:text-xs font-mono text-white/30 gap-6 md:gap-8">
            
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 bg-white/5 p-4 md:px-6 md:py-3 rounded-xl border border-white/5 w-full md:w-auto">
              <div className="flex flex-col md:flex-row justify-center items-center gap-3 md:gap-6 w-full">
                <span className="flex items-center justify-center gap-1.5 whitespace-nowrap"><Cloud className="w-3 h-3 text-blue-400" /> REGION: US-EAST-1</span>
                <span className="flex items-center justify-center gap-1.5 whitespace-nowrap"><Zap className="w-3 h-3 text-yellow-400" /> UPTIME: 99.99%</span>
                <span className="flex items-center justify-center gap-1.5 whitespace-nowrap"><GitBranch className="w-3 h-3 text-orange-400" /> CI/CD: GITHUB ACTIONS</span>
              </div>
              
              {/* Responsive Divider */}
              <div className="hidden md:block w-px h-4 bg-white/20" />
              <div className="md:hidden w-full h-px bg-white/10 my-2" />
              
              <div className="flex justify-center items-center gap-2 whitespace-nowrap w-full md:w-auto">
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" 
                /> 
                <span className="text-green-400 font-semibold tracking-wider">SYSTEM ONLINE</span>
              </div>
            </div>

            <div className="text-center opacity-50 uppercase tracking-widest text-[9px] md:text-xs leading-relaxed">
              © {new Date().getFullYear()} HARI PATEL.<br className="md:hidden" /> ALL RIGHTS RESERVED.
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
