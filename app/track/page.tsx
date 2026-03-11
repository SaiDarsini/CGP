'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Search, Loader2, ArrowLeft, MapPin, Calendar, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react'
import { CATEGORY_LABELS, STATUS_LABELS, type ComplaintStatus } from '@/lib/types'

interface TrackingResult {
  id: string
  tracking_id: string
  category: string
  title: string
  description: string
  location_text: string
  status: ComplaintStatus
  created_at: string
  updated_at: string
  resolution_notes: string | null
}

interface HistoryEntry {
  id: string
  new_status: ComplaintStatus
  notes: string | null
  created_at: string
}

export default function TrackPage() {
  const [trackingId, setTrackingId] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TrackingResult | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!trackingId.trim()) {
      setError('Please enter a tracking ID')
      return
    }

    setIsSearching(true)
    setError(null)
    setResult(null)
    setHistory([])

    try {
      const supabase = createClient()
      
      // Use the public RPC function to track complaint
      const { data, error: searchError } = await supabase
        .rpc('track_complaint_public', { p_tracking_id: trackingId.trim().toUpperCase() })

      if (searchError) throw searchError

      if (!data || data.length === 0) {
        setError('No complaint found with this tracking ID. Please check and try again.')
        return
      }

      const complaint = data[0]
      setResult({
        id: complaint.id,
        tracking_id: complaint.tracking_id,
        category: complaint.category,
        title: complaint.title,
        description: complaint.description,
        location_text: complaint.location_text,
        status: complaint.status,
        created_at: complaint.created_at,
        updated_at: complaint.updated_at,
        resolution_notes: complaint.resolution_notes,
      })

      // Fetch history for this complaint
      const { data: historyData } = await supabase
        .from('complaint_history')
        .select('id, new_status, notes, created_at')
        .eq('complaint_id', complaint.id)
        .order('created_at', { ascending: true })

      setHistory(historyData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching')
    } finally {
      setIsSearching(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setHistory([])
    setTrackingId('')
    setError(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            <span className="text-lg font-semibold text-foreground">Grievance Portal</span>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {!result ? (
          <div className="mx-auto max-w-md">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                Track Your Complaint
              </h1>
              <p className="mt-2 text-muted-foreground">
                Enter your tracking ID to check the status of your complaint
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                      placeholder="Enter Tracking ID (e.g., GRV-XXXXXX)"
                      className="pl-10 text-center font-mono text-lg uppercase"
                    />
                  </div>
                  
                  {error && (
                    <p className="text-center text-sm text-destructive">{error}</p>
                  )}

                  <Button type="submit" className="w-full" disabled={isSearching}>
                    {isSearching ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Track Complaint
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Your tracking ID was provided when you submitted your complaint.
              If you have an account, you can also{' '}
              <Link href="/auth/login" className="text-primary underline">
                sign in
              </Link>{' '}
              to view all your complaints.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <Button variant="ghost" onClick={handleReset} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Track Another Complaint
            </Button>

            {/* Status Card */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Badge variant="outline" className="mb-2 font-mono">
                      {result.tracking_id}
                    </Badge>
                    <CardTitle className="text-xl">{result.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {CATEGORY_LABELS[result.category as keyof typeof CATEGORY_LABELS]}
                    </CardDescription>
                  </div>
                  <StatusBadge status={result.status} large />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="mb-1 text-sm font-medium text-muted-foreground">Description</h3>
                  <p className="text-foreground">{result.description}</p>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {result.location_text}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Submitted: {new Date(result.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Updated: {new Date(result.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Resolution Card */}
            {result.status === 'resolved' && result.resolution_notes && (
              <Card className="border-accent/50 bg-accent/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-accent">
                    <CheckCircle className="h-5 w-5" />
                    Resolution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{result.resolution_notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Status Timeline</CardTitle>
                <CardDescription>Track the progress of your complaint</CardDescription>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No status updates yet.</p>
                ) : (
                  <div className="space-y-4">
                    {history.map((entry, index) => (
                      <div key={entry.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            index === history.length - 1 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {getStatusIcon(entry.new_status)}
                          </div>
                          {index < history.length - 1 && (
                            <div className="my-2 h-full w-px bg-border" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium text-foreground">
                            {STATUS_LABELS[entry.new_status]}
                          </p>
                          {entry.notes && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {entry.notes}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(entry.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-6 mt-auto">
        <div className="mx-auto max-w-4xl text-center text-sm text-muted-foreground">
          <p>Citizen Grievance Portal - Empowering Citizens, Building Communities</p>
        </div>
      </footer>
    </div>
  )
}

function StatusBadge({ status, large = false }: { status: ComplaintStatus; large?: boolean }) {
  const colorClasses: Record<ComplaintStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }

  return (
    <span className={`rounded-full font-medium ${colorClasses[status]} ${large ? 'px-4 py-2 text-sm' : 'px-2 py-0.5 text-xs'}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

function getStatusIcon(status: ComplaintStatus) {
  switch (status) {
    case 'pending':
      return <AlertCircle className="h-5 w-5" />
    case 'in_progress':
      return <Clock className="h-5 w-5" />
    case 'resolved':
      return <CheckCircle className="h-5 w-5" />
    case 'rejected':
      return <FileText className="h-5 w-5" />
    default:
      return <FileText className="h-5 w-5" />
  }
}
