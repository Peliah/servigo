'use client';

import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Technician } from "@/schemas/user-schema";

export function TechnicianDashboard() {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        // Redirect if not authenticated or not a technician
        if (!user || user.user_type !== 'technician') {
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

    if (!user || user.user_type !== 'technician') {
        return <div>Loading...</div>;
    }

    const technician = user as Technician; // Type assertion for technician-specific fields

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome, {user.first_name} {user.last_name}
                        </h1>
                        <p className="text-gray-600 mt-2">Technician Dashboard</p>
                        {technician.business_name && (
                            <p className="text-lg text-blue-600 font-medium">
                                {technician.business_name}
                            </p>
                        )}
                    </div>
                    <Button onClick={handleLogout} variant="outline">
                        Logout
                    </Button>
                </div>

                {/* Status Badges */}
                <div className="flex gap-4 mb-8">
                    <Badge variant={technician.is_available ? "default" : "secondary"}>
                        {technician.is_available ? "Available" : "Busy"}
                    </Badge>
                    <Badge variant={technician.identity_verified ? "default" : "destructive"}>
                        {technician.identity_verified ? "Verified" : "Unverified"}
                    </Badge>
                    <Badge variant="outline">
                        {technician.years_of_experience || 0} years experience
                    </Badge>
                </div>

                {/* Dashboard Content */}
                <div className="grid grid-cols-1 md:grid-2 lg:grid-cols-3 gap-6">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full" variant="default">
                                View Requests
                            </Button>
                            <Button className="w-full" variant="outline">
                                Manage Services
                            </Button>
                            <Button className="w-full" variant="outline">
                                Update Availability
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Recent Requests */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-500 text-sm">
                                No recent requests yet. Your services will appear here!
                            </p>
                        </CardContent>
                    </Card>

                    {/* Profile Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Stats</CardTitle>
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
                                <span className="text-sm font-medium">Experience:</span>
                                <p className="text-sm text-gray-600">
                                    {technician.years_of_experience || 0} years
                                </p>
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

                {/* Bio Section */}
                {technician.bio && (
                    <div className="mt-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>About Me</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">{technician.bio}</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Placeholder for future features */}
                <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Coming Soon</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                Service requests, schedule management, earnings tracking, and more features will be available here.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
