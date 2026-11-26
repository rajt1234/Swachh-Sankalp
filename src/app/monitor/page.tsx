import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MonitorDashboard from './MonitorDashboard'

export default async function MonitorPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || !['municipality', 'recycler'].includes(profile.role)) {
    redirect('/profile')
  }

  return <MonitorDashboard userRole={profile.role} />
}