'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminApiSimulation, AdminFilters } from '@/lib/admin-api-simulation';
import { User, Client, Technician, Admin } from '@/schemas/user-schema';
import { format } from 'date-fns';
import {
    Users,
    Search,
    Filter,
    UserCheck,
    UserX,
    Shield,
    ShieldCheck,
    ShieldX,
    Mail,
    Phone,
    Calendar,
    Loader2,
    AlertCircle,
    CheckCircle,
    XCircle,
    Eye,
    MoreHorizontal
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [verificationFilter, setVerificationFilter] = useState<string>('all');

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const filters: AdminFilters = {
                user_type: activeTab === 'all' ? undefined : activeTab as 'client' | 'technician' | 'admin',
                status: statusFilter === 'all' ? undefined : statusFilter as 'active' | 'inactive' | 'suspended',
                identity_verified: verificationFilter === 'all' ? undefined : verificationFilter === 'verified',
                search: searchQuery || undefined,
                pagination: { page: 1, limit: 50 }
            };

            const response = await AdminApiSimulation.getUsers(filters);

            if (response.success && response.data) {
                setUsers(response.data);
            } else {
                setError(response.error || 'Failed to load users');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, statusFilter, verificationFilter, searchQuery]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleStatusUpdate = async (userId: string, status: 'active' | 'inactive' | 'suspended') => {
        try {
            const response = await AdminApiSimulation.updateUserStatus(userId, status);
            if (response.success) {
                await loadUsers(); // Reload users
            } else {
                setError(response.error || 'Failed to update user status');
            }
        } catch (err) {
            setError('Failed to update user status');
        }
    };

    const handleVerificationUpdate = async (userId: string, verified: boolean) => {
        try {
            const response = await AdminApiSimulation.updateTechnicianVerification(userId, verified);
            if (response.success) {
                await loadUsers(); // Reload users
            } else {
                setError(response.error || 'Failed to update verification status');
            }
        } catch (err) {
            setError('Failed to update verification status');
        }
    };

    const getUserTypeIcon = (userType: string) => {
        switch (userType) {
            case 'client':
                return <Users className="w-4 h-4 text-blue-600" />;
            case 'technician':
                return <Shield className="w-4 h-4 text-green-600" />;
            case 'admin':
                return <ShieldCheck className="w-4 h-4 text-purple-600" />;
            default:
                return <Users className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusBadge = (user: User) => {
        if (!user.is_active) {
            return <Badge variant="destructive">Inactive</Badge>;
        }
        return <Badge variant="default">Active</Badge>;
    };

    const getVerificationBadge = (user: User) => {
        if (user.user_type === 'technician') {
            const technician = user as Technician;
            if (technician.identity_verified) {
                return <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>;
            } else {
                return <Badge variant="outline">Not Verified</Badge>;
            }
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                    <p className="text-gray-600">Manage platform users, verification, and account status</p>
                </div>
            </div>

            {/* Filters */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search users by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Verification status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Verification</SelectItem>
                                <SelectItem value="verified">Verified</SelectItem>
                                <SelectItem value="unverified">Unverified</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* User Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-2">
                    <TabsList className="grid w-full grid-cols-4 bg-transparent">
                        <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl">
                            <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4" />
                                <span>All Users</span>
                            </div>
                        </TabsTrigger>
                        <TabsTrigger value="client" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl">
                            <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4" />
                                <span>Clients</span>
                            </div>
                        </TabsTrigger>
                        <TabsTrigger value="technician" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl">
                            <div className="flex items-center space-x-2">
                                <Shield className="w-4 h-4" />
                                <span>Technicians</span>
                            </div>
                        </TabsTrigger>
                        <TabsTrigger value="admin" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl">
                            <div className="flex items-center space-x-2">
                                <ShieldCheck className="w-4 h-4" />
                                <span>Admins</span>
                            </div>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value={activeTab} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <span className="text-red-800">{error}</span>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600">Loading users...</span>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {users.map((user) => (
                                <Card key={user.user_id} className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    {user.first_name[0]}{user.last_name[0]}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {user.first_name} {user.last_name}
                                                    </h3>
                                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                        {getUserTypeIcon(user.user_type)}
                                                        <span className="capitalize">{user.user_type}</span>
                                                        {getStatusBadge(user)}
                                                        {getVerificationBadge(user)}
                                                    </div>
                                                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                                        <div className="flex items-center space-x-1">
                                                            <Mail className="w-3 h-3" />
                                                            <span>{user.email}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Phone className="w-3 h-3" />
                                                            <span>{user.phone_number}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>Joined {format(new Date(user.date_created), 'MMM dd, yyyy')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        {user.is_active ? (
                                                            <DropdownMenuItem onClick={() => handleStatusUpdate(user.user_id, 'inactive')}>
                                                                <UserX className="w-4 h-4 mr-2" />
                                                                Deactivate
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem onClick={() => handleStatusUpdate(user.user_id, 'active')}>
                                                                <UserCheck className="w-4 h-4 mr-2" />
                                                                Activate
                                                            </DropdownMenuItem>
                                                        )}
                                                        {user.user_type === 'technician' && (
                                                            <>
                                                                <DropdownMenuItem onClick={() => handleVerificationUpdate(user.user_id, true)}>
                                                                    <ShieldCheck className="w-4 h-4 mr-2" />
                                                                    Verify
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleVerificationUpdate(user.user_id, false)}>
                                                                    <ShieldX className="w-4 h-4 mr-2" />
                                                                    Unverify
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {!isLoading && users.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
