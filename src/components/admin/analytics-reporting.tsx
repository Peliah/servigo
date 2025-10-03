'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminApiSimulation, AdminStats } from '@/lib/admin-api-simulation';
import { format } from 'date-fns';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    Shield,
    ClipboardList,
    DollarSign,
    Calendar,
    Loader2,
    AlertCircle,
    CheckCircle,
    XCircle,
    Activity,
    CreditCard,
    Star
} from 'lucide-react';

export function AnalyticsReporting() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [dailyBookings, setDailyBookings] = useState<{ date: string; count: number; revenue: number }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [timeRange, setTimeRange] = useState('7');

    const loadStats = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await AdminApiSimulation.getAdminStats();
            if (response.success && response.data) {
                setStats(response.data);
            } else {
                setError(response.error || 'Failed to load statistics');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadDailyBookings = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await AdminApiSimulation.getDailyBookings(parseInt(timeRange));
            if (response.success && response.data) {
                setDailyBookings(response.data);
            }
        } catch (err) {
            setError('Failed to load daily bookings');
        } finally {
            setIsLoading(false);
        }
    }, [timeRange]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    useEffect(() => {
        loadDailyBookings();
    }, [loadDailyBookings]);

    const getRevenueChange = () => {
        if (dailyBookings.length < 2) return { change: 0, isPositive: true };

        const recent = dailyBookings.slice(-2);
        const current = recent[1]?.revenue || 0;
        const previous = recent[0]?.revenue || 0;

        if (previous === 0) return { change: 100, isPositive: current > 0 };

        const change = ((current - previous) / previous) * 100;
        return { change: Math.abs(change), isPositive: change >= 0 };
    };

    const getBookingsChange = () => {
        if (dailyBookings.length < 2) return { change: 0, isPositive: true };

        const recent = dailyBookings.slice(-2);
        const current = recent[1]?.count || 0;
        const previous = recent[0]?.count || 0;

        if (previous === 0) return { change: 100, isPositive: current > 0 };

        const change = ((current - previous) / previous) * 100;
        return { change: Math.abs(change), isPositive: change >= 0 };
    };

    const revenueChange = getRevenueChange();
    const bookingsChange = getBookingsChange();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Analytics & Reporting</h2>
                    <p className="text-gray-600">Platform performance metrics and insights</p>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800">{error}</span>
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading analytics...</span>
                </div>
            ) : (
                <>
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats?.total_users || 0}</p>
                                        <div className="flex items-center mt-2">
                                            <Users className="w-4 h-4 text-blue-600 mr-1" />
                                            <span className="text-xs text-gray-600">All platform users</span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Active Technicians</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats?.active_technicians || 0}</p>
                                        <div className="flex items-center mt-2">
                                            <Shield className="w-4 h-4 text-green-600 mr-1" />
                                            <span className="text-xs text-gray-600">{stats?.verified_technicians || 0} verified</span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Completed Services</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats?.completed_services || 0}</p>
                                        <div className="flex items-center mt-2">
                                            <ClipboardList className="w-4 h-4 text-purple-600 mr-1" />
                                            <span className="text-xs text-gray-600">{stats?.pending_requests || 0} pending</span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <ClipboardList className="w-6 h-6 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {stats?.total_revenue.toLocaleString() || 0} FCFA
                                        </p>
                                        <div className="flex items-center mt-2">
                                            <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                                            <span className="text-xs text-gray-600">
                                                {stats?.platform_fee_earned.toLocaleString() || 0} FCFA platform fee
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                        <DollarSign className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Daily Bookings Chart */}
                    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                                <span>Daily Bookings & Revenue</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {dailyBookings.length > 0 ? (
                                    <>
                                        {/* Chart representation */}
                                        <div className="space-y-3">
                                            {dailyBookings.slice(-7).map((day, index) => {
                                                const maxCount = Math.max(...dailyBookings.map(d => d.count));
                                                const maxRevenue = Math.max(...dailyBookings.map(d => d.revenue));

                                                return (
                                                    <div key={day.date} className="flex items-center space-x-4">
                                                        <div className="w-20 text-sm text-gray-600">
                                                            {format(new Date(day.date), 'MMM dd')}
                                                        </div>
                                                        <div className="flex-1 space-y-2">
                                                            <div className="flex items-center space-x-2">
                                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                <span className="text-sm text-gray-600">Bookings:</span>
                                                                <span className="text-sm font-medium">{day.count}</span>
                                                                <div
                                                                    className="h-2 bg-blue-200 rounded-full"
                                                                    style={{ width: `${maxCount > 0 ? (day.count / maxCount) * 100 : 0}%` }}
                                                                ></div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                                <span className="text-sm text-gray-600">Revenue:</span>
                                                                <span className="text-sm font-medium">
                                                                    {day.revenue.toLocaleString()} FCFA
                                                                </span>
                                                                <div
                                                                    className="h-2 bg-green-200 rounded-full"
                                                                    style={{ width: `${maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Summary */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                                <div>
                                                    <p className="text-sm text-gray-600">Avg Daily Bookings</p>
                                                    <p className="text-lg font-semibold">
                                                        {(dailyBookings.reduce((sum, day) => sum + day.count, 0) / dailyBookings.length).toFixed(1)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    {bookingsChange.isPositive ? (
                                                        <TrendingUp className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <TrendingDown className="w-4 h-4 text-red-600" />
                                                    )}
                                                    <span className={`text-sm ${bookingsChange.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                                        {bookingsChange.change.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                                <div>
                                                    <p className="text-sm text-gray-600">Avg Daily Revenue</p>
                                                    <p className="text-lg font-semibold">
                                                        {(dailyBookings.reduce((sum, day) => sum + day.revenue, 0) / dailyBookings.length).toLocaleString()} FCFA
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    {revenueChange.isPositive ? (
                                                        <TrendingUp className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <TrendingDown className="w-4 h-4 text-red-600" />
                                                    )}
                                                    <span className={`text-sm ${revenueChange.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                                        {revenueChange.change.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600">No booking data available for the selected period.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Platform Health */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Activity className="w-5 h-5 text-green-600" />
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
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        High
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Payment Success Rate</span>
                                    <Badge variant="default" className="bg-green-100 text-green-800">
                                        <CreditCard className="w-3 h-3 mr-1" />
                                        Excellent
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Customer Satisfaction</span>
                                    <Badge variant="default" className="bg-green-100 text-green-800">
                                        <Star className="w-3 h-3 mr-1" />
                                        High
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    <span>Recent Activity</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3 text-sm">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-gray-600">New technician registered</span>
                                        <span className="text-gray-400">2 hours ago</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-gray-600">Service request completed</span>
                                        <span className="text-gray-400">4 hours ago</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        <span className="text-gray-600">Payment processed</span>
                                        <span className="text-gray-400">6 hours ago</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <span className="text-gray-600">Review submitted</span>
                                        <span className="text-gray-400">8 hours ago</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
