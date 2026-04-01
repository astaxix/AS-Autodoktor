import { motion, AnimatePresence } from "motion/react";
import { Phone, MapPin, Clock, CheckCircle2, ChevronRight, Menu, X, Droplets, Disc, Gauge, ArrowUp, Loader2, Mail } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface AiImageProps {
  prompt: string;
  alt: string;
  className?: string;
  fallbackSeed?: string;
}

function AiImage({ prompt, alt, className, fallbackSeed }: AiImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    async function generateImage() {
      if (!process.env.GEMINI_API_KEY) {
        if (isMounted) setIsGenerating(false);
        return;
      }

      try {
        // Create instance inside effect to ensure fresh key access
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: "16:9",
            }
          }
        });

        const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (part?.inlineData?.data && isMounted) {
          setImageUrl(`data:image/png;base64,${part.inlineData.data}`);
        }
      } catch (err) {
        console.error("AI Image Generation failed:", err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setIsGenerating(false);
      }
    }

    generateImage();
    return () => { isMounted = false; };
  }, [prompt]);

  const fallbackUrl = `https://picsum.photos/seed/${fallbackSeed || 'workshop'}/1920/1080`;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Base Fallback Image - Always visible initially */}
      <img
        src={fallbackUrl}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        referrerPolicy="no-referrer"
      />
      
      {/* AI Generated Image - Fades in on top */}
      <AnimatePresence>
        {imageUrl && (
          <motion.img
            key="ai-image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            src={imageUrl}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover z-10"
          />
        )}
      </AnimatePresence>

      {/* Subtle loading indicator in the corner */}
      {isGenerating && !imageUrl && !error && (
        <div className="absolute bottom-4 right-4 z-20 opacity-30">
          <Loader2 className="w-4 h-4 text-brand-orange animate-spin" />
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isImpressumOpen, setIsImpressumOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Prevent browser scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    
    // Extra safety scroll
    setTimeout(() => window.scrollTo(0, 0), 10);
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      setShowScrollTop(currentScrollY > 500);
      setIsScrolled(currentScrollY > 20);

      // Header visibility logic: Show immediately on scroll up, hide on scroll down
      if (currentScrollY <= 0) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // Scrolling down and past header height
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show immediately
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    
    const handleLoad = () => {
      window.scrollTo(0, 0);
      setTimeout(() => window.scrollTo(0, 0), 50);
    };
    window.addEventListener('load', handleLoad);
    
    // Simple preloader timer
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Force scroll to top when preloader is removed
      window.scrollTo(0, 0);
      // Wait a tiny bit for the preloader to start fading, then enable smooth scroll
      setTimeout(() => {
        document.documentElement.classList.add('is-ready');
      }, 100);
    }, 1800);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      window.scrollTo(0, 0);
      // Extra safety
      setTimeout(() => window.scrollTo(0, 0), 100);
    }
  }, [isLoading]);

  const services = [
    {
      title: "Reifenservice",
      description: "Wechsel, Wuchten und Einlagerung Ihrer Reifen mit modernster Technik.",
      icon: <Disc className="w-8 h-8 text-brand-orange" />,
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Ölwechsel",
      description: "Schneller und sauberer Ölwechsel mit Qualitätsölen für langlebige Motoren.",
      icon: <Droplets className="w-8 h-8 text-brand-orange" />,
      image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "Check-up",
      description: "Sicherheitscheck für Ihr Fahrzeug, damit Sie immer sicher ans Ziel kommen.",
      icon: <Gauge className="w-8 h-8 text-brand-orange" />,
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800"
    },
  ];

  const benefits = [
    { title: "Schneller Service", desc: "Keine langen Wartezeiten. Wir arbeiten effizient." },
    { title: "Zuverlässige Arbeit", desc: "Präzision und Sorgfalt bei jedem Handgriff." },
    { title: "Faire Preise", desc: "Transparente Kosten ohne versteckte Gebühren." },
  ];

  return (
    <div 
      ref={mainRef}
      tabIndex={-1}
      className="min-h-screen font-sans bg-brand-black text-white selection:bg-brand-orange selection:text-brand-black outline-none"
    >
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 bg-brand-black z-[100] flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="w-16 h-16 bg-brand-orange rounded-2xl flex items-center justify-center shadow-neon animate-pulse">
                <span className="text-brand-black font-black text-2xl">AS</span>
              </div>
              <div className="h-1 w-32 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-brand-orange"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-500 bg-brand-black border-b border-white/5 ${isVisible ? 'translate-y-0' : '-translate-y-full'} ${isScrolled ? 'py-1' : 'py-2'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 bg-brand-orange rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,107,0,0.4)] transition-all">
                <span className="text-brand-black font-black text-xl">AS</span>
              </div>
              <span className="text-white font-display text-xl tracking-tighter uppercase">
                Auto<span className="text-brand-orange">doktor</span>
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-white/50 hover:text-brand-orange transition-colors uppercase text-xs font-bold tracking-[0.2em]">Leistungen</a>
              <a href="#about" className="text-white/50 hover:text-brand-orange transition-colors uppercase text-xs font-bold tracking-[0.2em]">Über Uns</a>
              <a href="#contact" className="bg-brand-orange text-brand-black px-6 py-2.5 rounded-full font-black uppercase text-xs tracking-widest hover:shadow-[0_0_20px_rgba(255,107,0,0.4)] transition-all">
                Termin vereinbaren
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden text-white p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

      {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] md:hidden bg-brand-black/98 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center"
            >
              <button 
                className="absolute top-6 right-6 text-white p-2" 
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="w-8 h-8" />
              </button>
              
              <motion.div 
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                  }
                }}
                className="space-y-8 w-full max-w-xs"
              >
                <motion.div 
                  variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
                  className="flex flex-col items-center gap-4 mb-8"
                >
                  <div className="w-16 h-16 bg-brand-orange rounded-2xl flex items-center justify-center shadow-neon">
                    <span className="text-brand-black font-black text-2xl">AS</span>
                  </div>
                  <span className="text-white font-display text-2xl tracking-tighter uppercase">
                    Auto<span className="text-brand-orange">doktor</span>
                  </span>
                </motion.div>

                {['Leistungen', 'Über Uns', 'Kontakt'].map((item, idx) => (
                  <motion.a 
                    key={item}
                    variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
                    transition={{ delay: idx * 0.1 }}
                    href={`#${item === 'Leistungen' ? 'services' : item === 'Über Uns' ? 'about' : 'contact'}`}
                    className="block text-4xl text-white font-black uppercase tracking-tighter hover:text-brand-orange transition-all duration-300 hover:translate-x-2" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </motion.a>
                ))}
                
                <motion.div 
                  variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
                  className="pt-8 border-t border-white/10"
                >
                  <a 
                    href="tel:01722804437" 
                    className="flex items-center justify-center gap-3 bg-brand-orange text-brand-black py-5 rounded-2xl font-black uppercase tracking-widest shadow-neon active:scale-95 transition-transform"
                  >
                    <Phone className="w-6 h-6" />
                    Anrufen
                  </a>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden pt-20">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0 bg-brand-black"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-brand-black/20 via-transparent to-brand-black z-10" />
          <motion.img 
            initial={{ y: 0 }}
            style={{ y: useMemo(() => typeof window !== 'undefined' ? window.scrollY * 0.4 : 0, []) }}
            src="/hero.png" 
            alt="AS Autodoktor Werkstatt" 
            className="w-full h-full object-cover object-center opacity-100"
            referrerPolicy="no-referrer"
           />
        </motion.div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 md:py-0">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-6 md:mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange"></span>
                </span>
                Jetzt Geöffnet
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-[100px] font-display font-black text-white leading-[0.9] md:leading-[0.85] tracking-tighter uppercase mb-6 md:mb-8 text-balance">
                High End <br />
                <span className="text-brand-orange neon-text">Performance</span>
              </h1>
              <p className="text-base md:text-xl text-white/50 max-w-xl mb-8 md:mb-10 font-medium leading-relaxed text-balance">
                Professioneller Reifen- und Ölservice in Bingen. 
                Wir kombinieren modernste Technik mit Leidenschaft für Ihr Fahrzeug.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                <a 
                  href="#contact" 
                  className="bg-brand-orange text-brand-black px-8 md:px-10 py-4 md:py-5 rounded-full font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-neon transition-all hover:scale-105 active:scale-95"
                >
                  Termin vereinbaren <ChevronRight className="w-5 h-5" />
                </a>
                <a 
                  href="#contact"
                  className="flex items-center justify-center gap-4 px-6 md:px-8 py-4 md:py-5 border border-white/10 rounded-full text-white/80 backdrop-blur-md hover:bg-white/5 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-brand-orange shadow-[0_0_10px_#FF6B00]" />
                  <span className="font-bold uppercase tracking-widest text-[10px] md:text-sm">Mainzer Str. 186</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-30">
          <div className="w-px h-8 md:h-12 bg-gradient-to-b from-brand-orange to-transparent" />
          <span className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-white font-bold">Scroll</span>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 md:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 md:mb-24">
            <div className="max-w-2xl">
              <h2 className="text-[10px] md:text-xs font-black text-brand-orange uppercase tracking-[0.4em] mb-4 md:mb-6">Unsere Expertise</h2>
              <p className="text-3xl sm:text-5xl md:text-7xl font-display font-black text-white tracking-tighter uppercase leading-none text-balance">
                Maximale <span className="text-brand-orange italic">Präzision</span> <br /> für Ihr Auto
              </p>
            </div>
            <p className="text-white/40 max-w-xs text-sm leading-relaxed">
              Vom Reifenwechsel bis zur Motorpflege – wir setzen auf Qualität und Schnelligkeit.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-10">
            {services.map((service, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: idx * 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="group relative p-8 md:p-12 bg-white/[0.02] border border-white/5 rounded-[2rem] md:rounded-[3rem] overflow-hidden transition-all duration-500 hover:bg-white/[0.05] hover:border-brand-orange/30 hover:-translate-y-2"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700">
                  <img src={service.image} alt="" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" />
                </div>
                <div className="relative z-10">
                  <div className="mb-6 md:mb-10 p-4 bg-white/5 w-fit rounded-2xl border border-white/10 group-hover:shadow-neon transition-all duration-500 group-hover:bg-brand-orange/10 group-hover:border-brand-orange/20">
                    {service.icon}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-display font-black uppercase mb-4 md:mb-6 tracking-tighter group-hover:text-brand-orange transition-colors duration-500">{service.title}</h3>
                  <p className="text-white/40 text-sm md:text-base leading-relaxed mb-6 md:mb-8 group-hover:text-white/60 transition-colors duration-500">
                    {service.description}
                  </p>
                  <div className="w-12 h-1 bg-white/10 group-hover:w-full group-hover:bg-brand-orange transition-all duration-700 ease-in-out" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="about" className="py-20 md:py-32 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative order-2 lg:order-1"
            >
              <div className="relative rounded-[2.5rem] md:rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl">
                <img 
                  src="/bild2.png"
                  alt="Service Detail"
                  className="w-full aspect-[4/5] object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 bg-brand-orange p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-neon">
                <div className="text-brand-black font-black text-3xl md:text-5xl mb-1 md:mb-2">10+</div>
                <div className="text-brand-black/60 text-[10px] font-black uppercase tracking-widest">Jahre Erfahrung</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-display font-black text-white tracking-tighter uppercase mb-10 md:mb-16 leading-none text-balance">
                Warum <br /> <span className="text-brand-orange neon-text">AS Service?</span>
              </h2>
              <div className="space-y-8 md:space-y-12">
                {benefits.map((benefit, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.15 }}
                    className="flex gap-6 md:gap-8 group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-white/5 rounded-[1rem] md:rounded-[1.5rem] flex items-center justify-center border border-white/10 group-hover:border-brand-orange/50 transition-all duration-500 group-hover:bg-brand-orange/10">
                      <span className="text-brand-orange font-black text-lg md:text-xl">0{idx + 1}</span>
                    </div>
                    <div>
                      <h4 className="text-xl md:text-2xl font-black text-white mb-2 md:mb-3 uppercase tracking-tight group-hover:text-brand-orange transition-colors duration-500">{benefit.title}</h4>
                      <p className="text-white/40 text-sm md:text-base leading-relaxed group-hover:text-white/60 transition-colors duration-500">{benefit.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 rounded-[2.5rem] md:rounded-[4rem] overflow-hidden grid lg:grid-cols-2">
            <div className="p-10 md:p-24 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-brand-orange shadow-[0_0_20px_#FF6B00]" />
              <h2 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tighter mb-10 md:mb-16 text-balance">
                Bereit für den <br /><span className="text-brand-orange">nächsten Stop?</span>
              </h2>
              <div className="space-y-8 md:space-y-12">
                <div className="flex items-start gap-6 md:gap-8 group cursor-pointer" onClick={() => window.open('https://maps.google.com/?q=Mainzer+Str.+186+55411+Bingen+am+Rhein', '_blank')}>
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-brand-orange rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-neon group-hover:scale-110 transition-transform duration-500">
                    <MapPin className="text-brand-black w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <p className="text-white/30 uppercase text-[9px] md:text-[10px] font-black tracking-[0.3em] mb-1 md:mb-2">Standort</p>
                    <p className="text-white text-xl md:text-2xl font-bold tracking-tight leading-tight group-hover:text-brand-orange transition-colors duration-500">Mainzer Str. 186<br />55411 Bingen am Rhein</p>
                  </div>
                </div>
                <div className="flex items-start gap-6 md:gap-8 group">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-brand-orange rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-neon">
                    <Mail className="text-brand-black w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <p className="text-white/30 uppercase text-[9px] md:text-[10px] font-black tracking-[0.3em] mb-1 md:mb-2">E-Mail</p>
                    <a href="mailto:info@as-mietwagen-service.de" className="text-white text-lg sm:text-xl md:text-2xl font-bold tracking-tight hover:text-brand-orange transition-colors whitespace-nowrap">info@as-mietwagen-service.de</a>
                  </div>
                </div>
                <div className="flex items-start gap-6 md:gap-8 group">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-brand-orange rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-neon">
                    <Phone className="text-brand-black w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="text-white/30 uppercase text-[9px] md:text-[10px] font-black tracking-[0.3em] mb-1 md:mb-2">Direkt-Kontakt</p>
                      <a href="tel:01722804437" className="text-white text-2xl md:text-3xl font-black tracking-tighter hover:text-brand-orange transition-colors">0172 2804437</a>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <a 
                        href="https://wa.me/491722804437" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(37,211,102,0.2)] hover:shadow-[0_0_30px_rgba(37,211,102,0.4)]"
                      >
                        WhatsApp
                      </a>
                      <a 
                        href="mailto:info@as-mietwagen-service.de" 
                        className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-300"
                      >
                        EMAIL
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-[400px] md:h-[500px] lg:h-auto relative group overflow-hidden">
              <iframe 
                src="https://maps.google.com/maps?q=Mainzer%20Str.%20186,%2055411%20Bingen%20am%20Rhein&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0 grayscale invert-[0.9] contrast-[1.2] opacity-80"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Standort AS Autodoktor"
                tabIndex={-1}
              ></iframe>
              <div className="absolute inset-0 bg-brand-black/10 pointer-events-none" />
              
              {/* Minimal Animated Marker */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative flex items-center justify-center">
                  {/* Pulse Rings */}
                  <div className="absolute w-20 h-20 bg-brand-orange/30 rounded-full animate-ping" />
                  <div className="absolute w-32 h-32 bg-brand-orange/10 rounded-full animate-pulse" />
                  
                  {/* The Pin - No background box as requested */}
                  <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    className="relative pointer-events-auto cursor-pointer"
                  >
                    <div className="filter drop-shadow-[0_0_15px_#FF6B00]">
                      <MapPin className="w-12 h-12 text-brand-orange fill-brand-orange/20" />
                    </div>
                    
                    {/* Tooltip-style Label on Hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-2 bg-brand-black/90 backdrop-blur-md border border-brand-orange/30 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-neon">
                      <p className="text-[10px] font-black uppercase tracking-widest">Mainzer Str. 186</p>
                      {/* Triangle pointer */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-brand-black/90" />
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-brand-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-orange rounded-lg flex items-center justify-center shadow-neon">
                <span className="text-brand-black font-black text-xl">AS</span>
              </div>
              <span className="text-white font-display text-2xl tracking-tighter uppercase">
                Auto<span className="text-brand-orange">doktor</span>
              </span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-8 md:gap-12">
              <a href="https://as-mietwagen-service.de" target="_blank" rel="noopener noreferrer" className="text-brand-orange hover:text-white transition-colors text-xs font-black uppercase tracking-widest border-b border-brand-orange/30 pb-1">Unser Taxi Unternehmen</a>
              <button 
                onClick={() => setIsImpressumOpen(true)}
                className="text-white/30 hover:text-brand-orange transition-colors text-xs font-black uppercase tracking-widest"
              >
                Impressum
              </button>
              <a href="#" className="text-white/30 hover:text-brand-orange transition-colors text-xs font-black uppercase tracking-widest">Datenschutz</a>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
              © {new Date().getFullYear()} AS Autodoktor.
            </p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-[60] w-14 h-14 bg-brand-orange text-brand-black rounded-full flex items-center justify-center shadow-neon hover:scale-110 transition-transform"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Impressum Modal */}
      <AnimatePresence>
        {isImpressumOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsImpressumOpen(false)}
              className="absolute inset-0 bg-brand-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl max-h-[80vh] bg-brand-black border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h2 className="text-2xl font-display font-black uppercase tracking-tighter">Impressum & Datenschutz</h2>
                <button 
                  onClick={() => setIsImpressumOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar text-white/70 space-y-8">
                <section>
                  <h3 className="text-xl font-black text-white uppercase mb-4 tracking-tight">Impressum</h3>
                  <p className="font-bold text-brand-orange mb-2">Angaben gemäß § 5 TMG</p>
                  <div className="space-y-1">
                    <p>AS Mietwagen Service</p>
                    <p>Inhaber: Semiya Atalay</p>
                    <p>Espenschiedstr 1</p>
                    <p>55411 Bingen am Rhein</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-black text-white uppercase mb-4 tracking-tight">Kontakt</h3>
                  <div className="space-y-1">
                    <p>Telefon: 06721-681 08 08</p>
                    <p>Telefax: 06721-201 6381</p>
                    <p>E-Mail: info@as-mietwagen-service.de</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-black text-white uppercase mb-4 tracking-tight">Umsatzsteuer-ID</h3>
                  <p className="mb-2">Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:</p>
                  <p className="text-white font-bold">DE 84 690 719 236</p>
                </section>

                <section>
                  <h3 className="text-xl font-black text-white uppercase mb-4 tracking-tight">Aufsichtsbehörde</h3>
                  <p>Bingen am Rhein</p>
                </section>

                <section>
                  <h3 className="text-xl font-black text-white uppercase mb-4 tracking-tight">Haftungsausschluss (Disclaimer)</h3>
                  <div className="space-y-4 text-sm leading-relaxed">
                    <div>
                      <p className="font-bold text-white mb-2">Haftung für Inhalte</p>
                      <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.</p>
                    </div>
                    <div>
                      <p className="font-bold text-white mb-2">Haftung für Links</p>
                      <p>Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.</p>
                    </div>
                    <div>
                      <p className="font-bold text-white mb-2">Urheberrecht</p>
                      <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-black text-white uppercase mb-4 tracking-tight">Datenschutzerklärung</h3>
                  <div className="space-y-4 text-sm leading-relaxed">
                    <p>Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.</p>
                    <p>Die Nutzung unserer Webseite ist in der Regel ohne Angabe personenbezogener Daten möglich. Soweit auf unseren Seiten personenbezogene Daten (beispielsweise Name, Anschrift oder E-Mail-Adressen) erhoben werden, erfolgt dies, soweit möglich, stets auf freiwilliger Basis. Diese Daten werden ohne Ihre ausdrückliche Zustimmung nicht an Dritte weitergegeben.</p>
                    <p>Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B. bei der Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht möglich. (Hinweis: Weitere Details zu Facebook, Google Analytics und Twitter finden Sie in der vollständigen Datenschutzerklärung in unserem Impressum-Bereich.)</p>
                  </div>
                </section>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
