import { Technician } from '@/schemas/user-schema';
import { TechnicianService } from '@/schemas/technician-service-schema';
import { ServiceArea } from '@/schemas/location-schema';
import { ApiResponse } from './mock-api';

// Simulate network delay
const simulateNetworkDelay = (min = 300, max = 800) => {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
};

export interface SearchFilters {
    category_id?: string;
    location?: {
        city?: string;
        region?: string;
        coordinates?: { lat: number; lng: number };
        radius?: number; // km
    };
    availability?: {
        status: 'available_now' | 'available_today' | 'available_this_week';
        preferred_time?: string;
    };
    pricing?: {
        min_price?: number;
        max_price?: number;
    };
    experience?: {
        min_years?: number;
    };
    verified_only?: boolean;
    sort_by?: 'rating' | 'price' | 'experience' | 'distance';
    pagination?: {
        page: number;
        limit: number;
    };
}

export interface SearchResponse {
    success: boolean;
    data?: SearchResult[];
    error?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface SearchResult {
    technician: Technician;
    services: TechnicianService[];
    service_areas: ServiceArea[];
    distance_km?: number;
    average_rating?: number;
    total_reviews?: number;
    is_favorite?: boolean;
}

export class SearchApiSimulation {
    // Get all technicians with their services and service areas
    static async searchTechnicians(filters: SearchFilters = {}): Promise<SearchResponse> {
        await simulateNetworkDelay();

        try {
            // Import dummy data directly
            const { DUMMY_TECHNICIANS } = await import('@/data/dummy-users');
            const { DUMMY_SERVICES } = await import('@/data/dummy-services');

            const technicians = DUMMY_TECHNICIANS;
            const technicianServices = DUMMY_SERVICES;

            // Import service areas from dummy data
            const { DUMMY_SERVICE_AREAS } = await import('@/data/dummy-service-areas');
            const serviceAreas = DUMMY_SERVICE_AREAS;

            const results: SearchResult[] = [];

            // Filter technicians based on search criteria
            for (const technician of technicians) {
                const techServices = technicianServices.filter(s => s.technician_id === technician.user_id);
                const techServiceAreas = serviceAreas.filter(a => a.technician_id === technician.user_id);

                // Apply filters
                let shouldInclude = true;

                // Category filter
                if (filters.category_id) {
                    const hasMatchingService = techServices.some(s =>
                        s.category_id === filters.category_id && s.is_active
                    );
                    if (!hasMatchingService) shouldInclude = false;
                }

                // Location filter
                if (filters.location?.city) {
                    const servesLocation = techServiceAreas.some(a =>
                        a.city.toLowerCase().includes(filters.location!.city!.toLowerCase()) && a.is_active
                    );
                    if (!servesLocation) shouldInclude = false;
                }

                // Experience filter
                if (filters.experience?.min_years) {
                    if ((technician.years_of_experience || 0) < filters.experience.min_years) {
                        shouldInclude = false;
                    }
                }

                // Verified only filter
                if (filters.verified_only && !technician.identity_verified) {
                    shouldInclude = false;
                }

                // Availability filter
                if (filters.availability?.status && !technician.is_available) {
                    shouldInclude = false;
                }

                // Price filter
                if (filters.pricing?.min_price || filters.pricing?.max_price) {
                    const activeServices = techServices.filter(s => s.is_active);
                    const minServicePrice = Math.min(...activeServices.map(s => s.base_service_fee_estimate || 0));
                    const maxServicePrice = Math.max(...activeServices.map(s => s.base_service_fee_estimate || 0));

                    if (filters.pricing.min_price && minServicePrice < filters.pricing.min_price) {
                        shouldInclude = false;
                    }
                    if (filters.pricing.max_price && maxServicePrice > filters.pricing.max_price) {
                        shouldInclude = false;
                    }
                }

                if (shouldInclude) {
                    // Calculate distance if coordinates provided
                    let distance_km: number | undefined;
                    if (filters.location?.coordinates && techServiceAreas.length > 0) {
                        // Simple distance calculation (in real app, use proper geolocation)
                        distance_km = Math.random() * 50; // Mock distance
                    }

                    results.push({
                        technician,
                        services: techServices.filter(s => s.is_active),
                        service_areas: techServiceAreas.filter(a => a.is_active),
                        distance_km,
                        average_rating: 4.5 + Math.random() * 0.5, // Mock rating
                        total_reviews: Math.floor(Math.random() * 100), // Mock reviews
                        is_favorite: false, // Will be updated based on client's favorites
                    });
                }
            }

            // Sort results
            if (filters.sort_by) {
                switch (filters.sort_by) {
                    case 'rating':
                        results.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
                        break;
                    case 'price':
                        results.sort((a, b) => {
                            const aMinPrice = Math.min(...a.services.map(s => s.base_service_fee_estimate || 0));
                            const bMinPrice = Math.min(...b.services.map(s => s.base_service_fee_estimate || 0));
                            return aMinPrice - bMinPrice;
                        });
                        break;
                    case 'experience':
                        results.sort((a, b) => (b.technician.years_of_experience || 0) - (a.technician.years_of_experience || 0));
                        break;
                    case 'distance':
                        results.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
                        break;
                }
            }

            // Apply pagination
            const page = filters.pagination?.page || 1;
            const limit = filters.pagination?.limit || 20;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedResults = results.slice(startIndex, endIndex);

            return {
                success: true,
                data: paginatedResults,
                pagination: {
                    page,
                    limit,
                    total: results.length,
                    totalPages: Math.ceil(results.length / limit),
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Search failed',
            };
        }
    }

    // Get technician details for public profile
    static async getTechnicianProfile(technicianId: string): Promise<ApiResponse<SearchResult>> {
        await simulateNetworkDelay();

        try {
            // Import dummy data directly
            const { DUMMY_TECHNICIANS } = await import('@/data/dummy-users');
            const { DUMMY_SERVICES } = await import('@/data/dummy-services');

            const technician = DUMMY_TECHNICIANS.find(t => t.user_id === technicianId);

            if (!technician) {
                return {
                    success: false,
                    error: 'Technician not found',
                };
            }

            const technicianServices = DUMMY_SERVICES;

            // Import service areas from dummy data
            const { DUMMY_SERVICE_AREAS } = await import('@/data/dummy-service-areas');
            const serviceAreas = DUMMY_SERVICE_AREAS;

            const techServices = technicianServices.filter(s => s.technician_id === technicianId);
            const techServiceAreas = serviceAreas.filter(a => a.technician_id === technicianId);

            const result: SearchResult = {
                technician,
                services: techServices.filter(s => s.is_active),
                service_areas: techServiceAreas.filter(a => a.is_active),
                average_rating: 4.5 + Math.random() * 0.5,
                total_reviews: Math.floor(Math.random() * 100),
                is_favorite: false,
            };

            return {
                success: true,
                data: result,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get technician profile',
            };
        }
    }

    // Get search suggestions
    static async getSearchSuggestions(query: string): Promise<ApiResponse<{ suggestions: string[] }>> {
        await simulateNetworkDelay();

        try {
            // Mock suggestions based on common service categories and locations
            const categorySuggestions = [
                'electrician', 'plumber', 'carpenter', 'painter', 'mechanic',
                'hairdresser', 'cleaner', 'gardener', 'technician', 'repair'
            ];

            const locationSuggestions = [
                'douala', 'yaounde', 'bamenda', 'buea', 'limbe',
                'kribi', 'garoua', 'maroua', 'bertoua', 'ebolowa'
            ];

            const allSuggestions = [...categorySuggestions, ...locationSuggestions];
            const suggestions = allSuggestions
                .filter(s => s.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 5);

            return {
                success: true,
                data: { suggestions },
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get suggestions',
            };
        }
    }
}
