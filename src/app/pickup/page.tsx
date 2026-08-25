'use client'

import { useState } from 'react'
import { useLanguage } from '@/lib/i18n'
import { Calendar, Clock, Truck, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function PickupPage() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    waste_type: '',
    preferred_date: '',
    preferred_time: '',
    notes: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">Schedule Pickup</h1>
        <p className="text-gray-600">Book a pickup with local recyclers for your waste</p>
      </div>

      {!submitted ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="w-4 h-4 inline mr-2 text-saffron" />
                Waste Type
              </label>
              <select
                value={formData.waste_type}
                onChange={(e) => setFormData({ ...formData, waste_type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
              >
                <option value="">Select waste type</option>
                <option value="plastic">Plastic</option>
                <option value="paper">Paper</option>
                <option value="metal">Metal</option>
                <option value="glass">Glass</option>
                <option value="organic">Organic</option>
                <option value="e-waste">E-Waste</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2 text-saffron" />
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={formData.preferred_date}
                  onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2 text-saffron" />
                  Preferred Time
                </label>
                <select
                  value={formData.preferred_time}
                  onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
                >
                  <option value="">Select time slot</option>
                  <option value="morning">Morning (9 AM - 12 PM)</option>
                  <option value="afternoon">Afternoon (12 PM - 3 PM)</option>
                  <option value="evening">Evening (3 PM - 6 PM)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
                placeholder="Any special instructions..."
              />
            </div>

            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full py-3 px-4 bg-saffron text-navy rounded-lg font-semibold hover:bg-saffron-dark transition-colors flex items-center justify-center gap-2"
            >
              <Truck className="w-5 h-5" />
              Schedule Pickup
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-navy mb-2">Pickup Scheduled!</h3>
          <p className="text-gray-600 mb-4">Your pickup request has been submitted successfully. You will receive a confirmation shortly.</p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-6 py-2 bg-saffron text-navy rounded-lg font-medium hover:bg-saffron-dark transition-colors"
          >
            Schedule Another
          </button>
        </div>
      )}
    </div>
  )
}
