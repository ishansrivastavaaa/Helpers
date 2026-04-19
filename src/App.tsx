import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import InstantBookingHero from './components/InstantBookingHero';
import HelperDetail from './components/HelperDetail';
import MyBookings from './components/MyBookings';
import BecomeHelper from './components/BecomeHelper';
import HowItWorks from './components/HowItWorks';
import Profile from './components/Profile';
import Safety from './components/Safety';
import Privacy from './components/Privacy';
import Cancellation from './components/Cancellation';
import AdminDashboard from './components/AdminDashboard';
import HelperCard from './components/HelperCard';
import { CATEGORIES } from './constants';
import { Helper, Category } from './types';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Search, Filter, X, Sparkles, Loader2, MessageCircle, Users, Clock, ShieldCheck, Star } from 'lucide-react';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { db } from './lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firestore-error';

import { ThemeProvider } from './components/ThemeProvider';
import { LanguageProvider, useLanguage } from './lib/i18n';
import { Toaster } from 'sonner';

type View = 'home' | 'detail' | 'bookings' | 'register' | 'how-it-works' | 'profile' | 'safety' | 'privacy' | 'cancellation' | 'admin';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedHelper, setSelectedHelper] = useState<Helper | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [isLoadingHelpers, setIsLoadingHelpers] = useState(true);
  const [userLocation, setUserLocation] = useState<string>('New Delhi, IN');
  const [userCoordinates, setUserCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const q = query(collection(db, 'helpers'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbHelpers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Helper[];
      
      setHelpers(dbHelpers);
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
      // Don't show blocked helpers
      if (helper.blocked) return false;

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
            userCoordinates={userCoordinates}
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

      case 'cancellation':
        return <Cancellation onBack={() => navigateTo('home')} />;

      case 'admin':
        if (auth.currentUser?.email !== 'ishansrivastavaaa@gmail.com') {
          navigateTo('home');
          return null;
        }
        return <AdminDashboard onBack={() => navigateTo('home')} />;

      case 'home':
      default:
        return (
          <>
            <InstantBookingHero 
              onNavigate={navigateTo} 
              availableHelpers={helpers} 
            />

            <section className="py-12 md:py-16 bg-background">
              <div className="container mx-auto px-4 lg:px-8 max-w-[1400px]">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl sm:text-[28px] font-medium tracking-tight text-foreground">Popular helpers in {userLocation.split(',')[0]}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredHelpers.slice(0, 10).map(helper => (
                    <HelperCard key={helper.id} helper={helper} onClick={(h) => navigateTo('detail', h)} />
                  ))}
                </div>
              </div>
            </section>

            <footer className="bg-muted/10 pt-16 pb-8">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('home')}>
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">H</div>
                      <span className="text-xl font-serif font-bold tracking-tight">Helpers</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-bold mb-6 text-foreground">Platform</h4>
                    <ul className="space-y-4 text-sm text-muted-foreground">
                      <li><button onClick={() => navigateTo('home')} className="hover:text-primary transition-colors">Instant Booking</button></li>
                      <li><button onClick={() => navigateTo('register')} className="hover:text-primary transition-colors">Become a Helper</button></li>
                      <li><button onClick={() => navigateTo('how-it-works')} className="hover:text-primary transition-colors">How it Works</button></li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold mb-6 text-foreground">Support</h4>
                    <ul className="space-y-4 text-sm text-muted-foreground">
                      <li><button onClick={() => navigateTo('safety')} className="hover:text-primary transition-colors">Trust & Safety</button></li>
                      <li>
                        <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" /> Contact Us
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold mb-6 text-foreground">Legal</h4>
                    <ul className="space-y-4 text-sm text-muted-foreground">
                      <li><button onClick={() => navigateTo('privacy')} className="hover:text-primary transition-colors">Privacy Policy</button></li>
                      <li><button onClick={() => navigateTo('privacy')} className="hover:text-primary transition-colors">Terms & Conditions</button></li>
                      <li><button onClick={() => navigateTo('cancellation')} className="hover:text-primary transition-colors">Cancellation Policy</button></li>
                    </ul>
                  </div>
                </div>

                <div className="pt-8 border-t border-muted/50 flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-muted-foreground">© 2025 Helpers. All rights reserved.</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Made with ❤️ in India</span>
                  </div>
                </div>
              </div>
            </footer>

            {/* Floating Contact Us Button */}
            <a 
              href="https://wa.me/919876543210" 
              target="_blank" 
              rel="noreferrer"
              className="fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-[#25D366] text-white p-3 md:p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-50 flex items-center justify-center group"
            >
              <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
              <MessageCircle className="h-5 w-5 md:h-6 md:w-6 relative z-10" />
              <span className="hidden md:block absolute right-16 bg-card text-foreground text-xs font-bold px-3 py-2 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-muted/50">
                Need Help? Chat with us
              </span>
            </a>
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
          setUserCoordinates={setUserCoordinates}
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
