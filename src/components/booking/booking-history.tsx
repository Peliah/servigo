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
import { useAuthStore } from '@/stores/auth-store';
import { ReviewModal } from '@/components/reviews/review-modal';
import { format } from 'date-fns';
import {
    Clock,
    MapPin,
    User,
    DollarSign,
    Calendar,
    Star,
    AlertCircle,
    CheckCircle,
    XCircle
} from 'lucide-react';

export function BookingHistory() {
    const { user } = useAuthStore();
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [services, setServices] = useState<TechnicianService[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

    // Load data
    useEffect(() => {
        const loadData = async () => {
            if (!user || user.user_type !== 'client') return;

            setIsLoading(true);
            setError('');

            try {
                // Load technicians and services
                const [{ DUMMY_TECHNICIANS }, { DUMMY_SERVICES }] = await Promise.all([
                    import('@/data/dummy-users'),
                    import('@/data/dummy-services')
                ]);

                setTechnicians(DUMMY_TECHNICIANS);
                setServices(DUMMY_SERVICES);

                // Load client's requests
                const filters: BookingFilters = {
                    client_id: user.user_id,
                    pagination: { page: 1, limit: 50 }
                };

                const response = await BookingApiSimulation.getServiceRequests(filters);

                if (response.success && response.data) {
                    setRequests(response.data);
                } else {
                    setError(response.error || 'Failed to load booking history');
                }
            } catch {
                setError('An unexpected error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [user]);

    const getTechnicianName = (technicianId: string) => {
        const technician = technicians.find(t => t.user_id === technicianId);
        return technician ? `${technician.first_name} ${technician.last_name}` : 'Unknown Technician';
    };

    const getTechnicianBusiness = (technicianId: string) => {
        const technician = technicians.find(t => t.user_id === technicianId);
        return technician?.business_name || 'Unknown Business';
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

    const getStatusIcon = (status: ServiceRequestStatus) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'accepted': return <CheckCircle className="w-4 h-4" />;
            case 'rejected': return <XCircle className="w-4 h-4" />;
            case 'in_progress': return <AlertCircle className="w-4 h-4" />;
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            case 'cancelled': return <XCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const filteredRequests = requests.filter(request => {
        if (activeTab === 'all') return true;
        return request.status === activeTab;
    });

    const handleCancelRequest = async (requestId: string) => {
        try {
            const response = await BookingApiSimulation.updateRequestStatus(requestId, 'cancelled');

            if (response.success) {
                // Reload requests
                const filters: BookingFilters = {
                    client_id: user!.user_id,
                    pagination: { page: 1, limit: 50 }
                };

                const updatedResponse = await BookingApiSimulation.getServiceRequests(filters);

                if (updatedResponse.success && updatedResponse.data) {
                    setRequests(updatedResponse.data);
                }
            } else {
                setError(response.error || 'Failed to cancel request');
            }
        } catch {
            setError('An unexpected error occurred');
        }
    };

    const handleLeaveReview = (requestId: string) => {
        const request = requests.find(r => r.request_id === requestId);
        if (request) {
            setSelectedRequest(request);
            setShowReviewModal(true);
        }
    };

    const handleSubmitReview = async (rating: number, comment: string) => {
        if (!selectedRequest) return;

        // TODO: Implement review submission API
        console.log('Submitting review:', {
            requestId: selectedRequest.request_id,
            technicianId: selectedRequest.technician_id,
            rating,
            comment
        });

        // For now, just show success message
        alert(`Review submitted successfully! Rating: ${rating}/5`);

        // Close modal and reset state
        setShowReviewModal(false);
        setSelectedRequest(null);
    };

    if (!user || user.user_type !== 'client') {
        return (
            <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">You must be logged in as a client to view booking history</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span>Booking History</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                        Track your service requests and bookings
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
                                    <p className="text-gray-600">Loading booking history...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-8">
                                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                                    <p className="text-red-600">{error}</p>
                                </div>
                            ) : filteredRequests.length === 0 ? (
                                <div className="text-center py-8">
                                    <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">No {activeTab} bookings found</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Start by searching for services and making your first booking!
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredRequests.map(request => (
                                        <Card key={request.request_id} className="bg-white/60 backdrop-blur-sm border-white/20">
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-semibold text-lg">{getServiceTitle(request.service_id)}</h3>
                                                        <p className="text-sm text-gray-600">
                                                            with {getTechnicianName(request.technician_id)} • {getTechnicianBusiness(request.technician_id)}
                                                        </p>
                                                        <p className="text-xs text-gray-500">Request ID: {request.request_id}</p>
                                                    </div>
                                                    <Badge className={`${getStatusColor(request.status)} flex items-center space-x-1`}>
                                                        {getStatusIcon(request.status)}
                                                        <span>{request.status.replace('_', ' ')}</span>
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
                                                            <span className="text-sm">{getTechnicianName(request.technician_id)}</span>
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
                                                        {request.updated_at && new Date(request.updated_at).getTime() !== new Date(request.created_at).getTime() && (
                                                            <span> • Updated: {format(new Date(request.updated_at), 'PPP')}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        {request.status === 'completed' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                                                                onClick={() => handleLeaveReview(request.request_id)}
                                                            >
                                                                <Star className="w-4 h-4 mr-1" />
                                                                Leave Review
                                                            </Button>
                                                        )}
                                                        {request.status === 'pending' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-red-200 text-red-600 hover:bg-red-50"
                                                                onClick={() => handleCancelRequest(request.request_id)}
                                                            >
                                                                Cancel Request
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

            {/* Review Modal */}
            {showReviewModal && selectedRequest && (
                <ReviewModal
                    isOpen={showReviewModal}
                    onClose={() => {
                        setShowReviewModal(false);
                        setSelectedRequest(null);
                    }}
                    technicianName={getTechnicianName(selectedRequest.technician_id)}
                    serviceTitle={getServiceTitle(selectedRequest.service_id)}
                    requestId={selectedRequest.request_id}
                    onSubmit={handleSubmitReview}
                />
            )}
        </div>
    );
}
