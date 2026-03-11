'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle,
  AlertCircle,
  FileText,
  Image as ImageIcon
} from 'lucide-react'
import { CATEGORY_LABELS, STATUS_LABELS, type Complaint, type ComplaintHistory, type ComplaintStatus } from '@/lib/types'
import dynamic from 'next/dynamic'

const LocationMap = dynamic(() => import('./location-map'), { 
  ssr: false,
  loading: () => (
    <div className="flex h-[200px] items-center justify-center rounded-lg border border-border bg-muted">
      <p className="text-sm text-muted-foreground">Loading map...</p>
    </div>
  )
})

interface ComplaintDetailProps {
  complaint: Complaint & {
    assigned_officer?: { id: string; full_name: string } | null
  }
  history: Array<ComplaintHistory & {
    changed_by_profile?: { id: string; full_name: string; role: string } | null
  }>
  userRole: string
  userId: string
}

export function ComplaintDetail({ complaint, history, userRole, userId }: ComplaintDetailProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link 
            href="/dashboard/complaints" 
            className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Complaints
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{complaint.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{complaint.tracking_id}</Badge>
            <Badge variant="secondary">{CATEGORY_LABELS[complaint.category]}</Badge>
            <StatusBadge status={complaint.status} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {complaint.description}
              </p>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                <MapPin className="mr-2 inline h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{complaint.location_text}</p>
              {complaint.location_lat && complaint.location_lng && (
                <LocationMap 
                  lat={complaint.location_lat} 
                  lng={complaint.location_lng} 
                />
              )}
            </CardContent>
          </Card>

          {/* Image */}
          {complaint.image_url && !imageError && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  <ImageIcon className="mr-2 inline h-5 w-5" />
                  Supporting Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={`/api/file?pathname=${encodeURIComponent(complaint.image_url)}`}
                  alt="Complaint evidence"
                  className="w-full rounded-lg border border-border object-cover"
                  onError={() => setImageError(true)}
                />
              </CardContent>
            </Card>
          )}

          {/* Resolution */}
          {complaint.status === 'resolved' && complaint.resolution_notes && (
            <Card className="border-accent/50 bg-accent/5">
              <CardHeader>
                <CardTitle className="text-lg text-accent">
                  <CheckCircle className="mr-2 inline h-5 w-5" />
                  Resolution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {complaint.resolution_notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="text-sm font-medium">
                    {new Date(complaint.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-medium">
                    {new Date(complaint.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {complaint.assigned_officer && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Assigned Officer</p>
                      <p className="text-sm font-medium">
                        {complaint.assigned_officer.full_name}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
              <CardDescription>Status history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.map((entry, index) => (
                  <div key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        index === history.length - 1 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {getStatusIcon(entry.new_status)}
                      </div>
                      {index < history.length - 1 && (
                        <div className="my-1 h-full w-px bg-border" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium">
                        {STATUS_LABELS[entry.new_status]}
                      </p>
                      {entry.notes && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {entry.notes}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleString()}
                        {entry.changed_by_profile && (
                          <span> by {entry.changed_by_profile.full_name}</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: ComplaintStatus }) {
  const colorClasses: Record<ComplaintStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colorClasses[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

function getStatusIcon(status: ComplaintStatus) {
  switch (status) {
    case 'pending':
      return <AlertCircle className="h-4 w-4" />
    case 'in_progress':
      return <Clock className="h-4 w-4" />
    case 'resolved':
      return <CheckCircle className="h-4 w-4" />
    case 'rejected':
      return <FileText className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}
