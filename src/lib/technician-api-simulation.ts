import { Technician } from '@/schemas/user-schema';
import { TechnicianService } from '@/schemas/technician-service-schema';
import { WorkingHours } from '@/schemas/working-hours-schema';
import { ServiceCategory } from '@/schemas/category-schema';
import { ApiResponse } from './mock-api';

// Simulate network delay
const simulateNetworkDelay = (min = 300, max = 800) => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Storage keys for technician data
const STORAGE_KEYS = {
  TECHNICIAN_SERVICES: 'servigo_technician_services',
  WORKING_HOURS: 'servigo_working_hours',
  SERVICE_AREAS: 'servigo_service_areas',
} as const;

// Technician API simulation
export class CategoriesApiSimulation {
  // Get all categories
  static async getCategories(): Promise<ApiResponse<ServiceCategory[]>> {
    await simulateNetworkDelay();

    try {
      // Import dummy categories directly
      const { DUMMY_CATEGORIES } = await import('@/data/dummy-categories');

      return {
        success: true,
        data: DUMMY_CATEGORIES,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get categories',
      };
    }
  }
}

export class TechnicianApiSimulation {
  // Profile Management
  static async updateProfile(technicianId: string, profileData: {
    business_name?: string;
    bio?: string;
    years_of_experience?: number;
    profile_picture_url?: string;
  }): Promise<ApiResponse<Technician>> {
    try {
      await simulateNetworkDelay();

      // Get current user from auth store
      const currentUser = localStorage.getItem('servigo_current_user');
      if (!currentUser) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      const user = JSON.parse(currentUser);
      if (user.user_type !== 'technician' || user.user_id !== technicianId) {
        return {
          success: false,
          error: 'Unauthorized access',
        };
      }

      // Update user profile
      const updatedUser = {
        ...user,
        ...profileData,
      };

      // Update in localStorage
      localStorage.setItem('servigo_current_user', JSON.stringify(updatedUser));

      // Update in users list
      const users = JSON.parse(localStorage.getItem('servigo_users') || '[]');
      const userIndex = users.findIndex((u: Technician) => u.user_id === technicianId);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('servigo_users', JSON.stringify(users));
      }

      return {
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Profile update failed',
      };
    }
  }

  // Service Management
  static async getServices(technicianId: string): Promise<ApiResponse<TechnicianService[]>> {
    try {
      await simulateNetworkDelay();

      const services = JSON.parse(localStorage.getItem(STORAGE_KEYS.TECHNICIAN_SERVICES) || '[]');
      const technicianServices = services.filter((service: TechnicianService) =>
        service.technician_id === technicianId
      );

      return {
        success: true,
        data: technicianServices,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch services',
      };
    }
  }

  static async addService(technicianId: string, serviceData: {
    category_id: string;
    service_title: string;
    service_description: string;
    base_service_fee_estimate?: number;
    transport_fee: number;
  }): Promise<ApiResponse<TechnicianService>> {
    try {
      await simulateNetworkDelay();

      const services = JSON.parse(localStorage.getItem(STORAGE_KEYS.TECHNICIAN_SERVICES) || '[]');

      const newService: TechnicianService = {
        service_id: `svc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        technician_id: technicianId,
        ...serviceData,
        is_active: true,
        created_at: new Date(),
      };

      services.push(newService);
      localStorage.setItem(STORAGE_KEYS.TECHNICIAN_SERVICES, JSON.stringify(services));

      return {
        success: true,
        data: newService,
        message: 'Service added successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add service',
      };
    }
  }

  static async updateService(serviceId: string, updates: Partial<TechnicianService>): Promise<ApiResponse<TechnicianService>> {
    try {
      await simulateNetworkDelay();

      const services = JSON.parse(localStorage.getItem(STORAGE_KEYS.TECHNICIAN_SERVICES) || '[]');
      const serviceIndex = services.findIndex((service: TechnicianService) => service.service_id === serviceId);

      if (serviceIndex === -1) {
        return {
          success: false,
          error: 'Service not found',
        };
      }

      services[serviceIndex] = { ...services[serviceIndex], ...updates };
      localStorage.setItem(STORAGE_KEYS.TECHNICIAN_SERVICES, JSON.stringify(services));

      return {
        success: true,
        data: services[serviceIndex],
        message: 'Service updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update service',
      };
    }
  }

  // Working Hours Management
  static async updateWorkingHours(technicianId: string, workingHours: WorkingHours[]): Promise<ApiResponse<WorkingHours[]>> {
    try {
      await simulateNetworkDelay();

      // Add technician_id to each working hour entry
      const hoursWithTechnicianId = workingHours.map(hour => ({
        ...hour,
        technician_id: technicianId,
      }));

      localStorage.setItem(STORAGE_KEYS.WORKING_HOURS, JSON.stringify(hoursWithTechnicianId));

      return {
        success: true,
        data: hoursWithTechnicianId,
        message: 'Working hours updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update working hours',
      };
    }
  }

  static async getWorkingHours(technicianId: string): Promise<ApiResponse<WorkingHours[]>> {
    try {
      await simulateNetworkDelay();

      const allHours = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKING_HOURS) || '[]');
      const technicianHours = allHours.filter((hour: WorkingHours) =>
        hour.technician_id === technicianId
      );

      return {
        success: true,
        data: technicianHours,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch working hours',
      };
    }
  }

  // Service Areas Management
  static async updateServiceAreas(technicianId: string, areas: string[]): Promise<ApiResponse<string[]>> {
    try {
      await simulateNetworkDelay();

      const serviceAreas = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICE_AREAS) || '{}');
      serviceAreas[technicianId] = areas;
      localStorage.setItem(STORAGE_KEYS.SERVICE_AREAS, JSON.stringify(serviceAreas));

      return {
        success: true,
        data: areas,
        message: 'Service areas updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update service areas',
      };
    }
  }

  static async getServiceAreas(technicianId: string): Promise<ApiResponse<string[]>> {
    try {
      await simulateNetworkDelay();

      const serviceAreas = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICE_AREAS) || '{}');
      const areas = serviceAreas[technicianId] || [];

      return {
        success: true,
        data: areas,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch service areas',
      };
    }
  }
}

// Categories API simulation
// export class CategoriesApiSimulation {
//   static async getAll(): Promise<ApiResponse<ServiceCategory[]>> {
//     try {
//       await simulateNetworkDelay();

//       // Import dummy categories
//       const { DUMMY_CATEGORIES } = await import('@/data/dummy-categories');

//       return {
//         success: true,
//         data: DUMMY_CATEGORIES,
//       };
//     } catch (error) {
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : 'Failed to fetch categories',
//       };
//     }
//   }
// }

// Initialize technician data
export function initializeTechnicianData(): void {
  if (typeof window === 'undefined') return;

  // Initialize working hours from dummy data
  const existingHours = localStorage.getItem(STORAGE_KEYS.WORKING_HOURS);
  if (!existingHours) {
    // Import dummy working hours
    import('@/data/dummy-services').then(({ DUMMY_WORKING_HOURS }) => {
      localStorage.setItem(STORAGE_KEYS.WORKING_HOURS, JSON.stringify(DUMMY_WORKING_HOURS));
    });
  }

  // Initialize service areas for demo technicians
  const existingAreas = localStorage.getItem(STORAGE_KEYS.SERVICE_AREAS);
  if (!existingAreas) {
    const demoServiceAreas = {
      'u_tech_1': ['Douala', 'Yaounde', 'Bamenda'], // Paul - Electrical
      'u_tech_2': ['Douala', 'Buea', 'Limbe'], // Marie - Plumbing
      'u_tech_3': ['Yaounde', 'Douala'], // Jean - Carpentry
      'u_tech_4': ['Douala', 'Yaounde', 'Bamenda'], // Grace - Painting
      'u_tech_5': ['Douala', 'Buea'], // Pierre - Automotive
      'u_tech_6': ['Douala', 'Yaounde'], // Sarah - Hair
      'u_tech_7': ['Douala', 'Yaounde', 'Bamenda', 'Buea'], // Marc - Cleaning
      'u_tech_8': ['Yaounde', 'Bamenda'], // Alice - Landscaping
      'u_tech_9': ['Douala', 'Yaounde'], // David - Technology
      'u_tech_10': ['Douala', 'Buea', 'Limbe'], // Rose - Beauty
    };

    localStorage.setItem(STORAGE_KEYS.SERVICE_AREAS, JSON.stringify(demoServiceAreas));
  }

  // Initialize technician services from dummy data
  const existingServices = localStorage.getItem(STORAGE_KEYS.TECHNICIAN_SERVICES);
  if (!existingServices) {
    // Import dummy services
    import('@/data/dummy-services').then(({ DUMMY_SERVICES }) => {
      localStorage.setItem(STORAGE_KEYS.TECHNICIAN_SERVICES, JSON.stringify(DUMMY_SERVICES));
    });
  }
}
