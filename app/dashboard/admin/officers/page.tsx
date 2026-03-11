import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, FileText, CheckCircle, Clock } from 'lucide-react'

export default async function OfficersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const role = user.user_metadata?.role || 'citizen'
  if (role !== 'admin') {
    redirect('/dashboard')
  }

  // Get all officers with their complaint counts
  const { data: officers } = await supabase
    .from('profiles')
    .select('id, full_name, created_at')
    .eq('role', 'officer')
    .order('created_at', { ascending: false })

  // Get complaint counts for each officer
  const officerStats = await Promise.all(
    (officers || []).map(async (officer) => {
      const { count: total } = await supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_officer_id', officer.id)

      const { count: resolved } = await supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_officer_id', officer.id)
        .eq('status', 'resolved')

      const { count: inProgress } = await supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_officer_id', officer.id)
        .eq('status', 'in_progress')

      return {
        ...officer,
        total: total || 0,
        resolved: resolved || 0,
        inProgress: inProgress || 0,
      }
    })
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Officers</h1>
        <p className="text-muted-foreground">
          View all registered officers and their workload
        </p>
      </div>

      {officerStats.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              No officers registered yet. Officers need to sign up with the Officer role.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {officerStats.map((officer) => (
            <Card key={officer.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{officer.full_name || 'Unnamed Officer'}</CardTitle>
                    <CardDescription>
                      Joined {new Date(officer.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-muted p-2">
                    <div className="flex items-center justify-center gap-1">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span className="text-lg font-bold">{officer.total}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-2">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3 text-primary" />
                      <span className="text-lg font-bold">{officer.inProgress}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                  <div className="rounded-lg bg-accent/10 p-2">
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle className="h-3 w-3 text-accent" />
                      <span className="text-lg font-bold">{officer.resolved}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Resolved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
