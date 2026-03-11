'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Shield, User, LogOut, LayoutDashboard, FileText, Users, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardNavProps {
  userEmail: string
  userName: string
  userRole: string
}

export function DashboardNav({ userEmail, userName, userRole }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navItems = getNavItems(userRole)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            <span className="hidden text-lg font-semibold text-foreground sm:inline">
              Grievance Portal
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-medium capitalize text-primary sm:inline">
            {userRole}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{userName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">{userName}</span>
                  <span className="text-xs text-muted-foreground">{userEmail}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

function getNavItems(role: string) {
  const baseItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ]

  if (role === 'citizen') {
    return [
      ...baseItems,
      { href: '/dashboard/complaints', label: 'My Complaints', icon: FileText },
      { href: '/dashboard/new', label: 'New Complaint', icon: FileText },
    ]
  }

  if (role === 'officer') {
    return [
      ...baseItems,
      { href: '/dashboard/officer/assigned', label: 'Assigned', icon: FileText },
    ]
  }

  if (role === 'admin') {
    return [
      ...baseItems,
      { href: '/dashboard/admin/complaints', label: 'All Complaints', icon: FileText },
      { href: '/dashboard/admin/officers', label: 'Officers', icon: Users },
    ]
  }

  return baseItems
}
