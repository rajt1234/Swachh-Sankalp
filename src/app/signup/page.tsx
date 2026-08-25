'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SwachhLogo } from '@/components/layout/SwachhLogo'
import { INDIAN_STATE_DISTRICTS, INDIAN_STATES_LIST } from '@/lib/indian-states'
import { generateUniqueUserId } from '@/lib/utils'

export default function SignupPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    district: '',
    state: '',
    password: '',
    confirm_password: '',
    role: 'citizen',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [countdown, setCountdown] = useState(5)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value }
      if (name === 'state') {
        updated.district = ''
      }
      return updated
    })
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
    setFormData(prev => ({ ...prev, phone: value }))
  }

  const selectedDistricts = formData.state ? INDIAN_STATE_DISTRICTS[formData.state] || [] : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (!formData.phone || formData.phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const fullPhone = `+91${formData.phone}`

    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', formData.email)
      .maybeSingle()

    if (profileCheckError) {
      console.error('Profile check error:', profileCheckError)
    }

    if (existingProfile) {
      setError('An account with this email already exists. Please use a different email or try logging in.')
      setLoading(false)
      return
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.full_name,
          phone: fullPhone,
          city: formData.district,
          state: formData.state,
          role: formData.role,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    const user = signUpData.user
    if (!user) {
      setError('Signup successful! Please login to access your profile.')
      setLoading(false)
      return
    }

    let userId = ''
    try {
      userId = await generateUniqueUserId(formData.role)
    } catch (err) {
      console.error('Failed to generate user ID:', err)
      const timestamp = Date.now().toString().slice(-5)
      const prefix = formData.role === 'municipality' ? 'M' : formData.role === 'recycler' ? 'R' : 'C'
      userId = `${prefix}${timestamp}`
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: formData.full_name,
        phone: fullPhone,
        city: formData.district,
        state: formData.state,
        role: formData.role,
        user_id: userId,
      }, { onConflict: 'id' })

    if (profileError) {
      console.error('Profile creation error:', profileError)
    }

    setShowConfirmation(true)
    setLoading(false)
  }

  useEffect(() => {
    if (!showConfirmation) return

    if (countdown <= 0) {
      router.push('/login')
      return
    }

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [showConfirmation, countdown, router])

  if (showConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-saffron/5 rounded-full" />
          <div className="absolute bottom-0 -right-24 w-80 h-80 bg-green/5 rounded-full" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-navy/5 rounded-full" />
        </div>

        <div className="max-w-md w-full relative z-10">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="h-2 bg-gradient-to-r from-saffron via-white to-green" />

            <div className="p-6 sm:p-8 text-center">
              <div className="inline-flex items-center justify-center mb-4">
                <SwachhLogo size={64} />
              </div>

              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-2">Check Your Email</h2>
              <p className="text-sm text-gray-500 mb-4">Government of India | Swachh Bharat Mission</p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  We've sent a confirmation link to <span className="font-semibold">{formData.email}</span>.
                  Please check your inbox and click the link to verify your account.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-700">
                  After confirming your email, you can log in to access your account.
                </p>
              </div>

              <div className="text-xs text-gray-500 mb-4">
                Redirecting to login in <span className="font-semibold text-navy">{countdown}</span> seconds...
              </div>

              <Link
                href="/login"
                className="inline-block px-6 py-2.5 bg-gradient-to-r from-saffron to-saffron-dark text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm"
              >
                Go to Login Now
              </Link>
            </div>

            <div className="h-2 bg-gradient-to-r from-saffron via-white to-green" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-saffron/5 rounded-full" />
        <div className="absolute bottom-0 -right-24 w-80 h-80 bg-green/5 rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-navy/5 rounded-full" />
      </div>

      <div className="max-w-4xl w-full relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
          <div className="h-2 bg-gradient-to-r from-saffron via-white to-green" />

          <div className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center mb-3">
                <SwachhLogo size={56} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-1">{t('auth.signupTitle')}</h2>
              <p className="text-xs text-gray-500">Government of India | Join the Movement</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-slide-up">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3" autoComplete="off">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="full_name" className="block text-xs font-medium text-gray-700 mb-1">
                    {t('auth.fullName')}
                  </label>
                  <input
                    id="full_name"
                    type="text"
                    required
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition-all duration-200 text-sm"
                    placeholder="John Doe"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                    {t('auth.email')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition-all duration-200 text-sm"
                    placeholder="you@example.com"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1">
                    {t('auth.phone')}
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 py-2.5 border-2 border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-gray-500 font-medium text-sm">
                      +91
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-r-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition-all duration-200 text-sm"
                      placeholder="xxxxxxx123"
                      maxLength={10}
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="role" className="block text-xs font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition-all duration-200 text-sm"
                  >
                    <option value="citizen">Citizen</option>
                    <option value="municipality">Municipality</option>
                    <option value="recycler">Recycler</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="state" className="block text-xs font-medium text-gray-700 mb-1">
                    {t('auth.state')}
                  </label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition-all duration-200 text-sm"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES_LIST.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="district" className="block text-xs font-medium text-gray-700 mb-1">
                    District
                  </label>
                  <select
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                    disabled={!formData.state}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition-all duration-200 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select District</option>
                    {selectedDistricts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                    {t('auth.password')}
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition-all duration-200 text-sm"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label htmlFor="confirm_password" className="block text-xs font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirm_password"
                    type="password"
                    required
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition-all duration-200 text-sm"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-saffron to-saffron-dark text-white rounded-lg font-semibold hover:shadow-lg hover:scale-[1.01] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  t('nav.signup')
                )}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-600">
                {t('auth.hasAccount')}{' '}
                <Link href="/login" className="text-saffron hover:text-saffron-dark font-semibold">
                  {t('nav.login')}
                </Link>
              </p>
            </div>
          </div>

          <div className="h-2 bg-gradient-to-r from-saffron via-white to-green" />
        </div>
      </div>
    </div>
  )
}
