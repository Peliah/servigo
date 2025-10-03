'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChatWindow } from '@/components/chat/chat-window';
import { ReviewModal } from '@/components/reviews/review-modal';
import { BookingApiSimulation } from '@/lib/booking-api-simulation';
import { PaymentApiSimulation } from '@/lib/payment-api-simulation';
import { ServiceRequest } from '@/schemas/service-request-schema';
import { PaymentTransaction } from '@/schemas/payment-schema';
import { Technician, Client } from '@/schemas/user-schema';
import { useAuthStore } from '@/stores/auth-store';
import { format } from 'date-fns';
import {
    Calendar,
    Clock,
    MapPin,
    DollarSign,
    MessageSquare,
    Star,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
    Eye,
    User,
    Phone,
    Mail
} from 'lucide-react';

interface ServiceHistoryProps {
    userType: 'client' | 'technician';
}

export function ServiceHistory({ userType }: ServiceHistoryProps) {
    const { user } = useAuthStore();
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [payments, setPayments] = useState<PaymentTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
    const [showChat, setShowChat] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const loadData = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        setError('');

        try {
            // Load service requests
            const requestsResponse = await BookingApiSimulation.getServiceRequests({
                [userType === 'client' ? 'client_id' : 'technician_id']: user.user_id,
                pagination: { page: 1, limit: 100 }
            });

            if (requestsResponse.success && requestsResponse.data) {
                setRequests(requestsResponse.data);
            }

            // Load payments
            const paymentsResponse = await PaymentApiSimulation.getPaymentTransactions({
                [userType === 'client' ? 'client_id' : 'technician_id']: user.user_id,
                pagination: { page: 1, limit: 100 }
            });

            if (paymentsResponse.success && paymentsResponse.data) {
                setPayments(paymentsResponse.data);
            }
        } catch {
            setError('Failed to load service history');
        } finally {
            setIsLoading(false);
        }
    }, [user, userType]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'accepted': return <CheckCircle className="w-4 h-4" />;
            case 'in_progress': return <AlertCircle className="w-4 h-4" />;
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            case 'cancelled': return <XCircle className="w-4 h-4" />;
            case 'rejected': return <XCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            case 'rejected': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const filteredRequests = requests.filter(request =>
        statusFilter === 'all' || request.status === statusFilter
    );

    const getOtherParticipant = async (request: ServiceRequest) => {
        if (userType === 'client') {
            // Get technician info
            const { DUMMY_TECHNICIANS } = await import('@/data/dummy-users');
            return DUMMY_TECHNICIANS.find(t => t.user_id === request.technician_id);
        } else {
            // Get client info
            const { DUMMY_CLIENTS } = await import('@/data/dummy-users');
            return DUMMY_CLIENTS.find(c => c.user_id === request.client_id);
        }
    };

    const handleViewChat = async (request: ServiceRequest) => {
        setSelectedRequest(request);
        setShowChat(true);
    };

    const handleLeaveReview = async (request: ServiceRequest) => {
        setSelectedRequest(request);
        setShowReview(true);
    };

    const getPaymentForRequest = (requestId: string) => {
        return payments.find(p => p.service_request_id === requestId);
    };

    if (isLoading) {
        return (
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                <CardContent className="p-6">
                    <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
                        <p className="text-gray-600">Loading service history...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span>Service History</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                        View all your {userType === 'client' ? 'booked' : 'assigned'} services and their details
                    </p>
                </CardHeader>
            </Card>

            {/* Filters */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                        <div className="flex-1">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="accepted">Accepted</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="text-sm text-gray-600">
                            {filteredRequests.length} of {requests.length} services
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Service Requests */}
            {error && (
                <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2 text-red-600">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {filteredRequests.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                    <CardContent className="p-6">
                        <div className="text-center py-8">
                            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No service requests found</p>
                            <p className="text-sm text-gray-400">
                                {statusFilter === 'all'
                                    ? 'You haven\'t made any service requests yet'
                                    : `No services with status "${statusFilter}"`
                                }
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredRequests.map((request) => {
                        const payment = getPaymentForRequest(request.request_id);

                        return (
                            <Card key={request.request_id} className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">Service Request</CardTitle>
                                            <p className="text-sm text-gray-600">#{request.request_id.slice(-8)}</p>
                                        </div>
                                        <Badge className={getStatusColor(request.status)}>
                                            <div className="flex items-center space-x-1">
                                                {getStatusIcon(request.status)}
                                                <span>{request.status.replace('_', ' ')}</span>
                                            </div>
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Service Details */}
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">Date:</span>
                                            <span className="text-sm font-medium">{format(new Date(request.preferred_date), 'PPP')}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">Time:</span>
                                            <span className="text-sm font-medium">{request.preferred_time}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">Location:</span>
                                            <span className="text-sm font-medium">{request.job_address}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <DollarSign className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">Cost:</span>
                                            <span className="text-sm font-medium">{(request.total_cost || 0).toLocaleString()} FCFA</span>
                                        </div>
                                    </div>

                                    {/* Payment Status */}
                                    {payment && (
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Payment Status:</span>
                                                <Badge className={
                                                    payment.status === 'held_in_escrow' ? 'bg-purple-100 text-purple-800' :
                                                        payment.status === 'released_to_technician' ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }>
                                                    {payment.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}

                                    {/* Problem Description */}
                                    <div>
                                        <span className="text-sm font-medium text-gray-900">Problem Description:</span>
                                        <p className="text-sm text-gray-600 mt-1">{request.problem_description}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex space-x-2 pt-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleViewChat(request)}
                                            className="flex-1"
                                        >
                                            <MessageSquare className="w-4 h-4 mr-1" />
                                            Chat
                                        </Button>
                                        {request.status === 'completed' && userType === 'client' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleLeaveReview(request)}
                                                className="flex-1"
                                            >
                                                <Star className="w-4 h-4 mr-1" />
                                                Review
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Chat Modal */}
            {showChat && selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <ChatWindow
                            serviceRequest={selectedRequest}
                            onClose={() => {
                                setShowChat(false);
                                setSelectedRequest(null);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {showReview && selectedRequest && (
                <ReviewModal
                    serviceRequest={selectedRequest}
                    technician={{} as Technician} // This would be populated with actual technician data
                    isOpen={showReview}
                    onClose={() => {
                        setShowReview(false);
                        setSelectedRequest(null);
                    }}
                    onSuccess={() => {
                        loadData(); // Refresh data after review submission
                    }}
                />
            )}
        </div>
    );
}
