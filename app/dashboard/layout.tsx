import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard/nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const role = (user.user_metadata?.role as string) || 'citizen'
  const fullName = (user.user_metadata?.full_name as string) || user.email || 'User'

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardNav 
        userEmail={user.email || ''} 
        userName={fullName}
        userRole={role} 
      />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
