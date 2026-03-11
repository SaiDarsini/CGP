import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CitizenDashboard } from '@/components/dashboard/citizen-dashboard'
import { OfficerDashboard } from '@/components/dashboard/officer-dashboard'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const role = (user.user_metadata?.role as string) || 'citizen'

  // Fetch dashboard stats based on role
  if (role === 'citizen') {
    const { data: complaints } = await supabase
      .from('complaints')
      .select('id, status, created_at')
      .eq('citizen_id', user.id)
      .order('created_at', { ascending: false })

    const stats = {
      total: complaints?.length || 0,
      pending: complaints?.filter(c => c.status === 'pending').length || 0,
      inProgress: complaints?.filter(c => c.status === 'in_progress').length || 0,
      resolved: complaints?.filter(c => c.status === 'resolved').length || 0,
    }

    return <CitizenDashboard stats={stats} recentComplaints={complaints?.slice(0, 5) || []} />
  }

  if (role === 'officer') {
    const { data: assigned } = await supabase
      .from('complaints')
      .select('id, status, created_at, title, tracking_id')
      .eq('assigned_officer_id', user.id)
      .order('created_at', { ascending: false })

    const stats = {
      total: assigned?.length || 0,
      pending: assigned?.filter(c => c.status === 'pending').length || 0,
      inProgress: assigned?.filter(c => c.status === 'in_progress').length || 0,
      resolved: assigned?.filter(c => c.status === 'resolved').length || 0,
    }

    return <OfficerDashboard stats={stats} recentAssigned={assigned?.slice(0, 5) || []} />
  }

  if (role === 'admin') {
    const { data: allComplaints } = await supabase
      .from('complaints')
      .select('id, status, created_at')
      .order('created_at', { ascending: false })

    const { data: officers } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'officer')

    const stats = {
      total: allComplaints?.length || 0,
      pending: allComplaints?.filter(c => c.status === 'pending').length || 0,
      inProgress: allComplaints?.filter(c => c.status === 'in_progress').length || 0,
      resolved: allComplaints?.filter(c => c.status === 'resolved').length || 0,
      officers: officers?.length || 0,
    }

    return <AdminDashboard stats={stats} />
  }

  // Default to citizen dashboard
  return <CitizenDashboard stats={{ total: 0, pending: 0, inProgress: 0, resolved: 0 }} recentComplaints={[]} />
}
