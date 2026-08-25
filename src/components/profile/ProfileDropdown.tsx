'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, LogOut, Settings, Award, FileText, ChevronDown } from 'lucide-react'
import Image from 'next/image'

export function ProfileDropdown() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [stats, setStats] = useState({ reports: 0, points: 0, rank: 'Citizen' })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (data) setProfile(data)

        const { count } = await supabase
          .from('complaints')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
        
        const totalPoints = data?.points || 0
        setStats({
          reports: count || 0,
          points: totalPoints,
          rank: totalPoints >= 1000 ? 'Eco Warrior' : totalPoints >= 500 ? 'Green Guardian' : 'Citizen'
        })
      }
    }
    getUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-saffron hover:bg-saffron/5 transition-all duration-200"
      >
        {profile?.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt="Profile"
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-saffron to-saffron-dark rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="hidden sm:block text-sm font-medium text-navy">
          {profile?.full_name?.split(' ')[0] || 'User'}
        </span>
        <ChevronDown className={`w-4 h-4 text-navy transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 animate-scale-in overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-saffron to-saffron-dark p-4 text-white">
              <div className="flex items-center gap-3">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Profile"
                    width={48}
                    height={48}
                    className="rounded-full object-cover border-2 border-white"
                  />
                ) : (
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-white">
                    {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                 <div>
                   <h3 className="font-semibold">{profile?.full_name || 'User'}</h3>
                   <p className="text-xs text-white/80">{user.email}</p>
                   <p className="text-[10px] text-white/60 font-mono">{profile?.user_id}</p>
                   <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                     {profile?.role || 'Citizen'}
                   </span>
                 </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 p-3 border-b border-gray-100">
              <div className="text-center">
                <p className="text-lg font-bold text-navy">{stats.reports}</p>
                <p className="text-xs text-gray-500">Reports</p>
              </div>
              <div className="text-center border-x border-gray-100">
                <p className="text-lg font-bold text-saffron">{stats.points}</p>
                <p className="text-xs text-gray-500">Points</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green">{stats.rank.split(' ')[0]}</p>
                <p className="text-xs text-gray-500">Rank</p>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2 space-y-1">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-saffron/5 text-gray-700 hover:text-navy transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">My Profile</span>
              </Link>
              <Link
                href="/profile#reports"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-saffron/5 text-gray-700 hover:text-navy transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">My Reports</span>
              </Link>
              <Link
                href="/profile#rewards"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-saffron/5 text-gray-700 hover:text-navy transition-colors"
              >
                <Award className="w-4 h-4" />
                <span className="text-sm font-medium">Rewards</span>
              </Link>
              <Link
                href="/profile#settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-saffron/5 text-gray-700 hover:text-navy transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Settings</span>
              </Link>
            </div>

            {/* Logout */}
            <div className="p-2 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
