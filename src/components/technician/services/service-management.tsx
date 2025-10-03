'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { TechnicianApiSimulation, CategoriesApiSimulation } from '@/lib/technician-api-simulation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TechnicianService } from '@/schemas/technician-service-schema';
import { ServiceCategory } from '@/schemas/category-schema';
import { ServiceForm } from './service-form';
import { ServiceList } from './service-list';

export function ServiceManagement() {
  const { user } = useAuthStore();
  const [services, setServices] = useState<TechnicianService[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (user && user.user_type === 'technician') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user || user.user_type !== 'technician') return;

    setIsLoading(true);
    setError('');

    try {
      // Load services and categories in parallel
      const [servicesResponse, categoriesResponse] = await Promise.all([
        TechnicianApiSimulation.getServices(user.user_id),
        CategoriesApiSimulation.getAll(),
      ]);

      if (servicesResponse.success) {
        setServices(servicesResponse.data);
      } else {
        setError(servicesResponse.error || 'Failed to load services');
      }

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      } else {
        setError(categoriesResponse.error || 'Failed to load categories');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddService = async (serviceData: {
    category_id: string;
    service_title: string;
    service_description: string;
    base_service_fee_estimate?: number;
    transport_fee: number;
  }) => {
    if (!user || user.user_type !== 'technician') return;

    try {
      const response = await TechnicianApiSimulation.addService(user.user_id, serviceData);
      
      if (response.success) {
        setServices(prev => [...prev, response.data]);
        setShowAddForm(false);
      } else {
        setError(response.error || 'Failed to add service');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add service');
    }
  };

  const handleUpdateService = async (serviceId: string, updates: Partial<TechnicianService>) => {
    try {
      const response = await TechnicianApiSimulation.updateService(serviceId, updates);
      
      if (response.success) {
        setServices(prev => prev.map(service => 
          service.service_id === serviceId ? response.data : service
        ));
      } else {
        setError(response.error || 'Failed to update service');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update service');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      const response = await TechnicianApiSimulation.updateService(serviceId, { is_active: false });
      
      if (response.success) {
        setServices(prev => prev.filter(service => service.service_id !== serviceId));
      } else {
        setError(response.error || 'Failed to delete service');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete service');
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
            <p className="text-gray-600">Loading services...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Service Management</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage your service offerings and pricing
              </p>
            </div>
            <Button 
              onClick={() => setShowAddForm(true)}
              disabled={showAddForm}
            >
              Add New Service
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm ? (
            <ServiceForm
              categories={categories}
              onSubmit={handleAddService}
              onCancel={() => setShowAddForm(false)}
            />
          ) : (
            <ServiceList
              services={services}
              categories={categories}
              onUpdate={handleUpdateService}
              onDelete={handleDeleteService}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

