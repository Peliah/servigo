'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookingApiSimulation, AvailabilitySlot } from '@/lib/booking-api-simulation';
import { Technician } from '@/schemas/user-schema';
import { TechnicianService } from '@/schemas/technician-service-schema';
import { ServiceRequest } from '@/schemas/service-request-schema';
import { PaymentForm } from '@/components/payment/payment-form';
import { useAuthStore } from '@/stores/auth-store';
import { format } from 'date-fns';
import { CalendarIcon, Clock, MapPin, DollarSign, AlertCircle, CheckCircle, CreditCard, Loader2 } from 'lucide-react';

interface BookingFormProps {
    technician: Technician;
    onSuccess?: (requestId: string) => void;
    onCancel?: () => void;
}

export function BookingForm({ technician, onSuccess, onCancel }: BookingFormProps) {
    const { user } = useAuthStore();
    const [selectedService, setSelectedService] = useState<TechnicianService | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
    const [services, setServices] = useState<TechnicianService[]>([]);
    const [jobAddress, setJobAddress] = useState('');
    const [problemDescription, setProblemDescription] = useState('');
    const [estimatedDuration, setEstimatedDuration] = useState(60);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPayment, setShowPayment] = useState(false);
    const [createdRequest, setCreatedRequest] = useState<ServiceRequest | null>(null);

    // Load technician's services
    useEffect(() => {
        const loadServices = async () => {
            try {
                const { DUMMY_SERVICES } = await import('@/data/dummy-services');
                const techServices = DUMMY_SERVICES.filter(s =>
                    s.technician_id === technician.user_id && s.is_active
                );
                setServices(techServices);
            } catch (error) {
                console.error('Failed to load services:', error);
            }
        };

        loadServices();
    }, [technician.user_id]);

    // Load availability when date is selected
    useEffect(() => {
        if (selectedDate) {
            const loadAvailability = async () => {
                try {
                    const dateString = format(selectedDate, 'yyyy-MM-dd');
                    const response = await BookingApiSimulation.getTechnicianAvailability(
                        technician.user_id,
                        dateString
                    );

                    if (response.success && response.data) {
                        setAvailableSlots(response.data);
                    }
                } catch (error) {
                    console.error('Failed to load availability:', error);
                }
            };

            loadAvailability();
        }
    }, [selectedDate, technician.user_id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || user.user_type !== 'client') {
            setError('You must be logged in as a client to make bookings');
            return;
        }

        if (!selectedService || !selectedDate || !selectedTime || !jobAddress || !problemDescription) {
            setError('Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await BookingApiSimulation.createServiceRequest({
                client_id: user.user_id,
                technician_id: technician.user_id,
                service_id: selectedService.service_id,
                preferred_date: selectedDate,
                preferred_time: selectedTime,
                job_address: jobAddress,
                problem_description: problemDescription,
                estimated_duration: estimatedDuration,
            });

            if (response.success && response.data) {
                setCreatedRequest(response.data);
                setShowPayment(true);
            } else {
                setError(response.error || 'Failed to create booking request');
            }
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const calculateTotalCost = () => {
        if (!selectedService) return 0;
        return (selectedService.base_service_fee_estimate || 0) + (selectedService.transport_fee || 0);
    };

    const handlePaymentSuccess = () => {
        setSuccess('Booking request submitted and payment processed successfully!');
        setTimeout(() => {
            onSuccess?.(createdRequest!.request_id);
        }, 2000);
    };

    const handlePaymentCancel = () => {
        setShowPayment(false);
        setCreatedRequest(null);
    };

    return (
        <Dialog open={true} onOpenChange={onCancel}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span>Book Service with {technician.first_name} {technician.last_name}</span>
                    </DialogTitle>
                    <p className="text-sm text-gray-600">
                        {technician.business_name} • {technician.years_of_experience} years experience
                    </p>
                </DialogHeader>
                <div className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Service Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="service">Select Service *</Label>
                            <Select
                                value={selectedService?.service_id || ''}
                                onValueChange={(value) => {
                                    const service = services.find(s => s.service_id === value);
                                    setSelectedService(service || null);
                                }}
                            >
                                <SelectTrigger className="bg-white/80 border-gray-200">
                                    <SelectValue placeholder="Choose a service" />
                                </SelectTrigger>
                                <SelectContent>
                                    {services.map(service => (
                                        <SelectItem key={service.service_id} value={service.service_id}>
                                            <div className="flex justify-between items-center w-full">
                                                <span>{service.service_title}</span>
                                                <span className="text-sm text-gray-500 ml-2">
                                                    {(service.base_service_fee_estimate || 0).toLocaleString()} FCFA
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Selection */}
                        <div className="space-y-2">
                            <Label>Select Date *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal bg-white/80 border-gray-200"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        disabled={(date) => date < new Date()}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Time Selection */}
                        {selectedDate && (
                            <div className="space-y-2">
                                <Label>Select Time *</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {availableSlots.map(slot => (
                                        <Button
                                            key={slot.time}
                                            type="button"
                                            variant={selectedTime === slot.time ? "default" : "outline"}
                                            disabled={!slot.available}
                                            onClick={() => setSelectedTime(slot.time)}
                                            className={`text-sm ${!slot.available
                                                ? 'opacity-50 cursor-not-allowed'
                                                : selectedTime === slot.time
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white/80 border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            {slot.time}
                                        </Button>
                                    ))}
                                </div>
                                {availableSlots.length === 0 && (
                                    <p className="text-sm text-gray-500">No available slots for this date</p>
                                )}
                            </div>
                        )}

                        {/* Job Address */}
                        <div className="space-y-2">
                            <Label htmlFor="address">Job Address *</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    id="address"
                                    value={jobAddress}
                                    onChange={(e) => setJobAddress(e.target.value)}
                                    placeholder="Enter the job location address"
                                    className="pl-10 bg-white/80 border-gray-200"
                                    required
                                />
                            </div>
                        </div>

                        {/* Problem Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Problem Description *</Label>
                            <Textarea
                                id="description"
                                value={problemDescription}
                                onChange={(e) => setProblemDescription(e.target.value)}
                                placeholder="Describe the problem or service needed"
                                className="bg-white/80 border-gray-200"
                                rows={4}
                                required
                            />
                        </div>

                        {/* Estimated Duration */}
                        <div className="space-y-2">
                            <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                            <Input
                                id="duration"
                                type="number"
                                value={estimatedDuration}
                                onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                                min="30"
                                max="480"
                                step="30"
                                className="bg-white/80 border-gray-200"
                            />
                        </div>

                        {/* Cost Summary */}
                        {selectedService && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                    <span className="font-medium">Cost Summary</span>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span>Service Fee:</span>
                                        <span>{(selectedService.base_service_fee_estimate || 0).toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Transport Fee:</span>
                                        <span>{(selectedService.transport_fee || 0).toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="flex justify-between font-medium border-t pt-1">
                                        <span>Total:</span>
                                        <span>{calculateTotalCost().toLocaleString()} FCFA</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm">{success}</span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                            <Button
                                type="submit"
                                disabled={isLoading || !selectedService || !selectedDate || !selectedTime}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Submit Booking & Pay
                                    </>
                                )}
                            </Button>
                            {onCancel && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onCancel}
                                    className="bg-white/80 border-gray-200 hover:bg-white"
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Payment Dialog */}
                <Dialog open={showPayment} onOpenChange={setShowPayment}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Complete Payment</DialogTitle>
                        </DialogHeader>
                        {createdRequest && (
                            <PaymentForm
                                serviceRequest={createdRequest}
                                technician={technician}
                                onSuccess={handlePaymentSuccess}
                                onCancel={handlePaymentCancel}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </DialogContent>
        </Dialog>
    );
}
