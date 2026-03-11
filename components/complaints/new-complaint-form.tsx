'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { CATEGORY_LABELS, type ComplaintCategory } from '@/lib/types'
import { MapPin, Upload, X, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

const LocationPicker = dynamic(() => import('./location-picker'), { 
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center rounded-lg border border-border bg-muted">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )
})

interface NewComplaintFormProps {
  userId: string
}

export function NewComplaintForm({ userId }: NewComplaintFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

  const [formData, setFormData] = useState({
    category: '' as ComplaintCategory | '',
    title: '',
    description: '',
    locationText: '',
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB')
        return
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()

      // Upload image if provided
      let imagePathname: string | null = null
      if (imageFile) {
        const formDataUpload = new FormData()
        formDataUpload.append('file', imageFile)
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        })

        if (!uploadRes.ok) {
          const uploadError = await uploadRes.json()
          throw new Error(uploadError.error || 'Failed to upload image')
        }

        const { pathname } = await uploadRes.json()
        imagePathname = pathname
      }

      // Generate tracking ID
      const trackingId = `GRV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

      // Insert complaint
      const { error: insertError } = await supabase
        .from('complaints')
        .insert({
          tracking_id: trackingId,
          citizen_id: userId,
          category: formData.category,
          title: formData.title,
          description: formData.description,
          location_text: formData.locationText,
          location_lat: location?.lat || null,
          location_lng: location?.lng || null,
          image_url: imagePathname,
          status: 'pending',
        })

      if (insertError) throw insertError

      router.push('/dashboard/complaints')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit complaint')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as ComplaintCategory })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief summary of your complaint"
                required
                maxLength={200}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide detailed information about your grievance..."
                rows={5}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="locationText">
                <MapPin className="mr-1 inline h-4 w-4" />
                Location Address *
              </Label>
              <Input
                id="locationText"
                value={formData.locationText}
                onChange={(e) => setFormData({ ...formData, locationText: e.target.value })}
                placeholder="Enter the address or area where the issue is located"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Pin Location on Map (Optional)</Label>
              <LocationPicker
                value={location}
                onChange={setLocation}
              />
              {location && (
                <p className="text-xs text-muted-foreground">
                  Selected: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-2">
            <Label>
              <Upload className="mr-1 inline h-4 w-4" />
              Supporting Image (Optional)
            </Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-48 w-full rounded-lg border border-border object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-8 transition-colors hover:border-primary/50 hover:bg-muted/50">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Click to upload an image</p>
                <p className="text-xs text-muted-foreground">Max size: 5MB</p>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Complaint'
          )}
        </Button>
      </div>
    </form>
  )
}
