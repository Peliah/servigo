import { PaymentTransaction, PaymentStatus, PaymentMethod, PaymentIntent } from '@/schemas/payment-schema';
import { ServiceRequest } from '@/schemas/service-request-schema';
import { ApiResponse } from './mock-api';

// Simulate network delay
const simulateNetworkDelay = (min = 300, max = 800) => {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
};

export interface PaymentFilters {
    service_request_id?: string;
    client_id?: string;
    technician_id?: string;
    status?: PaymentStatus;
    payment_method?: PaymentMethod;
    date_from?: Date;
    date_to?: Date;
    pagination?: {
        page: number;
        limit: number;
    };
}

export interface PaymentResponse {
    success: boolean;
    data?: PaymentTransaction[];
    error?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export class PaymentApiSimulation {
    // Create payment intent for escrow
    static async createPaymentIntent(
        serviceRequestId: string,
        amount: number
    ): Promise<ApiResponse<PaymentIntent>> {
        await simulateNetworkDelay();

        try {
            // Simulate payment gateway response
            const clientSecret = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const paymentIntent: PaymentIntent = {
                intent_id: `intent_${Date.now()}`,
                transaction_id: `txn_${Date.now()}`,
                amount,
                currency: 'FCFA',
                client_secret: clientSecret,
                status: 'requires_payment_method',
                created_at: new Date(),
            };

            return {
                success: true,
                data: paymentIntent,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create payment intent',
            };
        }
    }

    // Process payment and hold in escrow
    static async processPayment(
        serviceRequestId: string,
        amount: number,
        paymentMethod: PaymentMethod,
        gatewayTransactionId?: string
    ): Promise<ApiResponse<PaymentTransaction>> {
        await simulateNetworkDelay();

        try {
            // Get service request details from localStorage
            const requests = JSON.parse(localStorage.getItem('servigo_service_requests') || '[]');
            const serviceRequest = requests.find((r: ServiceRequest) => r.request_id === serviceRequestId);

            if (!serviceRequest) {
                return {
                    success: false,
                    error: 'Service request not found',
                };
            }

            // Create payment transaction
            const transaction: PaymentTransaction = {
                transaction_id: `txn_${Date.now()}`,
                service_request_id: serviceRequestId,
                client_id: serviceRequest.client_id,
                technician_id: serviceRequest.technician_id,
                amount,
                currency: 'FCFA',
                payment_method: paymentMethod,
                status: 'held_in_escrow',
                gateway_transaction_id: gatewayTransactionId || `gw_${Date.now()}`,
                gateway_response: {
                    status: 'succeeded',
                    transaction_id: gatewayTransactionId || `gw_${Date.now()}`,
                    amount: amount,
                    currency: 'FCFA',
                },
                created_at: new Date(),
                updated_at: new Date(),
            };

            // Store in localStorage
            const existingTransactions = JSON.parse(localStorage.getItem('servigo_payments') || '[]');
            existingTransactions.push(transaction);
            localStorage.setItem('servigo_payments', JSON.stringify(existingTransactions));

            return {
                success: true,
                data: transaction,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to process payment',
            };
        }
    }

    // Release payment to technician
    static async releasePayment(transactionId: string): Promise<ApiResponse<PaymentTransaction>> {
        await simulateNetworkDelay();

        try {
            const transactions = JSON.parse(localStorage.getItem('servigo_payments') || '[]');
            const transactionIndex = transactions.findIndex((t: PaymentTransaction) => t.transaction_id === transactionId);

            if (transactionIndex === -1) {
                return {
                    success: false,
                    error: 'Payment transaction not found',
                };
            }

            // Update transaction status
            transactions[transactionIndex] = {
                ...transactions[transactionIndex],
                status: 'released_to_technician',
                released_at: new Date(),
                updated_at: new Date(),
            };

            localStorage.setItem('servigo_payments', JSON.stringify(transactions));

            return {
                success: true,
                data: transactions[transactionIndex],
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to release payment',
            };
        }
    }

    // Refund payment
    static async refundPayment(
        transactionId: string,
        refundAmount: number,
        reason: string
    ): Promise<ApiResponse<PaymentTransaction>> {
        await simulateNetworkDelay();

        try {
            const transactions = JSON.parse(localStorage.getItem('servigo_payments') || '[]');
            const transactionIndex = transactions.findIndex((t: PaymentTransaction) => t.transaction_id === transactionId);

            if (transactionIndex === -1) {
                return {
                    success: false,
                    error: 'Payment transaction not found',
                };
            }

            // Update transaction status
            transactions[transactionIndex] = {
                ...transactions[transactionIndex],
                status: 'refunded',
                refund_amount: refundAmount,
                refund_reason: reason,
                refunded_at: new Date(),
                updated_at: new Date(),
            };

            localStorage.setItem('servigo_payments', JSON.stringify(transactions));

            return {
                success: true,
                data: transactions[transactionIndex],
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to refund payment',
            };
        }
    }

    // Get payment transactions with filters
    static async getPaymentTransactions(filters: PaymentFilters = {}): Promise<PaymentResponse> {
        await simulateNetworkDelay();

        try {
            const transactions = JSON.parse(localStorage.getItem('servigo_payments') || '[]');

            // Apply filters
            const filteredTransactions = transactions.filter((transaction: PaymentTransaction) => {
                if (filters.service_request_id && transaction.service_request_id !== filters.service_request_id) return false;
                if (filters.client_id && transaction.client_id !== filters.client_id) return false;
                if (filters.technician_id && transaction.technician_id !== filters.technician_id) return false;
                if (filters.status && transaction.status !== filters.status) return false;
                if (filters.payment_method && transaction.payment_method !== filters.payment_method) return false;
                if (filters.date_from && transaction.created_at < filters.date_from) return false;
                if (filters.date_to && transaction.created_at > filters.date_to) return false;
                return true;
            });

            // Sort by created_at (newest first)
            filteredTransactions.sort((a: PaymentTransaction, b: PaymentTransaction) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            // Apply pagination
            const page = filters.pagination?.page || 1;
            const limit = filters.pagination?.limit || 20;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

            return {
                success: true,
                data: paginatedTransactions,
                pagination: {
                    page,
                    limit,
                    total: filteredTransactions.length,
                    totalPages: Math.ceil(filteredTransactions.length / limit),
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get payment transactions',
            };
        }
    }

    // Get payment transaction by ID
    static async getPaymentTransaction(transactionId: string): Promise<ApiResponse<PaymentTransaction>> {
        await simulateNetworkDelay();

        try {
            const transactions = JSON.parse(localStorage.getItem('servigo_payments') || '[]');
            const transaction = transactions.find((t: PaymentTransaction) => t.transaction_id === transactionId);

            if (!transaction) {
                return {
                    success: false,
                    error: 'Payment transaction not found',
                };
            }

            return {
                success: true,
                data: transaction,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get payment transaction',
            };
        }
    }
}

