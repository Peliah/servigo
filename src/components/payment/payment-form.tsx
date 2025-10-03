'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PaymentApiSimulation } from '@/lib/payment-api-simulation';
import { PaymentMethod } from '@/schemas/payment-schema';
import { ServiceRequest } from '@/schemas/service-request-schema';
import { Technician } from '@/schemas/user-schema';
import {
    CreditCard,
    Smartphone,
    Banknote,
    Building2,
    Lock,
    CheckCircle,
    AlertCircle,
    Loader2,
    Shield
} from 'lucide-react';

interface PaymentFormProps {
    serviceRequest: ServiceRequest;
    technician: Technician;
    onSuccess: (transactionId: string) => void;
    onCancel: () => void;
}

export function PaymentForm({ serviceRequest, technician, onSuccess, onCancel }: PaymentFormProps) {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState<'method' | 'details' | 'processing' | 'success'>('method');

    // Payment method details
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });

    const [mobileMoneyDetails, setMobileMoneyDetails] = useState({
        provider: 'mtn',
        number: ''
    });

    const handlePayment = async () => {
        setIsProcessing(true);
        setError('');

        try {
            // Create payment intent
            const intentResponse = await PaymentApiSimulation.createPaymentIntent(
                serviceRequest.request_id,
                serviceRequest.total_cost || 0
            );

            if (!intentResponse.success) {
                throw new Error(intentResponse.error || 'Failed to create payment intent');
            }

            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Process payment
            const paymentResponse = await PaymentApiSimulation.processPayment(
                serviceRequest.request_id,
                serviceRequest.total_cost || 0,
                paymentMethod,
                `gw_${Date.now()}`
            );

            if (!paymentResponse.success) {
                throw new Error(paymentResponse.error || 'Payment failed');
            }

            setStep('success');
            onSuccess(paymentResponse.data!.transaction_id);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment failed');
            setStep('method');
        } finally {
            setIsProcessing(false);
        }
    };

    const getPaymentMethodIcon = (method: PaymentMethod) => {
        switch (method) {
            case 'card': return <CreditCard className="w-5 h-5" />;
            case 'mobile_money': return <Smartphone className="w-5 h-5" />;
            case 'cash': return <Banknote className="w-5 h-5" />;
            case 'bank_transfer': return <Building2 className="w-5 h-5" />;
            default: return <CreditCard className="w-5 h-5" />;
        }
    };

    const renderPaymentDetails = () => {
        switch (paymentMethod) {
            case 'card':
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="cardName">Cardholder Name</Label>
                            <Input
                                id="cardName"
                                placeholder="John Doe"
                                value={cardDetails.name}
                                onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input
                                id="cardNumber"
                                placeholder="1234 5678 9012 3456"
                                value={cardDetails.number}
                                onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="expiry">Expiry Date</Label>
                                <Input
                                    id="expiry"
                                    placeholder="MM/YY"
                                    value={cardDetails.expiry}
                                    onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cvv">CVV</Label>
                                <Input
                                    id="cvv"
                                    placeholder="123"
                                    value={cardDetails.cvv}
                                    onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'mobile_money':
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="provider">Provider</Label>
                            <Select value={mobileMoneyDetails.provider} onValueChange={(value) => setMobileMoneyDetails(prev => ({ ...prev, provider: value }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                                    <SelectItem value="orange">Orange Money</SelectItem>
                                    <SelectItem value="express">Express Union Mobile</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mobileNumber">Mobile Number</Label>
                            <Input
                                id="mobileNumber"
                                placeholder="+237 6XX XXX XXX"
                                value={mobileMoneyDetails.number}
                                onChange={(e) => setMobileMoneyDetails(prev => ({ ...prev, number: e.target.value }))}
                            />
                        </div>
                    </div>
                );

            case 'cash':
                return (
                    <div className="text-center py-8">
                        <Banknote className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Cash Payment</h3>
                        <p className="text-gray-600">
                            You will pay the technician in cash when the service is completed.
                        </p>
                    </div>
                );

            case 'bank_transfer':
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">Bank Transfer Details</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-blue-700">Account Name:</span>
                                    <span className="font-medium">Servigo Escrow Account</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-blue-700">Account Number:</span>
                                    <span className="font-medium">1234567890</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-blue-700">Bank:</span>
                                    <span className="font-medium">Afriland First Bank</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-blue-700">Reference:</span>
                                    <span className="font-medium">{serviceRequest.request_id}</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">
                            Please include the reference number in your transfer description.
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    if (step === 'success') {
        return (
            <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
                <p className="text-gray-600 mb-6">
                    Your payment has been processed and is being held in escrow.
                </p>
                <div className="bg-green-50 p-4 rounded-lg mb-6">
                    <div className="flex items-center justify-center space-x-2 text-green-700">
                        <Shield className="w-5 h-5" />
                        <span className="font-medium">Funds Protected</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                        Your payment will be released to the technician after service completion.
                    </p>
                </div>
                <Button onClick={onCancel} className="w-full">
                    Close
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Service Details */}
            <Card className="bg-gray-50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Service Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Technician:</span>
                        <span className="font-medium">{technician.first_name} {technician.last_name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Service Date:</span>
                        <span className="font-medium">{new Date(serviceRequest.preferred_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Service Time:</span>
                        <span className="font-medium">{serviceRequest.preferred_time}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                        <span>Total Amount:</span>
                        <span className="text-blue-600">{(serviceRequest.total_cost || 0).toLocaleString()} FCFA</span>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Method Selection */}
            {step === 'method' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Lock className="w-5 h-5 text-blue-600" />
                            <span>Select Payment Method</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {(['card', 'mobile_money', 'cash', 'bank_transfer'] as PaymentMethod[]).map((method) => (
                                <Button
                                    key={method}
                                    variant={paymentMethod === method ? 'default' : 'outline'}
                                    className="h-16 flex flex-col items-center justify-center space-y-2"
                                    onClick={() => setPaymentMethod(method)}
                                >
                                    {getPaymentMethodIcon(method)}
                                    <span className="text-sm capitalize">{method.replace('_', ' ')}</span>
                                </Button>
                            ))}
                        </div>

                        {error && (
                            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                                <AlertCircle className="w-5 h-5" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <div className="flex space-x-3">
                            <Button onClick={onCancel} variant="outline" className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={() => setStep('details')} className="flex-1">
                                Continue
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Payment Details */}
            {step === 'details' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            {getPaymentMethodIcon(paymentMethod)}
                            <span>Payment Details</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {renderPaymentDetails()}

                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2 text-blue-700 mb-2">
                                <Shield className="w-5 h-5" />
                                <span className="font-medium">Escrow Protection</span>
                            </div>
                            <p className="text-sm text-blue-600">
                                Your payment is protected. Funds will be released to the technician only after service completion.
                            </p>
                        </div>

                        <div className="flex space-x-3">
                            <Button onClick={() => setStep('method')} variant="outline" className="flex-1">
                                Back
                            </Button>
                            <Button onClick={handlePayment} className="flex-1" disabled={isProcessing}>
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    `Pay ${(serviceRequest.total_cost || 0).toLocaleString()} FCFA`
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Processing */}
            {step === 'processing' && (
                <Card>
                    <CardContent className="text-center py-8">
                        <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment...</h3>
                        <p className="text-gray-600">
                            Please wait while we process your payment securely.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
