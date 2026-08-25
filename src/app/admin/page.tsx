'use client'

import { useLanguage } from '@/lib/i18n'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart3, Users, Trash2, Settings, Shield, Bell } from 'lucide-react'
import { Complaint, Profile } from '@/lib/types'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [complaints, setComplaints] = useState<(Complaint & { profiles?: Profile })[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const supabase = createClient()

  const adminStats = [
    { title: 'Total Users', value: '45,230', change: '+12%', icon: Users, color: 'blue' },
    { title: 'Active Complaints', value: '1,245', change: '-5%', icon: Trash2, color: 'saffron' },
    { title: 'Recycling Centers', value: '156', change: '+8%', icon: Settings, color: 'green' },
    { title: 'Smart Bins', value: '2,340', change: '+15%', icon: BarChart3, color: 'navy' },
  ]

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.role === 'admin' || profile?.role === 'municipality') {
        setIsAdmin(true)
      } else {
        router.push('/')
      }
      setCheckingAuth(false)
    }

    checkAuth()
  }, [router, supabase])

  useEffect(() => {
    if (!isAdmin) return

    async function loadComplaints() {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          profiles (
            id,
            full_name,
            email,
            phone,
            city,
            state,
            role,
            user_id
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (data && !error) {
        setComplaints(data as any)
      }
      setLoading(false)
    }

    loadComplaints()
  }, [isAdmin, supabase])

  const handleStatusChange = async (complaintId: string, newStatus: string) => {
    setUpdatingId(complaintId)
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ status: newStatus })
        .eq('id', complaintId)

      if (error) throw error

      setComplaints((prev) =>
        prev.map((c) => (c.id === complaintId ? { ...c, status: newStatus as any } : c))
      )
    } catch (error) {
      console.error('Failed to update complaint status:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  if (checkingAuth) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Checking permissions...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Municipal waste management control center</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {adminStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-navy mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
              </div>
              <p className="text-sm text-green mt-2">{stat.change} from last month</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-navy mb-4">Recent Complaints</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Tracking ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-sm text-gray-500">Loading complaints...</td>
                  </tr>
                ) : complaints.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-sm text-gray-500">No complaints found.</td>
                  </tr>
                ) : (
                  complaints.map((complaint) => {
                    const profile = complaint.profiles as Profile | undefined
                    const userName = profile?.full_name || profile?.email || 'Unknown User'
                    const userLocation = [profile?.city, profile?.state].filter(Boolean).join(', ') || 'N/A'
                    const dateStr = complaint.created_at ? new Date(complaint.created_at).toLocaleDateString() : 'N/A'

                    return (
                  <tr key={complaint.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-navy">{complaint.id.slice(0, 8).toUpperCase()}</td>
                    <td className="py-3 px-4 text-sm font-medium text-saffron">{complaint.tracking_id || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                          <div className="flex flex-col">
                            <span className="font-medium text-navy">{userName}</span>
                            <span className="text-xs text-gray-500">{userLocation}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{complaint.location_text || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 capitalize">{complaint.ai_category || complaint.category_id || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <select
                            value={complaint.status}
                            onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                            disabled={updatingId === complaint.id}
                            className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer disabled:opacity-50 ${
                              complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              complaint.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{dateStr}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-navy mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-saffron hover:bg-saffron/5 transition-colors text-left">
              <Shield className="w-5 h-5 text-saffron" />
              <div>
                <p className="text-sm font-medium text-navy">Verify Reports</p>
                <p className="text-xs text-gray-500">12 pending verification</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-saffron hover:bg-saffron/5 transition-colors text-left">
              <Bell className="w-5 h-5 text-saffron" />
              <div>
                <p className="text-sm font-medium text-navy">Send Notifications</p>
                <p className="text-xs text-gray-500">Broadcast to citizens</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-saffron hover:bg-saffron/5 transition-colors text-left">
              <Settings className="w-5 h-5 text-saffron" />
              <div>
                <p className="text-sm font-medium text-navy">Manage Routes</p>
                <p className="text-xs text-gray-500">Optimize collection routes</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
