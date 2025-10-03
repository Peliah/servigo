'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TechnicianService } from '@/schemas/technician-service-schema';
import { ServiceCategory } from '@/schemas/category-schema';
import { ServiceForm } from './service-form';

interface ServiceListProps {
  services: TechnicianService[];
  categories: ServiceCategory[];
  onUpdate: (serviceId: string, updates: Partial<TechnicianService>) => void;
  onDelete: (serviceId: string) => void;
}

export function ServiceList({ services, categories, onUpdate, onDelete }: ServiceListProps) {
  const [editingService, setEditingService] = useState<TechnicianService | null>(null);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.category_id === categoryId);
    return category?.category_name || 'Unknown Category';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleEdit = (service: TechnicianService) => {
    setEditingService(service);
  };

  const handleUpdate = (data: {
    category_id: string;
    service_title: string;
    service_description: string;
    base_service_fee_estimate?: number;
    transport_fee: number;
  }) => {
    if (editingService) {
      onUpdate(editingService.service_id, data);
      setEditingService(null);
    }
  };

  const handleDelete = (serviceId: string) => {
    if (confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      onDelete(serviceId);
    }
  };

  const handleToggleActive = (service: TechnicianService) => {
    onUpdate(service.service_id, { is_active: !service.is_active });
  };

  if (services.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
        <p className="text-gray-500">
          Start by adding your first service to begin accepting bookings from clients.
        </p>
      </div>
    );
  }

  if (editingService) {
    return (
      <ServiceForm
        categories={categories}
        onSubmit={handleUpdate}
        onCancel={() => setEditingService(null)}
        initialData={editingService}
        isEditing={true}
      />
    );
  }

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <Card key={service.service_id} className={!service.is_active ? 'opacity-60' : ''}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg">{service.service_title}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">
                    {getCategoryName(service.category_id)}
                  </Badge>
                  <Badge variant={service.is_active ? 'default' : 'secondary'}>
                    {service.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(service)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(service)}
                >
                  {service.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(service.service_id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{service.service_description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900">Transport Fee:</span>
                <p className="text-gray-600">{formatPrice(service.transport_fee)}</p>
              </div>
              {service.base_service_fee_estimate && (
                <div>
                  <span className="font-medium text-gray-900">Base Fee:</span>
                  <p className="text-gray-600">{formatPrice(service.base_service_fee_estimate)}</p>
                </div>
              )}
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Created: {new Date(service.created_at).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

