'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminApiSimulation } from '@/lib/admin-api-simulation';
import { ServiceRequest, ServiceRequestStatus } from '@/schemas/service-request-schema';
import { PaymentTransaction, PaymentStatus } from '@/schemas/payment-schema';
import { Review } from '@/schemas/review-schema';
import { format } from 'date-fns';
import {
    ClipboardList,
    CreditCard,
    Star,
    Calendar,
    DollarSign,
    MapPin,
    User,
    Clock,
    Loader2,
    AlertCircle,
    CheckCircle,
    XCircle,
    TrendingUp,
    TrendingDown
} from 'lucide-react';

export function PlatformOversight() {
    const [activeTab, setActiveTab] = useState('requests');
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const loadRequests = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await AdminApiSimulation.getServiceRequests({
                pagination: { page: 1, limit: 50 }
            });
            if (response.success && response.data) {
                setRequests(response.data);
            }
        } catch (err) {
            setError('Failed to load service requests');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadTransactions = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await AdminApiSimulation.getPaymentTransactions({
                pagination: { page: 1, limit: 50 }
            });
            if (response.success && response.data) {
                setTransactions(response.data);
            }
        } catch (err) {
            setError('Failed to load payment transactions');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadReviews = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await AdminApiSimulation.getReviews({
                pagination: { page: 1, limit: 50 }
            });
            if (response.success && response.data) {
                setReviews(response.data);
            }
        } catch (err) {
            setError('Failed to load reviews');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'requests') loadRequests();
        else if (activeTab === 'transactions') loadTransactions();
        else if (activeTab === 'reviews') loadReviews();
    }, [activeTab, loadRequests, loadTransactions, loadReviews]);

    const getStatusBadge = (status: ServiceRequestStatus) => {
        const statusConfig = {
            pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
            accepted: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
            in_progress: { variant: 'default' as const, icon: Clock, color: 'text-blue-600' },
            completed: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
            cancelled: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
            rejected: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center space-x-1">
                <Icon className={`w-3 h-3 ${config.color}`} />
                <span className="capitalize">{status.replace('_', ' ')}</span>
            </Badge>
        );
    };

    const getPaymentStatusBadge = (status: PaymentStatus) => {
        const statusConfig = {
            pending: { variant: 'secondary' as const, color: 'text-yellow-600' },
            processing: { variant: 'default' as const, color: 'text-blue-600' },
            held_in_escrow: { variant: 'default' as const, color: 'text-orange-600' },
            released_to_technician: { variant: 'default' as const, color: 'text-green-600' },
            refunded: { variant: 'destructive' as const, color: 'text-red-600' },
            failed: { variant: 'destructive' as const, color: 'text-red-600' },
            cancelled: { variant: 'destructive' as const, color: 'text-red-600' },
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <Badge variant={config.variant} className={config.color}>
                {status.replace('_', ' ').toUpperCase()}
            </Badge>
        );
    };

    const getRatingStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
            />
        ));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Platform Oversight</h2>
                    <p className="text-gray-600">Monitor service requests, payments, and reviews</p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-2">
                    <TabsList className="grid w-full grid-cols-3 bg-transparent">
                        <TabsTrigger value="requests" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl">
                            <div className="flex items-center space-x-2">
                                <ClipboardList className="w-4 h-4" />
                                <span>Service Requests</span>
                            </div>
                        </TabsTrigger>
                        <TabsTrigger value="transactions" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl">
                            <div className="flex items-center space-x-2">
                                <CreditCard className="w-4 h-4" />
                                <span>Payments</span>
                            </div>
                        </TabsTrigger>
                        <TabsTrigger value="reviews" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl">
                            <div className="flex items-center space-x-2">
                                <Star className="w-4 h-4" />
                                <span>Reviews</span>
                            </div>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="requests" className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <span className="text-red-800">{error}</span>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600">Loading requests...</span>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {requests.map((request) => (
                                <Card key={request.request_id} className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <ClipboardList className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">Request #{request.request_id.slice(-8)}</h3>
                                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>{format(new Date(request.created_at), 'MMM dd, yyyy HH:mm')}</span>
                                                        {getStatusBadge(request.status)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {request.total_cost ? `${request.total_cost.toLocaleString()} FCFA` : 'TBD'}
                                                </div>
                                                <div className="text-sm text-gray-600">Total Cost</div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div className="flex items-center space-x-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-600">Client:</span>
                                                <span className="font-medium">{request.client_id}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-600">Technician:</span>
                                                <span className="font-medium">{request.technician_id}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-600">Location:</span>
                                                <span className="font-medium">{request.job_address}</span>
                                            </div>
                                        </div>
                                        {request.problem_description && (
                                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-700">{request.problem_description}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {!isLoading && requests.length === 0 && (
                        <div className="text-center py-12">
                            <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No service requests found</h3>
                            <p className="text-gray-600">Service requests will appear here as they are created.</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="transactions" className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <span className="text-red-800">{error}</span>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600">Loading transactions...</span>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {transactions.map((transaction) => (
                                <Card key={transaction.transaction_id} className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                    <CreditCard className="w-5 h-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">Transaction #{transaction.transaction_id.slice(-8)}</h3>
                                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>{format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}</span>
                                                        {getPaymentStatusBadge(transaction.status)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {transaction.amount.toLocaleString()} {transaction.currency}
                                                </div>
                                                <div className="text-sm text-gray-600 capitalize">
                                                    {transaction.payment_method.replace('_', ' ')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div className="flex items-center space-x-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-600">Client:</span>
                                                <span className="font-medium">{transaction.client_id}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-600">Technician:</span>
                                                <span className="font-medium">{transaction.technician_id}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <ClipboardList className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-600">Service Request:</span>
                                                <span className="font-medium">{transaction.service_request_id.slice(-8)}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {!isLoading && transactions.length === 0 && (
                        <div className="text-center py-12">
                            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No payment transactions found</h3>
                            <p className="text-gray-600">Payment transactions will appear here as they are processed.</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="reviews" className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <span className="text-red-800">{error}</span>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600">Loading reviews...</span>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {reviews.map((review) => (
                                <Card key={review.review_id} className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                                    <Star className="w-5 h-5 text-yellow-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="flex space-x-1">
                                                            {getRatingStars(review.rating)}
                                                        </div>
                                                        <span className="text-sm text-gray-600">({review.rating}/5)</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>{format(new Date(review.created_at), 'MMM dd, yyyy')}</span>
                                                        {review.is_verified && (
                                                            <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                                                Verified
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {review.comment && (
                                            <div className="p-3 bg-gray-50 rounded-lg mb-4">
                                                <p className="text-sm text-gray-700">{review.comment}</p>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div className="flex items-center space-x-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-600">Client:</span>
                                                <span className="font-medium">{review.client_id}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-600">Technician:</span>
                                                <span className="font-medium">{review.technician_id}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <ClipboardList className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-600">Service Request:</span>
                                                <span className="font-medium">{review.service_request_id.slice(-8)}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {!isLoading && reviews.length === 0 && (
                        <div className="text-center py-12">
                            <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
                            <p className="text-gray-600">Reviews will appear here as they are submitted.</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
