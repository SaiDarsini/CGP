import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NewComplaintForm } from '@/components/complaints/new-complaint-form'

export default async function NewComplaintPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const role = user.user_metadata?.role || 'citizen'
  
  // Only citizens can submit complaints
  if (role !== 'citizen') {
    redirect('/dashboard')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Submit New Complaint</h1>
        <p className="text-muted-foreground">
          Provide details about your grievance and we will work to resolve it
        </p>
      </div>
      <NewComplaintForm userId={user.id} />
    </div>
  )
}
