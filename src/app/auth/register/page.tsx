'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { SignUpForm } from '@/components/auth/sign-up-form';

export default function RegisterPage() {
    const { user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        // Redirect if already authenticated
        if (user) {
            const dashboardPath = user.user_type === 'client' ? '/dashboard/client' :
                user.user_type === 'technician' ? '/dashboard/technician' :
                    '/dashboard/admin';
            router.push(dashboardPath);
        }
    }, [user, router]);

    if (user) {
        return null; // Will redirect via useEffect
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Create your Servigo account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join our platform and start connecting with service providers
                    </p>
                </div>

                <SignUpForm />
            </div>
        </div>
    );
}
