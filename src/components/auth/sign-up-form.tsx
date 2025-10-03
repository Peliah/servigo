'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '@/schemas/user-schema';
import Link from 'next/link';

interface SignUpFormProps {
    onSuccess?: () => void;
    redirectTo?: string;
}

export function SignUpForm({ onSuccess, redirectTo }: SignUpFormProps) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        user_type: '' as UserRole | '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register, user, isAuthenticating } = useAuthStore();
    const router = useRouter();

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setIsLoading(false);
            return;
        }

        if (!formData.user_type) {
            setError('Please select a user type');
            setIsLoading(false);
            return;
        }

        try {
            await register({
                email: formData.email,
                password: formData.password,
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone_number: formData.phone_number,
                user_type: formData.user_type as UserRole,
            });

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
            setError(error instanceof Error ? error.message : 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Account</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="first_name">First Name</Label>
                            <Input
                                id="first_name"
                                value={formData.first_name}
                                onChange={(e) => handleInputChange('first_name', e.target.value)}
                                required
                                disabled={isLoading || isAuthenticating}
                            />
                        </div>
                        <div>
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input
                                id="last_name"
                                value={formData.last_name}
                                onChange={(e) => handleInputChange('last_name', e.target.value)}
                                required
                                disabled={isLoading || isAuthenticating}
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                            disabled={isLoading || isAuthenticating}
                        />
                    </div>

                    <div>
                        <Label htmlFor="phone_number">Phone Number</Label>
                        <Input
                            id="phone_number"
                            type="tel"
                            value={formData.phone_number}
                            onChange={(e) => handleInputChange('phone_number', e.target.value)}
                            required
                            disabled={isLoading || isAuthenticating}
                            placeholder="+237600000001"
                        />
                    </div>

                    <div>
                        <Label htmlFor="user_type">I want to</Label>
                        <Select
                            value={formData.user_type}
                            onValueChange={(value) => handleInputChange('user_type', value)}
                            disabled={isLoading || isAuthenticating}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="client">Find and book services</SelectItem>
                                <SelectItem value="technician">Provide services</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            required
                            disabled={isLoading || isAuthenticating}
                            minLength={6}
                        />
                    </div>

                    <div>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            required
                            disabled={isLoading || isAuthenticating}
                            minLength={6}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || isAuthenticating}
                    >
                        {isLoading || isAuthenticating ? 'Creating account...' : 'Create account'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Sign in
                        </Link>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
