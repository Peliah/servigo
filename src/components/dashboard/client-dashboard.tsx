'use client';

import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ClientDashboard() {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        // Redirect if not authenticated or not a client
        if (!user || user.user_type !== 'client') {
            router.push('/auth/login');
        }
    }, [user, router]);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (!user || user.user_type !== 'client') {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome, {user.first_name} {user.last_name}
                        </h1>
                        <p className="text-gray-600 mt-2">Client Dashboard</p>
                    </div>
                    <Button onClick={handleLogout} variant="outline">
                        Logout
                    </Button>
                </div>

                {/* Dashboard Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full" variant="default">
                                Find Services
                            </Button>
                            <Button className="w-full" variant="outline">
                                My Bookings
                            </Button>
                            <Button className="w-full" variant="outline">
                                My Favorites
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-500 text-sm">
                                No recent activity yet. Start by finding a service!
                            </p>
                        </CardContent>
                    </Card>

                    {/* Account Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <span className="text-sm font-medium">Email:</span>
                                <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium">Phone:</span>
                                <p className="text-sm text-gray-600">{user.phone_number}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium">Member Since:</span>
                                <p className="text-sm text-gray-600">
                                    {new Date(user.date_created).toLocaleDateString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Placeholder for future features */}
                <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Coming Soon</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                Service booking, technician reviews, payment history, and more features will be available here.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
