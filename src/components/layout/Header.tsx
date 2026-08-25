'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n'
import { Globe, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { SwachhLogo } from './SwachhLogo'
import { ProfileDropdown } from '@/components/profile/ProfileDropdown'
import { createClient } from '@/lib/supabase/client'

export function Header() {
  const { t, locale, setLocale } = useLanguage()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()

    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  const navItems = [
    { href: '/', label: t('nav.home') },
    { href: '/about', label: 'About' },
    { href: '/dashboard', label: t('nav.dashboard') },
    { href: '/report', label: t('nav.report') },
    { href: '/track', label: t('nav.track') },
    { href: '/map', label: t('nav.map') },
    { href: '/centers', label: t('nav.centers') },
    { href: '/chatbot', label: t('nav.chatbot') },
    { href: '/rewards', label: t('nav.rewards') },
    { href: '/analytics', label: t('nav.analytics') },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl text-navy shadow-[0_1px_8px_rgba(255,153,51,0.10)]" suppressHydrationWarning>
      {/* Top Government Bar */}
      <div className="bg-navy text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span>Smart Waste Management</span>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span className="hidden sm:inline text-gray-300">Swachh Bharat Mission</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-gray-300">स्वच्छ भारत, सुंदर भारत</span>
            </div>
        </div>
      </div>
      
      {/* Flag Stripe */}
      <div className="flag-stripe" />
      
      {/* Main Navigation */}
      <div className={`transition-all duration-300 ${scrolled ? 'shadow-lg' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <SwachhLogo size={56} />
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold leading-tight text-navy">Swachh Sankalp</h1>
                <span className="hidden sm:inline text-gray-300">|</span>
                <p className="hidden sm:block text-[11px] text-gray-500">Smart WasteWise Management</p>
              </div>
            </div>

            <nav className="hidden lg:flex items-center ml-6">
              <div className="flex items-center bg-gradient-to-r from-saffron/5 via-white to-green/5 backdrop-blur-md border border-gray-200/80 rounded-full px-1.5 py-0.5 shadow-[0_2px_12px_rgba(255,153,51,0.12)]">
                {navItems.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      pathname === item.href
                        ? 'bg-saffron text-navy shadow-md'
                        : 'text-gray-700 hover:bg-saffron-light hover:text-navy'
                    }`}
                  >
                    {index > 0 && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-px h-3 bg-gray-300" />
                    )}
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>

            <div className="ml-6 flex items-center gap-2">
              <button
                onClick={() => setLocale(locale === 'en' ? 'hi' : 'en')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md border-2 border-saffron text-sm font-medium text-navy hover:bg-saffron hover:text-white transition-all duration-200"
              >
                <Globe className="w-4 h-4" />
                {locale === 'en' ? 'हिं' : 'EN'}
              </button>

              {isLoggedIn ? (
                <ProfileDropdown />
              ) : (
                <Link
                  href="/login"
                  className="hidden sm:block px-5 py-2 bg-gradient-to-r from-saffron to-saffron-dark text-white rounded-md text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  {t('nav.login')}
                </Link>
              )}

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-saffron-light text-navy transition-colors"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {mobileOpen && (
            <div className="lg:hidden pb-4 border-t border-gray-200 pt-2 animate-slide-up">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-saffron-light hover:text-navy transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {!isLoggedIn && (
                <Link
                  href="/login"
                  className="block px-3 py-2 mt-2 text-sm font-medium text-saffron hover:bg-saffron-light rounded-md"
                  onClick={() => setMobileOpen(false)}
                >
                  {t('nav.login')}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
