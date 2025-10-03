'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ServiceCategory } from '@/schemas/category-schema';

interface ServiceFormProps {
  categories: ServiceCategory[];
  onSubmit: (data: {
    category_id: string;
    service_title: string;
    service_description: string;
    base_service_fee_estimate?: number;
    transport_fee: number;
  }) => void;
  onCancel: () => void;
  initialData?: {
    category_id: string;
    service_title: string;
    service_description: string;
    base_service_fee_estimate?: number;
    transport_fee: number;
  };
  isEditing?: boolean;
}

export function ServiceForm({ 
  categories, 
  onSubmit, 
  onCancel, 
  initialData,
  isEditing = false 
}: ServiceFormProps) {
  const [formData, setFormData] = useState({
    category_id: initialData?.category_id || '',
    service_title: initialData?.service_title || '',
    service_description: initialData?.service_description || '',
    base_service_fee_estimate: initialData?.base_service_fee_estimate || 0,
    transport_fee: initialData?.transport_fee || 0,
  });
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.category_id) {
      setError('Please select a category');
      return;
    }

    if (!formData.service_title.trim()) {
      setError('Service title is required');
      return;
    }

    if (!formData.service_description.trim()) {
      setError('Service description is required');
      return;
    }

    if (formData.transport_fee < 0) {
      setError('Transport fee cannot be negative');
      return;
    }

    if (formData.base_service_fee_estimate < 0) {
      setError('Service fee estimate cannot be negative');
      return;
    }

    onSubmit({
      category_id: formData.category_id,
      service_title: formData.service_title.trim(),
      service_description: formData.service_description.trim(),
      base_service_fee_estimate: formData.base_service_fee_estimate || undefined,
      transport_fee: formData.transport_fee,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div>
        <Label htmlFor="category_id">Service Category</Label>
        <Select
          value={formData.category_id}
          onValueChange={(value) => handleInputChange('category_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.category_id} value={category.category_id}>
                {category.category_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="service_title">Service Title</Label>
        <Input
          id="service_title"
          value={formData.service_title}
          onChange={(e) => handleInputChange('service_title', e.target.value)}
          placeholder="e.g., Electrical Installation"
          required
        />
      </div>

      <div>
        <Label htmlFor="service_description">Service Description</Label>
        <Textarea
          id="service_description"
          value={formData.service_description}
          onChange={(e) => handleInputChange('service_description', e.target.value)}
          placeholder="Describe what this service includes, requirements, and what clients can expect..."
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="base_service_fee_estimate">Base Service Fee (FCFA)</Label>
          <Input
            id="base_service_fee_estimate"
            type="number"
            min="0"
            value={formData.base_service_fee_estimate}
            onChange={(e) => handleInputChange('base_service_fee_estimate', parseInt(e.target.value) || 0)}
            placeholder="0"
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional: Estimated base fee for this service
          </p>
        </div>

        <div>
          <Label htmlFor="transport_fee">Transport Fee (FCFA)</Label>
          <Input
            id="transport_fee"
            type="number"
            min="0"
            value={formData.transport_fee}
            onChange={(e) => handleInputChange('transport_fee', parseInt(e.target.value) || 0)}
            placeholder="0"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Required: Fee for traveling to client location
          </p>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1">
          {isEditing ? 'Update Service' : 'Add Service'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

