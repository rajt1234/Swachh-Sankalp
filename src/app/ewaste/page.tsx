'use client'

import { useState } from 'react'
import { useLanguage } from '@/lib/i18n'
import { Calendar, Clock, Smartphone, Monitor, Battery, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function EWastePage() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    item_type: '',
    quantity: 1,
    preferred_date: '',
    address: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">E-Waste Collection</h1>
        <p className="text-gray-600">Schedule safe disposal of electronic waste</p>
      </div>

      {!submitted ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Smartphone className="w-4 h-4 inline mr-2 text-saffron" />
                Device Type
              </label>
              <select
                value={formData.item_type}
                onChange={(e) => setFormData({ ...formData, item_type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
              >
                <option value="">Select device type</option>
                <option value="mobile">Mobile Phone</option>
                <option value="laptop">Laptop</option>
                <option value="desktop">Desktop</option>
                <option value="tablet">Tablet</option>
                <option value="printer">Printer</option>
                <option value="tv">Television</option>
                <option value="battery">Batteries</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
                />
              </div>
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
                placeholder="Enter your full address..."
              />
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-800 mb-2">Important Guidelines</h4>
              <ul className="text-xs text-red-700 space-y-1">
                <li>Remove batteries from devices before scheduling pickup</li>
                <li>Do not mix e-waste with regular household waste</li>
                <li>Keep devices in a safe, accessible location</li>
                <li>Ensure someone is available during pickup hours</li>
              </ul>
            </div>

            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full py-3 px-4 bg-saffron text-navy rounded-lg font-semibold hover:bg-saffron-dark transition-colors flex items-center justify-center gap-2"
            >
              <Battery className="w-5 h-5" />
              Schedule E-Waste Pickup
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-navy mb-2">Pickup Scheduled!</h3>
          <p className="text-gray-600 mb-4">Your e-waste pickup request has been submitted. Our team will contact you shortly to confirm the details.</p>
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
