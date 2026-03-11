'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

interface LocationPickerProps {
  value: { lat: number; lng: number } | null
  onChange: (location: { lat: number; lng: number } | null) => void
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isLocating, setIsLocating] = useState(false)

  // Default center (India)
  const defaultCenter: [number, number] = [20.5937, 78.9629]

  const updateMarker = useCallback((lat: number, lng: number) => {
    if (!mapRef.current) return
    
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
    } else {
      // Dynamic import of L to avoid SSR issues
      import('leaflet').then((L) => {
        const icon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })
        markerRef.current = L.marker([lat, lng], { icon }).addTo(mapRef.current!)
      })
    }
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !mapContainerRef.current || mapRef.current) return

    // Dynamic import of leaflet
    import('leaflet').then((L) => {
      if (!mapContainerRef.current || mapRef.current) return

      const center = value ? [value.lat, value.lng] : defaultCenter
      const zoom = value ? 15 : 5

      const map = L.map(mapContainerRef.current, {
        center: center as [number, number],
        zoom,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      // Add click handler
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng
        onChange({ lat, lng })
        updateMarker(lat, lng)
        map.setView([lat, lng], Math.max(map.getZoom(), 13))
      })

      // Location handlers
      map.on('locationfound', (e: L.LocationEvent) => {
        setIsLocating(false)
        const { lat, lng } = e.latlng
        onChange({ lat, lng })
        updateMarker(lat, lng)
      })

      map.on('locationerror', () => {
        setIsLocating(false)
      })

      mapRef.current = map

      // Add initial marker if value exists
      if (value) {
        updateMarker(value.lat, value.lng)
      }
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
  }, [mounted]) // Only run once when mounted

  // Update marker when value changes externally
  useEffect(() => {
    if (value && mapRef.current) {
      updateMarker(value.lat, value.lng)
      mapRef.current.setView([value.lat, value.lng], Math.max(mapRef.current.getZoom(), 13))
    }
  }, [value, updateMarker])

  const handleLocate = useCallback(() => {
    if (mapRef.current) {
      setIsLocating(true)
      mapRef.current.locate({ setView: true, maxZoom: 16 })
    }
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-lg border border-border bg-muted">
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    )
  }

  return (
    <div className="relative h-[300px] w-full overflow-hidden rounded-lg border border-border">
      <div ref={mapContainerRef} className="h-full w-full" style={{ zIndex: 0 }} />
      <p className="absolute left-2 top-2 z-[1000] rounded bg-card/90 px-2 py-1 text-xs text-muted-foreground">
        Click on the map to set location
      </p>
      <button
        type="button"
        onClick={handleLocate}
        disabled={isLocating}
        className="absolute bottom-4 right-4 z-[1000] rounded-md bg-card px-3 py-2 text-sm font-medium text-foreground shadow-md transition-colors hover:bg-muted disabled:opacity-50"
      >
        {isLocating ? 'Locating...' : 'Use My Location'}
      </button>
    </div>
  )
}
