import { motion } from 'motion/react';
import { ArrowLeft, ShieldCheck, ShieldAlert, CheckCircle2, UserCheck, PhoneCall, MessageCircle, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

interface SafetyProps {
  onBack: () => void;
}

export default function Safety({ onBack }: SafetyProps) {
  const guidelines = [
    {
      icon: UserCheck,
      title: 'Verified Professionals',
      desc: 'All helpers on our platform undergo a multi-step verification process, including identity and background checks.'
    },
    {
      icon: MessageCircle,
      title: 'Secure Communication',
      desc: 'Use our integrated WhatsApp feature to discuss requirements. Keep a record of your conversations for safety.'
    },
    {
      icon: ShieldCheck,
      title: 'Service Guarantee',
      desc: 'We stand by the quality of our helpers. If you are not satisfied, our support team is here to help resolve issues.'
    },
    {
      icon: PhoneCall,
      title: '24/7 Support',
      desc: 'Our dedicated safety team is available around the clock to assist you with any concerns during a service.'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Button variant="ghost" onClick={onBack} className="mb-8 -ml-4 text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to home
      </Button>

      <div className="space-y-16">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px]">
            <Sparkles className="h-3 w-3" />
            Safety First
          </div>
          <h1 className="text-5xl font-serif font-medium tracking-tight">Safety Guidelines</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Your safety is our top priority. We've built a community based on trust, transparency, and accountability.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          {guidelines.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-[2.5rem] border border-muted/50 bg-card hover:border-primary/20 transition-all space-y-4"
            >
              <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-serif font-medium">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-destructive/5 border border-destructive/10 p-10 rounded-[3rem] space-y-6">
          <div className="flex items-center gap-3 text-destructive">
            <ShieldAlert className="h-6 w-6" />
            <h2 className="text-2xl font-serif font-medium">Emergency Protocol</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            In case of any immediate danger or emergency during a service, please contact local authorities (100 or 112) immediately. Once you are safe, please report the incident to our safety team.
          </p>
          <Button variant="destructive" className="rounded-xl px-8">Report an Incident</Button>
        </div>

        <div className="space-y-8">
          <h2 className="text-3xl font-serif font-medium tracking-tight">Tips for a Safe Experience</h2>
          <div className="grid gap-4">
            {[
              'Always verify the helper\'s ID when they arrive at your home.',
              'Discuss and fix the price before the work begins.',
              'Keep valuables in a secure place during the service.',
              'Provide clear instructions and supervise the work if possible.',
              'Share your service details with a family member or friend.'
            ].map((tip, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-muted/20 rounded-2xl">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <p className="text-sm font-medium">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
