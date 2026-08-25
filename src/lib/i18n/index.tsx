'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Locale = 'en' | 'hi'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const translations = {
  en: {
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.report': 'Report Issue',
    'nav.track': 'Track Waste',
    'nav.centers': 'Centers',
    'nav.rewards': 'Rewards',
    'nav.chatbot': 'Eco Mitra',
    'nav.map': 'Hotspot Map',
    'nav.analytics': 'Analytics',
    'nav.admin': 'Admin',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'nav.logout': 'Logout',
    'nav.language': 'Language',
    'hero.title': 'Swachh Sankalp',
    'hero.subtitle': 'Smart WasteWise Management System',
    'hero.description': 'Building cleaner, greener communities through technology, citizen participation, and sustainable waste management.',
    'hero.cta': 'Get Started',
    'hero.learnMore': 'Learn More',
    'hero.reportIssue': 'Report an Issue',
    'hero.trackWaste': 'Track Waste',
    'hero.joinNow': 'Join Now',
    'features.title': 'How It Works',
    'features.segregate': 'Smart Segregation',
    'features.segregateDesc': 'Citizens segregate waste using smart guidance provided through the application.',
    'features.bins': 'Smart Bins',
    'features.binsDesc': 'Smart bins and the app help users correctly classify waste.',
    'features.report': 'Geo-Tagged Reports',
    'features.reportDesc': 'Citizens can report waste issues through geo-tagged photos and messages.',
    'features.municipalities': 'Real-Time Updates',
    'features.municipalitiesDesc': 'Municipalities and recyclers receive real-time updates for quick action.',
    'features.chatbot': 'AI Chatbot',
    'features.chatbotDesc': 'AI chatbot provides 24/7 support and waste management guidance.',
    'features.rewards': 'Reward System',
    'features.rewardsDesc': 'Reward systems, awareness campaigns, and training encourage responsible waste disposal.',
    'features.leaderboard': 'City Leaderboard',
    'features.leaderboardDesc': 'City Leaderboards track and compare city performance to improve accountability.',
    'dashboard.title': 'Dashboard',
    'dashboard.totalComplaints': 'Total Complaints',
    'dashboard.resolved': 'Resolved',
    'dashboard.pending': 'Pending',
    'dashboard.wasteCollected': 'Waste Collected (kg)',
    'dashboard.activeCitizens': 'Active Citizens',
    'dashboard.recyclingRate': 'Recycling Rate',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.topCities': 'Top Performing Cities',
    'dashboard.wasteHotspots': 'Waste Hotspots',
    'dashboard.smartBins': 'Smart Bins Status',
    'dashboard.binFillLevel': 'Bin Fill Level',
    'dashboard.lastEmptied': 'Last Emptied',
    'dashboard.viewAll': 'View All',
    'dashboard.overview': 'Overview',
    'dashboard.complaints': 'Complaints',
    'dashboard.cities': 'Cities',
    'dashboard.centers': 'Recycling Centers',
    'dashboard.bins': 'Smart Bins',
    'chatbot.title': 'AI Waste Assistant',
    'chatbot.placeholder': 'Ask about waste management...',
    'chatbot.greeting': 'Hello! I\'m your AI waste management assistant. How can I help you today?',
    'footer.about': 'About',
    'footer.contact': 'Contact',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.copyright': 'Swachh Sankalp. All rights reserved.',
    'footer.govt': 'An initiative under Swachh Bharat Mission',
    'auth.loginTitle': 'Welcome Back',
    'auth.signupTitle': 'Create Account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.fullName': 'Full Name',
    'auth.phone': 'Phone Number',
    'auth.city': 'City',
    'auth.state': 'State',
    'auth.forgotPassword': 'Forgot password?',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
  },
  hi: {
    'nav.home': 'होम',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.report': 'समस्या रिपोर्ट करें',
    'nav.track': 'कचरा ट्रैक करें',
    'nav.centers': 'केंद्र',
    'nav.rewards': 'इनाम',
    'nav.chatbot': 'एको मित्र',
    'nav.map': 'हॉटस्पॉट मैप',
    'nav.analytics': 'विश्लेषण',
    'nav.admin': 'एडमिन',
    'nav.login': 'लॉगिन',
    'nav.signup': 'साइन अप',
    'nav.logout': 'लॉगआउट',
    'nav.language': 'भाषा',
    'hero.title': 'स्वच्छ संकल्प',
    'hero.subtitle': 'स्मार्ट वेस्टवाइज़ प्रबंधन प्रणाली',
    'hero.description': 'प्रौद्योगिकी, नागरिक सहभागिता और सतत कचरा प्रबंधन के माध्यम से स्वच्छ, हरित समुदायों का निर्माण।',
    'hero.cta': 'शुरुआत करें',
    'hero.learnMore': 'और जानें',
    'hero.reportIssue': 'समस्या रिपोर्ट करें',
    'hero.trackWaste': 'कचरा ट्रैक करें',
    'hero.joinNow': 'अभी जुड़ें',
    'features.title': 'यह कैसे काम करता है',
    'features.segregate': 'स्मार्ट अलगाव',
    'features.segregateDesc': 'नागरिक एप्लिकेशन द्वारा प्रदान की गई स्मार्ट मार्गदर्शन का उपयोग करके कचरा अलग करते हैं।',
    'features.bins': 'स्मार्ट बिन',
    'features.binsDesc': 'स्मार्ट बिन और ऐप उपयोगकर्ताओं को कचरे को सही तरीके से वर्गीकृत करने में मदद करते हैं।',
    'features.report': 'भौगोलिक टैग रिपोर्ट',
    'features.reportDesc': 'नागरिक भौगोलिक रूप से टैग की गई फोटो और संदेशों के माध्यम से कचरे की समस्याओं की रिपोर्ट कर सकते हैं।',
    'features.municipalities': 'रियल-टाइम अपडेट',
    'features.municipalitiesDesc': 'नगर पालिकाएं और रीसाइकलर त्वरित कार्रवाई के लिए रियल-टाइम अपडेट प्राप्त करती हैं।',
    'features.chatbot': 'एआई चैटबॉट',
    'features.chatbotDesc': 'एआई चैटबॉट 24/7 सहायता और कचरा प्रबंधन मार्गदर्शन प्रदान करता है।',
    'features.rewards': 'पुरस्कार प्रणाली',
    'features.rewardsDesc': 'पुरस्कार प्रणाली, जागरूकता अभियान और प्रशिक्षण जिम्मेदार कचरा निपटान को प्रोत्साहित करते हैं।',
    'features.leaderboard': 'शहर लीडरबोर्ड',
    'features.leaderboardDesc': 'शहर लीडरबोर्ड जवाबदehी बढ़ाने के लिए शहर प्रदर्शन को ट्रैक और तुलना करते हैं।',
    'dashboard.title': 'डैशबोर्ड',
    'dashboard.totalComplaints': 'कुल शिकायतें',
    'dashboard.resolved': 'हल की गई',
    'dashboard.pending': 'लंबित',
    'dashboard.wasteCollected': 'कचरा संग्रहीत (किग्रा)',
    'dashboard.activeCitizens': 'सक्रिय नागरिक',
    'dashboard.recyclingRate': 'रीसाइक्लिंग दर',
    'dashboard.recentActivity': 'हालिया गतिविधि',
    'dashboard.topCities': 'शीर्ष प्रदर्शन करने वाले शहर',
    'dashboard.wasteHotspots': 'कचरे के हॉटस्पॉट',
    'dashboard.smartBins': 'स्मार्ट बिन स्टेटस',
    'dashboard.binFillLevel': 'बिन फिल स्तर',
    'dashboard.lastEmptied': 'अंतिम खाली',
    'dashboard.viewAll': 'सभी देखें',
    'dashboard.overview': 'अवलोकन',
    'dashboard.complaints': 'शिकायतें',
    'dashboard.cities': 'शहर',
    'dashboard.centers': 'रीसाइक्लिंग केंद्र',
    'dashboard.bins': 'स्मार्ट बिन',
    'chatbot.title': 'एआई कचरा सहायक',
    'chatbot.placeholder': 'कचरा प्रबंधन के बारे में पूछें...',
    'chatbot.greeting': 'नमस्कार! मैं आपका एआई कचरा प्रबंधन सहायक हूं। आज मैं आपकी क्या मदद कर सकता हूं?',
    'footer.about': 'हमारे बारे में',
    'footer.contact': 'संपर्क करें',
    'footer.privacy': 'गोपनीयता नीति',
    'footer.terms': 'सेवा की शर्तें',
    'footer.copyright': 'स्वच्छ संकल्प. सर्वाधिकार सुरक्षित।',
    'footer.govt': 'स्वच्छ भारत मिशन के तहत एक पहल',
    'auth.loginTitle': 'वापसी पर स्वागत है',
    'auth.signupTitle': 'खाता बनाएं',
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.fullName': 'पूरा नाम',
    'auth.phone': 'फोन नंबर',
    'auth.city': 'शहर',
    'auth.state': 'राज्य',
    'auth.forgotPassword': 'पासवर्ड भूल गए?',
    'auth.noAccount': 'खाता नहीं है?',
    'auth.hasAccount': 'पहले से खाता है?',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('locale') as Locale
    if (saved) setLocale(saved)
  }, [])

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  const t = (key: string): string => {
    return translations[locale]?.[key as keyof typeof translations.en] || key
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}
