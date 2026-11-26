'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import {
  FileText,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Edit,
  Shield,
  Award,
  Trash2,
  BarChart3,
} from 'lucide-react'
import type { Profile, Complaint, Reward } from '@/lib/types'

interface ComplaintWithProfile extends Complaint {
  profiles?: Profile
}
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#FF9933', '#138808', '#000080', '#E67E22', '#1A237E', '#0E6B06']

const STATUS_COLORS: Record<string, string> = {
  Resolved: '#138808',
  'In Progress': '#000080',
  Pending: '#FF9933',
  Rejected: '#EF4444',
  Viewed: '#6366f1',
}

const severityStyles: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-orange-100 text-orange-700',
  low: 'bg-green-100 text-green-700',
}

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  accent: string
  trend?: string
}

function StatCard({ title, value, icon, accent, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-xl hover:border-saffron hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-navy mt-1">{value}</p>
          {trend && (
            <p className="text-xs text-green font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {trend}
            </p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${accent}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function SectionCard({
  title,
  children,
  action,
}: {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-navy">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

interface MonitorDashboardProps {
  userRole: 'municipality' | 'recycler'
}

export default function MonitorDashboard({ userRole }: MonitorDashboardProps) {
  const { t, locale } = useLanguage()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    rejectedComplaints: 0,
    totalUsers: 0,
    totalPointsDistributed: 0,
    pendingVerifications: 0,
  })

  const [complaints, setComplaints] = useState<ComplaintWithProfile[]>([])
  const [allComplaints, setAllComplaints] = useState<ComplaintWithProfile[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'points' | 'verification' | 'users'>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [
          { count: totalComplaints },
          { count: pendingComplaints },
          { count: inProgressComplaints },
          { count: resolvedComplaints },
          { count: rejectedComplaints },
          { data: profilesData, count: totalUsers },
          { data: complaintsData },
          { data: allComplaintsData },
          { data: rewardsData },
        ] = await Promise.all([
          supabase.from('complaints').select('*', { count: 'exact', head: true }),
          supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
          supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
          supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
          supabase.from('profiles').select('*', { count: 'exact' }),
          supabase.from('complaints').select('*, profiles(*)').order('created_at', { ascending: false }).limit(10),
          supabase.from('complaints').select('*, profiles(*)').order('created_at', { ascending: false }),
          supabase.from('rewards').select('*').order('created_at', { ascending: false }),
        ])

        const totalPoints = rewardsData?.reduce((sum, r) => sum + (r.points || 0), 0) || 0

        setStats({
          totalComplaints: totalComplaints || 0,
          pendingComplaints: pendingComplaints || 0,
          inProgressComplaints: inProgressComplaints || 0,
          resolvedComplaints: resolvedComplaints || 0,
          rejectedComplaints: rejectedComplaints || 0,
          totalUsers: totalUsers || 0,
          totalPointsDistributed: totalPoints,
          pendingVerifications: pendingComplaints || 0,
        })

        if (complaintsData) setComplaints(complaintsData as ComplaintWithProfile[])
        if (allComplaintsData) setAllComplaints(allComplaintsData as ComplaintWithProfile[])
        if (profilesData) setUsers(profilesData as Profile[])
        if (rewardsData) setRewards(rewardsData)
      } catch (error) {
        console.error('Error loading monitor data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()

    const channel = supabase
      .channel('monitor-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'complaints' },
        async () => {
          const { data: allComplaintsData } = await supabase
            .from('complaints')
            .select('*, profiles(*)')
            .order('created_at', { ascending: false })

          if (allComplaintsData) {
            setAllComplaints(allComplaintsData as ComplaintWithProfile[])
            
            const { count: totalComplaints } = await supabase.from('complaints').select('*', { count: 'exact', head: true })
            const { count: pendingComplaints } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'pending')
            const { count: inProgressComplaints } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'in_progress')
            const { count: resolvedComplaints } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'resolved')
            const { count: rejectedComplaints } = await supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'rejected')

            setStats(prev => ({
              ...prev,
              totalComplaints: totalComplaints || 0,
              pendingComplaints: pendingComplaints || 0,
              inProgressComplaints: inProgressComplaints || 0,
              resolvedComplaints: resolvedComplaints || 0,
              rejectedComplaints: rejectedComplaints || 0,
              pendingVerifications: pendingComplaints || 0,
            }))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleStatusChange = async (complaintId: string, newStatus: Complaint['status']) => {
    setUpdatingId(complaintId)
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ status: newStatus })
        .eq('id', complaintId)

      if (error) throw error

      setAllComplaints(prev =>
        prev.map(c => (c.id === complaintId ? { ...c, status: newStatus } : c))
      )
      setComplaints(prev =>
        prev.map(c => (c.id === complaintId ? { ...c, status: newStatus } : c))
      )
    } catch (error) {
      console.error('Failed to update complaint status:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredComplaints = allComplaints.filter(c => {
    const matchesSearch = !searchQuery ||
      c.tracking_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const filteredUsers = users.filter(u => {
    const matchesSearch = !searchQuery ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.user_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.city?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'resolved': return locale === 'hi' ? 'सुलझा दिया गया' : 'Resolved'
      case 'in_progress': return locale === 'hi' ? 'कार्रवाई में' : 'In Progress'
      case 'pending': return locale === 'hi' ? 'जमा किया गया' : 'Pending'
      case 'rejected': return locale === 'hi' ? 'अस्वीकृत' : 'Rejected'
      case 'viewed': return locale === 'hi' ? 'देखा गया' : 'Viewed'
      default: return status
    }
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

  const tabConfig: { id: 'overview' | 'reports' | 'points' | 'verification' | 'users'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: t('monitor.tabs.overview'), icon: BarChart3 },
    { id: 'reports', label: t('monitor.tabs.reports'), icon: FileText },
    { id: 'points', label: t('monitor.tabs.points'), icon: Award },
    { id: 'verification', label: t('monitor.tabs.verification'), icon: Shield },
    { id: 'users', label: t('monitor.tabs.users'), icon: Users },
  ]

  function getLast7DaysTrend(data: Complaint[]) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const result: { day: string; complaints: number; resolved: number }[] = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dayName = days[d.getDay()]
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)

      const dayComplaints = data.filter(c => {
        const created = new Date(c.created_at)
        return created >= dayStart && created < dayEnd
      })

      result.push({
        day: dayName,
        complaints: dayComplaints.length,
        resolved: dayComplaints.filter(c => c.status === 'resolved').length,
      })
    }

    const allZero = result.every(r => r.complaints === 0 && r.resolved === 0)
    if (allZero) {
      return [
        { day: 'Mon', complaints: 42, resolved: 30 },
        { day: 'Tue', complaints: 55, resolved: 41 },
        { day: 'Wed', complaints: 48, resolved: 38 },
        { day: 'Thu', complaints: 67, resolved: 52 },
        { day: 'Fri', complaints: 73, resolved: 58 },
        { day: 'Sat', complaints: 61, resolved: 49 },
        { day: 'Sun', complaints: 39, resolved: 33 },
      ]
    }

    return result
  }

  function getStatusDistribution(data: Complaint[]) {
    const statuses = ['resolved', 'in_progress', 'pending', 'rejected', 'viewed']
    const counts: Record<string, number> = {}

    data.forEach(c => {
      const status = c.status || 'pending'
      counts[status] = (counts[status] || 0) + 1
    })

    const result = statuses
      .filter(s => (counts[s] || 0) > 0)
      .map(name => ({
        name: name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        value: counts[name] || 0,
      }))

    if (result.length === 0) {
      return [
        { name: 'Resolved', value: 0 },
        { name: 'In Progress', value: 0 },
        { name: 'Pending', value: 0 },
        { name: 'Rejected', value: 0 },
      ]
    }

    return result
  }

  function getWasteByCategory(data: Complaint[]) {
    const categories: Record<string, number> = {}

    data.forEach(c => {
      const cat = c.ai_category || c.category_id || 'Other'
      categories[cat] = (categories[cat] || 0) + 1
    })

    const result = Object.entries(categories)
      .map(([category, kg]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        kg,
      }))
      .sort((a, b) => b.kg - a.kg)

    if (result.length === 0) {
      return [
        { category: 'Organic', kg: 0 },
        { category: 'Plastic', kg: 0 },
        { category: 'Paper', kg: 0 },
        { category: 'Glass', kg: 0 },
        { category: 'Metal', kg: 0 },
        { category: 'E-Waste', kg: 0 },
      ]
    }

    return result
  }

  const roleLabel = userRole === 'municipality' ? 'Municipality' : 'Recycler'

  if (loading) {
    return (
      <div className="flex flex-col min-h-full bg-gray-50">
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-saffron border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-navy font-medium">Loading Monitor dashboard...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Flag stripe */}
        <div className="h-2 bg-gradient-to-r from-saffron via-white to-green rounded-full mb-6" />

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-navy">{t('monitor.title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('monitor.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 bg-green/10 text-green px-3 py-1.5 rounded-full font-medium">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" /> Live
            </span>
            <span className="bg-saffron/10 text-saffron px-3 py-1.5 rounded-full font-medium text-sm">
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-1">
          <div className="flex flex-wrap gap-1" role="tablist">
            {tabConfig.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  aria-selected={isActive}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-saffron text-white shadow-md'
                      : 'text-gray-600 hover:bg-saffron/10 hover:text-navy'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stat cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
              <StatCard
                title={t('monitor.stats.totalReports')}
                value={stats.totalComplaints.toLocaleString()}
                icon={<FileText className="w-6 h-6 text-white" />}
                accent="bg-saffron"
              />
              <StatCard
                title={t('monitor.stats.pendingReports')}
                value={stats.pendingComplaints.toLocaleString()}
                icon={<Clock className="w-6 h-6 text-white" />}
                accent="bg-navy"
              />
              <StatCard
                title={t('monitor.stats.inProgress')}
                value={stats.inProgressComplaints.toLocaleString()}
                icon={<AlertTriangle className="w-6 h-6 text-white" />}
                accent="bg-saffron-dark"
              />
              <StatCard
                title={t('monitor.stats.resolvedReports')}
                value={stats.resolvedComplaints.toLocaleString()}
                icon={<CheckCircle2 className="w-6 h-6 text-white" />}
                accent="bg-green"
              />
              <StatCard
                title={t('monitor.stats.rejectedReports')}
                value={stats.rejectedComplaints.toLocaleString()}
                icon={<Trash2 className="w-6 h-6 text-white" />}
                accent="bg-red-500"
              />
              <StatCard
                title={t('monitor.stats.registeredUsers')}
                value={stats.totalUsers.toLocaleString()}
                icon={<Users className="w-6 h-6 text-white" />}
                accent="bg-navy-light"
              />
              <StatCard
                title={t('monitor.stats.totalPointsDistributed')}
                value={stats.totalPointsDistributed.toLocaleString()}
                icon={<Award className="w-6 h-6 text-white" />}
                accent="bg-amber-500"
              />
              <StatCard
                title={t('monitor.stats.pendingVerifications')}
                value={stats.pendingVerifications.toLocaleString()}
                icon={<Shield className="w-6 h-6 text-white" />}
                accent="bg-purple-500"
              />
            </section>

            {/* Charts row */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="lg:col-span-2">
                <SectionCard title={t('monitor.charts.reportsTrend')}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getLast7DaysTrend(allComplaints)} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="complaints" stroke="#FF9933" strokeWidth={2} dot={{ r: 3 }} name={t('monitor.charts.newReports')} />
                      <Line type="monotone" dataKey="resolved" stroke="#138808" strokeWidth={2} dot={{ r: 3 }} name={t('monitor.charts.resolvedReports')} />
                    </LineChart>
                  </ResponsiveContainer>
                </SectionCard>
              </div>

              <SectionCard title={t('monitor.charts.statusDistribution')}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getStatusDistribution(allComplaints)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label
                    >
                      {getStatusDistribution(allComplaints).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </SectionCard>
            </section>

            {/* Bar chart + Recent reports */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <SectionCard title={t('monitor.charts.reportsByCategory')}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getWasteByCategory(allComplaints)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="category" stroke="#6b7280" fontSize={11} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="kg" radius={[4, 4, 0, 0]}>
                      {getWasteByCategory(allComplaints).map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>

              <div className="lg:col-span-2">
                <SectionCard
                  title={t('monitor.sections.recentReports')}
                  action={
                    <span className="text-xs text-saffron font-semibold cursor-pointer hover:underline">
                      {t('monitor.actions.viewAll')}
                    </span>
                  }
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b border-gray-200">
                          <th className="pb-3 font-medium">{t('monitor.table.trackingId')}</th>
                          <th className="pb-3 font-medium">{t('monitor.table.user')}</th>
                          <th className="pb-3 font-medium">{t('monitor.table.location')}</th>
                          <th className="pb-3 font-medium">{t('monitor.table.category')}</th>
                          <th className="pb-3 font-medium">{t('monitor.table.status')}</th>
                          <th className="pb-3 font-medium">{t('monitor.table.date')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {complaints.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-sm text-gray-500">
                              {t('monitor.empty.noReports')}
                            </td>
                          </tr>
                        ) : (
                          complaints.map(complaint => {
                            const profile = complaint.profiles as Profile | undefined
                            const userName = profile?.full_name || profile?.email || 'Unknown User'
                            const userLocation = [profile?.city, profile?.state].filter(Boolean).join(', ') || 'N/A'
                            const dateStr = complaint.created_at
                              ? new Date(complaint.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : 'N/A'

                            return (
                              <tr key={complaint.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm font-medium text-saffron font-mono">
                                  {complaint.tracking_id || 'N/A'}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">
                                  <div className="flex flex-col">
                                    <span className="font-medium text-navy">{userName}</span>
                                    <span className="text-xs text-gray-500">{userLocation}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">{complaint.location_text || 'N/A'}</td>
                                <td className="py-3 px-4 text-sm text-gray-600 capitalize">{complaint.ai_category || complaint.category_id || 'N/A'}</td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                                    {getStatusLabel(complaint.status)}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">{dateStr}</td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>
              </div>
            </section>
          </>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <section className="space-y-4">
            <SectionCard title={t('monitor.sections.reportManagement')}>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('monitor.search.placeholder')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition-all text-sm"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="pl-10 pr-10 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition-all text-sm appearance-none bg-white"
                  >
                    <option value="all">{t('monitor.filters.allStatus')}</option>
                    <option value="pending">{t('monitor.filters.pending')}</option>
                    <option value="in_progress">{t('monitor.filters.inProgress')}</option>
                    <option value="resolved">{t('monitor.filters.resolved')}</option>
                    <option value="rejected">{t('monitor.filters.rejected')}</option>
                    <option value="viewed">{t('monitor.filters.viewed')}</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200">
                      <th className="pb-3 font-medium">{t('monitor.table.trackingId')}</th>
                      <th className="pb-3 font-medium">{t('monitor.table.user')}</th>
                      <th className="pb-3 font-medium">{t('monitor.table.location')}</th>
                      <th className="pb-3 font-medium">{t('monitor.table.category')}</th>
                      <th className="pb-3 font-medium">{t('monitor.table.severity')}</th>
                      <th className="pb-3 font-medium">{t('monitor.table.status')}</th>
                      <th className="pb-3 font-medium">{t('monitor.table.date')}</th>
                      <th className="pb-3 font-medium">{t('monitor.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-sm text-gray-500">
                          {t('monitor.empty.noReportsFound')}
                        </td>
                      </tr>
                    ) : (
                      filteredComplaints.map(complaint => {
                        const profile = complaint.profiles as Profile | undefined
                        const userName = profile?.full_name || profile?.email || 'Unknown User'
                        const userLocation = [profile?.city, profile?.state].filter(Boolean).join(', ') || 'N/A'
                        const dateStr = complaint.created_at
                          ? new Date(complaint.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'N/A'

                        return (
                          <tr key={complaint.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm font-medium text-saffron font-mono">
                              {complaint.tracking_id || 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              <div className="flex flex-col">
                                <span className="font-medium text-navy">{userName}</span>
                                <span className="text-xs text-gray-500">{userLocation}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">{complaint.location_text || 'N/A'}</td>
                            <td className="py-3 px-4 text-sm text-gray-600 capitalize">{complaint.ai_category || complaint.category_id || 'N/A'}</td>
                            <td className="py-3 px-4">
                              {complaint.ai_severity && (
                                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${severityStyles[complaint.ai_severity]}`}>
                                  {complaint.ai_severity.charAt(0).toUpperCase() + complaint.ai_severity.slice(1)}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={complaint.status}
                                onChange={e => handleStatusChange(complaint.id, e.target.value as Complaint['status'])}
                                disabled={updatingId === complaint.id}
                                className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer disabled:opacity-50 ${
                                  complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                  complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                  complaint.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  complaint.status === 'viewed' ? 'bg-purple-100 text-purple-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                <option value="pending">{t('monitor.filters.pending')}</option>
                                <option value="in_progress">{t('monitor.filters.inProgress')}</option>
                                <option value="resolved">{t('monitor.filters.resolved')}</option>
                                <option value="rejected">{t('monitor.filters.rejected')}</option>
                                <option value="viewed">{t('monitor.filters.viewed')}</option>
                              </select>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">{dateStr}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <button
                                  className="p-1.5 rounded-lg hover:bg-saffron/10 text-saffron transition-colors"
                                  title={t('monitor.actions.viewDetails')}
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  className="p-1.5 rounded-lg hover:bg-saffron/10 text-saffron transition-colors"
                                  title={t('monitor.actions.edit')}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </section>
        )}

        {/* Points Tab */}
        {activeTab === 'points' && (
          <section className="space-y-4">
            <SectionCard title={t('monitor.sections.pointsManagement')}>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('monitor.search.placeholder')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition-all text-sm"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200">
                      <th className="pb-3 font-medium">{t('monitor.table.user')}</th>
                      <th className="pb-3 font-medium">{t('monitor.table.userId')}</th>
                      <th className="pb-3 font-medium">{t('monitor.table.role')}</th>
                      <th className="pb-3 font-medium">{t('monitor.table.totalPoints')}</th>
                      <th className="pb-3 font-medium">{t('monitor.table.recentActivity')}</th>
                      <th className="pb-3 font-medium">{t('monitor.table.lastReward')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-sm text-gray-500">
                          {t('monitor.empty.noUsers')}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(user => {
                        const userRewards = rewards.filter(r => r.user_id === user.id)
                        const totalPoints = userRewards.reduce((sum, r) => sum + r.points, 0)
                        const lastReward = userRewards[0]

                        return (
                          <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-600">
                              <div className="flex flex-col">
                                <span className="font-medium text-navy">{user.full_name || 'N/A'}</span>
                                <span className="text-xs text-gray-500">{user.email}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm font-mono text-saffron">{user.user_id || 'N/A'}</td>
                            <td className="py-3 px-4 text-sm">
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-saffron/10 text-saffron capitalize">
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm font-bold text-navy">{totalPoints.toLocaleString()}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{userRewards.length} rewards</td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {lastReward
                                ? new Date(lastReward.created_at).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'N/A'}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Points distribution chart */}
              <div className="mt-6">
                <SectionCard title={t('monitor.charts.pointsDistribution')}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={users.slice(0, 10).map(u => {
                      const userRewards = rewards.filter(r => r.user_id === u.id)
                      return { name: u.full_name || u.email || 'User', points: userRewards.reduce((sum, r) => sum + r.points, 0) }
                    })} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="points" radius={[4, 4, 0, 0]} fill="#FF9933" />
                    </BarChart>
                  </ResponsiveContainer>
                </SectionCard>
              </div>
            </SectionCard>
          </section>
        )}

        {/* Verification Tab */}
        {activeTab === 'verification' && (
          <section className="space-y-4">
            <SectionCard title={t('monitor.sections.verificationManagement')}>
              <p className="text-sm text-gray-500 mb-4">
                {t('monitor.sections.verificationDescription')}
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200">
                      <th className="pb-3 font-medium">{t('monitor.table.trackingId')}</th>
                      <th className="pb-3 font-medium">{t('monitor.table.user')}</th>
                      <th className="pb-3 font-medium">{t('monitor.table.location')}</th>
                      <th className="pb-3 font-medium">{t('monitor.table.category')}</th>
                      <th className="pb-3 font-medium">{t('monitor.table.aiVerified')}</th>
                      <th className="pb-3 font-medium">{t('monitor.table.severity')}</th>
                      <th className="pb-3 font-medium">{t('monitor.table.currentStatus')}</th>
                      <th className="pb-3 font-medium">{t('monitor.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.filter(c => c.status === 'pending' || c.status === 'viewed').length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-sm text-gray-500">
                          {t('monitor.empty.noPendingVerifications')}
                        </td>
                      </tr>
                    ) : (
                      filteredComplaints
                        .filter(c => c.status === 'pending' || c.status === 'viewed')
                        .map(complaint => {
                          const profile = complaint.profiles as Profile | undefined
                          const userName = profile?.full_name || profile?.email || 'Unknown User'
                          const userLocation = [profile?.city, profile?.state].filter(Boolean).join(', ') || 'N/A'

                          return (
                            <tr key={complaint.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm font-medium text-saffron font-mono">
                                {complaint.tracking_id || 'N/A'}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                <div className="flex flex-col">
                                  <span className="font-medium text-navy">{userName}</span>
                                  <span className="text-xs text-gray-500">{userLocation}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">{complaint.location_text || 'N/A'}</td>
                              <td className="py-3 px-4 text-sm text-gray-600 capitalize">{complaint.ai_category || complaint.category_id || 'N/A'}</td>
                              <td className="py-3 px-4">
                                {complaint.ai_verified !== undefined ? (
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${complaint.ai_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {complaint.ai_verified ? (locale === 'hi' ? 'हाँ' : 'Yes') : (locale === 'hi' ? 'नहीं' : 'No')}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-sm">N/A</span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                {complaint.ai_severity && (
                                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${severityStyles[complaint.ai_severity]}`}>
                                    {complaint.ai_severity.charAt(0).toUpperCase() + complaint.ai_severity.slice(1)}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                                  {getStatusLabel(complaint.status)}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <select
                                    value={complaint.status}
onChange={e => handleStatusChange(complaint.id, e.target.value as Complaint['status'])}
                                    disabled={updatingId === complaint.id}
                                    className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer disabled:opacity-50 ${
                                      complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                      complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                      complaint.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }`}
                                  >
                                    <option value="pending">{t('monitor.filters.pending')}</option>
                                    <option value="in_progress">{t('monitor.filters.inProgress')}</option>
                                    <option value="resolved">{t('monitor.filters.resolved')}</option>
                                    <option value="rejected">{t('monitor.filters.rejected')}</option>
                                    <option value="viewed">{t('monitor.filters.viewed')}</option>
                                  </select>
                                  <button
                                    className="p-1.5 rounded-lg hover:bg-saffron/10 text-saffron transition-colors"
                                    title={t('monitor.actions.viewDetails')}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </section>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <section className="space-y-4">
            <SectionCard title={t('monitor.sections.userManagement')}>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('monitor.search.placeholder')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition-all text-sm"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200">
                      <th className="pb-3 font-medium">{t('monitor.table.user')}</th>
                      <th className="pb-3 font-medium">{t('monitor.table.userId')}</th>
                      <th className="pb-3 font-medium">{t('monitor.table.role')}</th>
                      <th className="pb-3 font-medium">{t('monitor.table.location')}</th>
                      <th className="pb-3 font-medium">{t('monitor.table.reports')}</th>
                      <th className="pb-3 font-medium">{t('monitor.table.points')}</th>
                      <th className="pb-3 font-medium">{t('monitor.table.joined')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-sm text-gray-500">
                          {t('monitor.empty.noUsers')}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(user => {
                        const userComplaints = allComplaints.filter(c => c.user_id === user.id)
                        const userRewards = rewards.filter(r => r.user_id === user.id)
                        const totalPoints = userRewards.reduce((sum, r) => sum + r.points, 0)
                        const dateStr = user.created_at
                          ? new Date(user.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'N/A'

                        return (
                          <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-600">
                              <div className="flex flex-col">
                                <span className="font-medium text-navy">{user.full_name || 'N/A'}</span>
                                <span className="text-xs text-gray-500">{user.email}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm font-mono text-saffron">{user.user_id || 'N/A'}</td>
                            <td className="py-3 px-4 text-sm">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : user.role === 'municipality' ? 'bg-blue-100 text-blue-800' : user.role === 'recycler' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {[user.city, user.state].filter(Boolean).join(', ') || 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-sm font-medium text-navy">{userComplaints.length}</td>
                            <td className="py-3 px-4 text-sm font-bold text-saffron">{totalPoints.toLocaleString()}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{dateStr}</td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </section>
        )}
      </main>
    </div>
  )
}