'use client'

import { useState } from 'react'
import { useLanguage } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SwachhLogo } from '@/components/layout/SwachhLogo'
import { generateUniqueUserId } from '@/lib/utils'

export default function LoginPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, user_id, role')
          .eq('id', user.id)
          .maybeSingle()

        if (!existingProfile) {
          const role = user.user_metadata?.role || 'citizen'
          let userId = ''
          try {
            userId = await generateUniqueUserId(role)
          } catch (err) {
            console.error('Failed to generate user ID:', err)
            const timestamp = Date.now().toString().slice(-5)
            const prefix = role === 'municipality' ? 'M' : role === 'recycler' ? 'R' : 'C'
            userId = `${prefix}${timestamp}`
          }

          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
              phone: user.user_metadata?.phone || '',
              city: user.user_metadata?.city || '',
              state: user.user_metadata?.state || '',
              role,
              user_id: userId,
            }, { onConflict: 'id' })

          if (profileError) {
            console.error('Profile creation error:', profileError)
          }
        } else if (!existingProfile.user_id) {
          const role = existingProfile.role || 'citizen'
          let userId = ''
          try {
            userId = await generateUniqueUserId(role)
          } catch (err) {
            console.error('Failed to generate user ID:', err)
            const timestamp = Date.now().toString().slice(-5)
            const prefix = role === 'municipality' ? 'M' : role === 'recycler' ? 'R' : 'C'
            userId = `${prefix}${timestamp}`
          }

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ user_id: userId })
            .eq('id', user.id)

          if (updateError) {
            console.error('User ID update error:', updateError)
          }
        }
      }

      setTimeout(() => {
        router.push('/profile')
        router.refresh()
      }, 300)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 relative">
      {/* Decorative Elements */}
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
              <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-1">{t('auth.loginTitle')}</h2>
              <p className="text-xs text-gray-500">Government of India | Swachh Bharat Mission</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-slide-up">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3" autoComplete="off">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                  {t('auth.email')}
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
                <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                  {t('auth.password')}
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition-all duration-200 text-sm"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-saffron border-gray-300 rounded focus:ring-saffron" />
                  <span className="ml-2 text-xs text-gray-600">Remember me</span>
                </label>
                <a href="/forgot-password" className="text-xs text-saffron hover:text-saffron-dark font-medium">
                  {t('auth.forgotPassword')}
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-saffron to-saffron-dark text-white rounded-lg font-semibold hover:shadow-lg hover:scale-[1.01] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  t('nav.login')
                )}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-600">
                {t('auth.noAccount')}{' '}
                <Link href="/signup" className="text-saffron hover:text-saffron-dark font-semibold">
                  {t('nav.signup')}
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
