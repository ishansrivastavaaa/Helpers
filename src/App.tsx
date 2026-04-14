import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategoryGrid from './components/CategoryGrid';
import HelperCard from './components/HelperCard';
import HelperDetail from './components/HelperDetail';
import MyBookings from './components/MyBookings';
import BecomeHelper from './components/BecomeHelper';
import HowItWorks from './components/HowItWorks';
import Profile from './components/Profile';
import Safety from './components/Safety';
import Privacy from './components/Privacy';
import { MOCK_HELPERS, CATEGORIES } from './constants';
import { Helper, Category } from './types';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Search, Filter, X, Sparkles, Loader2 } from 'lucide-react';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { db } from './lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firestore-error';

import { ThemeProvider } from './components/ThemeProvider';
import { LanguageProvider, useLanguage } from './lib/i18n';
import { Toaster } from 'sonner';

type View = 'home' | 'detail' | 'bookings' | 'register' | 'how-it-works' | 'profile' | 'safety' | 'privacy';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedHelper, setSelectedHelper] = useState<Helper | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [helpers, setHelpers] = useState<Helper[]>(MOCK_HELPERS);
  const [isLoadingHelpers, setIsLoadingHelpers] = useState(true);
  const [userLocation, setUserLocation] = useState<string>('New Delhi, IN');
  const { t } = useLanguage();

  useEffect(() => {
    const q = query(collection(db, 'helpers'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbHelpers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Helper[];
      
      // Combine mock helpers with DB helpers for the MVP
      if (dbHelpers.length > 0) {
        // Filter out mock helpers that might have the same ID as DB helpers
        const dbHelperIds = new Set(dbHelpers.map(h => h.id));
        const filteredMockHelpers = MOCK_HELPERS.filter(h => !dbHelperIds.has(h.id));
        setHelpers([...dbHelpers, ...filteredMockHelpers]);
      } else {
        setHelpers(MOCK_HELPERS);
      }
      setIsLoadingHelpers(false);
    }, (error) => {
      console.error("Error fetching helpers:", error);
      setIsLoadingHelpers(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle back button and navigation
  const navigateTo = (view: View, helper: Helper | null = null) => {
    setCurrentView(view);
    setSelectedHelper(helper);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredHelpers = useMemo(() => {
    return helpers.filter(helper => {
      const safeName = helper.name ? String(helper.name) : '';
      const safeCategory = helper.category ? String(helper.category) : '';
      const safeSkills = Array.isArray(helper.skills) ? helper.skills : [];
      
      const matchesSearch = safeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          safeSkills.some(s => typeof s === 'string' && s.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          safeCategory.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || safeCategory === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, helpers]);

  const renderView = () => {
    switch (currentView) {
      case 'detail':
        return selectedHelper ? (
          <HelperDetail 
            helper={selectedHelper} 
            onBack={() => navigateTo('home')} 
          />
        ) : <div className="py-20 text-center">Helper not found</div>;
      
      case 'bookings':
        return <MyBookings onBack={() => navigateTo('home')} />;
      
      case 'register':
        return <BecomeHelper onBack={() => navigateTo('home')} />;
      
      case 'how-it-works':
        return <HowItWorks onBack={() => navigateTo('home')} />;

      case 'profile':
        return <Profile onBack={() => navigateTo('home')} />;

      case 'safety':
        return <Safety onBack={() => navigateTo('home')} />;

      case 'privacy':
        return <Privacy onBack={() => navigateTo('home')} />;

      case 'home':
      default:
        return (
          <>
            <Hero />
            <CategoryGrid onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              const element = document.getElementById('recommended-section');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }} />
            <section id="recommended-section" className="py-24 container mx-auto px-4 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10 pointer-events-none" />
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px]">
                    <Sparkles className="h-3 w-3" />
                    {t('home.top')}
                  </div>
                  <h2 className="text-3xl md:text-5xl font-serif font-medium tracking-tight">{t('home.recommended')}</h2>
                  <p className="text-muted-foreground text-sm max-w-md">{t('home.desc')}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 w-full md:w-auto bg-muted/30 p-1.5 rounded-2xl backdrop-blur-sm border border-muted/50">
                  <Button 
                    variant={selectedCategory === 'All' ? 'default' : 'ghost'} 
                    size="sm" 
                    className={`rounded-xl px-5 h-9 text-xs font-bold transition-all ${selectedCategory === 'All' ? 'shadow-md shadow-primary/20' : 'hover:bg-background/50'}`}
                    onClick={() => setSelectedCategory('All')}
                  >
                    {t('home.all')}
                  </Button>
                  {CATEGORIES.slice(0, 5).map(cat => (
                    <Button 
                      key={cat}
                      variant={selectedCategory === cat ? 'default' : 'ghost'} 
                      size="sm" 
                      className={`rounded-xl px-5 h-9 text-xs font-bold transition-all ${selectedCategory === cat ? 'shadow-md shadow-primary/20' : 'hover:bg-background/50'}`}
                      onClick={() => setSelectedCategory(cat as Category)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-8 bg-muted/50 p-2 rounded-2xl lg:hidden">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search helpers..." 
                    className="pl-10 bg-transparent border-none focus-visible:ring-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="ghost" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              {filteredHelpers.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredHelpers.map((helper, index) => (
                    <motion.div
                      key={helper.id || `helper-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <HelperCard 
                        helper={helper} 
                        onClick={(h) => navigateTo('detail', h)} 
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-card/40 backdrop-blur-xl rounded-[3rem] border border-muted/50 shadow-xl shadow-primary/5">
                  <div className="w-20 h-20 bg-muted/50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Search className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-3xl font-serif font-bold">{t('home.no_helpers')}</h3>
                  <p className="text-muted-foreground text-lg mt-2 mb-8">{t('home.try_adjusting')}</p>
                  <Button 
                    className="rounded-2xl px-10 h-14 text-base font-bold shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                  >
                    {t('home.clear')}
                  </Button>
                </div>
              )}
            </section>

            <section className="py-20 md:py-32 bg-primary text-primary-foreground overflow-hidden relative rounded-[3rem] mx-4 my-12 shadow-2xl shadow-primary/20">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 blur-[100px] rounded-full mix-blend-overlay pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/10 blur-[80px] rounded-full mix-blend-overlay pointer-events-none" />
              
              <div className="container mx-auto px-4 relative z-10 text-center max-w-2xl">
                <h2 className="text-3xl md:text-5xl font-serif font-medium leading-tight mb-6 tracking-tight">
                  {t('home.are_you')}
                </h2>
                <p className="text-primary-foreground/80 mb-8 md:mb-12 leading-relaxed text-lg">
                  {t('home.join')}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    className="h-14 px-10 text-base font-bold rounded-2xl w-full sm:w-auto shadow-xl hover:-translate-y-1 transition-all duration-300 text-primary"
                    onClick={() => navigateTo('register')}
                  >
                    {t('home.register')}
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-14 px-10 text-base font-bold rounded-2xl w-full sm:w-auto border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground backdrop-blur-sm transition-all duration-300"
                    onClick={() => navigateTo('how-it-works')}
                  >
                    {t('home.learn')}
                  </Button>
                </div>
              </div>
            </section>

            <footer className="py-12 md:py-20 border-t border-muted/50">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('home')}>
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">H</div>
                    <span className="text-xl font-serif font-bold tracking-tight">Helpers</span>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <button onClick={() => navigateTo('home')} className="hover:text-primary transition-colors cursor-pointer">Find Helpers</button>
                    <button onClick={() => navigateTo('register')} className="hover:text-primary transition-colors cursor-pointer">Become a Helper</button>
                    <button onClick={() => navigateTo('safety')} className="hover:text-primary transition-colors cursor-pointer">Safety</button>
                    <button onClick={() => navigateTo('privacy')} className="hover:text-primary transition-colors cursor-pointer">Privacy</button>
                  </div>

                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">© 2024 Helpers</p>
                </div>
              </div>
            </footer>
          </>
        );
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 transition-colors duration-300 overflow-x-hidden">
        <Toaster position="top-center" richColors />
        <Navbar 
          onNavigate={navigateTo} 
          userLocation={userLocation} 
          setUserLocation={setUserLocation} 
        />
      
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
