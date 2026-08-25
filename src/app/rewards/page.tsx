'use client'

import { useLanguage } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { Trophy, Gift, Star, Award, Medal, Recycle, Crown, FileText, Users } from 'lucide-react'
import { Reward, Profile } from '@/lib/types'

const achievementColors: Record<string, { bg: string; from: string; to: string; border: string; text: string; mutedBg: string; mutedBorder: string; mutedText: string }> = {
  '1': { bg: 'bg-orange-50', from: 'from-orange-400', to: 'to-orange-600', border: 'border-orange-200', text: 'text-orange-600', mutedBg: 'bg-orange-50', mutedBorder: 'border-orange-100', mutedText: 'text-orange-400' },
  '2': { bg: 'bg-green-50', from: 'from-green-400', to: 'to-green-600', border: 'border-green-200', text: 'text-green-600', mutedBg: 'bg-green-50', mutedBorder: 'border-green-100', mutedText: 'text-green-400' },
  '3': { bg: 'bg-blue-50', from: 'from-blue-500', to: 'to-blue-700', border: 'border-blue-200', text: 'text-blue-700', mutedBg: 'bg-blue-50', mutedBorder: 'border-blue-100', mutedText: 'text-blue-400' },
  '4': { bg: 'bg-emerald-50', from: 'from-emerald-400', to: 'to-emerald-600', border: 'border-emerald-200', text: 'text-emerald-600', mutedBg: 'bg-emerald-50', mutedBorder: 'border-emerald-100', mutedText: 'text-emerald-400' },
  '5': { bg: 'bg-amber-50', from: 'from-amber-400', to: 'to-amber-600', border: 'border-amber-200', text: 'text-amber-600', mutedBg: 'bg-amber-50', mutedBorder: 'border-amber-100', mutedText: 'text-amber-400' },
  '6': { bg: 'bg-purple-50', from: 'from-purple-400', to: 'to-purple-600', border: 'border-purple-200', text: 'text-purple-600', mutedBg: 'bg-purple-50', mutedBorder: 'border-purple-100', mutedText: 'text-purple-400' },
}

const mockRewards: Reward[] = [
  { id: '1', user_id: '', points: 50, reason: 'Reported waste issue - verified', created_at: '2024-01-15T10:00:00Z' },
  { id: '2', user_id: '', points: 100, reason: 'Completed waste segregation training', created_at: '2024-01-14T14:30:00Z' },
  { id: '3', user_id: '', points: 25, reason: 'Daily login streak', created_at: '2024-01-13T09:00:00Z' },
  { id: '4', user_id: '', points: 200, reason: 'Recycled 10kg waste at center', created_at: '2024-01-12T11:00:00Z' },
  { id: '5', user_id: '', points: 75, reason: 'Participated in cleanliness drive', created_at: '2024-01-10T08:00:00Z' },
]

const achievements = [
  { id: '1', name: 'First Report', name_hi: 'पहली रिपोर्ट', icon: Trophy, points: 50, unlocked: true },
  { id: '2', name: 'Waste Warrior', name_hi: 'वेस्ट वारियर', icon: Award, points: 200, unlocked: true },
  { id: '3', name: 'Eco Champion', name_hi: 'इको चैंपियन', icon: Medal, points: 500, unlocked: false },
  { id: '4', name: 'Green Guardian', name_hi: 'ग्रीन गार्डियन', icon: Star, points: 1000, unlocked: false },
  { id: '5', name: 'Recycling Pro', name_hi: 'रीसाइक्लिंग प्रो', icon: Gift, points: 300, unlocked: true },
  { id: '6', name: 'Community Hero', name_hi: 'कम्युनिटी हीरो', icon: Trophy, points: 750, unlocked: false },
]

type TopContributor = {
  full_name: string
  report_count: number
}

export default function RewardsPage() {
  const { t } = useLanguage()
  const [totalPoints, setTotalPoints] = useState(0)
  const [reportsFiled, setReportsFiled] = useState<number | null>(null)
  const [recycledKg, setRecycledKg] = useState(0)
  const [rewards, setRewards] = useState<Reward[]>(mockRewards)
  const [topUsers, setTopUsers] = useState<Profile[]>([])
  const [showAllTopUsers, setShowAllTopUsers] = useState(false)
  const [topUsersReports, setTopUsersReports] = useState<{ userId: string; count: number }[]>([])
  const [topUsersRecycled, setTopUsersRecycled] = useState<{ userId: string; kg: number }[]>([])
  const [topRecyclers, setTopRecyclers] = useState<Array<{ full_name: string; kg: number }>>([])
  const [topReporters, setTopReporters] = useState<TopContributor[]>([])
  const [loading, setLoading] = useState(true)
  const [reportsError, setReportsError] = useState<string | null>(null)

  const fetchReportsStats = async () => {
    const supabase = createClient()
    setReportsError(null)

    try {
      const { data, error } = await supabase
        .rpc('get_public_reports_stats')

      if (error) throw error

      if (data) {
        setReportsFiled(data.totalReports ?? 0)
        setTopReporters(data.topContributors ?? [])
      }
    } catch (error) {
      console.error('Failed to load reports stats:', error)
      setReportsError('Unable to load reports statistics')
    }
  }

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient()
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('points', { ascending: false })
        .limit(10)

      if (profiles && !profileError) {
        setTopUsers(profiles)
        const total = profiles.reduce((sum, profile) => sum + (profile.points || 0), 0)
        setTotalPoints(total)

        const { data: allWasteRecords, error: wasteError } = await supabase
          .from('recycled_waste_records')
          .select('user_id, weight_kg')

        if (!wasteError && allWasteRecords) {
          const totalKg = allWasteRecords.reduce((sum, record) => sum + (record.weight_kg || 0), 0)
          setRecycledKg(totalKg)

          const userKgMap: Record<string, number> = {}
          allWasteRecords.forEach((record) => {
            const uid = record.user_id
            if (!uid) return
            userKgMap[uid] = (userKgMap[uid] || 0) + (record.weight_kg || 0)
          })

          const sortedUserIds = Object.entries(userKgMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([uid]) => uid)

          if (sortedUserIds.length > 0) {
            const { data: topProfiles } = await supabase
              .from('profiles')
              .select('id, full_name')
              .in('id', sortedUserIds)

            const profileMap = new Map((topProfiles || []).map((p) => [p.id, p.full_name || 'Anonymous']))
            setTopRecyclers(
              sortedUserIds.map((uid) => ({
                full_name: profileMap.get(uid) || 'Anonymous',
                kg: userKgMap[uid] || 0,
              }))
            )
          } else {
            setTopRecyclers([])
          }
        }

        const top3 = profiles.slice(0, 3)
        const reportPromises = top3.map((user) =>
          supabase
            .from('complaints')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .then(({ count, error }) => ({ userId: user.id, count: !error && typeof count === 'number' ? count : 0 }))
        )

        const wastePromises = top3.map((user) =>
          supabase
            .from('recycled_waste_records')
            .select('weight_kg')
            .eq('user_id', user.id)
            .then(({ data, error }) => ({ userId: user.id, kg: !error && data ? data.reduce((sum, record) => sum + (record.weight_kg || 0), 0) : 0 }))
        )

        const reportResults = await Promise.all(reportPromises)
        const wasteResults = await Promise.all(wastePromises)

        setTopUsersReports(reportResults)
        setTopUsersRecycled(wasteResults)
      }
      setLoading(false)
    }

    loadStats()
  }, [])

  useEffect(() => {
    fetchReportsStats()
  }, [])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('rewards-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'complaints',
        },
        () => {
          fetchReportsStats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">{t('nav.rewards')}</h1>
        <p className="text-gray-600">Track your contributions and earn rewards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-saffron to-saffron-dark rounded-xl p-6 text-navy">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Total Points</p>
              <p className="text-4xl font-bold mt-1">{loading ? '-' : totalPoints}</p>
            </div>
            <Trophy className="w-12 h-12 opacity-80" />
          </div>
          <div className="mt-4 pt-4 border-t border-navy/20">
            <div className="rounded-lg bg-white/70 border border-navy/10 divide-y divide-navy/10">
              {topUsers.slice(0, 3).map((user, index) => (
                <div key={user.id} className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-navy text-white text-[10px] font-bold leading-none">
                      {index + 1}
                    </span>
                    <span className="text-xs font-semibold text-navy truncate">{user.full_name || 'Anonymous'}</span>
                  </div>
                  <span className="text-xs font-bold text-saffron-dark whitespace-nowrap">{user.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green to-green-dark rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Reports Filed</p>
              <p className="text-4xl font-bold mt-1">
                {reportsFiled === null ? '-' : reportsFiled.toLocaleString()}
              </p>
            </div>
            <FileText className="w-12 h-12 opacity-80" />
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="rounded-lg bg-white/10 border border-white/10 divide-y divide-white/10">
              {reportsError ? (
                <div className="px-3 py-2 text-xs text-red-200">
                  {reportsError}
                </div>
              ) : topReporters.length > 0 ? (
                topReporters.map((reporter, index) => (
                  <div key={reporter.full_name + index} className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-green font-[10px] font-bold leading-none">
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold text-white truncate">{reporter.full_name}</span>
                    </div>
                    <span className="text-xs font-bold text-white/90 whitespace-nowrap">{reporter.report_count} reports</span>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-white/80">
                  No reports have been filed yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-navy to-navy-light rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Recycled (kg)</p>
              <p className="text-4xl font-bold mt-1">{loading ? '-' : recycledKg}</p>
            </div>
            <Recycle className="w-12 h-12 opacity-80" />
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="rounded-lg bg-white/10 border border-white/10 divide-y divide-white/10">
              {topRecyclers.length > 0 ? (
                topRecyclers.map((recycler, index) => (
                  <div key={recycler.full_name + index} className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-navy font-[10px] font-bold leading-none">
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold text-white truncate">{recycler.full_name}</span>
                    </div>
                    <span className="text-xs font-bold text-white/90 whitespace-nowrap">{recycler.kg} kg</span>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-white/80">
                  No recycled waste records yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-saffron" />
          Top Eco Warriors
        </h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading top contributors...</p>
        ) : topUsers.length > 0 ? (
          <>
            <div className="space-y-3">
              {(showAllTopUsers ? topUsers : topUsers.slice(0, 5)).map((user, index) => (
                <div key={user.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saffron to-saffron-dark flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy to-navy-light flex items-center justify-center text-white font-bold">
                    {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy truncate">{user.full_name || 'Anonymous Eco Warrior'}</p>
                    <p className="text-xs text-gray-600 truncate">
                      {[user.city, user.state].filter(Boolean).join(', ') || 'Location not specified'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-saffron">{user.points} pts</p>
                  </div>
                </div>
              ))}
            </div>
            {topUsers.length > 5 && (
              <button
                onClick={() => setShowAllTopUsers(!showAllTopUsers)}
                className="mt-4 w-full py-2 px-4 rounded-lg bg-navy/5 hover:bg-navy/10 text-navy text-sm font-semibold transition-colors"
              >
                {showAllTopUsers ? 'Show less' : 'Show more'}
              </button>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500">No top contributor data available yet.</p>
        )}
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-navy mb-4">Achievements</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon
              const colors = achievementColors[achievement.id] || achievementColors['1']
              return (
                <div
                  key={achievement.id}
                  className={`relative p-5 rounded-xl border-2 text-center transition-all duration-200 hover:scale-105 ${
                    achievement.unlocked
                      ? `${colors.border} ${colors.bg} shadow-md`
                      : `${colors.border} ${colors.mutedBg} shadow-md`
                  }`}
                >
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                    achievement.unlocked
                      ? `bg-gradient-to-br ${colors.from} ${colors.to} text-white shadow-lg`
                      : `bg-gradient-to-br ${colors.from} ${colors.to} text-white/70 shadow-md`
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className={`text-sm font-semibold ${achievement.unlocked ? 'text-navy' : 'text-gray-500'}`}>
                    {achievement.name}
                  </h3>
                  <p className={`text-xs mt-1 font-medium ${achievement.unlocked ? colors.text : colors.mutedText}`}>
                    {achievement.points} pts
                  </p>
                  {achievement.unlocked && (
                    <div className="absolute top-2 right-2">
                      <span className="text-green-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-navy mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {rewards.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-navy">{reward.reason}</p>
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
        </div>
      </div>
    </div>
  )
}
