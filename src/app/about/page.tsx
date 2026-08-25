'use client'

import { useLanguage } from '@/lib/i18n'
import { SwachhLogo } from '@/components/layout/SwachhLogo'
import { Recycle, Users, Globe, Award, Leaf, Bot, Camera, BarChart3, Gift, MessageCircle, MapPin, Smartphone } from 'lucide-react'

export default function AboutPage() {
  const { t, locale } = useLanguage()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-saffron/10 via-white to-green/10 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-saffron/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-32 w-80 h-80 bg-green/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center mb-6">
              <SwachhLogo size={80} />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy mb-6 leading-tight">
              About Swachh Sankalp
            </h1>
            <p className="text-xl md:text-2xl text-saffron font-semibold mb-4">
              Together for a Cleaner and Greener India 🌱
            </p>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Swachh Sankalp is an AI-powered Smart WasteWise Management System designed to transform the way waste is managed by combining technology, citizen participation, and environmental awareness. Our mission is to create cleaner, healthier, and more sustainable communities by making waste segregation, reporting, recycling, and monitoring smarter and more efficient.
            </p>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">Our Vision</h2>
            <div className="w-20 h-1 bg-saffron mx-auto mb-8" />
            <p className="text-lg text-gray-700 leading-relaxed">
              We envision a future where every citizen actively contributes to responsible waste management, enabling cleaner cities, healthier communities, and a sustainable environment for future generations.
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6 text-center">The Problem We Address</h2>
            <div className="w-20 h-1 bg-saffron mx-auto mb-8" />
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Improper waste management remains one of the biggest environmental challenges. Waste is often mixed at the source, reducing recycling efficiency and increasing pollution. Limited public awareness, delayed complaint resolution, lack of real-time monitoring, and poor coordination between citizens and municipal authorities further worsen the situation.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6 text-center">Our Solution</h2>
            <div className="w-20 h-1 bg-saffron mx-auto mb-8" />
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Swachh Sankalp leverages Artificial Intelligence, GIS mapping, and real-time monitoring to simplify waste management for everyone. The platform empowers citizens to segregate waste correctly, report waste-related issues, receive instant guidance, and earn rewards for responsible environmental practices.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Municipal authorities benefit from verified complaints, intelligent waste analytics, and real-time dashboards that help improve operational efficiency and faster response times.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-12 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Recycle className="w-6 h-6 text-green" />
              </div>
              <h3 className="text-xl font-semibold text-navy mb-3">Smart Waste Segregation</h3>
              <p className="text-gray-600">AI-assisted waste identification helps users classify waste into categories such as plastic, paper, glass, metal, organic waste, and e-waste while providing proper disposal recommendations.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-saffron">
              <div className="w-12 h-12 bg-saffron/10 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-saffron" />
              </div>
              <h3 className="text-xl font-semibold text-navy mb-3">Geo-Tagged Waste Reporting</h3>
              <p className="text-gray-600">Citizens can report garbage accumulation by uploading photos with GPS-enabled locations, allowing authorities to quickly identify and resolve waste-related issues.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-navy">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-navy" />
              </div>
              <h3 className="text-xl font-semibold text-navy mb-3">AI-Powered Verification</h3>
              <p className="text-gray-600">Artificial Intelligence automatically verifies whether uploaded images contain waste, detects duplicate complaints, determines severity levels, and recommends appropriate recycling methods.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-600">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-navy mb-3">Real-Time Monitoring Dashboard</h3>
              <p className="text-gray-600">Municipalities can monitor complaint status, waste collection progress, recycling activities, and city-wide cleanliness metrics through a centralized dashboard.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-amber-500">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Gift className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold text-navy mb-3">Rewards & Citizen Engagement</h3>
              <p className="text-gray-600">Users are encouraged to participate through reward points, awareness campaigns, and educational initiatives that promote responsible waste disposal habits.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-cyan-500">
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-cyan-500" />
              </div>
              <h3 className="text-xl font-semibold text-navy mb-3">AI Chatbot Support</h3>
              <p className="text-gray-600">A built-in AI chatbot provides 24/7 assistance by answering waste management queries and educating users on sustainable disposal practices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-12 text-center">How Swachh Sankalp Works</h2>
          <div className="w-20 h-1 bg-saffron mx-auto mb-12" />
          <div className="max-w-4xl mx-auto space-y-6">
            {[
              'Citizens segregate waste with AI-guided assistance.',
              'Waste issues are reported using geo-tagged photos.',
              'AI analyzes and verifies every complaint automatically.',
              'Municipal authorities receive verified reports in real time.',
              'Waste collection teams respond efficiently.',
              'Recycling activities are tracked and monitored.',
              'Citizens earn rewards for responsible participation.',
            ].map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-saffron text-white flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <p className="text-lg text-gray-700 pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-12 text-center">Our Impact</h2>
          <div className="w-20 h-1 bg-saffron mx-auto mb-12" />
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Improve waste segregation at the source.',
              'Increase recycling efficiency.',
              'Reduce environmental pollution.',
              'Accelerate complaint resolution.',
              'Enhance transparency in municipal operations.',
              'Encourage citizen participation through rewards.',
              'Build cleaner, greener, and smarter cities.',
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <Leaf className="w-5 h-5 text-green flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-12 text-center">Who Benefits?</h2>
          <div className="w-20 h-1 bg-saffron mx-auto mb-12" />
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'Citizens and local communities',
              'Municipal corporations',
              'Waste collection agencies',
              'Recycling companies',
              'Environmental NGOs',
              'Sanitation workers',
              'Green Champions',
              'Future generations who deserve a cleaner planet.',
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <Users className="w-5 h-5 text-saffron flex-shrink-0" />
                <span className="text-gray-700 text-sm md:text-base">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="py-16 bg-gradient-to-br from-navy to-navy-light text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Commitment</h2>
            <div className="w-20 h-1 bg-saffron mx-auto mb-8" />
            <p className="text-lg md:text-xl leading-relaxed mb-6">
              At <span className="text-saffron font-semibold">Swachh Sankalp</span>, we believe that technology and community participation together can create lasting environmental change. Every reported issue, every correctly segregated waste item, and every responsible action contributes toward a cleaner India and a sustainable future.
            </p>
            <p className="text-xl md:text-2xl font-semibold text-saffron">
              Swachh Sankalp — Together for a Cleaner and Greener India.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
