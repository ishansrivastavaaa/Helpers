import { useState, useEffect } from 'react';
import { Star, MapPin, ShieldCheck, Phone, MessageSquare, Calendar, ArrowLeft, CheckCircle2, MessageCircle, Loader2 } from 'lucide-react';
import { Helper } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-error';
import { toast } from 'sonner';

interface HelperDetailProps {
  helper: Helper;
  onBack: () => void;
  userCoordinates?: {lat: number, lng: number} | null;
}

import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

import { Input } from './ui/input';

export default function HelperDetail({ helper, onBack, userCoordinates }: HelperDetailProps) {
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');

  // Default location if none provided (New Delhi)
  const defaultLocation = { lat: 28.6139, lng: 77.2090 };
  const helperLocation = helper.location?.lat && helper.location?.lng 
    ? { lat: Number(helper.location.lat), lng: Number(helper.location.lng) } 
    : defaultLocation;

  const handleWhatsApp = () => {
    if (helper.phone) {
      const category = helper.category ? helper.category.toLowerCase() : 'service';
      const message = encodeURIComponent(`Hi ${helper.name || 'there'}, I saw your profile on Helpers.net.in and I'm looking for a ${category}...`);
      window.open(`https://wa.me/${helper.phone}?text=${message}`, '_blank');
    }
  };

  const handleConfirmBooking = async () => {
    if (!auth.currentUser) {
      toast.error("Please login to book a helper");
      setShowBookingDialog(false);
      return;
    }

    if (!bookingDate || !bookingTime) {
      toast.error("Please select a date and time for the booking.");
      return;
    }

    setIsBooking(true);
    try {
      // Use consistent format DD/MM/YYYY for cancellation logic
      const dateObj = new Date(bookingDate);
      const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;

      await addDoc(collection(db, 'bookings'), {
        userId: auth.currentUser.uid,
        helperId: helper.id,
        helperName: helper.name,
        category: helper.category,
        status: 'Upcoming',
        price: helper.priceRange,
        date: formattedDate,
        time: bookingTime,
        address: 'Default Address', // In a real app, we would collect this from the user
        createdAt: serverTimestamp()
      });
      setBookingSuccess(true);
    } catch (error) {
      toast.error("Failed to book helper. Please try again.");
      handleFirestoreError(error, OperationType.CREATE, 'bookings');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* ... existing back button ... */}
      <Button variant="ghost" onClick={onBack} className="mb-8 -ml-4 text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to search
      </Button>

      <div className="grid lg:grid-cols-3 gap-8 lg:gap-16">
        <div className="lg:col-span-2 space-y-10 lg:space-y-12">
          {/* ... existing profile header ... */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
            <div className="w-full md:w-72 aspect-square rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/10">
              <img 
                src={helper.imageUrl} 
                alt={helper.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-primary/5 text-primary border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                  {helper.category}
                </Badge>
                {helper.isAadhaarVerified && (
                  <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-green-200">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Aadhaar Verified
                  </div>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-serif font-medium tracking-tight leading-none">{helper.name}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <div className="flex items-center gap-1.5">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="text-xl font-bold">{helper.rating}</span>
                  <span className="text-muted-foreground text-sm">({helper.reviewCount} reviews)</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
                  <MapPin className="h-4 w-4" />
                  New Delhi, IN
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(helper.skills) && helper.skills.map((skill, index) => (
                  <Badge key={`${skill}-${index}`} variant="secondary" className="px-4 py-1.5 rounded-xl bg-muted/50 text-muted-foreground border-none text-xs font-medium">
                    {skill}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Badge variant="outline" className="px-3 py-1 text-xs uppercase tracking-widest border-green-500/30 text-green-600 bg-green-500/10">
                  UPI Accepted
                </Badge>
                <Badge variant="outline" className="px-3 py-1 text-xs uppercase tracking-widest border-blue-500/30 text-blue-600 bg-blue-500/10">
                  Cash After Service
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-medium tracking-tight">About</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {helper.description}
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-medium tracking-tight">Location</h2>
            <div className="h-[300px] w-full rounded-[2rem] overflow-hidden border border-muted/50 shadow-lg shadow-primary/5">
              <APIProvider apiKey={(import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || ''}>
                <Map
                  defaultCenter={helperLocation}
                  defaultZoom={userCoordinates ? 11 : 13}
                  gestureHandling={'greedy'}
                  disableDefaultUI={true}
                  className="w-full h-full"
                >
                  <Marker position={helperLocation} title="Helper Location" />
                  {userCoordinates && (
                    <Marker 
                      position={userCoordinates} 
                      title="Your Location"
                      icon={{
                        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                      }}
                    />
                  )}
                </Map>
              </APIProvider>
            </div>
            {userCoordinates && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                Your location is marked in blue. The helper will be able to see this location for service delivery.
              </p>
            )}
          </div>

          {helper.shopName && (
            <div className="bg-primary/5 p-8 rounded-[2rem] space-y-6 border border-primary/10">
              <h2 className="text-xl font-serif font-medium flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Shop Information
              </h2>
              <div className="space-y-1">
                <p className="text-lg font-bold tracking-tight">{helper.shopName}</p>
                <p className="text-muted-foreground text-sm">{helper.shopAddress}</p>
              </div>
              <div className="flex flex-wrap gap-6 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/60">
                  <CheckCircle2 className="h-4 w-4" />
                  Delivery Available
                </div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/60">
                  <CheckCircle2 className="h-4 w-4" />
                  Walk-in Welcome
                </div>
              </div>
            </div>
          )}

          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-medium tracking-tight">Reviews</h2>
              <Button variant="link" className="text-primary font-bold uppercase tracking-widest text-[10px]">Write a review</Button>
            </div>
            <div className="space-y-10">
              {Array.isArray(helper.reviews) && helper.reviews.length > 0 ? (
                helper.reviews.map((review, index) => (
                  <div key={review.id || `review-${index}`} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 rounded-2xl">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">{review.userName?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold tracking-tight">{review.userName}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${i < review.rating ? 'fill-primary text-primary' : 'text-muted'}`} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed pl-16">
                      {review.comment}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground italic text-center py-12 bg-muted/20 rounded-3xl">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="lg:sticky lg:top-24 bg-card p-6 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-muted/50 space-y-8">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">Estimated Price</p>
              <p className="text-4xl font-bold text-primary tracking-tight">{helper.priceRange}</p>
              <p className="text-[10px] text-muted-foreground mt-4 font-medium italic leading-relaxed">
                * Price is negotiable. Fix your own price with the helper.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/20"
                onClick={() => {
                  setBookingSuccess(false);
                  setShowBookingDialog(true);
                }}
              >
                Book Now
              </Button>
              <Button 
                onClick={handleWhatsApp}
                className="w-full h-14 rounded-2xl text-base font-bold bg-[#25D366] hover:bg-[#128C7E] text-white border-none shadow-lg shadow-green-500/20"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                WhatsApp Chat
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" className="h-14 rounded-2xl font-bold">
                  <Phone className="mr-2 h-4 w-4" />
                  Call
                </Button>
                <Button variant="secondary" className="h-14 rounded-2xl font-bold">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat
                </Button>
              </div>
            </div>

            <Separator className="opacity-50" />

            <div className="space-y-5">
              <p className="font-bold text-xs uppercase tracking-widest">Why choose {helper.name ? String(helper.name).split(' ')[0] : 'this helper'}?</p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  Verified background and identity
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  Excellent track record in your area
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  Equipped with professional tools
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border border-muted/50 shadow-2xl bg-background/80 backdrop-blur-xl">
          {!bookingSuccess ? (
            <div className="p-8 space-y-6 relative">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent -z-10" />
              <DialogHeader>
                <DialogTitle className="text-3xl font-serif font-medium tracking-tight">Confirm Booking</DialogTitle>
                <DialogDescription className="text-base">
                  You are about to request a service from <span className="font-bold text-foreground">{helper.name}</span>.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-2">
                <div className="flex justify-between items-center bg-card/50 backdrop-blur-sm border border-muted/50 p-5 rounded-[1.5rem] shadow-sm">
                  <span className="text-muted-foreground font-medium text-sm uppercase tracking-widest">Service</span>
                  <span className="font-bold">{helper.category}</span>
                </div>
                <div className="flex justify-between items-center bg-card/50 backdrop-blur-sm border border-muted/50 p-5 rounded-[1.5rem] shadow-sm">
                  <span className="text-muted-foreground font-medium text-sm uppercase tracking-widest">Est. Price</span>
                  <span className="font-bold text-primary text-lg">{helper.priceRange}</span>
                </div>

                <div className="space-y-2 mt-4">
                  <span className="text-muted-foreground font-medium text-xs uppercase tracking-widest px-1">Select Date</span>
                  <Input 
                    type="date" 
                    className="h-12 rounded-xl text-base"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]} // prevent past dates
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-muted-foreground font-medium text-xs uppercase tracking-widest px-1">Select Time</span>
                  <Input 
                    type="time" 
                    className="h-12 rounded-xl text-base"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-0 pt-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowBookingDialog(false)} 
                  className="rounded-2xl h-14 w-full sm:w-auto font-bold"
                  disabled={isBooking}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmBooking} 
                  disabled={isBooking} 
                  className="rounded-2xl h-14 w-full sm:w-auto font-bold shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all"
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="p-10 text-center space-y-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent -z-10" />
              <div className="w-24 h-24 bg-green-500/10 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner border border-green-500/20">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-serif font-medium tracking-tight">Booking Confirmed!</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Your service request has been sent to <span className="font-bold text-foreground">{helper.name}</span>. They will contact you shortly to confirm the exact time.
                </p>
              </div>
              <Button 
                onClick={() => {
                  setShowBookingDialog(false);
                  onBack(); // Optionally go back to home or bookings
                }} 
                className="w-full rounded-2xl h-14 font-bold text-base shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all"
              >
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
