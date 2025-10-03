import { ApiResponse } from './mock-api';

export interface Favorite {
    favorite_id: string;
    client_id: string;
    technician_id: string;
    notes?: string;
    tags?: string[];
    priority: 'high' | 'medium' | 'low';
    created_at: Date;
}

// Simulate network delay
const simulateNetworkDelay = (min = 300, max = 800) => {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
};

export class FavoritesApiSimulation {
    // Add technician to favorites
    static async addFavorite(
        clientId: string,
        technicianId: string,
        notes?: string,
        tags?: string[],
        priority: 'high' | 'medium' | 'low' = 'medium'
    ): Promise<ApiResponse<Favorite>> {
        await simulateNetworkDelay();

        try {
            const favorites = JSON.parse(localStorage.getItem('servigo_favorites') || '[]') as Favorite[];

            // Check if already favorited
            const existingFavorite = favorites.find(f =>
                f.client_id === clientId && f.technician_id === technicianId
            );

            if (existingFavorite) {
                return {
                    success: false,
                    error: 'Technician is already in your favorites',
                };
            }

            const newFavorite: Favorite = {
                favorite_id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                client_id: clientId,
                technician_id: technicianId,
                notes,
                tags,
                priority,
                created_at: new Date(),
            };

            favorites.push(newFavorite);
            localStorage.setItem('servigo_favorites', JSON.stringify(favorites));

            return {
                success: true,
                data: newFavorite,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to add favorite',
            };
        }
    }

    // Remove technician from favorites
    static async removeFavorite(clientId: string, technicianId: string): Promise<ApiResponse<boolean>> {
        await simulateNetworkDelay();

        try {
            const favorites = JSON.parse(localStorage.getItem('servigo_favorites') || '[]') as Favorite[];
            const filteredFavorites = favorites.filter(f =>
                !(f.client_id === clientId && f.technician_id === technicianId)
            );

            if (favorites.length === filteredFavorites.length) {
                return {
                    success: false,
                    error: 'Favorite not found',
                };
            }

            localStorage.setItem('servigo_favorites', JSON.stringify(filteredFavorites));

            return {
                success: true,
                data: true,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to remove favorite',
            };
        }
    }

    // Get client's favorites
    static async getFavorites(clientId: string): Promise<ApiResponse<Favorite[]>> {
        await simulateNetworkDelay();

        try {
            const favorites = JSON.parse(localStorage.getItem('servigo_favorites') || '[]') as Favorite[];
            const clientFavorites = favorites.filter(f => f.client_id === clientId);

            return {
                success: true,
                data: clientFavorites,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get favorites',
            };
        }
    }

    // Update favorite (notes, tags, priority)
    static async updateFavorite(
        clientId: string,
        technicianId: string,
        updates: Partial<Pick<Favorite, 'notes' | 'tags' | 'priority'>>
    ): Promise<ApiResponse<Favorite>> {
        await simulateNetworkDelay();

        try {
            const favorites = JSON.parse(localStorage.getItem('servigo_favorites') || '[]') as Favorite[];
            const favoriteIndex = favorites.findIndex(f =>
                f.client_id === clientId && f.technician_id === technicianId
            );

            if (favoriteIndex === -1) {
                return {
                    success: false,
                    error: 'Favorite not found',
                };
            }

            favorites[favoriteIndex] = {
                ...favorites[favoriteIndex],
                ...updates,
            };

            localStorage.setItem('servigo_favorites', JSON.stringify(favorites));

            return {
                success: true,
                data: favorites[favoriteIndex],
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update favorite',
            };
        }
    }

    // Check if technician is favorited
    static async isFavorited(clientId: string, technicianId: string): Promise<ApiResponse<boolean>> {
        await simulateNetworkDelay();

        try {
            const favorites = JSON.parse(localStorage.getItem('servigo_favorites') || '[]') as Favorite[];
            const isFavorited = favorites.some(f =>
                f.client_id === clientId && f.technician_id === technicianId
            );

            return {
                success: true,
                data: isFavorited,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to check favorite status',
            };
        }
    }

    // Get favorites count
    static async getFavoritesCount(clientId: string): Promise<ApiResponse<number>> {
        await simulateNetworkDelay();

        try {
            const favorites = JSON.parse(localStorage.getItem('servigo_favorites') || '[]') as Favorite[];
            const count = favorites.filter(f => f.client_id === clientId).length;

            return {
                success: true,
                data: count,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get favorites count',
            };
        }
    }
}
