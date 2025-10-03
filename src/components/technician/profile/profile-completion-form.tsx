'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { TechnicianApiSimulation } from '@/lib/technician-api-simulation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Technician } from '@/schemas/user-schema';
import { User } from 'lucide-react';

interface ProfileCompletionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProfileCompletionForm({ onSuccess, onCancel }: ProfileCompletionFormProps) {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    business_name: '',
    bio: '',
    years_of_experience: 0,
    profile_picture_url: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && user.user_type === 'technician') {
      const technician = user as Technician;
      setFormData({
        business_name: technician.business_name || '',
        bio: technician.bio || '',
        years_of_experience: technician.years_of_experience || 0,
        profile_picture_url: technician.profile_picture_url || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!user || user.user_type !== 'technician') {
      setError('User not found or not a technician');
      setIsLoading(false);
      return;
    }

    try {
      const response = await TechnicianApiSimulation.updateProfile(user.user_id, formData);

      if (response.success) {
        // Update the auth store with the new user data
        const { user: updatedUser } = useAuthStore.getState();
        if (updatedUser) {
          useAuthStore.setState({ user: response.data });
        }

        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(response.error || 'Profile update failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Profile update failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.user_type !== 'technician') {
    return null;
  }

  return (
    <Card className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm border-white/20 shadow-xl">
      <CardHeader className="text-center pb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
        <p className="text-gray-600 mt-2">
          Build your professional presence on the platform
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Label htmlFor="business_name" className="text-sm font-semibold text-gray-700">
              Business Name *
            </Label>
            <Input
              id="business_name"
              value={formData.business_name}
              onChange={(e) => handleInputChange('business_name', e.target.value)}
              placeholder="e.g., Ndi Electricals"
              disabled={isLoading}
              className="bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="bio" className="text-sm font-semibold text-gray-700">
              Professional Bio *
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell clients about your experience, skills, and what makes you unique..."
              rows={4}
              disabled={isLoading}
              className="bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be displayed on your profile to help clients understand your expertise.
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="years_of_experience" className="text-sm font-semibold text-gray-700">
              Years of Experience *
            </Label>
            <Input
              id="years_of_experience"
              type="number"
              min="0"
              max="50"
              value={formData.years_of_experience}
              onChange={(e) => handleInputChange('years_of_experience', parseInt(e.target.value) || 0)}
              placeholder="0"
              disabled={isLoading}
              className="bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="profile_picture_url" className="text-sm font-semibold text-gray-700">
              Profile Picture URL (Optional)
            </Label>
            <Input
              id="profile_picture_url"
              type="url"
              value={formData.profile_picture_url}
              onChange={(e) => handleInputChange('profile_picture_url', e.target.value)}
              placeholder="https://example.com/your-photo.jpg"
              disabled={isLoading}
              className="bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Add a professional profile picture to build trust with clients.
            </p>
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            >
              {isLoading ? 'Saving...' : 'Save Profile'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="bg-white/80 border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

