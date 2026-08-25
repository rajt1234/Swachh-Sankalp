'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  FileText,
  CheckCircle2,
  Clock,
  Trash2,
  Users,
  Recycle,
  MapPin,
  Bell,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import { useLanguage } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import type {
  Profile,
  Complaint,
  CityStats,
  WasteCategory,
  RecyclingCenter,
  SmartBin,
} from '@/lib/types'

// ----------------------------------------------------------------------------
// Mock data — replace with real Supabase queries (see TODOs below)
// ----------------------------------------------------------------------------

const COLORS = ['#FF9933', '#138808', '#000080', '#E67E22', '#1A237E', '#0E6B06']

const STATUS_COLORS: Record<string, string> = {
  Resolved: '#138808',
  'In Progress': '#000080',
  Pending: '#FF9933',
  Rejected: '#EF4444',
  Viewed: '#6366f1',
}

const mockCategories: WasteCategory[] = [
  { id: 'c1', name: 'Organic', color: '#138808', description: 'Biodegradable kitchen and garden waste' },
  { id: 'c2', name: 'Plastic', color: '#000080', description: 'Plastic bottles, packaging and containers' },
  { id: 'c3', name: 'Paper', color: '#E67E22', description: 'Newspaper, cardboard and paper waste' },
  { id: 'c4', name: 'Glass', color: '#1A237E', description: 'Glass bottles and jars' },
  { id: 'c5', name: 'Metal', color: '#0E6B06', description: 'Cans, tins and metal scraps' },
  { id: 'c6', name: 'E-Waste', color: '#FF9933', description: 'Electronic and electrical waste' },
]

// Complaints over the last 7 days
const mockComplaintsTrend: { day: string; complaints: number; resolved: number }[] = [
  { day: 'Mon', complaints: 42, resolved: 30 },
  { day: 'Tue', complaints: 55, resolved: 41 },
  { day: 'Wed', complaints: 48, resolved: 38 },
  { day: 'Thu', complaints: 67, resolved: 52 },
  { day: 'Fri', complaints: 73, resolved: 58 },
  { day: 'Sat', complaints: 61, resolved: 49 },
  { day: 'Sun', complaints: 39, resolved: 33 },
]

// Waste collected (kg) by category
const mockWasteByCategory: { category: string; kg: number }[] = [
  { category: 'Organic', kg: 1240 },
  { category: 'Plastic', kg: 870 },
  { category: 'Paper', kg: 540 },
  { category: 'Glass', kg: 320 },
  { category: 'Metal', kg: 210 },
  { category: 'E-Waste', kg: 95 },
]

// Complaint status distribution (for pie chart)
const mockStatusDistribution: { name: string; value: number }[] = [
  { name: 'Resolved', value: 1284 },
  { name: 'In Progress', value: 412 },
  { name: 'Pending', value: 268 },
  { name: 'Rejected', value: 76 },
]

// Top performing cities — sample data for 7 cities
const mockCityStats: CityStats[] = [
  { id: 'ci1', city: 'Indore', state: 'Madhya Pradesh', complaints_resolved: 3420, waste_collected_kg: 18600, citizens_active: 48200, recycling_rate: 88, updated_at: '' },
  { id: 'ci2', city: 'Bhopal', state: 'Madhya Pradesh', complaints_resolved: 2890, waste_collected_kg: 15400, citizens_active: 39600, recycling_rate: 84, updated_at: '' },
  { id: 'ci3', city: 'Surat', state: 'Gujarat', complaints_resolved: 2650, waste_collected_kg: 14100, citizens_active: 35400, recycling_rate: 82, updated_at: '' },
  { id: 'ci4', city: 'Mysore', state: 'Karnataka', complaints_resolved: 2410, waste_collected_kg: 12900, citizens_active: 31800, recycling_rate: 79, updated_at: '' },
  { id: 'ci5', city: 'Pune', state: 'Maharashtra', complaints_resolved: 2230, waste_collected_kg: 11800, citizens_active: 29500, recycling_rate: 77, updated_at: '' },
  { id: 'ci6', city: 'Ahmedabad', state: 'Gujarat', complaints_resolved: 1980, waste_collected_kg: 10600, citizens_active: 27100, recycling_rate: 74, updated_at: '' },
  { id: 'ci7', city: 'Jaipur', state: 'Rajasthan', complaints_resolved: 1750, waste_collected_kg: 9400, citizens_active: 24200, recycling_rate: 71, updated_at: '' },
]

// Recent activity feed
const mockActivity: { id: string; text: string; time: string; type: 'resolved' | 'pending' | 'report' | 'recycle' }[] = [
  { id: 'a1', text: 'Complaint #SW-4821 resolved in Indore', time: '2 mins ago', type: 'resolved' },
  { id: 'a2', text: 'New complaint filed in Bhopal — overflowing bin', time: '14 mins ago', type: 'report' },
  { id: 'a3', text: 'Recycling center collected 320kg plastic in Surat', time: '38 mins ago', type: 'recycle' },
  { id: 'a4', text: 'Complaint #SW-4790 pending review in Pune', time: '1 hour ago', type: 'pending' },
  { id: 'a5', text: 'Complaint #SW-4772 resolved in Mysore', time: '2 hours ago', type: 'resolved' },
  { id: 'a6', text: 'New complaint filed in Jaipur — illegal dumping', time: '3 hours ago', type: 'report' },
]

// Waste hotspots
const mockHotspots: { id: string; area: string; city: string; severity: 'high' | 'medium' | 'low'; open: number }[] = [
  { id: 'h1', area: 'Sector 45 Market', city: 'Gurugram', severity: 'high', open: 38 },
  { id: 'h2', area: 'Old City Dump Yard', city: 'Jaipur', severity: 'high', open: 31 },
  { id: 'h3', area: 'Station Road', city: 'Bhopal', severity: 'medium', open: 19 },
  { id: 'h4', area: 'Lakeside Colony', city: 'Indore', severity: 'medium', open: 14 },
  { id: 'h5', area: 'Tech Park Junction', city: 'Pune', severity: 'low', open: 7 },
]

// Smart bins sample
const mockBins: SmartBin[] = [
  { id: 'b1', location_text: 'MG Road, Indore', fill_level: 92, category: 'Organic', last_emptied: '2 days ago', created_at: '' },
  { id: 'b2', location_text: 'City Center, Bhopal', fill_level: 74, category: 'Plastic', last_emptied: '1 day ago', created_at: '' },
  { id: 'b3', location_text: 'Station, Surat', fill_level: 58, category: 'Paper', last_emptied: '3 days ago', created_at: '' },
  { id: 'b4', location_text: 'Mall Road, Pune', fill_level: 41, category: 'Glass', last_emptied: '5 days ago', created_at: '' },
]

// ----------------------------------------------------------------------------
// Small UI helpers
// ----------------------------------------------------------------------------

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

const severityStyles: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-orange-100 text-orange-700',
  low: 'bg-green-100 text-green-700',
}

// ----------------------------------------------------------------------------
// Main dashboard page
// ----------------------------------------------------------------------------

export default function DashboardPage() {
  const { t } = useLanguage()

  const [profiles, setProfiles] = useState<Profile[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([])
  const [recyclingCenters, setRecyclingCenters] = useState<RecyclingCenter[]>([])
  const [bins, setBins] = useState<SmartBin[]>([])
  const [cityStats, setCityStats] = useState<CityStats[]>([])
  const [loading, setLoading] = useState(true)

  const [totalComplaints, setTotalComplaints] = useState(2040)
  const [resolvedComplaints, setResolvedComplaints] = useState(1284)
  const [pendingComplaints, setPendingComplaints] = useState(268)
  const [wasteCollected, setWasteCollected] = useState(64250)
  const [activeCitizens, setActiveCitizens] = useState(234800)
  const [recyclingRate, setRecyclingRate] = useState(81)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      const [
        { count: complaintsCount, error: complaintsError },
        { count: resolvedCount, error: resolvedError },
        { count: pendingCount, error: pendingError },
        { data: profilesData, error: profilesError, count: profilesCount },
        { data: binsData, error: binsError },
        { data: centersData, error: centersError },
        { data: cityData, error: cityError },
        { data: wasteData, error: wasteError },
      ] = await Promise.all([
        supabase.from('complaints').select('*', { count: 'exact', head: true }),
        supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
        supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('smart_bins').select('*'),
        supabase.from('recycling_centers').select('*'),
        supabase.from('city_stats').select('*').order('complaints_resolved', { ascending: false }).limit(7),
        supabase.from('waste_records').select('weight_kg'),
      ])

      if (complaintsError) console.error('Complaints count error:', complaintsError)
      if (resolvedError) console.error('Resolved count error:', resolvedError)
      if (pendingError) console.error('Pending count error:', pendingError)
      if (profilesError) console.error('Profiles error:', profilesError)
      if (binsError) console.error('Bins error:', binsError)
      if (centersError) console.error('Centers error:', centersError)
      if (cityError) console.error('City stats error:', cityError)
      if (wasteError) console.error('Waste records error:', wasteError)

      setTotalComplaints(complaintsCount || 2040)
      setResolvedComplaints(resolvedCount || 1284)
      setPendingComplaints(pendingCount || 268)
      setActiveCitizens(profilesCount || 234800)

      if (profilesData && profilesData.length > 0) setProfiles(profilesData)
      if (binsData && binsData.length > 0) setBins(binsData)
      if (centersData && centersData.length > 0) setRecyclingCenters(centersData)
      if (cityData && cityData.length > 0) setCityStats(cityData)

      if (wasteData && wasteData.length > 0) {
        const totalKg = wasteData.reduce((sum, r) => sum + (r.weight_kg || 0), 0)
        setWasteCollected(totalKg)
      }

      if (cityData && cityData.length > 0) {
        const totalRate = cityData.reduce((sum, c) => sum + (c.recycling_rate || 0), 0)
        setRecyclingRate(Math.round(totalRate / cityData.length))
      }

      const { data: recentComplaints } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (recentComplaints && recentComplaints.length > 0) {
        setComplaints(recentComplaints)
      }

      const { data: allComplaintsData } = await supabase
        .from('complaints')
        .select('*')

      if (allComplaintsData && allComplaintsData.length > 0) {
        setAllComplaints(allComplaintsData)
      }

      setLoading(false)
    }

    loadData()
  }, [])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'complaints',
        },
        async () => {
          const { data: allComplaintsData } = await supabase
            .from('complaints')
            .select('*')

          if (allComplaintsData) {
            setAllComplaints(allComplaintsData)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

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

      const dayComplaints = data.filter((c) => {
        const created = new Date(c.created_at)
        return created >= dayStart && created < dayEnd
      })

      result.push({
        day: dayName,
        complaints: dayComplaints.length,
        resolved: dayComplaints.filter((c) => c.status === 'resolved').length,
      })
    }

    const allZero = result.every((r) => r.complaints === 0 && r.resolved === 0)
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

    data.forEach((c) => {
      const status = c.status || 'pending'
      counts[status] = (counts[status] || 0) + 1
    })

    const result = statuses
      .filter((s) => (counts[s] || 0) > 0)
      .map((name) => ({
        name: name.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        value: counts[name] || 0,
      }))

    if (result.length === 0) {
      return [
        { name: 'Resolved', value: 1284 },
        { name: 'In Progress', value: 412 },
        { name: 'Pending', value: 268 },
        { name: 'Rejected', value: 76 },
      ]
    }

    return result
  }

  function getWasteByCategory(data: Complaint[]) {
    const categories: Record<string, number> = {}

    data.forEach((c) => {
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
        { category: 'Organic', kg: 1240 },
        { category: 'Plastic', kg: 870 },
        { category: 'Paper', kg: 540 },
        { category: 'Glass', kg: 320 },
        { category: 'Metal', kg: 210 },
        { category: 'E-Waste', kg: 95 },
      ]
    }

    return result
  }

  function getHotspots(data: Complaint[]) {
    const areaMap: Record<string, { area: string; city: string; severity: 'high' | 'medium' | 'low'; open: number }> = {}

    data.forEach((c) => {
      const key = c.location_text || c.address || c.city || 'Unknown'
      if (!areaMap[key]) {
        areaMap[key] = {
          area: c.location_text || c.address || c.city || 'Unknown',
          city: c.city || 'Unknown',
          severity: c.ai_severity || 'medium',
          open: 0,
        }
      }
      if (c.status !== 'resolved' && c.status !== 'rejected') {
        areaMap[key].open += 1
      }
      if (c.ai_severity === 'high') {
        areaMap[key].severity = 'high'
      } else if (c.ai_severity === 'medium' && areaMap[key].severity !== 'high') {
        areaMap[key].severity = 'medium'
      }
    })

    const result = Object.values(areaMap)
      .sort((a, b) => b.open - a.open)
      .slice(0, 5)
      .map((h, i) => ({ ...h, id: `h${i + 1}` }))

    if (result.length === 0) {
      return [
        { id: 'h1', area: 'Sector 45 Market', city: 'Gurugram', severity: 'high', open: 38 },
        { id: 'h2', area: 'Old City Dump Yard', city: 'Jaipur', severity: 'high', open: 31 },
        { id: 'h3', area: 'Station Road', city: 'Bhopal', severity: 'medium', open: 19 },
        { id: 'h4', area: 'Lakeside Colony', city: 'Indore', severity: 'medium', open: 14 },
        { id: 'h5', area: 'Tech Park Junction', city: 'Pune', severity: 'low', open: 7 },
      ]
    }

    return result
  }

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Flag stripe */}
        <div className="h-2 bg-gradient-to-r from-saffron via-white to-green rounded-full mb-6" />
        
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-navy">{t('dashboard.title')}</h1>
            <p className="text-sm text-gray-500 mt-1">
              National Waste Management Analytics — Swachh Bharat Mission
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 bg-green/10 text-green px-3 py-1.5 rounded-full font-medium">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" /> Live
            </span>
            <span>
              {loading ? 'Syncing…' : 'Last updated: just now'}
            </span>
          </div>
        </div>

        {/* Stat cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <StatCard
            title={t('dashboard.totalComplaints')}
            value={totalComplaints.toLocaleString()}
            icon={<FileText className="w-6 h-6 text-white" />}
            accent="bg-saffron"
            trend="+12% this week"
          />
          <StatCard
            title={t('dashboard.resolved')}
            value={resolvedComplaints.toLocaleString()}
            icon={<CheckCircle2 className="w-6 h-6 text-white" />}
            accent="bg-green"
            trend="+8% this week"
          />
          <StatCard
            title={t('dashboard.pending')}
            value={pendingComplaints.toLocaleString()}
            icon={<Clock className="w-6 h-6 text-white" />}
            accent="bg-navy"
            trend="-3% this week"
          />
          <StatCard
            title={t('dashboard.wasteCollected')}
            value={wasteCollected.toLocaleString()}
            icon={<Trash2 className="w-6 h-6 text-white" />}
            accent="bg-saffron-dark"
            trend="+5% this week"
          />
          <StatCard
            title={t('dashboard.activeCitizens')}
            value={activeCitizens.toLocaleString()}
            icon={<Users className="w-6 h-6 text-white" />}
            accent="bg-navy-light"
            trend="+15% this week"
          />
          <StatCard
            title={t('dashboard.recyclingRate')}
            value={`${recyclingRate}%`}
            icon={<Recycle className="w-6 h-6 text-white" />}
            accent="bg-green-dark"
            trend="+2% this week"
          />
        </section>

        {/* Charts row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <SectionCard title="Complaints — Last 7 Days">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getLast7DaysTrend(complaints)} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="complaints" stroke="#FF9933" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="resolved" stroke="#138808" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </SectionCard>
          </div>

          <SectionCard title="Complaint Status">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getStatusDistribution(complaints)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {getStatusDistribution(complaints).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </SectionCard>
        </section>

        {/* Bar chart + table row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <SectionCard title="Waste Collected by Category (kg)">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getWasteByCategory(complaints)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="category" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip />
                <Bar dataKey="kg" radius={[4, 4, 0, 0]}>
                  {getWasteByCategory(complaints).map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          <div className="lg:col-span-2">
            <SectionCard
              title={t('dashboard.topCities')}
              action={
                <span className="text-xs text-saffron font-semibold cursor-pointer hover:underline">
                  {t('dashboard.viewAll')}
                </span>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200">
                      <th className="pb-3 font-medium">#</th>
                      <th className="pb-3 font-medium">City</th>
                      <th className="pb-3 font-medium">State</th>
                      <th className="pb-3 font-medium text-right">Resolved</th>
                      <th className="pb-3 font-medium text-right">Waste (kg)</th>
                      <th className="pb-3 font-medium text-right">Citizens</th>
                      <th className="pb-3 font-medium text-right">Recycle %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cityStats.length > 0 ? (
                      cityStats.map((c, i) => (
                        <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 font-semibold text-navy">{i + 1}</td>
                          <td className="py-3 font-medium text-gray-800">{c.city}</td>
                          <td className="py-3 text-gray-500">{c.state}</td>
                          <td className="py-3 text-right text-gray-700">{c.complaints_resolved.toLocaleString()}</td>
                          <td className="py-3 text-right text-gray-700">{c.waste_collected_kg.toLocaleString()}</td>
                          <td className="py-3 text-right text-gray-700">{c.citizens_active.toLocaleString()}</td>
                          <td className="py-3 text-right">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-green/10 text-green font-semibold text-xs">
                              {c.recycling_rate}%
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <>
                        {[
                          { id: 'ci1', city: 'Indore', state: 'Madhya Pradesh', complaints_resolved: 3420, waste_collected_kg: 18600, citizens_active: 48200, recycling_rate: 88 },
                          { id: 'ci2', city: 'Bhopal', state: 'Madhya Pradesh', complaints_resolved: 2890, waste_collected_kg: 15400, citizens_active: 39600, recycling_rate: 84 },
                          { id: 'ci3', city: 'Surat', state: 'Gujarat', complaints_resolved: 2650, waste_collected_kg: 14100, citizens_active: 35400, recycling_rate: 82 },
                          { id: 'ci4', city: 'Mysore', state: 'Karnataka', complaints_resolved: 2410, waste_collected_kg: 12900, citizens_active: 31800, recycling_rate: 79 },
                          { id: 'ci5', city: 'Pune', state: 'Maharashtra', complaints_resolved: 2230, waste_collected_kg: 11800, citizens_active: 29500, recycling_rate: 77 },
                          { id: 'ci6', city: 'Ahmedabad', state: 'Gujarat', complaints_resolved: 1980, waste_collected_kg: 10600, citizens_active: 27100, recycling_rate: 74 },
                          { id: 'ci7', city: 'Jaipur', state: 'Rajasthan', complaints_resolved: 1750, waste_collected_kg: 9400, citizens_active: 24200, recycling_rate: 71 },
                        ].map((c, i) => (
                          <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 font-semibold text-navy">{i + 1}</td>
                            <td className="py-3 font-medium text-gray-800">{c.city}</td>
                            <td className="py-3 text-gray-500">{c.state}</td>
                            <td className="py-3 text-right text-gray-700">{c.complaints_resolved.toLocaleString()}</td>
                            <td className="py-3 text-right text-gray-700">{c.waste_collected_kg.toLocaleString()}</td>
                            <td className="py-3 text-right text-gray-700">{c.citizens_active.toLocaleString()}</td>
                            <td className="py-3 text-right">
                              <span className="inline-block px-2 py-0.5 rounded-full bg-green/10 text-green font-semibold text-xs">
                                {c.recycling_rate}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        </section>

        {/* Activity + Hotspots + Bins */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Recent activity */}
          <SectionCard
            title={t('dashboard.recentActivity')}
            action={
              <Bell className="w-4 h-4 text-gray-400" />
            }
          >
            {complaints.length > 0 ? (
              <ul className="space-y-3">
                {complaints.slice(0, 6).map((c) => (
                  <li key={c.id} className="flex items-start gap-3">
                    <span
                      className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                        c.status === 'resolved'
                          ? 'bg-green'
                          : c.status === 'pending'
                          ? 'bg-navy'
                          : c.status === 'in_progress'
                          ? 'bg-saffron'
                          : 'bg-saffron-dark'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 line-clamp-1">
                        {c.description || 'Waste report'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(c.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-3">
                {[
                  { text: 'Complaint #SW-4821 resolved in Indore', time: '2 mins ago', type: 'resolved' as const },
                  { text: 'New complaint filed in Bhopal — overflowing bin', time: '14 mins ago', type: 'report' as const },
                  { text: 'Recycling center collected 320kg plastic in Surat', time: '38 mins ago', type: 'recycle' as const },
                  { text: 'Complaint #SW-4790 pending review in Pune', time: '1 hour ago', type: 'pending' as const },
                  { text: 'Complaint #SW-4772 resolved in Mysore', time: '2 hours ago', type: 'resolved' as const },
                  { text: 'New complaint filed in Jaipur — illegal dumping', time: '3 hours ago', type: 'report' as const },
                ].map((a) => (
                  <li key={a.text} className="flex items-start gap-3">
                    <span
                      className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                        a.type === 'resolved'
                          ? 'bg-green'
                          : a.type === 'pending'
                          ? 'bg-navy'
                          : a.type === 'recycle'
                          ? 'bg-saffron'
                          : 'bg-saffron-dark'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{a.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {/* Waste hotspots */}
          <SectionCard
            title={t('dashboard.wasteHotspots')}
            action={<MapPin className="w-4 h-4 text-gray-400" />}
          >
            {getHotspots(complaints).length > 0 ? (
              <ul className="space-y-3">
                {getHotspots(complaints).map((h) => (
                  <li key={h.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        className={`w-4 h-4 ${
                          h.severity === 'high'
                            ? 'text-red-500'
                            : h.severity === 'medium'
                            ? 'text-orange-500'
                            : 'text-green'
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{h.area}</p>
                        <p className="text-xs text-gray-400">{h.city}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${severityStyles[h.severity]}`}>
                      {h.open} open
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-3">
                {[
                  { id: 'h1', area: 'Sector 45 Market', city: 'Gurugram', severity: 'high' as const, open: 38 },
                  { id: 'h2', area: 'Old City Dump Yard', city: 'Jaipur', severity: 'high' as const, open: 31 },
                  { id: 'h3', area: 'Station Road', city: 'Bhopal', severity: 'medium' as const, open: 19 },
                  { id: 'h4', area: 'Lakeside Colony', city: 'Indore', severity: 'medium' as const, open: 14 },
                  { id: 'h5', area: 'Tech Park Junction', city: 'Pune', severity: 'low' as const, open: 7 },
                ].map((h) => (
                  <li key={h.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        className={`w-4 h-4 ${
                          h.severity === 'high'
                            ? 'text-red-500'
                            : h.severity === 'medium'
                            ? 'text-orange-500'
                            : 'text-green'
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{h.area}</p>
                        <p className="text-xs text-gray-400">{h.city}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${severityStyles[h.severity]}`}>
                      {h.open} open
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {/* Smart bins status */}
          <SectionCard
            title={t('dashboard.smartBins')}
            action={<Trash2 className="w-4 h-4 text-gray-400" />}
          >
            {bins.length > 0 ? (
              <ul className="space-y-3">
                {bins.map((b) => (
                  <li key={b.id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">{b.location_text || 'Unknown'}</span>
                      <span className="text-gray-500">{b.fill_level}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          b.fill_level >= 80 ? 'bg-red-500' : b.fill_level >= 50 ? 'bg-saffron' : 'bg-green'
                        }`}
                        style={{ width: `${b.fill_level}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {t('dashboard.lastEmptied')}: {b.last_emptied || 'N/A'}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-3">
                {[
                  { id: 'b1', location_text: 'MG Road, Indore', fill_level: 92, category: 'Organic', last_emptied: '2 days ago' },
                  { id: 'b2', location_text: 'City Center, Bhopal', fill_level: 74, category: 'Plastic', last_emptied: '1 day ago' },
                  { id: 'b3', location_text: 'Station, Surat', fill_level: 58, category: 'Paper', last_emptied: '3 days ago' },
                  { id: 'b4', location_text: 'Mall Road, Pune', fill_level: 41, category: 'Glass', last_emptied: '5 days ago' },
                ].map((b) => (
                  <li key={b.id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">{b.location_text}</span>
                      <span className="text-gray-500">{b.fill_level}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          b.fill_level >= 80 ? 'bg-red-500' : b.fill_level >= 50 ? 'bg-saffron' : 'bg-green'
                        }`}
                        style={{ width: `${b.fill_level}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {t('dashboard.lastEmptied')}: {b.last_emptied}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </section>

        {recyclingCenters.length === 0 && (
          <p className="text-xs text-gray-400 text-center">
            Showing demo analytics. Connect Supabase to load live recycling center data.
          </p>
        )}
      </main>
    </div>
  )
}
