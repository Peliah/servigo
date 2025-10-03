'use client';

import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Client } from "@/schemas/user-schema";
import { TechnicianSearch } from "@/components/search/technician-search";
import { BookingHistory } from "@/components/booking/booking-history";
import { ServiceHistory } from "@/components/history/service-history";
import {
    Search,
    Heart,
    Clock,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Star,
    Users,
    Settings,
    MessageSquare,
    TrendingUp,
    Filter,
    History
} from "lucide-react";

export function ClientDashboard() {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');

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
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const client = user as Client;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 mb-8">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                    {user.first_name[0]}{user.last_name[0]}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                                    <Users className="w-3 h-3 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Welcome back, {user.first_name}!
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Find trusted professionals for all your needs
                                </p>
                                <div className="flex items-center space-x-4 mt-3">
                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                        Active Client
                                    </Badge>
                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                        Member since {new Date(user.date_created).getFullYear()}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white"
                        >
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Search Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                placeholder="Search for services (e.g., 'electrician', 'plumber', 'carpenter')..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                            <Search className="w-4 h-4 mr-2" />
                            Search
                        </Button>
                        <Button variant="outline" className="bg-white/80 border-gray-200 hover:bg-white">
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Services Booked</p>
                                    <p className="text-2xl font-bold text-gray-900">0</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Favorite Technicians</p>
                                    <p className="text-2xl font-bold text-gray-900">0</p>
                                </div>
                                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                    <Heart className="w-6 h-6 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Reviews Written</p>
                                    <p className="text-2xl font-bold text-gray-900">0</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                    <Star className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                                    <p className="text-2xl font-bold text-gray-900">$0</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-2">
                        <TabsList className="grid w-full grid-cols-6 bg-transparent">
                            <TabsTrigger
                                value="overview"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl"
                            >
                                <div className="flex items-center space-x-2">
                                    <Users className="w-4 h-4" />
                                    <span>Overview</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="search"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl"
                            >
                                <div className="flex items-center space-x-2">
                                    <Search className="w-4 h-4" />
                                    <span>Search</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="favorites"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl"
                            >
                                <div className="flex items-center space-x-2">
                                    <Heart className="w-4 h-4" />
                                    <span>Favorites</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="bookings"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl"
                            >
                                <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Bookings</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="history"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl"
                            >
                                <div className="flex items-center space-x-2">
                                    <History className="w-4 h-4" />
                                    <span>History</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="profile"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl"
                            >
                                <div className="flex items-center space-x-2">
                                    <Settings className="w-4 h-4" />
                                    <span>Profile</span>
                                </div>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Quick Actions */}
                            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Search className="w-5 h-5 text-blue-600" />
                                        <span>Quick Actions</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button
                                        className="w-full justify-start"
                                        variant="default"
                                        onClick={() => setActiveTab('search')}
                                    >
                                        <Search className="w-4 h-4 mr-2" />
                                        Find Services
                                    </Button>
                                    <Button
                                        className="w-full justify-start"
                                        variant="outline"
                                        onClick={() => setActiveTab('favorites')}
                                    >
                                        <Heart className="w-4 h-4 mr-2" />
                                        My Favorites
                                    </Button>
                                    <Button
                                        className="w-full justify-start"
                                        variant="outline"
                                        onClick={() => setActiveTab('bookings')}
                                    >
                                        <Calendar className="w-4 h-4 mr-2" />
                                        My Bookings
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Contact Information */}
                            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Phone className="w-5 h-5 text-green-600" />
                                        <span>Contact Info</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">{user.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">{user.phone_number}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">{client.default_address || 'No address set'}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Activity */}
                            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-shadow lg:col-span-1">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Clock className="w-5 h-5 text-purple-600" />
                                        <span>Recent Activity</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <MessageSquare className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 text-sm">
                                            No recent activity yet. Start by finding a service!
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="search">
                        <TechnicianSearch />
                    </TabsContent>

                    <TabsContent value="favorites">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Heart className="w-10 h-10 text-red-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Favorite Technicians</h3>
                                <p className="text-gray-600 mb-6">
                                    Save technicians you love to easily find them again
                                </p>
                                <Button className="bg-red-600 hover:bg-red-700 text-white shadow-lg">
                                    <Heart className="w-4 h-4 mr-2" />
                                    Browse Technicians
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="bookings">
                        <BookingHistory />
                    </TabsContent>

                    <TabsContent value="history">
                        <ServiceHistory userType="client" />
                    </TabsContent>

                    <TabsContent value="profile">
                        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Settings className="w-5 h-5 text-indigo-600" />
                                    <span>Profile Information</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-2 gap-6">
                                    <div className="space-y-2">
                                        <span className="text-sm font-medium text-gray-900">Full Name</span>
                                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                                            {user.first_name} {user.last_name}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-sm font-medium text-gray-900">Email Address</span>
                                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                                            {user.email}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-sm font-medium text-gray-900">Phone Number</span>
                                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                                            {user.phone_number}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-sm font-medium text-gray-900">Default Address</span>
                                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                                            {client.default_address || 'Not set'}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                                        <Settings className="w-4 h-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
