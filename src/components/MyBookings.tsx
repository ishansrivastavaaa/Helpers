import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Clock, MapPin, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-error';

interface MyBookingsProps {
  onBack: () => void;
}

interface Booking {
  id: string;
  helperName: string;
  category: string;
  date: string;
  time: string;
  status: string;
  price: string;
  address: string;
}

export default function MyBookings({ onBack }: MyBookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData: Booking[] = [];
      snapshot.forEach((doc) => {
        bookingsData.push({ id: doc.id, ...doc.data() } as Booking);
      });
      // Sort by createdAt descending client-side to avoid composite index requirement
      bookingsData.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
        return timeB - timeA;
      });
      setBookings(bookingsData);
      setLoading(false);
    }, (error) => {
      setLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'bookings');
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!auth.currentUser) {
    return (
      <div className="container mx-auto px-4 py-32 text-center space-y-6">
        <h2 className="text-3xl font-serif font-medium">Please login to view your bookings</h2>
        <Button onClick={onBack} variant="outline" className="rounded-xl">Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Button variant="ghost" onClick={onBack} className="mb-8 -ml-4 text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to home
      </Button>

      <div className="space-y-8 relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none -z-10" />
        
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground text-lg">Manage your upcoming and past service requests.</p>
        </div>

        <div className="grid gap-6">
          {bookings.map((booking, index) => (
            <motion.div
              key={booking.id || `booking-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border-muted/50 hover:border-primary/20 transition-all rounded-[2.5rem] bg-card/40 backdrop-blur-xl shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Badge variant={booking.status === 'Upcoming' ? 'default' : 'secondary'} className="rounded-full px-4 py-1 shadow-sm">
                          {booking.status}
                        </Badge>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">{booking.category}</span>
                      </div>
                      
                      <h3 className="text-3xl font-serif font-bold">{booking.helperName}</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground bg-background/50 p-4 rounded-2xl border border-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-foreground">{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Clock className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-foreground">{booking.time}</span>
                        </div>
                        <div className="flex items-center gap-3 sm:col-span-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-foreground">{booking.address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-start md:items-end gap-6 md:gap-4 border-t md:border-t-0 md:border-l border-muted/30 pt-6 md:pt-0 md:pl-6">
                      <div className="text-left md:text-right w-full">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Paid</p>
                        <p className="text-4xl font-bold text-primary tracking-tight">{booking.price}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        {booking.status === 'Upcoming' ? (
                          <>
                            <Button variant="outline" className="rounded-2xl border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive flex-1 md:flex-none h-12">Cancel</Button>
                            <Button className="rounded-2xl shadow-lg shadow-primary/20 flex-1 md:flex-none h-12">Reschedule</Button>
                          </>
                        ) : (
                          <Button variant="outline" className="rounded-2xl flex-1 md:flex-none h-12">Rebook</Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {bookings.length === 0 && (
          <div className="text-center py-24 bg-card/40 backdrop-blur-xl rounded-[3rem] border border-muted/50 shadow-xl shadow-primary/5">
            <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-3xl font-serif font-bold">No bookings yet</h3>
            <p className="text-muted-foreground text-lg mt-2 mb-8">Book your first helper to see it here!</p>
            <Button className="rounded-2xl px-10 h-14 text-base font-bold shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all" onClick={onBack}>Explore Helpers</Button>
          </div>
        )}
      </div>
    </div>
  );
}
