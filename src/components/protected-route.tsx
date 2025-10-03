'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { canAccessRoute, getDashboardPath } from '@/lib/auth-middleware';
import { UserRole } from '@/schemas/user-schema';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: UserRole | UserRole[];
    fallback?: React.ReactNode;
    redirectTo?: string;
}

export function ProtectedRoute({
    children,
    requiredRole,
    fallback,
    redirectTo
}: ProtectedRouteProps) {
    const { user, checkAuth, isAuthenticating } = useAuthStore();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                await checkAuth();
            } catch (error) {
                console.error('Auth check failed:', error);
            } finally {
                setIsChecking(false);
            }
        };

        verifyAuth();
    }, [checkAuth]);

    // Show loading state while checking authentication
    if (isChecking || isAuthenticating) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        const loginPath = redirectTo || '/auth/login';
        router.push(loginPath);
        return null;
    }

    // Check role-based access
    if (requiredRole && !canAccessRoute(user.user_type, requiredRole)) {
        const dashboardPath = getDashboardPath(user.user_type);
        router.push(dashboardPath);
        return null;
    }

    // Show fallback if provided and access denied
    if (fallback && requiredRole && !canAccessRoute(user.user_type, requiredRole)) {
        return <>{fallback}</>;
    }

    // Render protected content
    return <>{children}</>;
}

// Higher-order component for protecting pages
export function withProtection<P extends object>(
    Component: React.ComponentType<P>,
    options?: {
        requiredRole?: UserRole | UserRole[];
        fallback?: React.ReactNode;
        redirectTo?: string;
    }
) {
    return function ProtectedComponent(props: P) {
        return (
            <ProtectedRoute {...options}>
                <Component {...props} />
            </ProtectedRoute>
        );
    };
}

// Hook for checking access in components
export function useAccessControl(requiredRole?: UserRole | UserRole[]) {
    const { user } = useAuthStore();
    const router = useRouter();

    const hasAccess = canAccessRoute(user?.user_type || null, requiredRole);

    const redirectToDashboard = () => {
        if (user) {
            const dashboardPath = getDashboardPath(user.user_type);
            router.push(dashboardPath);
        } else {
            router.push('/auth/login');
        }
    };

    return {
        hasAccess,
        userRole: user?.user_type || null,
        redirectToDashboard,
    };
}
