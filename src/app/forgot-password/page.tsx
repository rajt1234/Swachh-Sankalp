'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SwachhLogo } from '@/components/layout/SwachhLogo'

export default function ForgotPasswordPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const captchaRef = useRef<HTMLDivElement>(null)
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  const renderedRef = useRef(false)
  const widgetIdRef = useRef<number | null>(null)

  const renderCaptcha = useCallback(() => {
    if (!captchaRef.current || renderedRef.current) return
    const grecaptcha = (window as any).grecaptcha
    if (!grecaptcha || !grecaptcha.render) return

    try {
      renderedRef.current = true
      widgetIdRef.current = grecaptcha.render(captchaRef.current, {
        sitekey: siteKey || '',
        callback: (token: string) => {
          setCaptchaToken(token)
          setCaptchaVerified(true)
        },
        'expired-callback': () => {
          setCaptchaToken('')
          setCaptchaVerified(false)
        },
      })
    } catch (err) {
      console.error('reCAPTCHA render error:', err)
      renderedRef.current = false
    }
  }, [siteKey])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const grecaptcha = (window as any).grecaptcha

    if (grecaptcha && grecaptcha.render && captchaRef.current && !renderedRef.current) {
      renderCaptcha()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit'
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    let attempts = 0
    const maxAttempts = 20

    const intervalId = setInterval(() => {
      const grecaptcha = (window as any).grecaptcha
      if (grecaptcha && grecaptcha.render && captchaRef.current && !renderedRef.current) {
        clearInterval(intervalId)
        renderCaptcha()
      }
      attempts += 1
      if (attempts >= maxAttempts) {
        clearInterval(intervalId)
      }
    }, 250)

    return () => {
      clearInterval(intervalId)
      renderedRef.current = false
      widgetIdRef.current = null
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [renderCaptcha])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!captchaVerified || !captchaToken) {
      setError('Please complete the reCAPTCHA verification.')
      return
    }

    setLoading(true)

    try {
      const verifyResponse = await fetch('/api/verify-captcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: captchaToken }),
      })

      const verifyData = await verifyResponse.json()

      if (!verifyResponse.ok || !verifyData.success) {
        setError('reCAPTCHA verification failed. Please try again.')
        setLoading(false)
        return
      }
    } catch (err) {
      setError('reCAPTCHA verification failed. Please try again.')
      setLoading(false)
      return
    }

    const { data, error: checkError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .maybeSingle()

    if (checkError || !data) {
      setError('No account found with this email address.')
      setLoading(false)
      return
    }

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    })

    setLoading(false)

    if (otpError) {
      setError(otpError.message)
    } else {
      setMessage('OTP sent to your email. Please check your inbox.')
      setStep('otp')
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })

    if (verifyError || !data?.session) {
      setError('Invalid or expired OTP. Please try again.')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    setLoading(false)

    if (updateError) {
      setError(updateError.message)
    } else {
      setMessage('Password reset successfully! Redirecting to login...')
      setTimeout(() => router.push('/login'), 2000)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-saffron/5 rounded-full" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-green/5 rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-navy/5 rounded-full" />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
          <div className="h-2 bg-gradient-to-r from-saffron via-white to-green" />

          <div className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center mb-3">
                <SwachhLogo size={56} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-1">
                {step === 'email' ? 'Reset Password' : 'Enter OTP & New Password'}
              </h2>
              <p className="text-xs text-gray-500">Government of India | Swachh Bharat Mission</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-slide-up">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {message && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg animate-slide-up">
                <p className="text-sm text-green-700">{message}</p>
              </div>
            )}

            {step === 'email' ? (
              <form onSubmit={handleSendOtp} className="space-y-4" autoComplete="off">
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                    Registered Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition-all duration-200 text-sm"
                    placeholder="you@example.com"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Verification
                  </label>
                  <div ref={captchaRef} className="flex justify-center" />
                </div>

                <button
                  type="submit"
                  disabled={loading || !captchaVerified}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-saffron to-saffron-dark text-white rounded-lg font-semibold hover:shadow-lg hover:scale-[1.01] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    'Get OTP'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4" autoComplete="off">
                <div>
                  <label htmlFor="otp" className="block text-xs font-medium text-gray-700 mb-1">
                    Enter OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition-all duration-200 text-sm"
                    placeholder="123456"
                    maxLength={6}
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-xs font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition-all duration-200 text-sm"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition-all duration-200 text-sm"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-saffron to-saffron-dark text-white rounded-lg font-semibold hover:shadow-lg hover:scale-[1.01] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Resetting...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-600">
                Remember your password?{' '}
                <Link href="/login" className="text-saffron hover:text-saffron-dark font-semibold">
                  Sign in
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
