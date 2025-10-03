import { ServiceRequest, ServiceRequestStatus } from '@/schemas/service-request-schema';
import { ApiResponse } from './mock-api';

// Simulate network delay
const simulateNetworkDelay = (min = 300, max = 800) => {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
};

export interface BookingFilters {
    status?: ServiceRequestStatus;
    technician_id?: string;
    client_id?: string;
    date_from?: Date;
    date_to?: Date;
    pagination?: {
        page: number;
        limit: number;
    };
}

export interface BookingResponse {
    success: boolean;
    data?: ServiceRequest[];
    error?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface AvailabilitySlot {
    date: string;
    time: string;
    available: boolean;
}

export class BookingApiSimulation {
    // Create a new service request
    static async createServiceRequest(requestData: Omit<ServiceRequest, 'request_id' | 'status' | 'created_at' | 'updated_at'>): Promise<ApiResponse<ServiceRequest>> {
        await simulateNetworkDelay();

        try {
            // Import dummy data
            const { DUMMY_TECHNICIANS } = await import('@/data/dummy-users');
            const { DUMMY_SERVICES } = await import('@/data/dummy-services');

            // Validate technician exists
            const technician = DUMMY_TECHNICIANS.find(t => t.user_id === requestData.technician_id);
            if (!technician) {
                return {
                    success: false,
                    error: 'Technician not found',
                };
            }

            // Validate service exists and belongs to technician
            const service = DUMMY_SERVICES.find(s =>
                s.service_id === requestData.service_id &&
                s.technician_id === requestData.technician_id &&
                s.is_active
            );
            if (!service) {
                return {
                    success: false,
                    error: 'Service not found or inactive',
                };
            }

            // Calculate total cost
            const totalCost = (service.base_service_fee_estimate || 0) + (service.transport_fee || 0);

            // Create new request
            const newRequest: ServiceRequest = {
                ...requestData,
                request_id: `req_${Date.now()}`,
                status: 'pending',
                total_cost: totalCost,
                created_at: new Date(),
                updated_at: new Date(),
            };

            // Get existing requests from localStorage
            const existingRequests = JSON.parse(localStorage.getItem('servigo_service_requests') || '[]');
            const updatedRequests = [...existingRequests, newRequest];
            localStorage.setItem('servigo_service_requests', JSON.stringify(updatedRequests));

            return {
                success: true,
                data: newRequest,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create service request',
            };
        }
    }

    // Get service requests with filters
    static async getServiceRequests(filters: BookingFilters = {}): Promise<BookingResponse> {
        await simulateNetworkDelay();

        try {
            // Import dummy data
            const { DUMMY_SERVICE_REQUESTS } = await import('@/data/dummy-service-requests');

            // Get requests from localStorage or use dummy data
            let requests = JSON.parse(localStorage.getItem('servigo_service_requests') || '[]');
            if (requests.length === 0) {
                requests = DUMMY_SERVICE_REQUESTS;
                localStorage.setItem('servigo_service_requests', JSON.stringify(requests));
            }

            // Apply filters
            const filteredRequests = requests.filter((request: ServiceRequest) => {
                if (filters.status && request.status !== filters.status) return false;
                if (filters.technician_id && request.technician_id !== filters.technician_id) return false;
                if (filters.client_id && request.client_id !== filters.client_id) return false;
                if (filters.date_from && request.preferred_date < filters.date_from) return false;
                if (filters.date_to && request.preferred_date > filters.date_to) return false;
                return true;
            });

            // Sort by created_at (newest first)
            filteredRequests.sort((a: ServiceRequest, b: ServiceRequest) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            // Apply pagination
            const page = filters.pagination?.page || 1;
            const limit = filters.pagination?.limit || 20;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

            return {
                success: true,
                data: paginatedRequests,
                pagination: {
                    page,
                    limit,
                    total: filteredRequests.length,
                    totalPages: Math.ceil(filteredRequests.length / limit),
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get service requests',
            };
        }
    }

    // Update service request status
    static async updateRequestStatus(requestId: string, status: ServiceRequestStatus, notes?: string): Promise<ApiResponse<ServiceRequest>> {
        await simulateNetworkDelay();

        try {
            const requests = JSON.parse(localStorage.getItem('servigo_service_requests') || '[]');
            const requestIndex = requests.findIndex((r: ServiceRequest) => r.request_id === requestId);

            if (requestIndex === -1) {
                return {
                    success: false,
                    error: 'Service request not found',
                };
            }

            // Update request
            requests[requestIndex] = {
                ...requests[requestIndex],
                status,
                notes: notes || requests[requestIndex].notes,
                updated_at: new Date(),
            };

            localStorage.setItem('servigo_service_requests', JSON.stringify(requests));

            return {
                success: true,
                data: requests[requestIndex],
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update request status',
            };
        }
    }

    // Get technician availability for a specific date
    static async getTechnicianAvailability(technicianId: string, date: string): Promise<ApiResponse<AvailabilitySlot[]>> {
        await simulateNetworkDelay();

        try {
            // Import dummy data
            const { DUMMY_WORKING_HOURS } = await import('@/data/dummy-services');

            // Get technician's working hours for the day of week
            const targetDate = new Date(date);
            const dayOfWeek = targetDate.getDay() || 7; // Convert Sunday (0) to 7

            const workingHours = DUMMY_WORKING_HOURS.filter(wh =>
                wh.technician_id === technicianId &&
                wh.day_of_week === dayOfWeek &&
                wh.is_available
            );

            // Debug logging
            console.log('Availability Debug:', {
                technicianId,
                date,
                dayOfWeek,
                availableWorkingHours: workingHours.length,
                allWorkingHours: DUMMY_WORKING_HOURS.filter(wh => wh.technician_id === technicianId)
            });

            if (workingHours.length === 0) {
                return {
                    success: true,
                    data: [],
                };
            }

            // Generate time slots (30-minute intervals)
            const slots: AvailabilitySlot[] = [];
            const startTime = workingHours[0].start_time;
            const endTime = workingHours[0].end_time;

            const [startHour, startMin] = startTime.split(':').map(Number);
            const [endHour, endMin] = endTime.split(':').map(Number);

            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;

            for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
                const hour = Math.floor(minutes / 60);
                const min = minutes % 60;
                const timeString = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;

                // Check if slot is already booked
                const requests = JSON.parse(localStorage.getItem('servigo_service_requests') || '[]');
                const isBooked = requests.some((req: ServiceRequest) =>
                    req.technician_id === technicianId &&
                    new Date(req.preferred_date).toISOString().split('T')[0] === date &&
                    req.preferred_time === timeString &&
                    ['pending', 'accepted', 'in_progress'].includes(req.status)
                );

                slots.push({
                    date,
                    time: timeString,
                    available: !isBooked,
                });
            }

            return {
                success: true,
                data: slots,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get availability',
            };
        }
    }

    // Get service request details
    static async getServiceRequest(requestId: string): Promise<ApiResponse<ServiceRequest>> {
        await simulateNetworkDelay();

        try {
            const requests = JSON.parse(localStorage.getItem('servigo_service_requests') || '[]');
            const request = requests.find((r: ServiceRequest) => r.request_id === requestId);

            if (!request) {
                return {
                    success: false,
                    error: 'Service request not found',
                };
            }

            return {
                success: true,
                data: request,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get service request',
            };
        }
    }
}
