'use client'

import { useLanguage } from '@/lib/i18n'
import { Mail, Phone, MapPin, Globe, Share2, Users } from 'lucide-react'
import { SwachhLogo } from './SwachhLogo'

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-navy text-white mt-auto" suppressHydrationWarning>
      {/* Flag Stripe */}
      <div className="flag-stripe" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <SwachhLogo size={72} />
              <div>
                <h3 className="text-lg font-bold">Swachh Sankalp</h3>
                <p className="text-sm text-gray-300">Smart WasteWise Management</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-4 max-w-md">
              Building cleaner, greener communities through technology, citizen participation, and sustainable waste management practices.
            </p>
            <p className="text-xs text-saffron">{t('footer.govt')}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-saffron">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/about" className="text-sm text-gray-300 hover:text-white transition-colors">{t('footer.about')}</a></li>
              <li><a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">{t('footer.contact')}</a></li>
              <li><a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">{t('footer.privacy')}</a></li>
              <li><a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">{t('footer.terms')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-saffron">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <Mail className="w-4 h-4 text-saffron" />
                info@swachhsankalp.gov.in
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <Phone className="w-4 h-4 text-saffron" />
                1800-XXX-XXXX
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <MapPin className="w-4 h-4 text-saffron" />
                New Delhi, India
              </li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-saffron hover:text-navy transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-saffron hover:text-navy transition-colors">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-saffron hover:text-navy transition-colors">
                <Users className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
