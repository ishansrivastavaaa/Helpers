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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!selectedBookingForPayment || !auth.currentUser) return;
    
    setIsProcessingPayment(true);
    
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setIsProcessingPayment(false);
        return;
      }

      // Parse amount from string like "₹500" or "₹ 500"
      const amountStr = selectedBookingForPayment.price.replace(/[^0-9]/g, '');
      const amount = parseInt(amountStr, 10);

      if (isNaN(amount)) {
        toast.error('Invalid amount');
        setIsProcessingPayment(false);
        return;
      }

      // Create order on backend
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          receipt: selectedBookingForPayment.id,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Helpers Platform',
        description: `Payment for ${selectedBookingForPayment.category}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              // Update booking status
              const bookingRef = doc(db, 'bookings', selectedBookingForPayment.id);
              await updateDoc(bookingRef, {
                paymentStatus: 'Paid'
              });

              // Generate Invoice in helpers subcollection
              const invoiceData = {
                bookingId: selectedBookingForPayment.id,
                userId: auth.currentUser!.uid,
                helperId: selectedBookingForPayment.helperId,
                amount: selectedBookingForPayment.price,
                status: 'Paid',
                date: new Date().toISOString(),
                createdAt: serverTimestamp()
              };
              
              await addDoc(collection(db, 'helpers', selectedBookingForPayment.helperId, 'invoices'), invoiceData);

              // Create notification for the client
              await addDoc(collection(db, 'notifications'), {
                userId: auth.currentUser?.uid,
                title: 'Payment Successful',
                message: `Your payment of ${selectedBookingForPayment.price} to ${selectedBookingForPayment.helperName} was successful. Invoice generated.`,
                read: false,
                createdAt: serverTimestamp()
              });

              toast.success('Payment successful! Invoice generated.');
              setSelectedBookingForPayment(null);
            } else {
              toast.error('Payment verification failed');
            }
          } catch (err) {
            console.error(err);
            toast.error('Error verifying payment');
          }
        },
        prefill: {
          name: auth.currentUser.displayName || '',
          email: auth.currentUser.email || '',
        },
        theme: {
          color: '#000000',
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed to process. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
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
                            {booking.paymentStatus !== 'Paid' ? (
                              <Button 
                                className="rounded-2xl shadow-lg shadow-primary/20 flex-1 md:flex-none h-12 bg-green-600 hover:bg-green-700 text-white"
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
                                  className="rounded-2xl border-primary/20 text-primary hover:bg-primary/10 h-12"
                                  onClick={() => handleViewInvoice(booking)}
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  Invoice
                                </Button>
                              </>
                            )}
                            {booking.paymentStatus !== 'Paid' && (
                              <Button variant="outline" className="rounded-2xl border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive flex-1 md:flex-none h-12">Cancel</Button>
                            )}
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
              className="w-full rounded-2xl h-14 text-lg font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl shadow-[#25D366]/20"
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
              className="w-full rounded-2xl h-14 text-lg font-bold"
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
