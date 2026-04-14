import { motion } from 'motion/react';
import { ArrowLeft, Search, Calendar, CheckCircle2, ShieldCheck, Star, Sparkles, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';

interface HowItWorksProps {
  onBack: () => void;
}

export default function HowItWorks({ onBack }: HowItWorksProps) {
  const steps = [
    {
      icon: Search,
      title: 'Find your Helper',
      description: 'Browse through verified local professionals in your area. Filter by category, rating, or specific skills.'
    },
    {
      icon: MessageCircle,
      title: 'Chat on WhatsApp',
      description: 'Connect directly with the helper via WhatsApp. Discuss your requirements and fix a price that works for both.'
    },
    {
      icon: Calendar,
      title: 'Book & Relax',
      description: 'Schedule the service at your convenience. Our helpers arrive on time with the necessary tools.'
    },
    {
      icon: Star,
      title: 'Rate & Review',
      description: 'After the service is done, share your experience to help others in the community find the best help.'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Button variant="ghost" onClick={onBack} className="mb-8 -ml-4 text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to home
      </Button>

      <div className="space-y-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px]">
            <Sparkles className="h-3 w-3" />
            Simple & Transparent
          </div>
          <h1 className="text-6xl font-serif font-medium tracking-tight leading-tight">How Helpers Works</h1>
          <p className="text-muted-foreground text-xl leading-relaxed">
            We bridge the gap between skilled local professionals and people who need their services, making home maintenance stress-free.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="space-y-6 text-center"
            >
              <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto text-primary group-hover:scale-110 transition-transform">
                <step.icon className="h-8 w-8" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-serif font-medium">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-muted/30 rounded-[3rem] p-12 lg:p-20 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-serif font-medium tracking-tight">Safety & Trust First</h2>
            <div className="space-y-6">
              {[
                { title: 'Identity Verification', desc: 'Every helper undergoes a strict identity check before joining.' },
                { title: 'Community Ratings', desc: 'Real reviews from real customers ensure high service quality.' },
                { title: 'Secure Communication', desc: 'Direct WhatsApp integration for transparent discussions.' }
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold tracking-tight">{item.title}</h4>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
              <img 
                src="https://picsum.photos/seed/trust/800/800" 
                alt="Trust and Safety" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-background p-8 rounded-[2rem] shadow-xl border border-muted max-w-[240px]">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-bold">4.9/5</span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">Average rating of our verified helpers across India.</p>
            </div>
          </div>
        </div>

        <div className="text-center space-y-8 py-12">
          <h2 className="text-3xl font-serif font-medium">Ready to get started?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="h-14 px-10 rounded-2xl font-bold" onClick={onBack}>
              Find a Helper
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl font-bold">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
