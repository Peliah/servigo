'use client';

import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Admin } from "@/schemas/user-schema";
import { UserManagement } from "@/components/admin/user-management";
import { PlatformOversight } from "@/components/admin/platform-oversight";
import { AnalyticsReporting } from "@/components/admin/analytics-reporting";
import { CategoryManagement } from "@/components/admin/category-management";
import { AdminApiSimulation, AdminStats } from "@/lib/admin-api-simulation";
import {
    Users,
    Shield,
    ClipboardList,
    DollarSign,
    Settings,
    BarChart3,
    Tag,
    TrendingUp,
    Activity
} from "lucide-react";

export function AdminDashboard() {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState<AdminStats | null>(null);

    useEffect(() => {
        // Redirect if not authenticated or not an admin
        if (!user || user.user_type !== 'admin') {
            router.push('/auth/login');
        }
    }, [user, router]);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const response = await AdminApiSimulation.getAdminStats();
                if (response.success && response.data) {
                    setStats(response.data);
                }
            } catch (error) {
                console.error('Failed to load admin stats:', error);
            }
        };

        if (user && user.user_type === 'admin') {
            loadStats();
        }
    }, [user]);

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="max-w-7xl mx-auto p-6">
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
                    <Button onClick={handleLogout} variant="outline" className="bg-white/80 border-gray-200 hover:bg-white">
                        Logout
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats?.total_users || 0}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Technicians</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats?.active_technicians || 0}</p>
                                    <p className="text-xs text-gray-600">{stats?.verified_technicians || 0} verified</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Completed Services</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats?.completed_services || 0}</p>
                                    <p className="text-xs text-gray-600">{stats?.pending_requests || 0} pending</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <ClipboardList className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats?.total_revenue.toLocaleString() || 0} FCFA
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {stats?.platform_fee_earned.toLocaleString() || 0} FCFA platform fee
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-2">
                        <TabsList className="grid w-full grid-cols-5 bg-transparent">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl">
                                <div className="flex items-center space-x-2">
                                    <Activity className="w-4 h-4" />
                                    <span>Overview</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger value="users" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl">
                                <div className="flex items-center space-x-2">
                                    <Users className="w-4 h-4" />
                                    <span>Users</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger value="oversight" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl">
                                <div className="flex items-center space-x-2">
                                    <ClipboardList className="w-4 h-4" />
                                    <span>Oversight</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl">
                                <div className="flex items-center space-x-2">
                                    <BarChart3 className="w-4 h-4" />
                                    <span>Analytics</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger value="categories" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl">
                                <div className="flex items-center space-x-2">
                                    <Tag className="w-4 h-4" />
                                    <span>Categories</span>
                                </div>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Activity className="w-5 h-5 text-blue-600" />
                                        <span>Platform Health</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">User Growth</span>
                                        <Badge variant="default" className="bg-green-100 text-green-800">
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                            Healthy
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Service Completion Rate</span>
                                        <Badge variant="default" className="bg-green-100 text-green-800">
                                            <ClipboardList className="w-3 h-3 mr-1" />
                                            High
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Payment Success Rate</span>
                                        <Badge variant="default" className="bg-green-100 text-green-800">
                                            <DollarSign className="w-3 h-3 mr-1" />
                                            Excellent
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Settings className="w-5 h-5 text-indigo-600" />
                                        <span>Admin Information</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Email:</span>
                                        <p className="text-sm text-gray-900">{user.email}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Phone:</span>
                                        <p className="text-sm text-gray-900">{user.phone_number}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Role:</span>
                                        <p className="text-sm text-gray-900">{admin.admin_role || 'admin'}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Member Since:</span>
                                        <p className="text-sm text-gray-900">
                                            {new Date(user.date_created).toLocaleDateString()}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="users">
                        <UserManagement />
                    </TabsContent>

                    <TabsContent value="oversight">
                        <PlatformOversight />
                    </TabsContent>

                    <TabsContent value="analytics">
                        <AnalyticsReporting />
                    </TabsContent>

                    <TabsContent value="categories">
                        <CategoryManagement />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}