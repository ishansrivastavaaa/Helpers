import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ArrowRight, ShieldCheck, Star, Clock, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useLanguage } from '../lib/i18n';

interface HeroProps {
  onNavigate?: (view: any) => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  selectedCategory?: string;
  setSelectedCategory?: (c: any) => void;
}

const PLACEHOLDERS = [
  "What do you need help with?",
  "Search for plumbers...",
  "Search for electricians...",
  "Search for housekeepers...",
  "Search for painters..."
];

export default function Hero({ onNavigate, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory }: HeroProps) {
  const { t } = useLanguage();
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40">
      {/* Modern Atmospheric Background */}
      <div className="absolute inset-0 -z-10 bg-background">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 dark:opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-blue-500/40 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        </div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-purple-500/30 to-primary/30 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-8 backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>The New Standard in Local Help</span>
          </motion.div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-serif font-medium leading-[1.1] mb-6 sm:mb-8 tracking-tight text-balance">
            {t('hero.title')}
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0 font-medium">
            {t('hero.subtitle')}
          </p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-16 sm:mb-20 px-4 sm:px-0"
          >
            <div className="relative flex-1 group flex flex-col sm:flex-row gap-0 sm:gap-2 bg-background/80 backdrop-blur-xl p-2 rounded-3xl border border-muted/50 shadow-2xl shadow-black/5">
              <div className="relative flex-1 flex items-center overflow-hidden">
                <Search className="absolute left-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                
                {!searchQuery && (
                  <div className="absolute left-12 right-0 flex items-center h-full pointer-events-none overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={placeholderIndex}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-muted-foreground text-lg absolute"
                      >
                        {PLACEHOLDERS[placeholderIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                )}

                <Input 
                  placeholder=""
                  className="pl-12 h-14 text-lg border-none bg-transparent focus-visible:ring-0 shadow-none relative z-10 transition-all w-full"
                  value={searchQuery || ''}
                  onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                />
              </div>
              <div className="h-px w-full sm:w-px sm:h-10 bg-border my-auto hidden sm:block" />
              <div className="relative flex items-center sm:w-48 bg-muted/30 sm:bg-transparent rounded-2xl sm:rounded-none mt-2 sm:mt-0">
                <select 
                  className="h-14 w-full pl-4 pr-10 bg-transparent border-none text-foreground focus:ring-0 outline-none cursor-pointer text-sm font-medium appearance-none"
                  value={selectedCategory || 'All'}
                  onChange={(e) => setSelectedCategory && setSelectedCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Painting">Painting</option>
                  <option value="AC Repair">AC Repair</option>
                  <option value="RO Service">RO Service</option>
                  <option value="Carpentry">Carpentry</option>
                  <option value="Gardening">Gardening</option>
                  <option value="Pandit/Pooja">Pandit/Pooja</option>
                  <option value="Cook/Chef">Cook/Chef</option>
                </select>
                <ChevronDown className="absolute right-4 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <Button 
              size="lg" 
              className="h-[72px] px-8 text-lg font-bold rounded-[1.5rem] shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto group"
              onClick={() => {
                const element = document.getElementById('recommended-section');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {t('nav.find')}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          <div className="flex justify-center mb-16">
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-2xl h-14 px-8 font-bold border-primary/20 text-primary hover:bg-primary/5"
              onClick={() => onNavigate && onNavigate('register')}
            >
              Become a Helper
            </Button>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="flex flex-wrap justify-center items-center gap-8 sm:gap-16 opacity-70 hover:opacity-100 transition-opacity duration-500"
          >
            <div className="flex flex-col items-center gap-2 group cursor-default">
              <div className="flex items-center gap-1 text-3xl font-serif font-bold group-hover:text-primary transition-colors">
                4.9 <Star className="h-5 w-5 fill-primary text-primary" />
              </div>
              <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Average Rating</span>
            </div>
            <div className="w-px h-12 bg-border hidden sm:block" />
            <div className="flex flex-col items-center gap-2 group cursor-default">
              <div className="flex items-center gap-1 text-3xl font-serif font-bold group-hover:text-primary transition-colors">
                10k+ <UserIcon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Happy Users</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function UserIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
