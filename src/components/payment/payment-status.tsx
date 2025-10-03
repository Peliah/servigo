'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentApiSimulation, PaymentFilters } from '@/lib/payment-api-simulation';
import { PaymentTransaction, PaymentStatus as PaymentStatusType } from '@/schemas/payment-schema';
import { Technician } from '@/schemas/user-schema';
import {
    CreditCard,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    DollarSign,
    Loader2,
    Shield,
    ArrowUpRight
} from 'lucide-react';
import { format } from 'date-fns';

interface PaymentStatusProps {
    technician: Technician;
}

export function PaymentStatus({ technician }: PaymentStatusProps) {
    const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const loadTransactions = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const filters: PaymentFilters = {
                technician_id: technician.user_id,
                pagination: { page: 1, limit: 10 }
            };

            const response = await PaymentApiSimulation.getPaymentTransactions(filters);

            if (response.success && response.data) {
                setTransactions(response.data);
            } else {
                setError(response.error || 'Failed to load transactions');
            }
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [technician.user_id]);

    useEffect(() => {
        loadTransactions();
    }, [technician.user_id, loadTransactions]);

    const handleReleasePayment = async (transactionId: string) => {
        try {
            const response = await PaymentApiSimulation.releasePayment(transactionId);

            if (response.success) {
                // Reload transactions
                await loadTransactions();
            } else {
                setError(response.error || 'Failed to release payment');
            }
        } catch {
            setError('Failed to release payment');
        }
    };

    const getStatusIcon = (status: PaymentStatusType) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'processing': return <Loader2 className="w-4 h-4 animate-spin" />;
            case 'held_in_escrow': return <Shield className="w-4 h-4" />;
            case 'released_to_technician': return <CheckCircle className="w-4 h-4" />;
            case 'refunded': return <ArrowUpRight className="w-4 h-4" />;
            case 'failed': return <XCircle className="w-4 h-4" />;
            case 'cancelled': return <XCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: PaymentStatusType) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'held_in_escrow': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'released_to_technician': return 'bg-green-100 text-green-800 border-green-200';
            case 'refunded': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'failed': return 'bg-red-100 text-red-800 border-red-200';
            case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPaymentMethodIcon = (method: string) => {
        switch (method) {
            case 'card': return <CreditCard className="w-4 h-4" />;
            case 'mobile_money': return <DollarSign className="w-4 h-4" />;
            case 'cash': return <DollarSign className="w-4 h-4" />;
            case 'bank_transfer': return <DollarSign className="w-4 h-4" />;
            default: return <DollarSign className="w-4 h-4" />;
        }
    };

    // Calculate totals
    const totalEarnings = transactions
        .filter(t => t.status === 'released_to_technician')
        .reduce((sum, t) => sum + t.amount, 0);

    const pendingAmount = transactions
        .filter(t => t.status === 'held_in_escrow')
        .reduce((sum, t) => sum + t.amount, 0);

    const refundedAmount = transactions
        .filter(t => t.status === 'refunded')
        .reduce((sum, t) => sum + (t.refund_amount || 0), 0);

    if (isLoading) {
        return (
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                <CardContent className="p-6">
                    <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
                        <p className="text-gray-600">Loading payment status...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Payment Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                                <p className="text-2xl font-bold text-green-600">{totalEarnings.toLocaleString()} FCFA</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Release</p>
                                <p className="text-2xl font-bold text-purple-600">{pendingAmount.toLocaleString()} FCFA</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Shield className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Refunded</p>
                                <p className="text-2xl font-bold text-orange-600">{refundedAmount.toLocaleString()} FCFA</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                <ArrowUpRight className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <span>Recent Transactions</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg mb-4">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {transactions.length === 0 ? (
                        <div className="text-center py-8">
                            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No transactions yet</p>
                            <p className="text-sm text-gray-400">Your payment transactions will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {transactions.map((transaction) => (
                                <div
                                    key={transaction.transaction_id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            {getPaymentMethodIcon(transaction.payment_method)}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2 mb-1">
                                                <Badge className={getStatusColor(transaction.status)}>
                                                    <div className="flex items-center space-x-1">
                                                        {getStatusIcon(transaction.status)}
                                                        <span>{transaction.status.replace('_', ' ')}</span>
                                                    </div>
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {format(new Date(transaction.created_at), 'MMM d, yyyy • h:mm a')}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Transaction ID: {transaction.transaction_id.slice(-8)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-lg font-semibold text-gray-900">
                                            {transaction.amount.toLocaleString()} FCFA
                                        </p>
                                        {transaction.status === 'held_in_escrow' && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleReleasePayment(transaction.transaction_id)}
                                                className="mt-2 bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                Release Payment
                                            </Button>
                                        )}
                                        {transaction.status === 'released_to_technician' && (
                                            <p className="text-xs text-green-600 mt-1">
                                                Released {transaction.released_at && format(new Date(transaction.released_at), 'MMM d')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
