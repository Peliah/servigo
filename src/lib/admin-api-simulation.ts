'use client';

// Simulate network delay
const simulateNetworkDelay = () => new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
import { ApiResponse } from './mock-api';
import { User, Technician } from '@/schemas/user-schema';
import { ServiceRequest, ServiceRequestStatus } from '@/schemas/service-request-schema';
import { PaymentTransaction, PaymentStatus } from '@/schemas/payment-schema';
import { Review } from '@/schemas/review-schema';
import { ServiceCategory } from '@/schemas/category-schema';
import { DUMMY_TECHNICIANS, DUMMY_CLIENTS, DUMMY_ADMINS } from '@/data/dummy-users';
import { DUMMY_CATEGORIES } from '@/data/dummy-categories';

export interface AdminFilters {
    user_type?: 'client' | 'technician' | 'admin';
    status?: 'active' | 'inactive' | 'suspended';
    identity_verified?: boolean;
    search?: string;
    pagination?: {
        page: number;
        limit: number;
    };
}

export interface AdminStats {
    total_users: number;
    active_clients: number;
    active_technicians: number;
    verified_technicians: number;
    pending_requests: number;
    completed_services: number;
    total_revenue: number;
    platform_fee_earned: number;
}

export class AdminApiSimulation {
    // User Management
    static async getUsers(filters: AdminFilters = {}): Promise<ApiResponse<User[]>> {
        await simulateNetworkDelay();

        try {
            let users: User[] = [...DUMMY_CLIENTS, ...DUMMY_TECHNICIANS, ...DUMMY_ADMINS];

            // Apply filters
            if (filters.user_type) {
                users = users.filter(user => user.user_type === filters.user_type);
            }

            if (filters.status) {
                users = users.filter(user => {
                    if (filters.status === 'active') return user.is_active;
                    if (filters.status === 'inactive') return !user.is_active;
                    return true;
                });
            }

            if (filters.identity_verified !== undefined && filters.user_type === 'technician') {
                users = users.filter(user => {
                    if (user.user_type === 'technician') {
                        const technician = user as Technician;
                        return technician.identity_verified === filters.identity_verified;
                    }
                    return false;
                });
            }

            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                users = users.filter(user =>
                    user.first_name.toLowerCase().includes(searchLower) ||
                    user.last_name.toLowerCase().includes(searchLower) ||
                    user.email.toLowerCase().includes(searchLower)
                );
            }

            // Apply pagination
            if (filters.pagination) {
                const { page, limit } = filters.pagination;
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                users = users.slice(startIndex, endIndex);
            }

            return {
                success: true,
                data: users,
            };
        } catch {
            return {
                success: false,
                error: 'Failed to fetch users',
            };
        }
    }

    static async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<ApiResponse<User>> {
        await simulateNetworkDelay();

        try {
            // In a real app, this would update the database
            // For simulation, we'll just return success
            const users = JSON.parse(localStorage.getItem('servigo_users') || '[]');
            const userIndex = users.findIndex((u: User) => u.user_id === userId);

            if (userIndex !== -1) {
                users[userIndex].is_active = status === 'active';
                localStorage.setItem('servigo_users', JSON.stringify(users));
            }

            return {
                success: true,
                data: users[userIndex] || null,
            };
        } catch {
            return {
                success: false,
                error: 'Failed to update user status',
            };
        }
    }

    static async updateTechnicianVerification(userId: string, verified: boolean): Promise<ApiResponse<Technician>> {
        await simulateNetworkDelay();

        try {
            const users = JSON.parse(localStorage.getItem('servigo_users') || '[]');
            const userIndex = users.findIndex((u: User) => u.user_id === userId && u.user_type === 'technician');

            if (userIndex !== -1) {
                const technician = users[userIndex] as Technician;
                technician.identity_verified = verified;
                localStorage.setItem('servigo_users', JSON.stringify(users));

                return {
                    success: true,
                    data: technician,
                };
            }

            return {
                success: false,
                error: 'Technician not found',
            };
        } catch {
            return {
                success: false,
                error: 'Failed to update verification status',
            };
        }
    }

    // Platform Oversight
    static async getServiceRequests(filters: { status?: ServiceRequestStatus; pagination?: { page: number; limit: number } } = {}): Promise<ApiResponse<ServiceRequest[]>> {
        await simulateNetworkDelay();

        try {
            const requests = JSON.parse(localStorage.getItem('servigo_service_requests') || '[]');

            let filteredRequests = requests;

            if (filters.status) {
                filteredRequests = requests.filter((req: ServiceRequest) => req.status === filters.status);
            }

            if (filters.pagination) {
                const { page, limit } = filters.pagination;
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                filteredRequests = filteredRequests.slice(startIndex, endIndex);
            }

            return {
                success: true,
                data: filteredRequests,
            };
        } catch {
            return {
                success: false,
                error: 'Failed to fetch service requests',
            };
        }
    }

    static async getPaymentTransactions(filters: { status?: PaymentStatus; pagination?: { page: number; limit: number } } = {}): Promise<ApiResponse<PaymentTransaction[]>> {
        await simulateNetworkDelay();

        try {
            const transactions = JSON.parse(localStorage.getItem('servigo_payment_transactions') || '[]');

            let filteredTransactions = transactions;

            if (filters.status) {
                filteredTransactions = transactions.filter((t: PaymentTransaction) => t.status === filters.status);
            }

            if (filters.pagination) {
                const { page, limit } = filters.pagination;
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                filteredTransactions = filteredTransactions.slice(startIndex, endIndex);
            }

            return {
                success: true,
                data: filteredTransactions,
            };
        } catch {
            return {
                success: false,
                error: 'Failed to fetch payment transactions',
            };
        }
    }

    static async getReviews(filters: { pagination?: { page: number; limit: number } } = {}): Promise<ApiResponse<Review[]>> {
        await simulateNetworkDelay();

        try {
            const reviews = JSON.parse(localStorage.getItem('servigo_reviews') || '[]');

            let filteredReviews = reviews;

            if (filters.pagination) {
                const { page, limit } = filters.pagination;
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                filteredReviews = filteredReviews.slice(startIndex, endIndex);
            }

            return {
                success: true,
                data: filteredReviews,
            };
        } catch {
            return {
                success: false,
                error: 'Failed to fetch reviews',
            };
        }
    }

    // Analytics & Reporting
    static async getAdminStats(): Promise<ApiResponse<AdminStats>> {
        await simulateNetworkDelay();

        try {
            const users = [...DUMMY_CLIENTS, ...DUMMY_TECHNICIANS, ...DUMMY_ADMINS];
            const requests = JSON.parse(localStorage.getItem('servigo_service_requests') || '[]');
            const transactions = JSON.parse(localStorage.getItem('servigo_payment_transactions') || '[]');

            const stats: AdminStats = {
                total_users: users.length,
                active_clients: users.filter(u => u.user_type === 'client' && u.is_active).length,
                active_technicians: users.filter(u => u.user_type === 'technician' && u.is_active).length,
                verified_technicians: users.filter(u => u.user_type === 'technician' && (u as Technician).identity_verified).length,
                pending_requests: requests.filter((r: ServiceRequest) => r.status === 'pending').length,
                completed_services: requests.filter((r: ServiceRequest) => r.status === 'completed').length,
                total_revenue: transactions
                    .filter((t: PaymentTransaction) => t.status === 'released_to_technician')
                    .reduce((sum: number, t: PaymentTransaction) => sum + t.amount, 0),
                platform_fee_earned: transactions
                    .filter((t: PaymentTransaction) => t.status === 'released_to_technician')
                    .reduce((sum: number, t: PaymentTransaction) => sum + (t.amount * 0.05), 0), // 5% platform fee
            };

            return {
                success: true,
                data: stats,
            };
        } catch {
            return {
                success: false,
                error: 'Failed to fetch admin stats',
            };
        }
    }

    static async getDailyBookings(days: number = 7): Promise<ApiResponse<{ date: string; count: number; revenue: number }[]>> {
        await simulateNetworkDelay();

        try {
            const requests = JSON.parse(localStorage.getItem('servigo_service_requests') || '[]');
            const transactions = JSON.parse(localStorage.getItem('servigo_payment_transactions') || '[]');

            const dailyData: { date: string; count: number; revenue: number }[] = [];
            const today = new Date();

            for (let i = days - 1; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];

                const dayRequests = requests.filter((r: ServiceRequest) => {
                    const requestDate = new Date(r.created_at).toISOString().split('T')[0];
                    return requestDate === dateStr;
                });

                const dayTransactions = transactions.filter((t: PaymentTransaction) => {
                    const transactionDate = new Date(t.created_at).toISOString().split('T')[0];
                    return transactionDate === dateStr && t.status === 'released_to_technician';
                });

                dailyData.push({
                    date: dateStr,
                    count: dayRequests.length,
                    revenue: dayTransactions.reduce((sum: number, t: PaymentTransaction) => sum + t.amount, 0),
                });
            }

            return {
                success: true,
                data: dailyData,
            };
        } catch {
            return {
                success: false,
                error: 'Failed to fetch daily bookings',
            };
        }
    }

    // Category Management
    static async getCategories(): Promise<ApiResponse<ServiceCategory[]>> {
        await simulateNetworkDelay();

        try {
            return {
                success: true,
                data: DUMMY_CATEGORIES,
            };
        } catch {
            return {
                success: false,
                error: 'Failed to fetch categories',
            };
        }
    }

    static async createCategory(category: Omit<ServiceCategory, 'category_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<ServiceCategory>> {
        await simulateNetworkDelay();

        try {
            const newCategory: ServiceCategory = {
                ...category,
                category_id: `cat_${Date.now()}`,
                created_at: new Date(),
            };

            const categories = JSON.parse(localStorage.getItem('servigo_categories') || '[]');
            categories.push(newCategory);
            localStorage.setItem('servigo_categories', JSON.stringify(categories));

            return {
                success: true,
                data: newCategory,
            };
        } catch {
            return {
                success: false,
                error: 'Failed to create category',
            };
        }
    }

    static async updateCategory(categoryId: string, updates: Partial<ServiceCategory>): Promise<ApiResponse<ServiceCategory>> {
        await simulateNetworkDelay();

        try {
            const categories = JSON.parse(localStorage.getItem('servigo_categories') || '[]');
            const categoryIndex = categories.findIndex((c: ServiceCategory) => c.category_id === categoryId);

            if (categoryIndex !== -1) {
                categories[categoryIndex] = {
                    ...categories[categoryIndex],
                    ...updates,
                };
                localStorage.setItem('servigo_categories', JSON.stringify(categories));

                return {
                    success: true,
                    data: categories[categoryIndex],
                };
            }

            return {
                success: false,
                error: 'Category not found',
            };
        } catch {
            return {
                success: false,
                error: 'Failed to update category',
            };
        }
    }

    static async deleteCategory(categoryId: string): Promise<ApiResponse<boolean>> {
        await simulateNetworkDelay();

        try {
            const categories = JSON.parse(localStorage.getItem('servigo_categories') || '[]');
            const filteredCategories = categories.filter((c: ServiceCategory) => c.category_id !== categoryId);
            localStorage.setItem('servigo_categories', JSON.stringify(filteredCategories));

            return {
                success: true,
                data: true,
            };
        } catch {
            return {
                success: false,
                error: 'Failed to delete category',
            };
        }
    }
}
