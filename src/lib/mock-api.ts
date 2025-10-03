import { AuthSimulation } from './auth-simulation';
import { User, UserRole } from '@/schemas/user-schema';

// Mock API response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    user_type: UserRole;
}

export interface AuthResponse {
    user: User;
    token: string;
}

// Mock API delay simulation
const simulateNetworkDelay = (min = 300, max = 800) => {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
};

// Mock API functions
export const mockApi = {
    // Authentication endpoints
    auth: {
        async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
            try {
                await simulateNetworkDelay();

                const result = await AuthSimulation.register(data);

                return {
                    success: true,
                    data: result,
                    message: 'Registration successful',
                };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Registration failed',
                };
            }
        },

        async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
            try {
                await simulateNetworkDelay();

                const result = await AuthSimulation.login(data.email, data.password);

                return {
                    success: true,
                    data: result,
                    message: 'Login successful',
                };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Login failed',
                };
            }
        },

        async logout(): Promise<ApiResponse<null>> {
            try {
                await simulateNetworkDelay();

                await AuthSimulation.logout();

                return {
                    success: true,
                    message: 'Logout successful',
                };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Logout failed',
                };
            }
        },

        async getCurrentUser(): Promise<ApiResponse<User | null>> {
            try {
                await simulateNetworkDelay(100, 300);

                const user = AuthSimulation.getCurrentUser();

                return {
                    success: true,
                    data: user,
                };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Failed to get current user',
                };
            }
        },

        async verifyToken(): Promise<ApiResponse<User | null>> {
            try {
                await simulateNetworkDelay(100, 200);

                if (!AuthSimulation.isAuthenticated()) {
                    return {
                        success: false,
                        error: 'Token is invalid or expired',
                    };
                }

                const user = AuthSimulation.getCurrentUser();

                return {
                    success: true,
                    data: user,
                };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Token verification failed',
                };
            }
        },
    },
};

// Export individual functions for easier imports
export const {
    register: registerUser,
    login: loginUser,
    logout: logoutUser,
    getCurrentUser: getCurrentUserApi,
    verifyToken: verifyTokenApi,
} = mockApi.auth;
