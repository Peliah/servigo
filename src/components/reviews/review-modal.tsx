'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ReviewApiSimulation } from '@/lib/review-api-simulation';
import { ServiceRequest } from '@/schemas/service-request-schema';
import { Technician } from '@/schemas/user-schema';
import { useAuthStore } from '@/stores/auth-store';
import {
    Star,
    Loader2,
    CheckCircle,
    AlertCircle,
    User,
    Calendar,
    DollarSign
} from 'lucide-react';
import { format } from 'date-fns';

interface ReviewModalProps {
    serviceRequest: ServiceRequest;
    technician: Technician;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function ReviewModal({ serviceRequest, technician, isOpen, onClose, onSuccess }: ReviewModalProps) {
    const { user } = useAuthStore();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        if (!user || user.user_type !== 'client') {
            setError('Only clients can submit reviews');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await ReviewApiSimulation.submitReview({
                service_request_id: serviceRequest.request_id,
                client_id: user.user_id,
                technician_id: technician.user_id,
                rating,
                comment: comment.trim() || undefined,
                is_verified: false,
                is_featured: false,
                helpful_count: 0,
            });

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess?.();
                    onClose();
                }, 2000);
            } else {
                setError(response.error || 'Failed to submit review');
            }
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setRating(0);
            setComment('');
            setError('');
            setSuccess(false);
            onClose();
        }
    };

    const renderStars = () => {
        return (
            <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        disabled={isSubmitting}
                        className={`transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-300'
                            } hover:text-yellow-400 disabled:opacity-50`}
                    >
                        <Star className="w-8 h-8 fill-current" />
                    </button>
                ))}
            </div>
        );
    };

    const getRatingText = (rating: number) => {
        switch (rating) {
            case 1: return 'Poor';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Very Good';
            case 5: return 'Excellent';
            default: return 'Select Rating';
        }
    };

    if (success) {
        return (
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center">Review Submitted!</DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank You!</h3>
                        <p className="text-gray-600">
                            Your review has been submitted successfully and will help other clients make informed decisions.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <span>Rate Your Experience</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Service Request Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Service Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Technician:</span>
                                <span className="font-medium">{technician.first_name} {technician.last_name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Date:</span>
                                <span className="font-medium">{format(new Date(serviceRequest.preferred_date), 'PPP')}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Time:</span>
                                <span className="font-medium">{serviceRequest.preferred_time}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <DollarSign className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Cost:</span>
                                <span className="font-medium">{(serviceRequest.total_cost || 0).toLocaleString()} FCFA</span>
                            </div>
                        </div>
                        {technician.business_name && (
                            <div className="mt-3">
                                <Badge variant="outline" className="text-xs">
                                    {technician.business_name}
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Rating Section */}
                    <div className="space-y-4">
                        <div>
                            <Label className="text-base font-medium">Overall Rating *</Label>
                            <div className="mt-2">
                                {renderStars()}
                                <p className="text-sm text-gray-600 mt-2">
                                    {getRatingText(rating)}
                                </p>
                            </div>
                        </div>

                        {/* Comment Section */}
                        <div>
                            <Label htmlFor="comment" className="text-base font-medium">
                                Share Your Experience (Optional)
                            </Label>
                            <Textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Tell others about your experience with this technician..."
                                className="mt-2 min-h-[100px]"
                                disabled={isSubmitting}
                                maxLength={500}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {comment.length}/500 characters
                            </p>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                        <Button
                            onClick={handleClose}
                            variant="outline"
                            className="flex-1"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={rating === 0 || isSubmitting}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Star className="w-4 h-4 mr-2" />
                                    Submit Review
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Review Guidelines */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-medium text-blue-900 mb-2">Review Guidelines</h5>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Be honest and constructive in your feedback</li>
                            <li>• Focus on the service quality and technician&apos;s professionalism</li>
                            <li>• Your review will be visible to other clients</li>
                            <li>• Reviews help maintain quality standards in our community</li>
                        </ul>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}