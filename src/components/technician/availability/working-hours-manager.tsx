'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { TechnicianApiSimulation } from '@/lib/technician-api-simulation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { WorkingHours } from '@/schemas/working-hours-schema';

const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
];

export function WorkingHoursManager() {
  const { user } = useAuthStore();
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadWorkingHours = async () => {
    if (!user || user.user_type !== 'technician') return;

    setIsLoading(true);
    setError('');

    try {
      const response = await TechnicianApiSimulation.getWorkingHours(user.user_id);
      
      if (response.success && response.data) {
        setWorkingHours(response.data);
      } else {
        setError(response.error || 'Failed to load working hours');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load working hours');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.user_type === 'technician') {
      loadWorkingHours();
    }
  }, [user]);

  const handleDayToggle = (dayOfWeek: number) => {
    const existingHour = workingHours.find(hour => hour.day_of_week === dayOfWeek);
    
    if (existingHour) {
      // Toggle existing day
      setWorkingHours(prev => prev.map(hour => 
        hour.day_of_week === dayOfWeek 
          ? { ...hour, is_available: !hour.is_available }
          : hour
      ));
    } else {
      // Add new day with default hours
      const newHour: WorkingHours = {
        hours_id: `wh_${Date.now()}_${dayOfWeek}`,
        technician_id: user!.user_id,
        day_of_week: dayOfWeek,
        start_time: '09:00',
        end_time: '17:00',
        is_available: true,
      };
      setWorkingHours(prev => [...prev, newHour]);
    }
  };

  const handleTimeChange = (dayOfWeek: number, field: 'start_time' | 'end_time', value: string) => {
    setWorkingHours(prev => prev.map(hour => 
      hour.day_of_week === dayOfWeek 
        ? { ...hour, [field]: value }
        : hour
    ));
  };

  const handleSave = async () => {
    if (!user || user.user_type !== 'technician') return;

    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await TechnicianApiSimulation.updateWorkingHours(user.user_id, workingHours);
      
      if (response.success && response.data) {
        setMessage('Working hours updated successfully');
        setWorkingHours(response.data);
      } else {
        setError(response.error || 'Failed to update working hours');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update working hours');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user || user.user_type !== 'technician') {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading working hours...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Working Hours</CardTitle>
        <p className="text-sm text-gray-600">
          Set your weekly availability and working hours
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day) => {
            const dayHours = workingHours.find(hour => hour.day_of_week === day.value);
            const isAvailable = dayHours?.is_available || false;

            return (
              <div key={day.value} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Switch
                    checked={isAvailable}
                    onCheckedChange={() => handleDayToggle(day.value)}
                  />
                  <Label className="font-medium">{day.label}</Label>
                </div>

                {isAvailable && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={dayHours?.start_time || '09:00'}
                      onChange={(e) => handleTimeChange(day.value, 'start_time', e.target.value)}
                      className="px-2 py-1 border rounded text-sm"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={dayHours?.end_time || '17:00'}
                      onChange={(e) => handleTimeChange(day.value, 'end_time', e.target.value)}
                      className="px-2 py-1 border rounded text-sm"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Working Hours'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
