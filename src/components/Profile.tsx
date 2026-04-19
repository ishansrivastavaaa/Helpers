import { motion } from 'motion/react';
import { ArrowLeft, User, Mail, Phone, MapPin, Settings, Shield, LogOut, Briefcase, Star, Clock, CreditCard, Power } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { db, auth, logout } from '../lib/firebase';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { toast } from 'sonner';

interface ProfileProps {
  onBack: () => void;
}

export default function Profile({ onBack }: ProfileProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [helperData, setHelperData] = useState<any>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check if user is also a helper
        const q = query(collection(db, 'helpers'), where('userId', '==', currentUser.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setHelperData({ id: snap.docs[0].id, ...snap.docs[0].data() });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleAvailability = async () => {
    if (!helperData) return;
    setIsUpdatingStatus(true);
    try {
      const newStatus = helperData.isAvailable === false ? true : false;
      await updateDoc(doc(db, 'helpers', helperData.id), { isAvailable: newStatus });
      setHelperData({ ...helperData, isAvailable: newStatus });
      toast.success(newStatus ? 'You are now Online & Available!' : 'You are now Offline.');
    } catch (error) {
      toast.error('Failed to update status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-32 text-center space-y-6">
        <h2 className="text-3xl font-serif font-medium">Please login to view your profile</h2>
        <Button onClick={onBack} variant="outline" className="rounded-xl">Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Button variant="ghost" onClick={onBack} className="mb-8 -ml-4 text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to home
      </Button>

      <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="space-y-8">
          <div className="text-center space-y-4 bg-card/40 backdrop-blur-xl border border-muted/50 p-8 rounded-[2.5rem] shadow-2xl shadow-primary/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent -z-10" />
            <Avatar className="w-32 h-32 mx-auto rounded-[2rem] border-4 border-background shadow-xl">
              <AvatarImage src={user.photoURL || ''} />
              <AvatarFallback className="text-4xl font-serif bg-primary/10 text-primary">
                {user.displayName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-serif font-bold tracking-tight">{user.displayName}</h1>
              <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
            </div>
            <div className="pt-4 flex justify-center gap-2">
              <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-[10px] font-bold uppercase tracking-widest border border-green-500/20">
                Verified User
              </span>
            </div>
          </div>

          <div className="space-y-3 bg-card/40 backdrop-blur-xl border border-muted/50 p-4 rounded-[2rem] shadow-lg shadow-primary/5">
            <Button variant="ghost" className="w-full justify-start h-14 rounded-2xl gap-4 hover:bg-primary/5 hover:text-primary transition-all">
              <Settings className="h-5 w-5" />
              <span className="font-medium">Account Settings</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start h-14 rounded-2xl gap-4 hover:bg-primary/5 hover:text-primary transition-all">
              <CreditCard className="h-5 w-5" />
              <span className="font-medium">Payment Methods</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start h-14 rounded-2xl gap-4 hover:bg-primary/5 hover:text-primary transition-all">
              <Shield className="h-5 w-5" />
              <span className="font-medium">Privacy & Security</span>
            </Button>
            <div className="h-px bg-border/50 my-2 mx-4" />
            <Button 
              variant="ghost" 
              className="w-full justify-start h-14 rounded-2xl gap-4 text-destructive hover:bg-destructive/10 hover:text-destructive transition-all"
              onClick={() => {
                logout();
                onBack();
              }}
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          
          {helperData && (
            <Card className={`rounded-[2.5rem] border-muted/50 backdrop-blur-xl shadow-2xl overflow-hidden ${helperData.isAvailable ? 'bg-green-500/10 border-green-500/30' : 'bg-card/40'}`}>
              <CardContent className="p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold tracking-tight">Helper Status</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    {helperData.isAvailable ? "You are currently online and looking for jobs." : "You are currently offline. You will not be auto-assigned."}
                  </p>
                </div>
                <Button 
                  size="lg"
                  onClick={toggleAvailability}
                  disabled={isUpdatingStatus}
                  className={`rounded-2xl h-14 font-bold px-8 shadow-xl transition-all hover:-translate-y-1 ${helperData.isAvailable ? 'bg-destructive hover:bg-destructive/90' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  <Power className="mr-2 h-5 w-5" />
                  {helperData.isAvailable ? 'Go Offline' : 'Go Online'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card/40 backdrop-blur-xl border border-muted/50 p-6 rounded-[2rem] shadow-lg shadow-primary/5 flex flex-col items-center justify-center text-center gap-2 hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                <Briefcase className="h-5 w-5" />
              </div>
              <span className="text-2xl font-serif font-bold">12</span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Bookings</span>
            </div>
            <div className="bg-card/40 backdrop-blur-xl border border-muted/50 p-6 rounded-[2rem] shadow-lg shadow-primary/5 flex flex-col items-center justify-center text-center gap-2 hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                <Star className="h-5 w-5" />
              </div>
              <span className="text-2xl font-serif font-bold">4.8</span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Avg Rating</span>
            </div>
            <div className="bg-card/40 backdrop-blur-xl border border-muted/50 p-6 rounded-[2rem] shadow-lg shadow-primary/5 flex flex-col items-center justify-center text-center gap-2 hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                <Clock className="h-5 w-5" />
              </div>
              <span className="text-2xl font-serif font-bold">2yr</span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Member</span>
            </div>
          </div>

          <Card className="rounded-[2.5rem] border-muted/50 bg-card/40 backdrop-blur-xl shadow-2xl shadow-primary/5 overflow-hidden">
            <CardContent className="p-8 sm:p-10 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold tracking-tight">Contact Information</h2>
                <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold h-9">Edit</Button>
              </div>
              <div className="grid gap-6">
                <div className="flex items-center gap-5 p-4 rounded-2xl hover:bg-muted/30 transition-colors">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Email Address</p>
                    <p className="font-medium text-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 p-4 rounded-2xl hover:bg-muted/30 transition-colors">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Phone Number</p>
                    <p className="font-medium text-muted-foreground italic">Not provided</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 p-4 rounded-2xl hover:bg-muted/30 transition-colors">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Default Address</p>
                    <p className="font-medium text-muted-foreground italic">Not provided</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-muted/50 bg-card/40 backdrop-blur-xl shadow-2xl shadow-primary/5 overflow-hidden">
            <CardContent className="p-8 sm:p-10 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold tracking-tight">Payment Methods</h2>
                <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold h-9">Add New</Button>
              </div>
              <div className="grid gap-6">
                <div className="flex items-center gap-5 p-4 rounded-2xl hover:bg-muted/30 transition-colors border border-muted/50">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">UPI ID</p>
                    <p className="font-medium text-foreground">Not added yet</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary font-bold">Link</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
