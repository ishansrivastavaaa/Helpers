import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Clock, MapPin, CheckCircle2, AlertCircle, Loader2, CreditCard, QrCode, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-error';
import { toast } from 'sonner';

interface MyBookingsProps {
  onBack: () => void;
}

interface Booking {
  id: string;
  helperId: string;
  helperName: string;
  category: string;
  date: string;
  time: string;
  status: string;
  price: string;
  address: string;
  paymentStatus?: string;
}

interface Invoice {
  id: string;
  bookingId: string;
  userId: string;
  helperId: string;
  amount: string;
  status: string;
  date: string;
}

export default function MyBookings({ onBack }: MyBookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewingInvoice, setIsViewingInvoice] = useState(false);

  const handleCancelBooking = async (booking: Booking) => {
    // Parse the booking date and time
    // date: "DD/MM/YYYY", time: "HH:MM"
    try {
      const [day, month, year] = booking.date.split('/').map(Number);
      const [hours, minutes] = booking.time.split(':').map(Number);
      const bookingDate = new Date(year, month - 1, day, hours, minutes);
      const now = new Date();
      
      const diffInHours = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      let message = 'Are you sure you want to cancel this booking?';
      let penalty = false;
      
      if (diffInHours < 3 && diffInHours > 0) {
        message = 'Warning: This booking is in less than 3 hours. A cancellation charge of 30% will apply. Do you wish to continue?';
        penalty = true;
      } else if (diffInHours <= 0) {
        toast.error("Cannot cancel a booking that has already started or passed.");
        return;
      }

      if (!window.confirm(message)) return;

      const bookingRef = doc(db, 'bookings', booking.id);
      await updateDoc(bookingRef, {
        status: penalty ? 'Cancelled (Penalty Applied)' : 'Cancelled',
        cancelledAt: serverTimestamp(),
        hasPenalty: penalty
      });
      
      toast.success(penalty ? 'Booking cancelled. 30% penalty recorded.' : 'Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Could not cancel booking');
    }
  };

  const handleBookSameHelper = async (booking: Booking) => {
    if (!window.confirm(`Request ${booking.helperName} again for ${booking.category}?`)) return;

    try {
      const dateObj = new Date();
      const finalDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
      
      // Auto-schedule ~30 mins from now
      dateObj.setMinutes(dateObj.getMinutes() + 30);
      const finalTime = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

      await addDoc(collection(db, 'bookings'), {
        userId: auth.currentUser!.uid,
        helperId: booking.helperId,
        helperName: booking.helperName,
        category: booking.category,
        status: 'Assigned',
        price: booking.price, // Reuse same pricing mode
        date: finalDate,
        time: finalTime,
        address: booking.address,
        createdAt: serverTimestamp()
      });

      toast.success(`${booking.helperName} has been booked! Check Upcoming bookings.`);
    } catch (error) {
      console.error('Error re-booking:', error);
      toast.error('Could not request helper.');
    }
  };

  const handleManualPaymentConfirmation = async () => {
    if (!selectedBookingForPayment || !auth.currentUser) return;
    setIsProcessingPayment(true);
    
    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 1500));
    
    try {
      const response = { razorpay_payment_id: `upi_manual_${Math.random().toString(36).substring(7)}` };
      
      const invoiceData = {
        bookingId: selectedBookingForPayment.id,
        userId: auth.currentUser?.uid,
        helperId: selectedBookingForPayment.helperId,
        amount: selectedBookingForPayment.price,
        status: 'Paid',
        date: new Date().toISOString(),
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'helpers', selectedBookingForPayment.helperId, 'invoices'), invoiceData);
      
      await addDoc(collection(db, 'transactions'), {
        ...invoiceData,
        type: 'Service Payment',
        externalRef: response.razorpay_payment_id
      });

      await addDoc(collection(db, 'notifications'), {
        userId: auth.currentUser?.uid,
        title: 'Payment Successful',
        message: `Your payment of ${selectedBookingForPayment.price} to ${selectedBookingForPayment.helperName} was successful. Invoice generated.`,
        createdAt: serverTimestamp(),
        read: false,
        type: 'payment'
      });

      const bookingRef = doc(db, 'bookings', selectedBookingForPayment.id);
      await updateDoc(bookingRef, { paymentStatus: 'Paid' });

      toast.success('Payment recorded successfully');
      setSelectedBookingForPayment(null);
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to confirm payment');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePayment = async () => {
    // Replaced real razorpay open with manual confirmation because backend doesn't exist
    toast.error('Razorpay backend not configured. Proceeding with simulated manual UPI/Cash payment demo.', { duration: 4000 });
    handleManualPaymentConfirmation();
  };

  const handleViewInvoice = async (booking: Booking) => {
    try {
      const q = query(
        collection(db, 'helpers', booking.helperId, 'invoices'),
        where('bookingId', '==', booking.id)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const invoiceDoc = snapshot.docs[0];
        setSelectedInvoice({ id: invoiceDoc.id, ...invoiceDoc.data() } as Invoice);
        setIsViewingInvoice(true);
      } else {
        toast.error('Invoice not found.');
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast.error('Could not load invoice.');
    }
  };

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
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20, 
                delay: index * 0.05 
              }}
            >
              <Card className="overflow-hidden border-muted/50 hover:border-primary/20 transition-all rounded-[2.5rem] bg-card/40 backdrop-blur-xl shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10">
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
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Due</p>
                        <p className="text-4xl font-bold text-primary tracking-tight">{booking.price}</p>
                      </div>
                      
                      <div className="flex flex-col gap-2 w-full md:w-auto">
                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                          {booking.status === 'Upcoming' ? (
                            <>
                              {booking.paymentStatus !== 'Paid' ? (
                                <Button 
                                  className="rounded-2xl shadow-lg shadow-primary/20 flex-1 md:flex-none h-12 bg-green-600 hover:bg-green-700 text-white transition-all active:scale-95"
                                  onClick={() => setSelectedBookingForPayment(booking)}
                                >
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Pay Now
                                </Button>
                              ) : (
                                <>
                                  <Badge variant="outline" className="rounded-2xl border-green-500/30 text-green-600 bg-green-500/10 flex items-center justify-center h-12 px-6">
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Paid
                                  </Badge>
                                  <Button 
                                    variant="outline" 
                                    className="rounded-2xl border-primary/20 text-primary hover:bg-primary/10 h-12 transition-all active:scale-95"
                                    onClick={() => handleViewInvoice(booking)}
                                  >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Invoice
                                  </Button>
                                </>
                              )}
                              {booking.paymentStatus !== 'Paid' && (
                                <Button 
                                  variant="outline" 
                                  className="rounded-2xl border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive flex-1 md:flex-none h-12 transition-all active:scale-95"
                                  onClick={() => handleCancelBooking(booking)}
                                >
                                  Cancel
                                </Button>
                              )}
                            </>
                          ) : (
                            <Button 
                              variant="outline" 
                              className="rounded-2xl flex-1 md:flex-none h-12 border-primary/20 text-primary hover:bg-primary/10 transition-all active:scale-95"
                              onClick={() => handleBookSameHelper(booking)}
                            >
                              Book Same Helper Again
                            </Button>
                          )}
                        </div>
                        {booking.status === 'Upcoming' && (
                          <Button 
                            variant="outline" 
                            className="rounded-2xl w-full h-12 border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/10 transition-all active:scale-95"
                            onClick={() => window.open(`https://wa.me/?text=Hi%20${booking.helperName},%20I%20hit%20you%20up%20on%20Helpers.`, '_blank')}
                          >
                            WhatsApp {booking.helperName}
                          </Button>
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
            <Button className="rounded-2xl px-10 h-14 text-base font-bold shadow-xl shadow-primary/20 hover:-translate-y-1 active:scale-95 transition-all" onClick={onBack}>Book a Helper</Button>
          </div>
        )}
      </div>

      <Dialog open={!!selectedBookingForPayment} onOpenChange={(open) => !open && !isProcessingPayment && setSelectedBookingForPayment(null)}>
        <DialogContent className="sm:max-w-md rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif font-bold text-center">Complete Payment</DialogTitle>
            <DialogDescription className="text-center">
              Pay directly to {selectedBookingForPayment?.helperName} via UPI
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-6 space-y-6">
            <div className="w-48 h-48 bg-muted/30 rounded-3xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center relative overflow-hidden">
              {isProcessingPayment ? (
                <div className="flex flex-col items-center gap-4 text-primary">
                  <Loader2 className="h-10 w-10 animate-spin" />
                  <span className="font-bold animate-pulse">Processing...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <QrCode className="h-16 w-16 opacity-50" />
                  <span className="text-xs font-bold uppercase tracking-widest">Scan to Pay</span>
                </div>
              )}
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
              <p className="text-4xl font-bold text-primary">{selectedBookingForPayment?.price}</p>
            </div>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button 
              size="lg" 
              className="w-full rounded-2xl h-14 text-lg font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl shadow-[#25D366]/20 transition-all active:scale-95"
              onClick={handlePayment}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? 'Please wait...' : 'Pay via UPI App'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewingInvoice} onOpenChange={setIsViewingInvoice}>
        <DialogContent className="sm:max-w-md rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif font-bold text-center">Transaction Invoice</DialogTitle>
            <DialogDescription className="text-center">
              Receipt for your payment
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="flex flex-col py-6 space-y-6">
              <div className="bg-muted/30 p-6 rounded-2xl border border-muted/50 space-y-4">
                <div className="flex justify-between items-center border-b border-muted/50 pb-4">
                  <span className="text-sm text-muted-foreground">Invoice ID</span>
                  <span className="font-mono text-sm font-bold">{selectedInvoice.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-muted/50 pb-4">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="font-medium">{new Date(selectedInvoice.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-muted/50 pb-4">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline" className="border-green-500/30 text-green-600 bg-green-500/10">
                    {selectedInvoice.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-base font-bold">Total Amount Paid</span>
                  <span className="text-2xl font-bold text-primary">{selectedInvoice.amount}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-center">
            <Button 
              size="lg" 
              className="w-full rounded-2xl h-14 text-lg font-bold transition-all active:scale-95"
              onClick={() => setIsViewingInvoice(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
