'use client'

import { useLanguage } from '@/lib/i18n'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, Trash2, Users, Recycle } from 'lucide-react'
import { useState, useEffect, useMemo, useCallback } from 'react'

const weeklyData = [
  { day: 'Mon', complaints: 45, resolved: 38, waste: 120 },
  { day: 'Tue', complaints: 52, resolved: 41, waste: 135 },
  { day: 'Wed', complaints: 38, resolved: 35, waste: 98 },
  { day: 'Thu', complaints: 65, resolved: 50, waste: 155 },
  { day: 'Fri', complaints: 48, resolved: 42, waste: 110 },
  { day: 'Sat', complaints: 72, resolved: 60, waste: 180 },
  { day: 'Sun', complaints: 55, resolved: 48, waste: 140 },
]

const categoryData = [
  { name: 'Plastic', value: 35, color: '#3b82f6' },
  { name: 'Organic', value: 40, color: '#22c55e' },
  { name: 'Paper', value: 12, color: '#f59e0b' },
  { name: 'Metal', value: 8, color: '#6366f1' },
  { name: 'Glass', value: 3, color: '#06b6d4' },
  { name: 'E-Waste', value: 2, color: '#ef4444' },
]

const cityData = [
  { name: 'Mumbai', resolved: 72, unresolved: 18 },
  { name: 'Bangalore', resolved: 68, unresolved: 22 },
  { name: 'Delhi', resolved: 65, unresolved: 25 },
  { name: 'Hyderabad', resolved: 63, unresolved: 27 },
  { name: 'Chennai', resolved: 61, unresolved: 29 },
  { name: 'Pune', resolved: 58, unresolved: 24 },
  { name: 'Kolkata', resolved: 55, unresolved: 35 },
  { name: 'Ahmedabad', resolved: 52, unresolved: 31 },
  { name: 'Jaipur', resolved: 49, unresolved: 28 },
  { name: 'Lucknow', resolved: 45, unresolved: 33 },
]

const topCities = [...cityData].sort((a, b) => b.resolved - a.resolved).slice(0, 5)
const bottomCities = [...cityData].sort((a, b) => a.resolved - b.resolved).slice(0, 5)

export default function AnalyticsPage() {
  const { t } = useLanguage()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [aqiData, setAqiData] = useState<{ time: string; aqi: number }[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [isLive, setIsLive] = useState(false)

  const fetchAqiData = useCallback(async () => {
    try {
      const waqiToken = process.env.NEXT_PUBLIC_WAQI_TOKEN || 'demo'
      const res = await fetch(`https://api.waqi.info/feed/delhi/?token=${waqiToken}`)
      const json = await res.json()
      
      if (json.status === 'ok' && json.data?.forecast?.daily?.pm25) {
        const today = new Date().toISOString().split('T')[0]
        const dailyForecast = json.data.forecast.daily.pm25.find((d: any) => d.day === today)
        
        if (dailyForecast && dailyForecast.hourly) {
          const data: { time: string; aqi: number }[] = []
          const currentHour = new Date().getHours()
          
          dailyForecast.hourly.forEach((hourData: any, index: number) => {
            if (index <= currentHour) {
              const hour = (index + 6).toString().padStart(2, '0')
              const aqiValue = Math.round(hourData.avg || hourData.v || 50)
              data.push({
                time: `${hour}:00`,
                aqi: Math.max(20, Math.min(300, aqiValue))
              })
            }
          })
          
          if (data.length > 0) {
            setAqiData(data)
            setLastUpdated(new Date().toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }))
            setIsLive(true)
            return
          }
        }
      }
      
      generateMockData()
    } catch (error) {
      generateMockData()
    }
  }, [])

  const generateMockData = useCallback(() => {
    const currentHour = new Date().getHours()
    const data: { time: string; aqi: number }[] = []
    
    for (let hour = 6; hour <= Math.min(currentHour, 23); hour++) {
      const label = `${hour.toString().padStart(2, '0')}:00`
      let aqi = 60 + Math.sin((hour - 6) / 17 * Math.PI) * 60 + Math.random() * 20
      if (hour >= 8 && hour <= 11) aqi += 30
      if (hour >= 17 && hour <= 20) aqi += 25
      aqi = Math.round(Math.min(300, Math.max(20, aqi)))
      data.push({ time: label, aqi })
    }
    
    setAqiData(data)
    setLastUpdated(new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }))
    setIsLive(false)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetchAqiData()
    const interval = setInterval(fetchAqiData, 300000)
    return () => clearInterval(interval)
  }, [fetchAqiData])

  const totalComplaints = weeklyData.reduce((sum, day) => sum + day.complaints, 0)
  const totalResolved = weeklyData.reduce((sum, day) => sum + day.resolved, 0)
  const totalWaste = weeklyData.reduce((sum, day) => sum + day.waste, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">{t('nav.analytics')}</h1>
        <p className="text-gray-600">City-level performance analytics and waste management insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Complaints</p>
              <p className="text-3xl font-bold text-navy mt-1">{totalComplaints}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-green mt-2">+12% from last week</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Resolved</p>
              <p className="text-3xl font-bold text-navy mt-1">{totalResolved}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-green mt-2">87% resolution rate</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Waste Collected</p>
              <p className="text-3xl font-bold text-navy mt-1">{totalWaste} kg</p>
            </div>
            <div className="w-12 h-12 bg-saffron/10 rounded-lg flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-saffron" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Daily average: 145kg</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Recycling Rate</p>
              <p className="text-3xl font-bold text-navy mt-1">68%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Recycle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-green mt-2">+5% improvement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-navy mb-4">Weekly Complaints Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line type="monotone" dataKey="complaints" stroke="#FF9933" strokeWidth={2} name="Complaints" />
              <Line type="monotone" dataKey="resolved" stroke="#138808" strokeWidth={2} name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-navy mb-4">Waste Collection by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-navy mb-4">Resolved vs Unresolved by City</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-green mb-2">Top 5 Performing Cities</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topCities} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="resolved" fill="#138808" name="Resolved" />
                  <Bar dataKey="unresolved" fill="#FF9933" name="Unresolved" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-600 mb-2">Top 5 Low Performing Cities</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={bottomCities} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="resolved" fill="#ef4444" name="Resolved" />
                  <Bar dataKey="unresolved" fill="#f97316" name="Unresolved" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-navy">Air Quality Index</h2>
            <div className="text-right">
              <p className="text-xs text-gray-500">
                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-xs text-gray-400">
                {lastUpdated ? `Updated: ${lastUpdated}` : 'Loading...'}
              </p>
            </div>
          </div>
          {isLive && (
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs text-green-600 font-medium">Live Data</span>
            </div>
          )}
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={aqiData} margin={{ bottom: 50, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
                interval={0}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                domain={[0, 160]} 
                ticks={[0, 20, 40, 60, 80, 100, 120, 140, 160]}
                label={{ value: 'AQI', angle: -90, position: 'outside', dx: -10, dy: 0 }}
              />
              <Tooltip formatter={(value) => [`AQI ${value}`, 'Air Quality Index']} />
              <Line type="monotone" dataKey="aqi" stroke="#FF9933" strokeWidth={2} name="AQI" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
