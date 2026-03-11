export type UserRole = 'citizen' | 'officer' | 'admin'

export type ComplaintStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected'

export type ComplaintCategory = 
  | 'road_maintenance'
  | 'water_supply'
  | 'electricity'
  | 'sanitation'
  | 'public_safety'
  | 'noise_pollution'
  | 'illegal_construction'
  | 'other'

export interface Profile {
  id: string
  full_name: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Complaint {
  id: string
  tracking_id: string
  citizen_id: string
  category: ComplaintCategory
  title: string
  description: string
  location_text: string
  location_lat: number | null
  location_lng: number | null
  image_url: string | null
  status: ComplaintStatus
  assigned_officer_id: string | null
  resolution_notes: string | null
  resolution_image_url: string | null
  created_at: string
  updated_at: string
  // Joined fields
  citizen?: Profile
  assigned_officer?: Profile
}

export interface ComplaintHistory {
  id: string
  complaint_id: string
  changed_by: string | null
  old_status: ComplaintStatus | null
  new_status: ComplaintStatus
  notes: string | null
  created_at: string
  // Joined fields
  changed_by_profile?: Profile
}

export const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  road_maintenance: 'Road Maintenance',
  water_supply: 'Water Supply',
  electricity: 'Electricity',
  sanitation: 'Sanitation',
  public_safety: 'Public Safety',
  noise_pollution: 'Noise Pollution',
  illegal_construction: 'Illegal Construction',
  other: 'Other',
}

export const STATUS_LABELS: Record<ComplaintStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
}

export const STATUS_COLORS: Record<ComplaintStatus, string> = {
  pending: 'bg-warning text-warning-foreground',
  in_progress: 'bg-primary text-primary-foreground',
  resolved: 'bg-success text-success-foreground',
  rejected: 'bg-destructive text-destructive-foreground',
}
