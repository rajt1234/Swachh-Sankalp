'use client'

import { useState } from 'react'
import { useLanguage } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Phone, Clock, Navigation } from 'lucide-react'
import { RecyclingCenter } from '@/lib/types'

const mockCenters: RecyclingCenter[] = [
  {
    id: '1',
    name: 'GreenCycle Recycling Center',
    name_hi: 'ग्रीनसाइकल रीसाइक्लिंग सेंटर',
    address: 'MG Road, Delhi',
    latitude: 28.6139,
    longitude: 77.2090,
    accepts: ['plastic', 'paper', 'metal'],
    phone: '+91-11-12345678',
    operating_hours: '9:00 AM - 6:00 PM',
    created_at: '',
  },
  {
    id: '2',
    name: 'EcoWaste Solutions',
    name_hi: 'इकोवेस्ट सॉल्यूशंस',
    address: 'Bandra West, Mumbai',
    latitude: 19.0544,
    longitude: 72.8406,
    accepts: ['organic', 'plastic', 'glass'],
    phone: '+91-22-87654321',
    operating_hours: '8:00 AM - 7:00 PM',
    created_at: '',
  },
  {
    id: '3',
    name: 'Swachh Recycling Hub',
    name_hi: 'स्वच्छ रीसाइक्लिंग हब',
    address: 'Koramangala, Bangalore',
    latitude: 12.9352,
    longitude: 77.6245,
    accepts: ['e-waste', 'metal', 'plastic'],
    phone: '+91-80-11223344',
    operating_hours: '9:00 AM - 5:00 PM',
    created_at: '',
  },
]

export default function CentersPage() {
  const { t } = useLanguage()
  const [centers, setCenters] = useState<RecyclingCenter[]>(mockCenters)
  const [filter, setFilter] = useState<string>('all')

  const filteredCenters = filter === 'all' ? centers : centers.filter((c) => c.accepts.includes(filter))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">Recycling Centers</h1>
        <p className="text-gray-600">Find nearby recycling centers for responsible waste disposal</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'plastic', 'organic', 'paper', 'metal', 'glass', 'e-waste'].map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === category
                ? 'bg-saffron text-navy'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-saffron'
            }`}
          >
            {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCenters.map((center) => (
          <div key={center.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-navy">{center.name}</h3>
                <p className="text-sm text-gray-500">{center.name_hi}</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Open
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-saffron" />
                {center.address}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-saffron" />
                {center.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-saffron" />
                {center.operating_hours}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Accepts:</p>
              <div className="flex flex-wrap gap-2">
                {center.accepts.map((type) => (
                  <span key={type} className="px-2 py-1 bg-saffron/10 text-navy text-xs rounded-full capitalize">
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-2 px-4 bg-saffron text-navy rounded-lg text-sm font-medium hover:bg-saffron-dark transition-colors flex items-center justify-center gap-2">
                <Navigation className="w-4 h-4" />
                Directions
              </button>
              <button className="flex-1 py-2 px-4 border border-gray-200 rounded-lg text-sm font-medium hover:border-saffron hover:text-saffron transition-colors">
                Book Pickup
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
