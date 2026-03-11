'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FileText, MapPin, Calendar, Search, User, UserPlus, Loader2 } from 'lucide-react'
import { CATEGORY_LABELS, STATUS_LABELS, type Complaint, type ComplaintStatus } from '@/lib/types'

interface AdminComplaintsListProps {
  complaints: Array<Complaint & {
    citizen?: { id: string; full_name: string } | null
    assigned_officer?: { id: string; full_name: string } | null
  }>
  officers: Array<{ id: string; full_name: string | null }>
}

export function AdminComplaintsList({ complaints, officers }: AdminComplaintsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [assignmentFilter, setAssignmentFilter] = useState<string>('all')

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch = 
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.tracking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.location_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.citizen?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter
    
    const matchesAssignment = 
      assignmentFilter === 'all' ||
      (assignmentFilter === 'unassigned' && !complaint.assigned_officer_id) ||
      (assignmentFilter === 'assigned' && complaint.assigned_officer_id)

    return matchesSearch && matchesStatus && matchesAssignment
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, tracking ID, location, or citizen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Assignment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filteredComplaints.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              {complaints.length === 0 
                ? 'No complaints submitted yet' 
                : 'No complaints match your filters'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((complaint) => (
            <Card key={complaint.id} className="transition-colors hover:bg-muted/30">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {complaint.tracking_id}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {CATEGORY_LABELS[complaint.category]}
                      </Badge>
                      <StatusBadge status={complaint.status} />
                    </div>
                    <Link href={`/dashboard/admin/complaints/${complaint.id}`}>
                      <h3 className="font-semibold text-foreground hover:text-primary">
                        {complaint.title}
                      </h3>
                    </Link>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {complaint.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      {complaint.citizen && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {complaint.citizen.full_name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {complaint.location_text}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-start gap-2 lg:items-end">
                    {complaint.assigned_officer ? (
                      <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        Assigned to: {complaint.assigned_officer.full_name}
                      </div>
                    ) : (
                      <AssignOfficerDialog 
                        complaintId={complaint.id} 
                        officers={officers} 
                      />
                    )}
                    <Link href={`/dashboard/admin/complaints/${complaint.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
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

function AssignOfficerDialog({ 
  complaintId, 
  officers 
}: { 
  complaintId: string
  officers: Array<{ id: string; full_name: string | null }>
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedOfficer, setSelectedOfficer] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)

  const handleAssign = async () => {
    if (!selectedOfficer) return
    
    setIsAssigning(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('complaints')
        .update({ 
          assigned_officer_id: selectedOfficer,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', complaintId)

      if (error) throw error

      // Get current user for history entry
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        await supabase.from('complaint_history').insert({
          complaint_id: complaintId,
          changed_by: user.id,
          old_status: 'pending',
          new_status: 'in_progress',
          notes: 'Complaint assigned to officer',
        })
      }

      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to assign officer:', error)
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <UserPlus className="mr-2 h-4 w-4" />
          Assign Officer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Officer</DialogTitle>
          <DialogDescription>
            Select an officer to handle this complaint
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {officers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No officers available. Officers need to register with the Officer role.
            </p>
          ) : (
            <>
              <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an officer" />
                </SelectTrigger>
                <SelectContent>
                  {officers.map((officer) => (
                    <SelectItem key={officer.id} value={officer.id}>
                      {officer.full_name || 'Unnamed Officer'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssign} 
                  disabled={!selectedOfficer || isAssigning}
                >
                  {isAssigning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    'Assign'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
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
