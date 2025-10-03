'use client';

import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Technician } from "@/schemas/user-schema";
import { ProfileCompletionForm } from "@/components/technician/profile/profile-completion-form";
import { ServiceManagement } from "@/components/technician/services/service-management";
import { WorkingHoursManager } from "@/components/technician/availability/working-hours-manager";
import { BookingQueue } from "@/components/booking/booking-queue";
import { initializeTechnicianData, TechnicianApiSimulation } from "@/lib/technician-api-simulation";
import { TechnicianService } from "@/schemas/technician-service-schema";
import {
    User,
    Settings,
    Clock,
    Briefcase,
    Star,
    MapPin,
    Phone,
    Mail,
    Calendar,
    TrendingUp,
    Users,
    AlertCircle,
    MessageSquare
} from "lucide-react";

export function TechnicianDashboard() {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [showProfileForm, setShowProfileForm] = useState(false);
    const [services, setServices] = useState<TechnicianService[]>([]);

    const loadServices = useCallback(async () => {
        if (!user || user.user_type !== 'technician') return;

        try {
            const response = await TechnicianApiSimulation.getServices(user.user_id);
            if (response.success && response.data) {
                setServices(response.data);
            }
        } catch (error) {
            console.error('Failed to load services:', error);
        }
    }, [user]);

    useEffect(() => {
        // Redirect if not authenticated or not a technician
        if (!user || user.user_type !== 'technician') {
            router.push('/auth/login');
        } else {
            // Initialize technician data
            initializeTechnicianData();
            loadServices();
        }
    }, [user, router, loadServices]);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (!user || user.user_type !== 'technician') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const technician = user as Technician;

    // Calculate profile completion percentage
    const profileFields = [
        technician.business_name,
        technician.bio,
        technician.years_of_experience,
        technician.profile_picture_url
    ];
    const completedFields = profileFields.filter(field => field && field !== '').length;
    const profileCompletionPercentage = (completedFields / profileFields.length) * 100;
    const isProfileComplete = profileCompletionPercentage >= 75;

    // Calculate stats
    const activeServices = services.filter(service => service.is_active).length;

    if (showProfileForm) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6">
                        <Button
                            variant="outline"
                            onClick={() => setShowProfileForm(false)}
                            className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white"
                        >
                            ← Back to Dashboard
                        </Button>
                    </div>
                    <ProfileCompletionForm
                        onSuccess={() => setShowProfileForm(false)}
                        onCancel={() => setShowProfileForm(false)}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 mb-8">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                    {user.first_name[0]}{user.last_name[0]}
                                </div>
                                {technician.is_available && (
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Welcome back, {user.first_name}!
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    {technician.business_name || 'Technician Dashboard'}
                                </p>
                                <div className="flex items-center space-x-4 mt-3">
                                    <Badge
                                        variant={technician.is_available ? "default" : "secondary"}
                                        className="bg-green-100 text-green-800 border-green-200"
                                    >
                                        {technician.is_available ? "Available" : "Busy"}
                                    </Badge>
                                    <Badge
                                        variant={technician.identity_verified ? "default" : "destructive"}
                                        className={technician.identity_verified ? "bg-blue-100 text-blue-800 border-blue-200" : ""}
                                    >
                                        {technician.identity_verified ? "Verified" : "Unverified"}
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

                {/* Profile Completion Card */}
                {!isProfileComplete && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-8 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-amber-900">Complete Your Profile</h3>
                                    <p className="text-sm text-amber-700 mt-1">
                                        Add your business information to start attracting clients
                                    </p>
                                    <div className="mt-2">
                                        <Progress value={profileCompletionPercentage} className="w-48 h-2" />
                                        <p className="text-xs text-amber-600 mt-1">
                                            {Math.round(profileCompletionPercentage)}% complete
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <Button
                                onClick={() => setShowProfileForm(true)}
                                className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg"
                            >
                                Complete Profile
                            </Button>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Services</p>
                                    <p className="text-2xl font-bold text-gray-900">{activeServices}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Briefcase className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Experience</p>
                                    <p className="text-2xl font-bold text-gray-900">{technician.years_of_experience || 0} years</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <Star className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Profile Score</p>
                                    <p className="text-2xl font-bold text-gray-900">{Math.round(profileCompletionPercentage)}%</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Member Since</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {new Date(user.date_created).getFullYear()}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-indigo-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-2">
                        <TabsList className="grid w-full grid-cols-5 bg-transparent">
                            <TabsTrigger
                                value="overview"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl"
                            >
                                <div className="flex items-center space-x-2">
                                    <User className="w-4 h-4" />
                                    <span>Overview</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="bookings"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl"
                            >
                                <div className="flex items-center space-x-2">
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Bookings</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="services"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl"
                            >
                                <div className="flex items-center space-x-2">
                                    <Briefcase className="w-4 h-4" />
                                    <span>Services</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="availability"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl"
                            >
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4" />
                                    <span>Availability</span>
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
                                        <Briefcase className="w-5 h-5 text-blue-600" />
                                        <span>Quick Actions</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button
                                        className="w-full justify-start"
                                        variant="default"
                                        onClick={() => setActiveTab('services')}
                                    >
                                        <Briefcase className="w-4 h-4 mr-2" />
                                        Manage Services
                                    </Button>
                                    <Button
                                        className="w-full justify-start"
                                        variant="outline"
                                        onClick={() => setActiveTab('availability')}
                                    >
                                        <Clock className="w-4 h-4 mr-2" />
                                        Update Availability
                                    </Button>
                                    <Button
                                        className="w-full justify-start"
                                        variant="outline"
                                        onClick={() => setShowProfileForm(true)}
                                    >
                                        <User className="w-4 h-4 mr-2" />
                                        Edit Profile
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
                                        <span className="text-sm text-gray-600">Douala, Cameroon</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Activity */}
                            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-shadow lg:col-span-1">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <TrendingUp className="w-5 h-5 text-purple-600" />
                                        <span>Recent Activity</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Users className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 text-sm">
                                            No recent requests yet. Your services will appear here!
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Bio Section */}
                        {technician.bio && (
                            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Star className="w-5 h-5 text-yellow-600" />
                                        <span>About Me</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 leading-relaxed">{technician.bio}</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="bookings">
                        <BookingQueue technician={technician} />
                    </TabsContent>

                    <TabsContent value="services">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                            <ServiceManagement />
                        </div>
                    </TabsContent>

                    <TabsContent value="availability">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                            <WorkingHoursManager />
                        </div>
                    </TabsContent>

                    <TabsContent value="profile">
                        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <User className="w-5 h-5 text-indigo-600" />
                                    <span>Profile Information</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-2 gap-6">
                                    <div className="space-y-2">
                                        <span className="text-sm font-medium text-gray-900">Business Name</span>
                                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                                            {technician.business_name || 'Not set'}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-sm font-medium text-gray-900">Years of Experience</span>
                                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                                            {technician.years_of_experience || 0} years
                                        </p>
                                    </div>
                                </div>

                                {technician.bio && (
                                    <div className="space-y-2">
                                        <span className="text-sm font-medium text-gray-900">Professional Bio</span>
                                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg leading-relaxed">
                                            {technician.bio}
                                        </p>
                                    </div>
                                )}

                                <div className="pt-4">
                                    <Button
                                        onClick={() => setShowProfileForm(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                                    >
                                        <User className="w-4 h-4 mr-2" />
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
