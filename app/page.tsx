import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, FileText, Search, Clock, CheckCircle, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold text-foreground">Citizen Grievance Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/track">
              <Button variant="outline" size="sm">
                <Search className="mr-2 h-4 w-4" />
                Track Complaint
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Your Voice Matters
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
            Submit your grievances, track their progress, and help us build a better community. 
            Our transparent system ensures your concerns are heard and addressed efficiently.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/auth/sign-up">
              <Button size="lg" className="w-full sm:w-auto">
                <FileText className="mr-2 h-5 w-5" />
                Submit a Complaint
              </Button>
            </Link>
            <Link href="/track">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Search className="mr-2 h-5 w-5" />
                Track Your Complaint
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
            How It Works
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-muted-foreground">
            A simple, transparent process to address your concerns
          </p>
          
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4">1. Submit</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  File your complaint with details, location, and supporting images
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4">2. Assign</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Your complaint is reviewed and assigned to the appropriate officer
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4">3. Process</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Track real-time updates as your complaint is being processed
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <CheckCircle className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="mt-4">4. Resolve</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get notified when your complaint is resolved with resolution details
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Ready to Make a Difference?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Join thousands of citizens who have successfully resolved their grievances through our portal.
          </p>
          <div className="mt-6">
            <Link href="/auth/sign-up">
              <Button size="lg">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center text-sm text-muted-foreground">
          <p>Citizen Grievance Portal - Empowering Citizens, Building Communities</p>
          <p className="mt-1">For support, contact: support@grievanceportal.gov</p>
        </div>
      </footer>
    </div>
  )
}
