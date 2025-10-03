'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingApiSimulation, BookingFilters } from '@/lib/booking-api-simulation';
import { ServiceRequest, ServiceRequestStatus } from '@/schemas/service-request-schema';
import { Technician } from '@/schemas/user-schema';
import { TechnicianService } from '@/schemas/technician-service-schema';
import { format } from 'date-fns';
import {
    Clock,
    MapPin,
    User,
    DollarSign,
    CheckCircle,
    XCircle,
    AlertCircle,
    Calendar
} from 'lucide-react';

interface BookingQueueProps {
    technician: Technician;
}

export function BookingQueue({ technician }: BookingQueueProps) {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [services, setServices] = useState<TechnicianService[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('pending');

    // Load services
    useEffect(() => {
        const loadServices = async () => {
            try {
                const { DUMMY_SERVICES } = await import('@/data/dummy-services');
                const techServices = DUMMY_SERVICES.filter(s => s.technician_id === technician.user_id);
                setServices(techServices);
            } catch (error) {
                console.error('Failed to load services:', error);
            }
        };

        loadServices();
    }, [technician.user_id]);

    // Load requests
    const loadRequests = async (status?: ServiceRequestStatus) => {
        setIsLoading(true);
        setError('');

        try {
            const filters: BookingFilters = {
                technician_id: technician.user_id,
                pagination: { page: 1, limit: 50 }
            };

            if (status) {
                filters.status = status;
            }

            const response = await BookingApiSimulation.getServiceRequests(filters);

            if (response.success && response.data) {
                setRequests(response.data);
            } else {
                setError(response.error || 'Failed to load requests');
            }
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, [technician.user_id]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleStatusUpdate = async (requestId: string, status: ServiceRequestStatus) => {
        try {
            const response = await BookingApiSimulation.updateRequestStatus(requestId, status);

            if (response.success) {
                // Reload requests
                await loadRequests();
            } else {
                setError(response.error || 'Failed to update request status');
            }
        } catch {
            setError('An unexpected error occurred');
        }
    };

    const getServiceTitle = (serviceId: string) => {
        const service = services.find(s => s.service_id === serviceId);
        return service?.service_title || 'Unknown Service';
    };

    const getStatusColor = (status: ServiceRequestStatus) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const filteredRequests = requests.filter(request => {
        if (activeTab === 'all') return true;
        return request.status === activeTab;
    });

    return (
        <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span>Booking Management</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                        Manage your service requests and bookings
                    </p>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList className="grid w-full grid-cols-6 bg-transparent">
                            <TabsTrigger
                                value="all"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl"
                            >
                                All
                            </TabsTrigger>
                            <TabsTrigger
                                value="pending"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl"
                            >
                                Pending
                            </TabsTrigger>
                            <TabsTrigger
                                value="accepted"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl"
                            >
                                Accepted
                            </TabsTrigger>
                            <TabsTrigger
                                value="in_progress"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl"
                            >
                                In Progress
                            </TabsTrigger>
                            <TabsTrigger
                                value="completed"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl"
                            >
                                Completed
                            </TabsTrigger>
                            <TabsTrigger
                                value="rejected"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl"
                            >
                                Rejected
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab} className="space-y-4">
                            {isLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading requests...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-8">
                                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                                    <p className="text-red-600">{error}</p>
                                </div>
                            ) : filteredRequests.length === 0 ? (
                                <div className="text-center py-8">
                                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">No {activeTab} requests found</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredRequests.map(request => (
                                        <Card key={request.request_id} className="bg-white/60 backdrop-blur-sm border-white/20">
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-semibold text-lg">{getServiceTitle(request.service_id)}</h3>
                                                        <p className="text-sm text-gray-600">Request ID: {request.request_id}</p>
                                                    </div>
                                                    <Badge className={getStatusColor(request.status)}>
                                                        {request.status.replace('_', ' ')}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center space-x-2">
                                                            <Calendar className="w-4 h-4 text-gray-500" />
                                                            <span className="text-sm">
                                                                {format(new Date(request.preferred_date), 'PPP')} at {request.preferred_time}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <MapPin className="w-4 h-4 text-gray-500" />
                                                            <span className="text-sm">{request.job_address}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <DollarSign className="w-4 h-4 text-gray-500" />
                                                            <span className="text-sm">
                                                                {request.total_cost?.toLocaleString()} FCFA
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center space-x-2">
                                                            <Clock className="w-4 h-4 text-gray-500" />
                                                            <span className="text-sm">{request.estimated_duration} minutes</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <User className="w-4 h-4 text-gray-500" />
                                                            <span className="text-sm">Client ID: {request.client_id}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <p className="text-sm font-medium text-gray-700 mb-1">Problem Description:</p>
                                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                                        {request.problem_description}
                                                    </p>
                                                </div>

                                                {request.notes && (
                                                    <div className="mb-4">
                                                        <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                                                        <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                                                            {request.notes}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-center">
                                                    <div className="text-xs text-gray-500">
                                                        Created: {format(new Date(request.created_at), 'PPP')}
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        {request.status === 'pending' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleStatusUpdate(request.request_id, 'accepted')}
                                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                                >
                                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                                    Accept
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleStatusUpdate(request.request_id, 'rejected')}
                                                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                                                >
                                                                    <XCircle className="w-4 h-4 mr-1" />
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}
                                                        {request.status === 'accepted' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleStatusUpdate(request.request_id, 'in_progress')}
                                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                                            >
                                                                Start Work
                                                            </Button>
                                                        )}
                                                        {request.status === 'in_progress' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleStatusUpdate(request.request_id, 'completed')}
                                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                            >
                                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                                Complete
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
