import { motion } from 'motion/react';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { Button } from './ui/button';

export default function Cancellation({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-8 hover:bg-transparent hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-[2rem] p-8 md:p-12 shadow-xl shadow-primary/5 border border-muted/50"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold">Cancellation Policy</h1>
          </div>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">1. General Cancellation Rules</h2>
              <p>
                We understand that plans can change. Our cancellation policy is designed to be fair to both our clients and our helpers. You can cancel a booking directly through the "My Bookings" section of your profile.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">2. Free Cancellation Period</h2>
              <p>
                Bookings can be cancelled free of charge up to 3 hours before the scheduled service time. If you cancel within this window, you will not be charged any cancellation fees.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">3. Late Cancellations</h2>
              <p>
                Cancellations made less than 3 hours before the scheduled service time will be subject to a cancellation fee equivalent to 30% of the total booking amount. This is required to compensate the helper for their blocked schedule.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">4. No-Shows</h2>
              <p>
                If a helper arrives at the scheduled location and you are unavailable, or if you fail to cancel the booking and do not show up, you will be charged a no-show fee equivalent to 50% of the booking amount.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">5. Helper Cancellations</h2>
              <p>
                In the rare event that a helper needs to cancel your booking, you will be notified immediately and will not be charged. We will do our best to find a replacement helper for your requested time slot.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">6. Refunds</h2>
              <p>
                If you are eligible for a refund due to a cancellation, the amount will be processed back to your original payment method within 5-7 business days.
              </p>
            </section>

            <div className="mt-12 p-6 bg-muted/30 rounded-2xl border border-muted/50">
              <p className="text-sm">
                If you have any questions about our cancellation policy or need assistance with a specific booking, please contact our support team via WhatsApp.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
