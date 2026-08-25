'use client'

import { useLanguage } from '@/lib/i18n'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, FileText, MapPin, Calendar, CheckCircle, Clock, Loader2, AlertCircle, ImageOff } from 'lucide-react'
import type { Complaint } from '@/lib/types'
import Image from 'next/image'

function ComplaintImageView({ url, alt = 'Complaint' }: { url: string; alt?: string }) {
  const [errored, setErrored] = useState(false)
  const [loading, setLoading] = useState(true)

  if (errored) {
    return (
      <div className="w-full border border-gray-200 rounded-xl overflow-hidden bg-gray-50 p-6 flex flex-col items-center justify-center gap-2 text-gray-500">
        <ImageOff className="w-8 h-8" />
        <p className="text-sm">Image unavailable</p>
      </div>
    )
  }

  return (
    <div className="relative w-full border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-saffron rounded-full animate-spin" />
        </div>
      )}
      <img
        src={url}
        alt={alt}
        className="max-w-full h-auto mx-auto block"
        loading="lazy"
        onLoad={() => setLoading(false)}
        onError={() => setErrored(true)}
      />
    </div>
  )
}

function TypewriterText({ text, speed = 35 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    if (!text || displayed.length >= text.length) return

    const timeout = setTimeout(() => {
      setDisplayed(prev => prev + text[prev.length])
    }, speed)

    return () => clearTimeout(timeout)
  }, [displayed, text, speed])

  return <>{displayed}</>
}

const TRACK_CARDS = [
  {
    image: '/images/track-track-1.png',
    titleEn: '',
    titleHi: '',
    quoteEn: 'The dream of Swachh Bharat will not be fulfilled just by cleanliness alone, until every citizen becomes smart and responsible.',
    quoteHi: 'Swachh Bharat ka sapna sirf safai se pura nahi hoga, Jab tak har nagrik smart aur zimmedar nahi banega.',
    isQuote: true,
  },
  {
    image: '/images/track-track-2.png',
    titleEn: '',
    titleHi: '',
    quoteEn: 'Start cleanliness from your home and neighborhood, become a responsible citizen by throwing waste in the dustbin.',
    quoteHi: 'Safai ki shuruat apne ghar aur mohalle se karo, Kachra dustbin mein daal kar ek zimmedar nagrik bano.',
    isQuote: true,
  },
  {
    image: '/images/track-track-3.png',
    titleEn: '',
    titleHi: '',
    quoteEn: 'Swachh Bharat will happen only when instead of "Someone will do it" we adopt the mindset of "I will do it, We will do it".',
    quoteHi: 'Swachh Bharat tabhi banega, jab "Koi Karega" ki jagah "Main Karunga, Hum Karenge" ki soch apnayenge.',
    isQuote: true,
  },
]

export default function TrackPage() {
  const { locale } = useLanguage()
  const supabase = createClient()
  const [trackingId, setTrackingId] = useState('')
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200'
      case 'viewed': return 'bg-purple-100 text-purple-700 border-purple-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'resolved': return locale === 'hi' ? 'सुलझा दिया गया' : 'Resolved'
      case 'in_progress': return locale === 'hi' ? 'कार्रवाई में' : 'In Progress'
      case 'pending': return locale === 'hi' ? 'जमा किया गया' : 'Submitted'
      case 'rejected': return locale === 'hi' ? 'अस्वीकृत' : 'Rejected'
      case 'viewed': return locale === 'hi' ? 'देखा गया' : 'Viewed'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'in_progress': return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />
      case 'rejected': return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'viewed': return <FileText className="w-5 h-5 text-purple-600" />
      default: return <FileText className="w-5 h-5 text-gray-600" />
    }
  }

  const handleTrack = async () => {
    const trimmed = trackingId.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)
    setComplaint(null)
    setSearched(true)

    try {
      const { data, error: fetchError } = await supabase
        .from('complaints')
        .select('*')
        .ilike('tracking_id', trimmed)
        .maybeSingle()

      if (fetchError) throw fetchError
      if (!data) {
        setError(locale === 'hi' ? 'ट्रैकिंग आईडी नहीं मिली' : 'Tracking ID not found')
        return
      }

      setComplaint(data as Complaint)
    } catch (err) {
      console.error('Tracking lookup error:', err)
      setError(locale === 'hi' ? 'ट्रैकिंग आईडी लookup में त्रुटि' : 'Error looking up tracking ID')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleTrack()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-3">
            {locale === 'hi' ? 'अपनी रिपोर्ट ट्रैक करें' : 'Track Your Report'}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {locale === 'hi'
              ? 'अपनी शिकायत की स्थिति जांचने के लिए अपना ट्रैकिंग आईडी दर्ज करें।'
              : 'Enter your tracking ID to check the status of your complaint.'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 mb-10">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'hi' ? 'ट्रैकिंग आईडी' : 'Tracking ID'}
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={locale === 'hi' ? 'उदाहरण: SWA-2025-000001' : 'e.g. SWA-2025-000001'}
                className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-saffron focus:border-saffron transition-colors text-navy placeholder:text-gray-400"
              />
            </div>
            <button
              onClick={handleTrack}
              disabled={loading || !trackingId.trim()}
              className="px-8 py-3.5 bg-saffron text-navy rounded-xl font-bold hover:bg-saffron-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {locale === 'hi' ? 'खोज रहे हैं...' : 'Tracking...'}
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  {locale === 'hi' ? 'ट्रैक करें' : 'Track'}
                </>
              )}
            </button>
          </div>
        </div>

        {error && searched && (
          <div className="mb-10 p-5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {complaint && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-14">
            <div className="h-2 bg-gradient-to-r from-saffron via-white to-green" />
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    {locale === 'hi' ? 'ट्रैकिंग आईडी' : 'Tracking ID'}
                  </p>
                  <p className="text-2xl font-bold text-navy font-mono tracking-wide">{complaint.tracking_id}</p>
                </div>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(complaint.status)}`}>
                  {getStatusIcon(complaint.status)}
                  {getStatusLabel(complaint.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      {locale === 'hi' ? 'विवरण' : 'Description'}
                    </p>
                    <p className="text-sm text-navy leading-relaxed">
                      {complaint.description || (locale === 'hi' ? 'कोई विवरण उपलब्ध नहीं' : 'No description provided')}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      {locale === 'hi' ? 'श्रेणी' : 'Category'}
                    </p>
                    <p className="text-sm text-navy font-medium capitalize">
                      {complaint.ai_category || complaint.category_id || (locale === 'hi' ? 'अज्ञात' : 'Unknown')}
                    </p>
                  </div>

                  {(complaint.location_text || complaint.address) && (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        {locale === 'hi' ? 'स्थान' : 'Location'}
                      </p>
                      <p className="text-sm text-navy flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        {complaint.location_text || complaint.address}
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      {locale === 'hi' ? 'जमा किया गया' : 'Submitted On'}
                    </p>
                    <p className="text-sm text-navy flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(complaint.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                 <div className="space-y-4">
                  {complaint.image_url && (
                    <ComplaintImageView url={complaint.image_url} />
                  )}

                  {complaint.ai_category && (
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">
                        {locale === 'hi' ? 'एआई विश्लेषण' : 'AI Analysis'}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">
                            {locale === 'hi' ? 'पहचान की गई श्रेणी' : 'Detected Category'}
                          </span>
                          <span className="text-sm font-semibold text-navy capitalize">{complaint.ai_category}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">
                            {locale === 'hi' ? 'गंभीरता' : 'Severity'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                            complaint.ai_severity === 'high' ? 'text-red-600 bg-red-50 border-red-200' :
                            complaint.ai_severity === 'medium' ? 'text-amber-600 bg-amber-50 border-amber-200' :
                            'text-green-600 bg-green-50 border-green-200'
                          }`}>
                            {complaint.ai_severity ? complaint.ai_severity.toUpperCase() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {!complaint && !loading && !error && !searched && (
          <div className="space-y-10">
            {TRACK_CARDS.map((card, index) => (
              <div key={card.image} className="space-y-4">
                <section className={`group ${card.isQuote ? 'bg-saffron/5 border-saffron/30' : 'bg-white border-gray-200'} rounded-2xl shadow-sm border overflow-hidden transition-all duration-500 ease-out hover:shadow-xl hover:shadow-saffron/10 hover:-translate-y-1 hover:border-saffron/40`}>
                  <div className="grid grid-cols-1 md:grid-cols-12 md:items-stretch">
                    <div className={`md:col-span-7 ${index % 2 === 1 ? 'md:order-last' : ''}`}>
                      <div className="relative w-full h-64 sm:h-80 md:h-full min-h-[400px] bg-gray-50 flex items-center justify-center overflow-hidden">
                        <Image
                          src={card.image}
                          alt={locale === 'hi' ? card.titleHi : card.titleEn}
                          width={1600}
                          height={900}
                          className="max-w-full max-h-full object-contain p-4 transition-all duration-500 ease-out group-hover:scale-[1.03] group-hover:p-2"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      </div>
                    </div>
                    <div className={`md:col-span-5 p-6 sm:p-8 flex flex-col justify-center transition-colors duration-500 ${card.isQuote ? 'bg-saffron/5 group-hover:bg-saffron/10' : 'bg-white group-hover:bg-gray-50'}`}>
                      {card.isQuote ? (
                        <div>
                          <p className="text-2xl sm:text-3xl font-bold text-navy leading-snug tracking-tight transition-colors duration-500 group-hover:text-navy/90">
                            <span className="text-saffron text-4xl leading-none transition-transform duration-500 group-hover:scale-110 inline-block">&ldquo;</span>
                            <TypewriterText key={locale === 'hi' ? card.quoteHi : card.quoteEn} text={locale === 'hi' ? card.quoteHi : card.quoteEn} speed={40} />
                            <span className="text-saffron text-4xl leading-none transition-transform duration-500 group-hover:scale-110 inline-block">&rdquo;</span>
                          </p>
                        </div>
                      ) : (
                        <>
                          <h2 className="text-xl font-semibold text-navy mb-3 transition-colors duration-300 group-hover:text-saffron">
                            {locale === 'hi' ? card.titleHi : card.titleEn}
                          </h2>
                          <p className="text-gray-600 leading-relaxed text-sm sm:text-base transition-colors duration-300 group-hover:text-navy/80">
                            {locale === 'hi' ? card.quoteHi : card.quoteEn}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            ))}
          </div>
        )}

        {!complaint && !loading && !error && searched && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-gray-500">
              {locale === 'hi'
                ? 'कृपया ट्रैकिंग आईडी दर्ज करें और ट्रैक करें बटन पर क्लिक करें।'
                : 'Please enter your tracking ID and click Track to see results.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
