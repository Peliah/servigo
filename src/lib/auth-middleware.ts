import { NextRequest, NextResponse } from 'next/server';
import { AuthSimulation, verifyJWT } from './auth-simulation';
import { UserRole, User } from '@/schemas/user-schema';

// Middleware for protecting API routes
export function withAuth(handler: (req: NextRequest, user: User) => Promise<NextResponse>) {
    return async (req: NextRequest) => {
        try {
            const token = req.headers.get('authorization')?.replace('Bearer ', '');

            if (!token) {
                return NextResponse.json(
                    { success: false, error: 'No token provided' },
                    { status: 401 }
                );
            }

            const payload = verifyJWT(token);

            if (!payload) {
                return NextResponse.json(
                    { success: false, error: 'Invalid or expired token' },
                    { status: 401 }
                );
            }

            const user = AuthSimulation.getCurrentUser();

            if (!user || user.user_id !== payload.userId) {
                return NextResponse.json(
                    { success: false, error: 'User not found' },
                    { status: 401 }
                );
            }

            return handler(req, user);
        } catch {
            return NextResponse.json(
                { success: false, error: 'Authentication failed' },
                { status: 401 }
            );
        }
    };
}

// Middleware for role-based authorization
export function withRole(requiredRole: UserRole, handler: (req: NextRequest, user: User) => Promise<NextResponse>) {
    return withAuth(async (req, user) => {
        if (user.user_type !== requiredRole) {
            return NextResponse.json(
                { success: false, error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        return handler(req, user);
    });
}

// Middleware for multiple roles
export function withAnyRole(requiredRoles: UserRole[], handler: (req: NextRequest, user: User) => Promise<NextResponse>) {
    return withAuth(async (req, user) => {
        if (!requiredRoles.includes(user.user_type)) {
            return NextResponse.json(
                { success: false, error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        return handler(req, user);
    });
}

// Client-side route protection hook
export function useRouteProtection() {
    const checkAccess = (requiredRole?: UserRole | UserRole[]) => {
        if (!AuthSimulation.isAuthenticated()) {
            return { hasAccess: false, redirectTo: '/auth/login' };
        }

        if (requiredRole) {
            const userRole = AuthSimulation.getCurrentUserRole();

            if (Array.isArray(requiredRole)) {
                if (!requiredRole.includes(userRole!)) {
                    return { hasAccess: false, redirectTo: '/dashboard' };
                }
            } else {
                if (userRole !== requiredRole) {
                    return { hasAccess: false, redirectTo: '/dashboard' };
                }
            }
        }

        return { hasAccess: true };
    };

    return { checkAccess };
}

// Route protection component props
export interface ProtectedRouteProps {
    requiredRole?: UserRole | UserRole[];
    fallback?: React.ReactNode;
    redirectTo?: string;
}

// Utility function to check if user can access a route
export function canAccessRoute(userRole: UserRole | null, requiredRole?: UserRole | UserRole[]): boolean {
    if (!userRole) return false;

    if (!requiredRole) return true;

    if (Array.isArray(requiredRole)) {
        return requiredRole.includes(userRole);
    }

    return userRole === requiredRole;
}

// Get redirect path based on user role
export function getDashboardPath(userRole: UserRole | null): string {
    switch (userRole) {
        case 'client':
            return '/dashboard/client';
        case 'technician':
            return '/dashboard/technician';
        case 'admin':
            return '/dashboard/admin';
        default:
            return '/';
    }
}
