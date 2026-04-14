import { motion } from 'motion/react';
import { Search, ArrowRight, ShieldCheck, Star, Clock, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useLanguage } from '../lib/i18n';

export default function Hero() {
  const { t } = useLanguage();

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
          
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-serif font-medium leading-[1.05] mb-6 sm:mb-8 tracking-tight text-balance">
            {t('hero.title')}
          </h1>
          
          <p className="text-base sm:text-xl text-muted-foreground mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0 font-medium">
            {t('hero.subtitle')}
          </p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-16 sm:mb-20 px-4 sm:px-0"
          >
            <div className="relative flex-1 group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/0 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
              <Input 
                placeholder={t('hero.search')}
                className="pl-12 h-16 text-lg rounded-2xl border-muted/50 bg-background/60 backdrop-blur-xl focus-visible:ring-primary/30 focus-visible:border-primary/50 shadow-xl shadow-black/5 relative z-10 transition-all"
              />
            </div>
            <Button size="lg" className="h-16 px-10 text-lg font-bold rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto group">
              {t('nav.find')}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

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
            <div className="w-px h-12 bg-border hidden sm:block" />
            <div className="flex flex-col items-center gap-2 group cursor-default">
              <div className="flex items-center gap-1 text-3xl font-serif font-bold group-hover:text-primary transition-colors">
                30m <Clock className="h-5 w-5 text-primary" />
              </div>
              <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Avg Response</span>
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
