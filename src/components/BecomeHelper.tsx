import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle2, User, Briefcase, MapPin, Phone, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { CATEGORIES } from '../constants';
import { toast } from 'sonner';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-error';

interface BecomeHelperProps {
  onBack: () => void;
}

export default function BecomeHelper({ onBack }: BecomeHelperProps) {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    category: CATEGORIES[0],
    skills: '',
    bio: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      toast.error("Please login to submit your application");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'helpers'), {
        userId: auth.currentUser.uid,
        name: formData.name,
        phone: formData.phone,
        category: formData.category,
        skills: formData.skills.split(',').map(s => s.trim()),
        description: formData.bio,
        shopAddress: formData.address,
        rating: 5.0, // Initial rating
        reviewCount: 0,
        priceRange: 'Negotiable',
        imageUrl: auth.currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
        location: { lat: 28.6139, lng: 77.2090 }, // Default to Delhi for MVP
        reviews: [],
        createdAt: serverTimestamp()
      });
      
      setIsSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit application. Please try again.");
      handleFirestoreError(error, OperationType.CREATE, 'helpers');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-32 max-w-2xl text-center space-y-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto"
        >
          <CheckCircle2 className="h-12 w-12 text-primary" />
        </motion.div>
        <div className="space-y-4">
          <h1 className="text-5xl font-serif font-medium tracking-tight">Application Received!</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Thank you for joining the Helpers community. Your profile is now live and visible to customers in your area!
          </p>
        </div>
        <Button size="lg" className="h-14 px-10 rounded-2xl font-bold" onClick={onBack}>
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none -z-10" />
      
      <Button variant="ghost" onClick={onBack} className="mb-8 -ml-4 text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to home
      </Button>

      <div className="space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-[0.2em] uppercase backdrop-blur-md">
            <Sparkles className="h-3 w-3" />
            Join the community
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight">Become a Helper</h1>
          <p className="text-muted-foreground text-lg">Share your skills and start earning on your own terms.</p>
        </div>

        <div className="flex gap-4 mb-12">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]' : 'bg-muted/50'}`} 
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 bg-card/40 backdrop-blur-xl border border-muted/50 p-8 rounded-[2.5rem] shadow-2xl shadow-primary/5"
              >
                <div className="space-y-6">
                  <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    Personal Information
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</Label>
                      <Input id="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Rajesh Kumar" className="h-14 rounded-2xl bg-background/50 border-muted/50 focus-visible:ring-primary/30" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone Number (WhatsApp)</Label>
                      <Input id="phone" value={formData.phone} onChange={handleInputChange} placeholder="e.g. 9876543210" className="h-14 rounded-2xl bg-background/50 border-muted/50 focus-visible:ring-primary/30" required />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="address" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Address</Label>
                      <Input id="address" value={formData.address} onChange={handleInputChange} placeholder="e.g. Sector 12, MG Road, New Delhi" className="h-14 rounded-2xl bg-background/50 border-muted/50 focus-visible:ring-primary/30" required />
                    </div>
                  </div>
                </div>
                <Button type="button" className="w-full h-14 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all" onClick={() => setStep(2)}>
                  Continue to Service Details
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 bg-card/40 backdrop-blur-xl border border-muted/50 p-8 rounded-[2.5rem] shadow-2xl shadow-primary/5"
              >
                <div className="space-y-6">
                  <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    Service Details
                  </h2>
                  <div className="grid gap-6">
                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Primary Category</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {CATEGORIES.map(cat => (
                          <div 
                            key={cat}
                            onClick={() => setFormData({ ...formData, category: cat })}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all text-center text-xs font-bold ${formData.category === cat ? 'border-primary bg-primary/10 text-primary shadow-inner' : 'border-muted/50 bg-background/50 hover:border-primary/50 hover:bg-primary/5'}`}
                          >
                            {cat}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="skills" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Skills (Comma separated)</Label>
                      <Input id="skills" value={formData.skills} onChange={handleInputChange} placeholder="e.g. Pipe Repair, Leak Fixing" className="h-14 rounded-2xl bg-background/50 border-muted/50 focus-visible:ring-primary/30" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tell us about your experience</Label>
                      <Textarea id="bio" value={formData.bio} onChange={handleInputChange} placeholder="Describe your expertise..." className="min-h-[120px] rounded-2xl bg-background/50 border-muted/50 focus-visible:ring-primary/30 resize-none" required />
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button type="button" variant="outline" className="flex-1 h-14 rounded-2xl font-bold border-muted/50 hover:bg-muted/30" onClick={() => setStep(1)}>Back</Button>
                  <Button type="button" className="flex-[2] h-14 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all" onClick={() => setStep(3)}>Continue to Verification</Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 bg-card/40 backdrop-blur-xl border border-muted/50 p-8 rounded-[2.5rem] shadow-2xl shadow-primary/5"
              >
                <div className="space-y-6 text-center py-8">
                  <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-primary/20">
                    <ShieldCheck className="h-12 w-12 text-primary" />
                  </div>
                  <h2 className="text-3xl font-serif font-bold">Verification & Safety</h2>
                  <p className="text-muted-foreground max-w-md mx-auto text-lg">
                    To maintain the quality of our community, we require a quick identity verification. By submitting, you agree to our terms of service.
                  </p>
                  <div className="bg-background/50 border border-muted/50 p-6 rounded-3xl text-left space-y-4 max-w-md mx-auto">
                    <div className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-sm font-medium">I agree to provide valid ID proof during verification.</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-sm font-medium">I will maintain professional conduct with all customers.</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button type="button" variant="outline" className="flex-1 h-14 rounded-2xl font-bold border-muted/50 hover:bg-muted/30" onClick={() => setStep(2)} disabled={isSubmitting}>Back</Button>
                  <Button type="submit" className="flex-[2] h-14 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</> : "Submit Application"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}
