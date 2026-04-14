import { useState, useEffect } from 'react';
import { Search, Menu, User, Bell, MapPin, Moon, Sun, LogOut, Globe, Phone as PhoneIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { useTheme } from './ThemeProvider';
import { auth, signInWithGoogle, logout, db } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { toast } from 'sonner';
import { useLanguage } from '../lib/i18n';

interface NavbarProps {
  onNavigate: (view: any) => void;
  userLocation: string;
  setUserLocation: (loc: string) => void;
  setUserCoordinates?: (coords: {lat: number, lng: number}) => void;
}

export default function Navbar({ onNavigate, userLocation, setUserLocation, setUserCoordinates }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const { language, setLanguage, t } = useLanguage();
  const [isLocating, setIsLocating] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: any[] = [];
      let unread = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        notifs.push({ id: doc.id, ...data });
        if (!data.read) unread++;
      });
      
      // Sort client-side to avoid needing a composite index immediately
      notifs.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
        return timeB - timeA;
      });

      setNotifications(notifs);
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      toast.success("Welcome back!");
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        toast.info("Login cancelled. Please complete the sign-in process.");
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error("This domain is not authorized. Please add it to Firebase Console.");
      } else {
        toast.error("Login failed. Please try again.");
        console.error("Login failed", error);
      }
    }
  };

  const handlePhoneLogin = () => {
    toast.info("Phone Auth requires production domain whitelisting. Using Google Auth for preview.");
    handleLogin();
  };

  const requestLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            if (setUserCoordinates) {
              setUserCoordinates({ lat: position.coords.latitude, lng: position.coords.longitude });
            }
            // Reverse geocoding using a free API or just setting coordinates
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.state || "Current Location";
            setUserLocation(`${city}, IN`);
            toast.success("Location updated!");
          } catch (error) {
            setUserLocation("Location Found");
            toast.success("Location updated!");
          }
          setIsLocating(false);
        },
        (error) => {
          toast.error("Could not get location. Please enable permissions.");
          setIsLocating(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
      setIsLocating(false);
    }
  };

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 px-4 transition-all duration-300">
      <div className="container mx-auto h-16 flex items-center justify-between gap-4 bg-background/80 backdrop-blur-xl border border-border/50 shadow-lg shadow-black/5 rounded-2xl px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-4 mt-8">
                <Button variant="ghost" className="justify-start whitespace-nowrap" onClick={() => onNavigate('home')}>Home</Button>
                <Button variant="ghost" className="justify-start whitespace-nowrap" onClick={() => onNavigate('home')}>Find Helpers</Button>
                <Button variant="ghost" className="justify-start whitespace-nowrap" onClick={() => onNavigate('bookings')}>My Bookings</Button>
                <Button variant="ghost" className="justify-start whitespace-nowrap" onClick={() => onNavigate('register')}>Become a Helper</Button>
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => onNavigate('home')}>
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <span className="text-primary-foreground font-bold text-xl leading-none">H</span>
            </div>
            <span className="text-xl font-serif font-medium tracking-tight hidden sm:inline-block whitespace-nowrap">Helpers</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button onClick={() => onNavigate('home')} className="transition-colors hover:text-primary whitespace-nowrap">{t('nav.find')}</button>
          <button onClick={() => onNavigate('home')} className="transition-colors hover:text-primary whitespace-nowrap">{t('nav.categories')}</button>
          <button onClick={() => onNavigate('how-it-works')} className="transition-colors hover:text-primary whitespace-nowrap">{t('nav.how')}</button>
        </div>

        <div className="flex-1 max-w-md hidden lg:flex relative group mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search for help..." 
            className="pl-10 bg-muted/30 dark:bg-muted/10 border-none focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl h-10 w-full"
          />
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLanguage(language === 'EN' ? 'HI' : 'EN')}
            className="rounded-xl text-muted-foreground hover:text-primary font-bold text-xs"
            title="Toggle Language"
          >
            {language}
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="rounded-xl text-muted-foreground hover:text-primary"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          <div 
            className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={requestLocation}
          >
            <MapPin className="h-3 w-3" />
            <span>{isLocating ? 'Locating...' : userLocation}</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative hidden sm:flex" />}>
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background animate-pulse"></span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-2xl p-2 max-h-[400px] overflow-y-auto">
              <DropdownMenuLabel className="font-bold flex justify-between items-center">
                Notifications
                {unreadCount > 0 && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{unreadCount} new</span>}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`p-3 rounded-xl text-sm ${notif.read ? 'bg-transparent' : 'bg-primary/5'} hover:bg-muted/50 transition-colors`}>
                      <p className="font-bold text-foreground">{notif.title}</p>
                      <p className="text-muted-foreground mt-0.5 leading-snug">{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-2 uppercase tracking-widest">
                        {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleDateString() : 'Just now'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                  <Bell className="h-8 w-8 text-muted-foreground/30" />
                  No new notifications
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-xl overflow-hidden border border-muted/50 bg-muted/20 shrink-0" />}>
                <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-full h-full object-cover" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
                <div className="px-2 py-3">
                  <p className="text-sm font-bold truncate">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-xl cursor-pointer" onClick={() => onNavigate('profile')}>Profile</DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl cursor-pointer" onClick={() => onNavigate('bookings')}>My Bookings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="rounded-xl cursor-pointer text-destructive focus:text-destructive"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button className="rounded-xl font-bold px-4 sm:px-6 shadow-lg shadow-primary/20 whitespace-nowrap shrink-0" />}>
                {t('nav.login')}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
                <DropdownMenuItem className="rounded-xl cursor-pointer py-3" onClick={handlePhoneLogin}>
                  <PhoneIcon className="mr-2 h-4 w-4" />
                  Login with Phone (OTP)
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl cursor-pointer py-3" onClick={handleLogin}>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Login with Google
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
}
