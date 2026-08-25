'use client'

import { useState } from 'react'
import { useLanguage } from '@/lib/i18n'
import { Calculator, Leaf, Car, Zap, Home, Trash2 } from 'lucide-react'

export default function CarbonPage() {
  const { t } = useLanguage()
  const [inputs, setInputs] = useState({
    electricity: 200,
    lpg: 2,
    carKm: 500,
    flights: 2,
    meatMeals: 5,
    wasteKg: 10,
  })
  const [result, setResult] = useState<number | null>(null)

  const calculateCarbon = () => {
    const electricity = inputs.electricity * 0.82
    const lpg = inputs.lpg * 3.11
    const car = inputs.carKm * 0.192
    const flights = inputs.flights * 250
    const meat = inputs.meatMeals * 2.5
    const waste = inputs.wasteKg * 0.5
    setResult(electricity + lpg + car + flights + meat + waste)
  }

  const getEcoRating = (carbon: number) => {
    if (carbon < 2000) return { rating: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' }
    if (carbon < 5000) return { rating: 'Good', color: 'text-green-600', bg: 'bg-green-100' }
    if (carbon < 10000) return { rating: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { rating: 'High Impact', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const rating = result ? getEcoRating(result) : null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">Carbon Footprint Calculator</h1>
        <p className="text-gray-600">Estimate your household carbon emissions and get tips to reduce your impact</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Home className="w-4 h-4 inline mr-2 text-saffron" />
              Monthly Electricity (kWh)
            </label>
            <input
              type="number"
              value={inputs.electricity}
              onChange={(e) => setInputs({ ...inputs, electricity: Number(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Zap className="w-4 h-4 inline mr-2 text-saffron" />
              Monthly LPG Cylinders
            </label>
            <input
              type="number"
              value={inputs.lpg}
              onChange={(e) => setInputs({ ...inputs, lpg: Number(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Car className="w-4 h-4 inline mr-2 text-saffron" />
              Monthly Car Travel (km)
            </label>
            <input
              type="number"
              value={inputs.carKm}
              onChange={(e) => setInputs({ ...inputs, carKm: Number(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calculator className="w-4 h-4 inline mr-2 text-saffron" />
              Annual Flights
            </label>
            <input
              type="number"
              value={inputs.flights}
              onChange={(e) => setInputs({ ...inputs, flights: Number(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weekly Meat-Based Meals
            </label>
            <input
              type="number"
              value={inputs.meatMeals}
              onChange={(e) => setInputs({ ...inputs, meatMeals: Number(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Trash2 className="w-4 h-4 inline mr-2 text-saffron" />
              Monthly Waste (kg)
            </label>
            <input
              type="number"
              value={inputs.wasteKg}
              onChange={(e) => setInputs({ ...inputs, wasteKg: Number(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
            />
          </div>
        </div>

        <button
          onClick={calculateCarbon}
          className="w-full py-3 px-4 bg-saffron text-navy rounded-lg font-semibold hover:bg-saffron-dark transition-colors mb-8"
        >
          Calculate Carbon Footprint
        </button>

        {result !== null && (
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="text-center mb-6">
              <p className="text-sm font-medium text-gray-500 mb-2">Your Monthly Carbon Footprint</p>
              <p className="text-5xl font-bold text-navy">{result.toFixed(0)}</p>
              <p className="text-gray-500">kg CO2 equivalent</p>
              {rating && (
                <span className={`inline-block mt-3 px-4 py-1 rounded-full text-sm font-medium ${rating.bg} ${rating.color}`}>
                  {rating.rating}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-navy mb-2">Tips to Reduce</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>Use LED bulbs to save electricity</li>
                  <li>Switch to renewable energy</li>
                  <li>Reduce car usage - use public transport</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-navy mb-2">Waste Impact</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>Segregate waste at source</li>
                  <li>Compost organic waste</li>
                  <li>Recycle plastics and paper</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-navy mb-2">Community Impact</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>Join local cleanup drives</li>
                  <li>Report waste hotspots</li>
                  <li>Spread awareness</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
