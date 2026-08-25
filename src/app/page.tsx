'use client'

import { useLanguage } from '@/lib/i18n'
import { Recycle, Trash2, MapPin, RefreshCw, Bot, Gift, Trophy, Users, Globe, Award, Leaf, Camera, TrendingUp, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { useCountUp, useInView } from '@/hooks/useCountUp'
import { createClient } from '@/lib/supabase/client'

const carouselSlides = [
  {
    title: 'Swachh Bharat Mission',
    subtitle: 'Clean India, Green India',
    description: 'Join the largest civic movement to create a cleaner and greener India through citizen participation and technology.',
    gradient: 'from-saffron via-orange-100 to-white',
    icon: Globe,
  },
  {
    title: 'Smart Waste Management',
    subtitle: 'Technology for a Cleaner Tomorrow',
    description: 'AI-powered waste classification, real-time tracking, and smart bin monitoring for efficient waste management.',
    gradient: 'from-navy via-blue-900 to-blue-800',
    icon: Bot,
  },
  {
    title: 'Citizen Engagement',
    subtitle: 'Every Citizen Matters',
    description: 'Report issues, earn rewards, and be part of the solution. Together we can build cleaner, greener communities.',
    gradient: 'from-green via-emerald-100 to-green-50',
    icon: Users,
  },
]

const stats = [
  { value: 85, suffix: '%', label: 'Waste Segregation', icon: Recycle, color: 'green' },
  { value: 60, suffix: '%', label: 'Recycling Efficiency', icon: TrendingUp, color: 'navy' },
  { value: 30, suffix: '%', label: 'Faster Collection', icon: Users, color: 'saffron' },
  { value: 10, suffix: 'K+', label: 'Citizens', icon: Users, color: 'green' },
  { value: 24, suffix: '/7', label: 'AI Support', icon: Bot, color: 'navy' },
  { value: 1000, suffix: '+', label: 'Issues Resolved', icon: Award, color: 'saffron' },
]

const benefits = [
  'Cleaner Communities',
  'Smart Waste Monitoring',
  'Sustainable Recycling',
  'Citizen Participation',
  'AI-Powered Guidance',
  'Reward-Based Engagement',
]

const howItWorksCards = [
  {
    icon: Recycle,
    title: 'Segregate Your Waste',
    description: 'Separate wet, dry, and recyclable waste with step-by-step smart guidance provided by the Swachh Sankalp app for accurate disposal.',
    color: '#22C55E',
  },
  {
    icon: Trash2,
    title: 'Use Smart Bins',
    description: 'Smart bins and intelligent classification help citizens identify the correct waste category, reducing contamination and improving recycling efficiency.',
    color: '#3B82F6',
  },
  {
    icon: Camera,
    title: 'Report Nearby Issues',
    description: 'Capture geo-tagged photos of overflowing bins or illegal dumping and instantly notify local authorities for quick resolution.',
    color: '#F97316',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Tracking',
    description: 'Municipal authorities and recycling partners receive live updates to monitor waste collection, optimize routes, and respond faster.',
    color: '#8B5CF6',
  },
  {
    icon: Bot,
    title: 'AI Waste Guide',
    description: 'Get instant answers about waste segregation, recycling practices, and disposal methods through a 24/7 AI-powered chatbot.',
    color: '#06B6D4',
  },
  {
    icon: Gift,
    title: 'Earn Green Rewards',
    description: 'Complete eco-friendly actions, participate in campaigns, and earn points, badges, and rewards for responsible waste management.',
    color: '#F59E0B',
  },
  {
    icon: Trophy,
    title: 'Compete for a Cleaner City',
    description: 'Track city rankings through public leaderboards that encourage healthy competition and improve cleanliness across communities.',
    color: '#EC4899',
  },
]

const colorMap: Record<string, { bg: string; text: string; light: string }> = {
  saffron: { bg: 'bg-saffron', text: 'text-saffron', light: 'bg-saffron-light' },
  green: { bg: 'bg-green', text: 'text-green', light: 'bg-green-light' },
  navy: { bg: 'bg-navy', text: 'text-navy', light: 'bg-blue-50' },
}

export default function Home() {
  const { t } = useLanguage()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const heroRef = useScrollAnimation()
  const featuresRef = useScrollAnimation()
  const statsRef = useScrollAnimation()
  const ctaRef = useScrollAnimation()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (isMounted) {
        setIsLoggedIn(!!session)
        setCheckingAuth(false)
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (isMounted) {
        setIsLoggedIn(!!session)
        setCheckingAuth(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const joinHref = isLoggedIn ? '/profile' : '/login'
  const joinLabel = t('hero.joinNow')

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length)
  }

  return (
    <div className="flex flex-col">
      {/* Image Carousel */}
      <section className="relative h-[350px] md:h-[450px] overflow-hidden">
        <div 
          className="carousel-track h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {carouselSlides.map((slide, index) => {
            const Icon = slide.icon
            const colors = colorMap[slide.gradient.includes('saffron') ? 'saffron' : slide.gradient.includes('navy') || slide.gradient.includes('blue') ? 'navy' : 'green']
            return (
              <div
                key={index}
                className={`carousel-slide h-full flex items-center justify-center ${index === 0 || index === 1 || index === 2 ? '' : `bg-gradient-to-br ${slide.gradient}`}`}
                style={
                  index === 0 ? { backgroundImage: 'url(/images/clean-india.png)', backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } :
                  index === 1 ? { backgroundImage: 'url(/images/clean-india-2.png)', backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } :
                  index === 2 ? { backgroundImage: 'url(/images/clean-india-3.png)', backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } :
                  {}
                }
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
                  <div className="grid grid-cols-1 gap-6 items-center">
                    <div className="text-center lg:text-left animate-slide-up">
                      <div className={`inline-flex items-center gap-2 backdrop-blur-md px-3 py-1 rounded-full mb-4 border ${index === 0 ? 'bg-green text-white border-green shadow-sm' : index === 1 ? 'bg-navy text-white border-navy shadow-sm' : index === 2 ? 'bg-saffron text-white border-saffron shadow-sm' : colors.light + ' border ' + colors.bg + '/20'}`}>
                        <Icon className={`w-4 h-4 ${index === 0 || index === 1 || index === 2 ? 'text-white' : colors.text}`} />
                        <span className={`text-xs font-medium ${index === 0 || index === 1 || index === 2 ? 'text-white' : colors.text}`}>{slide.subtitle}</span>
                      </div>
                      <div className={`rounded-xl p-4 md:p-5 ${index === 0 || index === 1 || index === 2 ? 'backdrop-blur-md bg-white/70 border border-white/60 shadow-lg max-w-2xl' : ''}`}>
                        <h1 
                          className="text-2xl md:text-4xl font-bold text-navy mb-4 leading-tight"
                          style={index === 0 || index === 1 || index === 2 ? { textShadow: 'none' } : {}}
                        >
                          {slide.title}
                        </h1>
                        <p 
                          className="text-base md:text-lg text-gray-700 mb-6 max-w-2xl"
                          style={index === 0 || index === 1 || index === 2 ? { textShadow: 'none' } : {}}
                        >
                          {slide.description}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                          <Link
                            href="/dashboard"
                            className="px-6 py-2 bg-white text-navy rounded-lg font-semibold text-base hover:bg-gray-100 transition-all duration-200 hover:shadow-lg hover:scale-105"
                          >
                            Get Started
                          </Link>
                          <Link
                            href="/report"
                            className="px-6 py-2 bg-navy text-white rounded-lg font-semibold text-base hover:bg-navy-light transition-all duration-200 hover:shadow-lg hover:scale-105"
                          >
                            Report Issue
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-navy hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg"
        >
          ←
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-navy hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg"
        >
          →
        </button>

        {/* Carousel Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {carouselSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'bg-saffron w-6' : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white" ref={statsRef.ref}>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${statsRef.isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Impact at a Glance
          </h2>
          <div className="w-20 h-1 bg-saffron mx-auto" />
        </div>
        <StackedCarousel />
        <BenefitsGrid />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7]" ref={featuresRef.ref}>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${featuresRef.isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              How it Works
            </h2>
            <div className="w-20 h-1 bg-saffron mx-auto mb-4" />
            <p className="text-gray-600 max-w-2xl mx-auto">
              Together for a Cleaner & Greener India
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {howItWorksCards.map((card, index) => {
              const Icon = card.icon
              return (
                <div
                  key={index}
                  className={`group bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-all duration-300 border border-gray-100 border-l-[6px] ${index === 6 ? 'lg:col-span-3 max-w-3xl mx-auto' : ''}`}
                  style={{ borderLeftColor: card.color }}
                >
                  <div className="p-4 flex items-center gap-4">
                    <div 
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 group-hover:scale-110"
                      style={{ backgroundColor: card.color, color: '#fff' }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-navy group-hover:text-[#2563eb] transition-colors duration-300">
                        {card.title}
                      </h3>
                    </div>
                  </div>
                  <div
                    className="max-h-0 opacity-0 overflow-hidden transition-all duration-500 ease-in-out group-hover:max-h-40 group-hover:opacity-100 group-hover:px-5 group-hover:pb-5"
                  >
                    <p className="text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-3">
                      {card.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-saffron via-saffron-dark to-saffron relative overflow-hidden" ref={ctaRef.ref}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rounded-full" />
        </div>
        <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 ${ctaRef.isVisible ? 'animate-scale-in' : 'opacity-0'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join the Movement
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Be part of the solution. Report issues, segregate waste, and help build a cleaner India.
          </p>
                          <Link
                            href={joinHref}
                            className="inline-block px-10 py-4 bg-navy text-white rounded-lg font-semibold text-lg hover:bg-navy-light transition-all duration-200 hover:shadow-xl hover:scale-105"
                            suppressHydrationWarning
                          >
                            {joinLabel}
                          </Link>
        </div>
      </section>
    </div>
  )
}

function StatsGrid() {
  const { ref, isInView } = useInView(0.2)

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const colors = colorMap[stat.color]
        const displayValue =
          typeof stat.value === 'number' ? useCountUp(stat.value, 2000, isInView) : stat.value
        const suffix = stat.suffix || ''

        return (
          <div
            key={stat.label}
            className="bg-white border border-gray-100 rounded-xl p-6 text-center shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)] transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`w-16 h-16 ${colors.light} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Icon className={`w-7 h-7 ${colors.text}`} />
            </div>
            <p className="text-3xl md:text-4xl font-bold text-navy mb-1">
              {typeof displayValue === 'number' ? `${displayValue}${suffix}` : displayValue}
            </p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        )
      })}
    </div>
  )
}

const benefitColors = [
  { bg: 'bg-green-50', text: 'text-green', border: 'border-green-100', iconBg: 'bg-green-100', accent: '#22C55E' },
  { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', iconBg: 'bg-blue-100', accent: '#3B82F6' },
  { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', iconBg: 'bg-amber-100', accent: '#F59E0B' },
  { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', iconBg: 'bg-purple-100', accent: '#8B5CF6' },
  { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100', iconBg: 'bg-cyan-100', accent: '#06B6D4' },
  { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', iconBg: 'bg-orange-100', accent: '#F97316' },
]

function BenefitsGrid() {
  const { ref, isInView } = useInView(0.2)
  const duplicatedBenefits = [...benefits, ...benefits]

  return (
    <div ref={ref} className="max-w-6xl mx-auto">
      <h3 className="text-2xl font-semibold text-navy text-center mb-8">Key Benefits</h3>
      <div className="relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        <div className="benefits-reel">
          {duplicatedBenefits.map((benefit, index) => {
            const colors = benefitColors[index % benefitColors.length]
            return (
              <div
                key={index}
                className="group relative flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-6 py-5 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 mx-3 flex-shrink-0 w-[320px]"
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 shadow-sm`} style={{ backgroundColor: `${colors.accent}15`, color: colors.accent }}>
                  <CheckCircle2 className="w-6 h-6" style={{ color: colors.accent }} />
                </div>
                <span className="text-navy font-semibold text-sm md:text-base leading-snug">{benefit}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const vibrantGradients = [
  'linear-gradient(135deg, #10b981, #059669)',
  'linear-gradient(135deg, #3b82f6, #1d4ed8)',
  'linear-gradient(135deg, #f97316, #ea580c)',
  'linear-gradient(135deg, #8b5cf6, #6d28d9)',
  'linear-gradient(135deg, #06b6d4, #0891b2)',
  'linear-gradient(135deg, #f59e0b, #d97706)',
]

function StackedCarousel() {
  const { ref, isInView } = useInView(0.2)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!isInView) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stats.length)
    }, 3000)

    return () => clearInterval(timer)
  }, [isInView])

  const previousIndex = (currentIndex - 1 + stats.length) % stats.length
  const nextIndex = (currentIndex + 1) % stats.length

  const getCardStyle = (index: number) => {
    if (index === currentIndex) {
      return {
        transform: 'translateX(0) rotateY(0deg) scale(1)',
        opacity: 1,
        zIndex: 30,
      }
    }
    if (index === nextIndex) {
      return {
        transform: 'translateX(58%) rotateY(-25deg) scale(0.85)',
        opacity: 0.5,
        zIndex: 20,
      }
    }
    if (index === previousIndex) {
      return {
        transform: 'translateX(-58%) rotateY(25deg) scale(0.85)',
        opacity: 0.5,
        zIndex: 20,
      }
    }
    return {
      transform: 'translateX(0) scale(0.8)',
      opacity: 0,
      zIndex: 0,
    }
  }

  return (
    <div
      ref={ref}
      className="relative h-[340px] md:h-[400px] flex items-center justify-center mb-6 md:mb-8 overflow-hidden"
    >
      <div className="relative w-full max-w-5xl mx-auto px-4" style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}>
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const gradient = vibrantGradients[index] || vibrantGradients[0]
          const isActive = index === currentIndex
          const displayValue = useCountUp(stat.value, 2000, isActive)
          const style = getCardStyle(index)

          return (
            <div
              key={stat.label}
              className="absolute left-1/2 top-1/2 w-full max-w-md"
              style={{
                transform: `translate(-50%, -50%) ${style.transform}`,
                opacity: style.opacity,
                zIndex: style.zIndex,
                transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s ease',
                willChange: 'transform, opacity',
                pointerEvents: isActive ? 'auto' : 'none',
              }}
            >
              <div className="rounded-2xl p-6 md:p-8 text-center shadow-2xl" style={{ background: gradient }}>
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <p className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                  {displayValue}{stat.suffix || ''}
                </p>
                <p className="text-base md:text-lg text-white/90 font-medium">{stat.label}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
