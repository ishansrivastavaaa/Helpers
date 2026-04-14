import { motion } from 'motion/react';
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText, Bell, ShieldAlert, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

interface PrivacyProps {
  onBack: () => void;
}

export default function Privacy({ onBack }: PrivacyProps) {
  const sections = [
    {
      icon: Eye,
      title: 'Data Collection',
      content: 'We collect information you provide directly to us, such as when you create an account, book a service, or communicate with us. This includes your name, email, and location.'
    },
    {
      icon: Lock,
      title: 'Data Security',
      content: 'We use industry-standard security measures to protect your personal information from unauthorized access, disclosure, or destruction.'
    },
    {
      icon: FileText,
      title: 'Information Sharing',
      content: 'We do not sell your personal information. We only share data with service providers (Helpers) necessary to complete your requested services.'
    },
    {
      icon: Bell,
      title: 'Your Choices',
      content: 'You can access, update, or delete your account information at any time through your profile settings.'
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
            Your Trust Matters
          </div>
          <h1 className="text-5xl font-serif font-medium tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            At Helpers, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information.
          </p>
        </div>

        <div className="grid gap-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-muted/30 p-8 rounded-[2rem] border border-muted/50 space-y-4"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <section.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-serif font-medium">{section.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{section.content}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-primary/5 p-10 rounded-[3rem] space-y-6">
          <h2 className="text-2xl font-serif font-medium">Updates to this Policy</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We may update this privacy policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last Updated" date.
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Last Updated: April 2024</p>
        </div>
      </div>
    </div>
  );
}
