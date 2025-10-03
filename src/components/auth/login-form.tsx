'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

interface LoginFormProps {
    onSuccess?: () => void;
    redirectTo?: string;
}

export function LoginForm({ onSuccess, redirectTo }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, user, isAuthenticating } = useAuthStore();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await login(email, password);

            if (onSuccess) {
                onSuccess();
            } else if (redirectTo) {
                router.push(redirectTo);
            } else if (user) {
                const dashboardPath = user.user_type === 'client' ? '/dashboard/client' :
                    user.user_type === 'technician' ? '/dashboard/technician' :
                        '/dashboard/admin';
                router.push(dashboardPath);
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = async (userType: 'client' | 'technician' | 'admin') => {
        const demoCredentials = {
            client: { email: 'jane.client@example.com', password: 'password123' },
            technician: { email: 'paul.tech@example.com', password: 'password123' },
            admin: { email: 'admin@example.com', password: 'password123' },
        };

        setEmail(demoCredentials[userType].email);
        setPassword(demoCredentials[userType].password);

        try {
            await login(demoCredentials[userType].email, demoCredentials[userType].password);

            if (onSuccess) {
                onSuccess();
            } else if (redirectTo) {
                router.push(redirectTo);
            } else {
                const dashboardPath = userType === 'client' ? '/dashboard/client' :
                    userType === 'technician' ? '/dashboard/technician' :
                        '/dashboard/admin';
                router.push(dashboardPath);
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Demo login failed');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sign In</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div>
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading || isAuthenticating}
                        />
                    </div>

                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading || isAuthenticating}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || isAuthenticating}
                    >
                        {isLoading || isAuthenticating ? 'Signing in...' : 'Sign in'}
                    </Button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDemoLogin('client')}
                            disabled={isLoading || isAuthenticating}
                        >
                            Client
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDemoLogin('technician')}
                            disabled={isLoading || isAuthenticating}
                        >
                            Technician
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDemoLogin('admin')}
                            disabled={isLoading || isAuthenticating}
                        >
                            Admin
                        </Button>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
                            Sign up
                        </Link>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
