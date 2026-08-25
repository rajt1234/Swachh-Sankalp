'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { User, Mail, Phone, MapPin, Shield, Award, FileText, LogOut, ArrowLeft, Camera, TrendingUp, Edit2, Save, X } from 'lucide-react'
import type { Profile, Complaint, Reward } from '@/lib/types'
import { INDIAN_STATES_LIST, INDIAN_STATE_DISTRICTS } from '@/lib/indian-states'
import { generateUniqueUserId } from '@/lib/utils'

export default function ProfilePage() {
  const { t, locale } = useLanguage()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    city: '',
    state: '',
  })
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const selectedDistricts = formData.state ? (INDIAN_STATE_DISTRICTS[formData.state] || []) : []

  const ensureProfile = async (user: any): Promise<Profile | null> => {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (existingProfile) return existingProfile as Profile

    const role = user.user_metadata?.role || 'citizen'
    const fallbackUserId = user.user_metadata?.user_id || ''
    let userId = ''
    if (!fallbackUserId) {
      try {
        userId = await generateUniqueUserId(role)
      } catch {
        const timestamp = Date.now().toString().slice(-5)
        const prefix = role === 'municipality' ? 'M' : role === 'recycler' ? 'R' : 'C'
        userId = `${prefix}${timestamp}`
      }
    } else {
      userId = fallbackUserId
    }

    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          phone: user.user_metadata?.phone || '',
          city: user.user_metadata?.city || '',
          state: user.user_metadata?.state || '',
          role,
          user_id: userId,
        },
        { onConflict: 'id' }
      )
      .select('*')
      .single()

    if (createError) {
      console.error('Profile auto-create error:', createError)
      setError('Could not load or create profile. Please contact support.')
      return null
    }

    return newProfile as Profile
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const profileData = await ensureProfile(user)
      if (!profileData) {
        setLoading(false)
        return
      }

      setProfile(profileData)
      setFormData({
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        city: profileData.city || '',
        state: profileData.state || '',
      })

      const { data: complaintsData } = await supabase
        .from('complaints')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (complaintsData) setComplaints(complaintsData)

      const { data: rewardsData } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (rewardsData) {
        setRewards(rewardsData)
      }

      setTotalPoints(profileData?.points || 0)

      setLoading(false)
    }

    getUser()
  }, [supabase, router])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `avatar.${fileExt}`
      const filePath = `${profile.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error('Storage bucket "avatars" not found. Please create it in Supabase Dashboard > Storage.')
        }
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)

      if (updateError) throw updateError
      setProfile({ ...profile, avatar_url: publicUrl })
    } catch (error) {
      console.error('Error uploading avatar:', error)
      const message = error instanceof Error ? error.message : 'Failed to upload profile photo'
      alert(message)
    } finally {
      setUploading(false)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
    setFormData({ ...formData, phone: value })
  }

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const state = e.target.value
    setFormData({ ...formData, state, city: '' })
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, city: e.target.value })
  }

  const handleSaveProfile = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          city: formData.city,
          state: formData.state,
        })
        .eq('id', profile.id)

      if (error) throw error
      setProfile({ ...profile, ...formData })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-700'
      case 'in_progress': return 'bg-blue-100 text-blue-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      case 'viewed': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-saffron-light/30 via-white to-green-light/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-saffron border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-navy font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!loading && error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-saffron-light/30 via-white to-green-light/30 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-saffron text-white rounded-lg hover:bg-saffron-dark transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-light/30 via-white to-green-light/30 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-navy hover:text-saffron transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            {locale === 'hi' ? 'होम पर वापस जाएं' : 'Back to Home'}
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="h-3 bg-gradient-to-r from-saffron via-white to-green" />

          <div className="p-6 sm:p-8">
            <div className="relative mb-6">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-navy to-navy-light text-white px-4 py-2 rounded-lg shadow-lg">
                <p className="text-[10px] font-medium opacity-80">User ID</p>
                <p className="text-sm font-bold tracking-wider">{profile.user_id}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
              <div className="relative group">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-saffron shadow-lg bg-gray-100">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-saffron to-saffron-dark flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
                      {profile.full_name?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-saffron hover:bg-saffron-dark text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-1">
                  {profile.full_name || 'User'}
                </h1>
                <p className="text-gray-500 mb-2">{profile.email}</p>
                <span className="inline-block px-3 py-1 bg-saffron/10 text-saffron-dark rounded-full text-sm font-medium capitalize">
                  {profile.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-saffron to-saffron-dark rounded-xl p-4 text-white text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 opacity-80" />
                <p className="text-2xl font-bold">{totalPoints}</p>
                <p className="text-xs opacity-80">{locale === 'hi' ? 'कुल पॉइंट्स' : 'Total Points'}</p>
              </div>
              <div className="bg-gradient-to-br from-green to-green-dark rounded-xl p-4 text-white text-center">
                <FileText className="w-6 h-6 mx-auto mb-2 opacity-80" />
                <p className="text-2xl font-bold">{complaints.length}</p>
                <p className="text-xs opacity-80">{locale === 'hi' ? 'रिपोर्ट्स' : 'Reports'}</p>
              </div>
              <div className="bg-gradient-to-br from-navy to-navy-light rounded-xl p-4 text-white text-center">
                <Award className="w-6 h-6 mx-auto mb-2 opacity-80" />
                <p className="text-2xl font-bold">{rewards.length}</p>
                <p className="text-xs opacity-80">{locale === 'hi' ? 'पुरस्कार' : 'Rewards'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-navy flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {locale === 'hi' ? 'व्यक्तिगत विवरण' : 'Personal Details'}
                    </h2>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-saffron hover:bg-saffron/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        {locale === 'hi' ? 'संपादित करें' : 'Edit'}
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition-all text-sm"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-3 py-2 border-2 border-gray-200 rounded-l-lg bg-gray-50 text-gray-500 font-medium text-sm">
                            +91
                          </span>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-r-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition-all text-sm"
                            placeholder="98765 43210"
                            maxLength={10}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                          <select
                            value={formData.state}
                            onChange={handleStateChange}
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition-all text-sm"
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
                          <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                          <select
                            value={formData.city}
                            onChange={handleCityChange}
                            disabled={!formData.state}
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition-all text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option value="">Select City</option>
                            {selectedDistricts.map((district) => (
                              <option key={district} value={district}>
                                {district}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{profile.email}</span>
                        <span className="text-xs text-gray-400">(Cannot be changed)</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 capitalize">{profile.role}</span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {saving ? 'Saving...' : (locale === 'hi' ? 'सहेजें' : 'Save')}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false)
                            setFormData({
                              full_name: profile.full_name || '',
                              phone: profile.phone || '',
                              city: profile.city || '',
                              state: profile.state || '',
                            })
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        >
                          <X className="w-4 h-4" />
                          {locale === 'hi' ? 'रद्द करें' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{profile.full_name || 'Not set'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{profile.email}</span>
                      </div>
                      {profile.phone && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">+91 {profile.phone}</span>
                        </div>
                      )}
                      {(profile.city || profile.state) && (
                        <div className="flex items-center gap-3 text-sm">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {[profile.city, profile.state].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 capitalize">{profile.role}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    {locale === 'hi' ? 'हालिया पुरस्कार' : 'Recent Rewards'}
                  </h2>
                  {rewards.length === 0 ? (
                    <p className="text-sm text-gray-500">{locale === 'hi' ? 'अभी तक कोई पुरस्कार नहीं' : 'No rewards yet'}</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {rewards.slice(0, 10).map((reward) => (
                        <div key={reward.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div>
                            <p className="text-sm font-medium text-navy">{reward.reason || 'Bonus'}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(reward.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-green">+{reward.points} pts</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {locale === 'hi' ? 'मेरी रिपोर्ट्स' : 'My Reports'}
                  </h2>
                  {complaints.length === 0 ? (
                    <p className="text-sm text-gray-500">{locale === 'hi' ? 'अभी तक कोई रिपोर्ट नहीं' : 'No reports yet'}</p>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {complaints.map((complaint) => (
                        <div key={complaint.id} className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              {complaint.tracking_id && (
                                <p className="text-xs font-medium text-saffron mb-1 font-mono tracking-wide">
                                  {complaint.tracking_id}
                                </p>
                              )}
                              <p className="text-sm font-medium text-navy line-clamp-2">
                                {complaint.description || 'Waste Report'}
                              </p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                              {getStatusLabel(complaint.status)}
                            </span>
                          </div>
                          {complaint.location_text && (
                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {complaint.location_text}
                            </p>
                          )}
                          <p className="text-xs text-gray-400">
                            {new Date(complaint.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium border border-red-200"
              >
                <LogOut className="w-5 h-5" />
                {locale === 'hi' ? 'लॉग आउट' : 'Sign Out'}
              </button>
              <Link
                href="/"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-saffron to-saffron-dark text-white rounded-xl hover:shadow-lg transition-all font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                {locale === 'hi' ? 'मुख्य पृष्ठ पर जाएं' : 'Back to Home'}
              </Link>
            </div>
          </div>

          <div className="h-3 bg-gradient-to-r from-saffron via-white to-green" />
        </div>
      </div>
    </div>
  )
}
