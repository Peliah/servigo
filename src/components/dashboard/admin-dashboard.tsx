'use client';

import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Admin } from "@/schemas/user-schema";

export function AdminDashboard() {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        // Redirect if not authenticated or not an admin
        if (!user || user.user_type !== 'admin') {
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

    if (!user || user.user_type !== 'admin') {
        return <div>Loading...</div>;
    }

    const admin = user as Admin; // Type assertion for admin-specific fields

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Admin Panel
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Welcome, {user.first_name} {user.last_name}
                        </p>
                        {admin.admin_role && (
                            <Badge variant="outline" className="mt-2">
                                {admin.admin_role.replace('_', ' ').toUpperCase()}
                            </Badge>
                        )}
                    </div>
                    <Button onClick={handleLogout} variant="outline">
                        Logout
                    </Button>
                </div>

                {/* Admin Actions */}
                <div className="grid grid-cols-1 md:grid-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">User Management</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full" variant="default" size="sm">
                                View All Users
                            </Button>
                            <Button className="w-full" variant="outline" size="sm">
                                Manage Roles
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Service Management</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full" variant="default" size="sm">
                                View Services
                            </Button>
                            <Button className="w-full" variant="outline" size="sm">
                                Manage Categories
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Request Management</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full" variant="default" size="sm">
                                View All Requests
                            </Button>
                            <Button className="w-full" variant="outline" size="sm">
                                Dispute Resolution
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Analytics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full" variant="default" size="sm">
                                View Reports
                            </Button>
                            <Button className="w-full" variant="outline" size="sm">
                                System Stats
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* System Overview */}
                <div className="grid grid-cols-1 md:grid-2 lg:grid-cols-3 gap-6">
                    {/* Quick Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>System Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">Total Users:</span>
                                <span className="text-sm text-gray-600">0</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">Active Technicians:</span>
                                <span className="text-sm text-gray-600">0</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">Pending Requests:</span>
                                <span className="text-sm text-gray-600">0</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">Completed Services:</span>
                                <span className="text-sm text-gray-600">0</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-500 text-sm">
                                No recent activity to display.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Admin Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Admin Information</CardTitle>
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
                                <span className="text-sm font-medium">Role:</span>
                                <p className="text-sm text-gray-600">
                                    {admin.admin_role || 'admin'}
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

                {/* System Settings */}
                <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button variant="outline" size="sm">
                                Platform Settings
                            </Button>
                            <Button variant="outline" size="sm">
                                Email Templates
                            </Button>
                            <Button variant="outline" size="sm">
                                Notification Settings
                            </Button>
                            <Button variant="outline" size="sm">
                                Backup & Recovery
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
