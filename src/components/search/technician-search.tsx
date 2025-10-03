'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchApiSimulation, SearchFilters, SearchResult } from '@/lib/search-api-simulation';
import { CategoriesApiSimulation } from '@/lib/technician-api-simulation';
import { ServiceCategory } from '@/schemas/category-schema';
import {
    Search,
    MapPin,
    Star,
    DollarSign,
    Heart,
    Briefcase,
    Phone
} from 'lucide-react';

export function TechnicianSearch() {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState<SearchFilters>({
        pagination: { page: 1, limit: 12 }
    });

    const loadCategories = async () => {
        try {
            const response = await CategoriesApiSimulation.getCategories();
            if (response.success && response.data) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const performSearch = async () => {
        setIsLoading(true);
        setError('');

        try {
            const searchFilters: SearchFilters = {
                ...filters,
                // Add text search if query provided
                ...(searchQuery && {
                    // For now, we'll search by category name or service title
                    // In a real app, this would be more sophisticated
                })
            };

            const response = await SearchApiSimulation.searchTechnicians(searchFilters);

            if (response.success && response.data) {
                setResults(response.data);
            } else {
                setError(response.error || 'Search failed');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Search failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (key: string, value: string | boolean | undefined) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            pagination: { page: 1, limit: prev.pagination?.limit || 12 } // Reset to first page
        }));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        performSearch();
    };

    useEffect(() => {
        loadCategories();
        performSearch();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="space-y-6">
            {/* Search Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Find Technicians</h2>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                placeholder="Search for services or technicians..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                            <Search className="w-4 h-4 mr-2" />
                            Search
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Select
                            value={filters.category_id || 'all'}
                            onValueChange={(value) => handleFilterChange('category_id', value === 'all' ? undefined : value)}
                        >
                            <SelectTrigger className="bg-white/80 border-gray-200">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map(category => (
                                    <SelectItem key={category.category_id} value={category.category_id}>
                                        {category.category_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.location?.city || 'all'}
                            onValueChange={(value) => {
                                setFilters(prev => ({
                                    ...prev,
                                    location: value === 'all' ? undefined : { city: value },
                                    pagination: { page: 1, limit: prev.pagination?.limit || 12 }
                                }));
                            }}
                        >
                            <SelectTrigger className="bg-white/80 border-gray-200">
                                <SelectValue placeholder="All Locations" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Locations</SelectItem>
                                <SelectItem value="douala">Douala</SelectItem>
                                <SelectItem value="yaounde">Yaounde</SelectItem>
                                <SelectItem value="bamenda">Bamenda</SelectItem>
                                <SelectItem value="buea">Buea</SelectItem>
                                <SelectItem value="limbe">Limbe</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.sort_by || 'default'}
                            onValueChange={(value) => handleFilterChange('sort_by', value === 'default' ? undefined : value)}
                        >
                            <SelectTrigger className="bg-white/80 border-gray-200">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default">Default</SelectItem>
                                <SelectItem value="rating">Rating</SelectItem>
                                <SelectItem value="price">Price</SelectItem>
                                <SelectItem value="experience">Experience</SelectItem>
                                <SelectItem value="distance">Distance</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="verified_only"
                                checked={filters.verified_only || false}
                                onChange={(e) => handleFilterChange('verified_only', e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <label htmlFor="verified_only" className="text-sm text-gray-700">
                                Verified only
                            </label>
                        </div>
                    </div>
                </form>
            </div>

            {/* Results */}
            {isLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Searching for technicians...</p>
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-red-600">{error}</p>
                </div>
            ) : results.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No technicians found</h3>
                    <p className="text-gray-600">Try adjusting your search criteria or filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((result) => (
                        <TechnicianCard key={result.technician.user_id} result={result} />
                    ))}
                </div>
            )}
        </div>
    );
}

interface TechnicianCardProps {
    result: SearchResult;
}

function TechnicianCard({ result }: TechnicianCardProps) {
    const { technician, services, service_areas, average_rating, total_reviews, distance_km } = result;
    const [isFavorited, setIsFavorited] = useState(false);

    const handleFavoriteToggle = () => {
        setIsFavorited(!isFavorited);
        // TODO: Implement favorite toggle API call
    };

    const minPrice = Math.min(...services.map(s => s.base_service_fee_estimate || 0));
    const maxPrice = Math.max(...services.map(s => s.base_service_fee_estimate || 0));

    return (
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                            {technician.first_name[0]}{technician.last_name[0]}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">
                                {technician.first_name} {technician.last_name}
                            </h3>
                            <p className="text-sm text-gray-600">{technician.business_name}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleFavoriteToggle}
                        className={isFavorited ? "text-red-600" : "text-gray-400"}
                    >
                        <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Rating and Reviews */}
                <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium ml-1">{average_rating?.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-gray-500">({total_reviews} reviews)</span>
                    {technician.identity_verified && (
                        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 text-xs">
                            Verified
                        </Badge>
                    )}
                </div>

                {/* Experience */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    <span>{technician.years_of_experience || 0} years experience</span>
                </div>

                {/* Services */}
                <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Services:</p>
                    <div className="flex flex-wrap gap-1">
                        {services.slice(0, 3).map(service => (
                            <Badge key={service.service_id} variant="outline" className="text-xs">
                                {service.service_title}
                            </Badge>
                        ))}
                        {services.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{services.length - 3} more
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Pricing */}
                {services.length > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>
                            {minPrice === maxPrice ? `$${minPrice}` : `$${minPrice} - $${maxPrice}`}
                        </span>
                    </div>
                )}

                {/* Location */}
                {service_areas.length > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{service_areas[0].city}</span>
                        {distance_km && (
                            <span className="text-xs text-gray-500">({distance_km.toFixed(1)}km away)</span>
                        )}
                    </div>
                )}

                {/* Availability */}
                <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${technician.is_available ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm text-gray-600">
                        {technician.is_available ? 'Available' : 'Busy'}
                    </span>
                </div>

                {/* Bio */}
                {technician.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2">{technician.bio}</p>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                        <Phone className="w-4 h-4 mr-1" />
                        Contact
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                        View Profile
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
