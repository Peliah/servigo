'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function Home() {
  const { user, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Check authentication status on page load
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Redirect to appropriate dashboard if already authenticated
    if (user) {
      const dashboardPath = user.user_type === 'client' ? '/dashboard/client' :
        user.user_type === 'technician' ? '/dashboard/technician' :
          '/dashboard/admin';
      router.push(dashboardPath);
    }
  }, [user, router]);

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Servigo</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Connect with
            <span className="text-blue-600"> Professional </span>
            Service Providers
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Find trusted technicians for all your home and business needs.
            From electrical work to plumbing, carpentry to general maintenance -
            we connect you with verified professionals in your area.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto">
                Find Services
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Become a Provider
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">For Clients</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Find and book professional services in your area with just a few clicks.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Browse verified technicians</li>
                <li>• Book services online</li>
                <li>• Track service progress</li>
                <li>• Leave reviews and ratings</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">For Technicians</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Grow your business by connecting with clients who need your services.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Create service listings</li>
                <li>• Manage bookings</li>
                <li>• Build your reputation</li>
                <li>• Get paid securely</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Trusted & Secure</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                All technicians are verified and background-checked for your peace of mind.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Identity verification</li>
                <li>• Background checks</li>
                <li>• Insurance coverage</li>
                <li>• Secure payments</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Demo Section */}
        <div className="mt-20">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Try Demo Accounts</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Explore the platform with our demo accounts. No registration required!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">
                    Client Demo
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">
                    Technician Demo
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">
                    Admin Demo
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Use email: jane.client@example.com, paul.tech@example.com, or admin@example.com<br />
                Password: password123
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 Servigo. All rights reserved.</p>
            <p className="mt-2 text-sm">
              Built with Next.js, TypeScript, and Tailwind CSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
