import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, ShieldCheck, Clock, MapPin, Search, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Category, Helper } from '../types';
import { CATEGORIES } from '../constants';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { toast } from 'sonner';

interface InstantBookingHeroProps {
  onNavigate: (view: any) => void;
  availableHelpers: Helper[]; 
}

type BookingStep = 'service' | 'time' | 'location' | 'address' | 'matching';

export default function InstantBookingHero({ onNavigate, availableHelpers }: InstantBookingHeroProps) {
  const [step, setStep] = useState<BookingStep>('service');
  const [category, setCategory] = useState<Category | ''>('');
  const [timeMode, setTimeMode] = useState<'Now' | 'Today' | 'Scheduled'>('Now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [location, setLocation] = useState('New Delhi, IN');
  const [subLocation, setSubLocation] = useState('');
  const [isMatching, setIsMatching] = useState(false);

  // Guarantee matching logic
  const handleMatchAndBook = async () => {
    if (!auth.currentUser) {
      toast.error("Please login to book a helper.");
      return;
    }

    if (!category) {
      toast.error("Please select a service category.");
      return;
    }

    if (!subLocation.trim() || !location.trim()) {
      toast.error("Please complete your address details.");
      return;
    }

    setIsMatching(true);
    setStep('matching');

    try {
      // Simulate matching AI backend delay
      await new Promise(r => setTimeout(r, 2500));

      // In real life: backend logic nearest helper + availability + rating
      // For MVP frontend: pick the best rated helper in the category
      const matches = availableHelpers.filter(h => h.category === category && !h.blocked);
      
      let assignedHelper: Helper;
      if (matches.length > 0) {
        // Sort by rating internally
        const sorted = matches.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        assignedHelper = sorted[0];
      } else {
        // Fallback or generic assignment if nobody exactly fits the category
         const backup = availableHelpers.filter(h => !h.blocked);
         if (backup.length > 0) {
           assignedHelper = backup[0];
         } else {
           throw new Error("No helpers currently available in your area.");
         }
      }

      // Format dates
      let finalDate = '';
      let finalTime = '';
      
      if (timeMode === 'Now' || timeMode === 'Today') {
        const dateObj = new Date();
        finalDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
        
        if (timeMode === 'Now') {
           // ~30 mins from now
           dateObj.setMinutes(dateObj.getMinutes() + 30);
           finalTime = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
        } else {
           finalTime = 'By End of Day';
        }
      } else {
        const dateObj = new Date(scheduledDate);
        finalDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
        finalTime = scheduledTime;
      }

      const fullAddress = `${subLocation.trim()}, ${location.trim()}`;

      await addDoc(collection(db, 'bookings'), {
        userId: auth.currentUser.uid,
        helperId: assignedHelper.id,
        helperName: assignedHelper.name,
        category: category,
        status: 'Assigned',
        price: '₹ 49', // Just hardcode platform fee for the MVP to allow easy mock payment
        date: finalDate,
        time: finalTime,
        address: fullAddress,
        createdAt: serverTimestamp()
      });

      toast.success(`Match found! ${assignedHelper.name} has been assigned to you.`);
      
      // Route immediately to bookings page to see the matched helper
      onNavigate('bookings');

    } catch (error: any) {
      toast.error(error.message || "Failed to find a match. Please try again later.");
      setStep('service');
      setIsMatching(false);
    }
  };


  return (
    <section className="relative pt-24 pb-32 lg:pt-32 lg:pb-40 bg-background text-foreground overflow-hidden">
      {/* Upscale Minimalist Indian Market Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4" />
      </div>

      <div className="container relative mx-auto px-4 grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
        
        {/* Left Side: Minimalist Hero Positioning */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl pt-4 lg:pt-10 space-y-8"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-medium leading-[1.05] tracking-tight text-balance">
            Home help in <span className="text-primary italic">30 mins.</span><br /> Guaranteed.
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-md">
            Skip the endless profiles. Tell us what you need, and we'll send a verified professional instantly.
          </p>
          
          {/* Minimal Guarantee Block */}
          <div className="pt-4 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Our Promise</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-4 text-muted-foreground font-medium text-base">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                <span>Instant refund if helper doesn't arrive</span>
              </li>
              <li className="flex items-center gap-4 text-muted-foreground font-medium text-base">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                <span>Free replacement if delayed &gt; 20 min</span>
              </li>
              <li className="flex items-center gap-4 text-muted-foreground font-medium text-base">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                <span>Identity & background verified</span>
              </li>
            </ul>
          </div>

        </motion.div>

        {/* Right Side: The Booking Engine (Crisp Design) */}
        <motion.div
           initial={{ opacity: 0, x: 30 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.8, delay: 0.2 }}
           className="w-full max-w-lg mx-auto lg:ml-auto lg:mr-0"
        >
          <div className="bg-card rounded-[2rem] p-8 md:p-10 border shadow-2xl shadow-primary/5">
            <h2 className="text-3xl font-serif font-medium mb-8 tracking-tight">Instant Booking</h2>

            <AnimatePresence mode="wait">
              {step === 'service' && (
                <motion.div 
                  key="step-service" 
                  initial={{opacity:0, scale: 0.95}} 
                  animate={{opacity:1, scale: 1}} 
                  exit={{opacity:0, scale: 0.95}} 
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <h3 className="font-bold text-muted-foreground uppercase text-xs tracking-widest flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">1</span> 
                    What do you need?
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {CATEGORIES.slice(0, 8).map(cat => (
                      <motion.button
                        key={cat}
                        type="button"
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          setCategory(cat as Category);
                          setStep('time');
                        }}
                        className="py-4 px-4 text-sm font-semibold rounded-2xl border border-muted hover:border-primary/50 border-b-4 hover:border-b-primary shadow-sm hover:shadow-primary/10 bg-card hover:bg-primary/5 transition-colors outline-none text-center"
                      >
                        {cat}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 'time' && (
                <motion.div 
                  key="step-time" 
                  initial={{opacity:0, x:20}} 
                  animate={{opacity:1, x:0}} 
                  exit={{opacity:0, x:-20}} 
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="space-y-6"
                >
                  <h3 className="font-bold text-muted-foreground uppercase text-xs tracking-widest flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">2</span> 
                    When do you need {category}?
                  </h3>
                  <div className="space-y-3">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setTimeMode('Now'); setStep('location'); }}
                      className="w-full relative py-5 px-6 flex items-center justify-between text-left rounded-2xl border-2 border-primary bg-primary/5 text-primary outline-none transition-colors"
                    >
                      <span className="font-bold text-lg">Now (Emergency)</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/20 px-3 py-1 rounded-full">30-min Guarantee</span>
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setTimeMode('Today'); setStep('location'); }}
                      className="w-full py-5 px-6 flex items-center justify-between text-left rounded-2xl border border-muted hover:border-primary/50 hover:bg-primary/5 transition-colors outline-none"
                    >
                      <span className="font-bold">Sometime Today</span>
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setTimeMode('Scheduled')}
                      className={`w-full py-5 px-6 flex flex-col justify-center text-left rounded-2xl border transition-colors outline-none ${timeMode === 'Scheduled' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50 hover:bg-primary/5'}`}
                    >
                      <span className="font-bold block w-full">Schedule for Later</span>
                    </motion.button>
                    
                    {timeMode === 'Scheduled' && (
                      <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="grid grid-cols-2 gap-3 pt-2">
                        <Input type="date" className="h-14 rounded-2xl text-base" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                        <Input type="time" className="h-14 rounded-2xl text-base" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
                        <Button 
                          className="col-span-2 h-14 rounded-2xl font-bold" 
                          onClick={() => {
                            if (!scheduledDate || !scheduledTime) toast.error("Please pick a date and time");
                            else setStep('location');
                          }}
                        >
                          Confirm Time
                        </Button>
                      </motion.div>
                    )}
                  </div>
                  <Button variant="ghost" className="text-muted-foreground w-full hover:bg-muted/50 rounded-xl transition-all active:scale-95" onClick={() => setStep('service')}>← Back to services</Button>
                </motion.div>
              )}

              {step === 'location' && (
                <motion.div 
                  key="step-location" 
                  initial={{opacity:0, x:20}} 
                  animate={{opacity:1, x:0}} 
                  exit={{opacity:0, x:-20}} 
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="space-y-6"
                >
                  <h3 className="font-bold text-muted-foreground uppercase text-xs tracking-widest flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">3</span> 
                    Which general area?
                  </h3>
                  <div className="space-y-6">
                    <div className="relative flex items-center">
                      <MapPin className="absolute left-4 h-5 w-5 text-muted-foreground" />
                      <Input 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="pl-12 h-16 rounded-2xl text-lg bg-background/50 border-muted placeholder:text-muted-foreground/50 transition-all focus:scale-[1.02]"
                        placeholder="City, Locality, or Area..."
                        required
                      />
                    </div>
                    
                    <Button 
                      size="lg" 
                      className="w-full h-16 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 transition-all active:scale-95"
                      onClick={() => {
                        if (!location.trim()) toast.error("Please provide a general location");
                        else setStep('address'); 
                      }}
                    >
                      Continue
                    </Button>
                  </div>
                  <Button variant="ghost" className="text-muted-foreground w-full hover:bg-muted/50 rounded-xl transition-all active:scale-95" onClick={() => setStep('time')}>← Back to time</Button>
                </motion.div>
              )}

              {step === 'address' && (
                <motion.div 
                  key="step-address" 
                  initial={{opacity:0, x:20}} 
                  animate={{opacity:1, x:0}} 
                  exit={{opacity:0, x:-20}} 
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="space-y-6"
                >
                  <h3 className="font-bold text-muted-foreground uppercase text-xs tracking-widest flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">4</span> 
                    Exact House Details?
                  </h3>
                  <div className="space-y-6">
                    <div className="relative flex items-center">
                      <Input 
                        value={subLocation}
                        onChange={(e) => setSubLocation(e.target.value)}
                        className="px-6 h-16 rounded-2xl text-lg bg-background/50 border-muted placeholder:text-muted-foreground/50 transition-all focus:scale-[1.02]"
                        placeholder="House/Flat No., Building Name..."
                        required
                      />
                    </div>
                    
                    <div className="bg-muted/30 p-5 rounded-2xl border border-muted/50 flex justify-between items-center text-sm font-medium">
                      <span className="text-muted-foreground">Platform matching fee:</span>
                      <span className="font-bold text-lg">₹49.00</span>
                    </div>

                    <Button 
                      size="lg" 
                      className="w-full h-16 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 transition-all active:scale-95 bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleMatchAndBook}
                    >
                      Confirm Booking
                    </Button>
                  </div>
                  <Button variant="ghost" className="text-muted-foreground w-full hover:bg-muted/50 rounded-xl transition-all active:scale-95" onClick={() => setStep('location')}>← Back to location</Button>
                </motion.div>
              )}

              {step === 'matching' && (
                <motion.div 
                  key="step-matching" 
                  initial={{opacity:0, scale:0.9}} 
                  animate={{opacity:1, scale:1}} 
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="py-12 flex flex-col items-center justify-center space-y-6 text-center"
                >
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-muted border-t-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-serif font-medium">Assigning Reliability...</h3>
                    <p className="text-muted-foreground text-sm max-w-[250px] mx-auto leading-relaxed">
                       Our backend is analyzing {Math.floor(Math.random() * 50) + 12} local helpers for trust, availability, and rating.
                    </p>
                  </div>
                </motion.div>
              )}


            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
