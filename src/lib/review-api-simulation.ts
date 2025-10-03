import { Review, ReviewStats } from '@/schemas/review-schema';
import { ServiceRequest } from '@/schemas/service-request-schema';
import { ApiResponse } from './mock-api';

// Simulate network delay
const simulateNetworkDelay = (min = 300, max = 800) => {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
};

export interface ReviewFilters {
    technician_id?: string;
    client_id?: string;
    service_request_id?: string;
    rating?: number;
    is_verified?: boolean;
    pagination?: {
        page: number;
        limit: number;
    };
}

export interface ReviewResponse {
    success: boolean;
    data?: Review[];
    error?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export class ReviewApiSimulation {
    // Submit a review
    static async submitReview(reviewData: Omit<Review, 'review_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Review>> {
        await simulateNetworkDelay();

        try {
            // Check if review already exists for this service request
            const existingReviews = JSON.parse(localStorage.getItem('servigo_reviews') || '[]');
            const existingReview = existingReviews.find((r: Review) =>
                r.service_request_id === reviewData.service_request_id
            );

            if (existingReview) {
                return {
                    success: false,
                    error: 'Review already exists for this service request',
                };
            }

            // Verify the service request is completed
            const requests = JSON.parse(localStorage.getItem('servigo_service_requests') || '[]');
            const serviceRequest = requests.find((r: ServiceRequest) => r.request_id === reviewData.service_request_id);

            if (!serviceRequest) {
                return {
                    success: false,
                    error: 'Service request not found',
                };
            }

            if (serviceRequest.status !== 'completed') {
                return {
                    success: false,
                    error: 'Can only review completed services',
                };
            }

            const review: Review = {
                ...reviewData,
                review_id: `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                is_verified: true, // Auto-verify for simulation
                created_at: new Date(),
                updated_at: new Date(),
            };

            existingReviews.push(review);
            localStorage.setItem('servigo_reviews', JSON.stringify(existingReviews));

            return {
                success: true,
                data: review,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to submit review',
            };
        }
    }

    // Get reviews for a technician
    static async getTechnicianReviews(technicianId: string, filters: ReviewFilters = {}): Promise<ReviewResponse> {
        await simulateNetworkDelay();

        try {
            const reviews = JSON.parse(localStorage.getItem('servigo_reviews') || '[]');

            // Filter by technician
            let filteredReviews = reviews.filter((review: Review) => review.technician_id === technicianId);

            // Apply additional filters
            if (filters.rating) {
                filteredReviews = filteredReviews.filter((review: Review) => review.rating === filters.rating);
            }
            if (filters.is_verified !== undefined) {
                filteredReviews = filteredReviews.filter((review: Review) => review.is_verified === filters.is_verified);
            }

            // Sort by created_at (newest first)
            filteredReviews.sort((a: Review, b: Review) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            // Apply pagination
            const page = filters.pagination?.page || 1;
            const limit = filters.pagination?.limit || 20;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

            return {
                success: true,
                data: paginatedReviews,
                pagination: {
                    page,
                    limit,
                    total: filteredReviews.length,
                    totalPages: Math.ceil(filteredReviews.length / limit),
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get technician reviews',
            };
        }
    }

    // Get review statistics for a technician
    static async getTechnicianReviewStats(technicianId: string): Promise<ApiResponse<ReviewStats>> {
        await simulateNetworkDelay();

        try {
            const reviews = JSON.parse(localStorage.getItem('servigo_reviews') || '[]');
            const technicianReviews = reviews.filter((review: Review) => review.technician_id === technicianId);

            if (technicianReviews.length === 0) {
                return {
                    success: true,
                    data: {
                        technician_id: technicianId,
                        total_reviews: 0,
                        average_rating: 0,
                        rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                        recent_reviews: [],
                    },
                };
            }

            // Calculate statistics
            const totalReviews = technicianReviews.length;
            const averageRating = technicianReviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / totalReviews;

            // Rating distribution
            const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            technicianReviews.forEach((review: Review) => {
                ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
            });

            // Recent reviews (last 5)
            const recentReviews = technicianReviews
                .sort((a: Review, b: Review) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5);

            const stats: ReviewStats = {
                technician_id: technicianId,
                total_reviews: totalReviews,
                average_rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
                rating_distribution: ratingDistribution,
                recent_reviews: recentReviews,
            };

            return {
                success: true,
                data: stats,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get review statistics',
            };
        }
    }

    // Get reviews by client
    static async getClientReviews(clientId: string, filters: ReviewFilters = {}): Promise<ReviewResponse> {
        await simulateNetworkDelay();

        try {
            const reviews = JSON.parse(localStorage.getItem('servigo_reviews') || '[]');

            // Filter by client
            let filteredReviews = reviews.filter((review: Review) => review.client_id === clientId);

            // Apply additional filters
            if (filters.technician_id) {
                filteredReviews = filteredReviews.filter((review: Review) => review.technician_id === filters.technician_id);
            }
            if (filters.rating) {
                filteredReviews = filteredReviews.filter((review: Review) => review.rating === filters.rating);
            }

            // Sort by created_at (newest first)
            filteredReviews.sort((a: Review, b: Review) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            // Apply pagination
            const page = filters.pagination?.page || 1;
            const limit = filters.pagination?.limit || 20;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

            return {
                success: true,
                data: paginatedReviews,
                pagination: {
                    page,
                    limit,
                    total: filteredReviews.length,
                    totalPages: Math.ceil(filteredReviews.length / limit),
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get client reviews',
            };
        }
    }

    // Update review (for technician response)
    static async updateReview(reviewId: string, updates: Partial<Review>): Promise<ApiResponse<Review>> {
        await simulateNetworkDelay();

        try {
            const reviews = JSON.parse(localStorage.getItem('servigo_reviews') || '[]');
            const reviewIndex = reviews.findIndex((r: Review) => r.review_id === reviewId);

            if (reviewIndex === -1) {
                return {
                    success: false,
                    error: 'Review not found',
                };
            }

            // Update review
            reviews[reviewIndex] = {
                ...reviews[reviewIndex],
                ...updates,
                updated_at: new Date(),
            };

            localStorage.setItem('servigo_reviews', JSON.stringify(reviews));

            return {
                success: true,
                data: reviews[reviewIndex],
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update review',
            };
        }
    }

    // Delete review
    static async deleteReview(reviewId: string): Promise<ApiResponse<void>> {
        await simulateNetworkDelay();

        try {
            const reviews = JSON.parse(localStorage.getItem('servigo_reviews') || '[]');
            const filteredReviews = reviews.filter((r: Review) => r.review_id !== reviewId);

            if (filteredReviews.length === reviews.length) {
                return {
                    success: false,
                    error: 'Review not found',
                };
            }

            localStorage.setItem('servigo_reviews', JSON.stringify(filteredReviews));

            return {
                success: true,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete review',
            };
        }
    }
}
