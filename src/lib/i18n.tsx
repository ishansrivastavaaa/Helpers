import React, { createContext, useContext, useState } from 'react';

type Language = 'EN' | 'HI';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  EN: {
    'hero.title': 'Find Trusted Local Helpers',
    'hero.subtitle': 'Book verified professionals for your home needs. Plumbers, electricians, cleaners, and more.',
    'hero.search': 'What do you need help with?',
    'nav.find': 'Find Helpers',
    'nav.categories': 'Categories',
    'nav.how': 'How it works',
    'nav.login': 'Login',
    'nav.become': 'Become a Helper',
    'home.recommended': 'Recommended for you',
    'home.top': 'Top Rated',
    'home.desc': 'Hand-picked professionals in your neighborhood.',
    'home.all': 'All',
    'home.no_helpers': 'No helpers found',
    'home.try_adjusting': 'Try adjusting your search or category filters.',
    'home.clear': 'Clear all filters',
    'home.are_you': 'Are you a skilled professional?',
    'home.join': 'Join our community of local experts and grow your business. Set your own schedule and fix your own prices.',
    'home.register': 'Register as a Helper',
    'home.learn': 'Learn More'
  },
  HI: {
    'hero.title': 'भरोसेमंद स्थानीय सहायक खोजें',
    'hero.subtitle': 'अपने घर की जरूरतों के लिए सत्यापित पेशेवरों को बुक करें। प्लंबर, इलेक्ट्रीशियन, क्लीनर और बहुत कुछ।',
    'hero.search': 'आपको किस काम में मदद चाहिए?',
    'nav.find': 'सहायक खोजें',
    'nav.categories': 'श्रेणियाँ',
    'nav.how': 'यह कैसे काम करता है',
    'nav.login': 'लॉग इन करें',
    'nav.become': 'सहायक बनें',
    'home.recommended': 'आपके लिए अनुशंसित',
    'home.top': 'शीर्ष रेटेड',
    'home.desc': 'आपके पड़ोस में चुने गए पेशेवर।',
    'home.all': 'सभी',
    'home.no_helpers': 'कोई सहायक नहीं मिला',
    'home.try_adjusting': 'अपनी खोज या श्रेणी फ़िल्टर समायोजित करने का प्रयास करें।',
    'home.clear': 'सभी फ़िल्टर साफ़ करें',
    'home.are_you': 'क्या आप एक कुशल पेशेवर हैं?',
    'home.join': 'स्थानीय विशेषज्ञों के हमारे समुदाय में शामिल हों और अपना व्यवसाय बढ़ाएं। अपना खुद का शेड्यूल सेट करें और अपनी खुद की कीमतें तय करें।',
    'home.register': 'सहायक के रूप में पंजीकरण करें',
    'home.learn': 'और जानें'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('EN');

  const t = (key: string) => {
    return (translations[language] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
