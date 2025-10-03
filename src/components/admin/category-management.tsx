'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AdminApiSimulation } from '@/lib/admin-api-simulation';
import { ServiceCategory } from '@/schemas/category-schema';
import { format } from 'date-fns';
import {
    Tag,
    Plus,
    Edit,
    Trash2,
    Search,
    Loader2,
    AlertCircle,
    CheckCircle,
    XCircle,
    Save,
    X
} from 'lucide-react';

export function CategoryManagement() {
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
    const [formData, setFormData] = useState({
        category_name: '',
        description: '',
        icon_url: '',
        is_active: true
    });

    const loadCategories = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await AdminApiSimulation.getCategories();
            if (response.success && response.data) {
                setCategories(response.data);
            } else {
                setError(response.error || 'Failed to load categories');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await AdminApiSimulation.createCategory(formData);
            if (response.success) {
                setShowCreateDialog(false);
                setFormData({ category_name: '', description: '', icon_url: '', is_active: true });
                await loadCategories();
            } else {
                setError(response.error || 'Failed to create category');
            }
        } catch (err) {
            setError('Failed to create category');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;

        setIsLoading(true);

        try {
            const response = await AdminApiSimulation.updateCategory(editingCategory.category_id, formData);
            if (response.success) {
                setEditingCategory(null);
                setFormData({ category_name: '', description: '', icon_url: '', is_active: true });
                await loadCategories();
            } else {
                setError(response.error || 'Failed to update category');
            }
        } catch (err) {
            setError('Failed to update category');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await AdminApiSimulation.deleteCategory(categoryId);
            if (response.success) {
                await loadCategories();
            } else {
                setError(response.error || 'Failed to delete category');
            }
        } catch (err) {
            setError('Failed to delete category');
        } finally {
            setIsLoading(false);
        }
    };

    const startEdit = (category: ServiceCategory) => {
        setEditingCategory(category);
        setFormData({
            category_name: category.category_name,
            description: category.description,
            icon_url: category.icon_url,
            is_active: category.is_active
        });
    };

    const cancelEdit = () => {
        setEditingCategory(null);
        setFormData({ category_name: '', description: '', icon_url: '', is_active: true });
    };

    const filteredCategories = categories.filter(category =>
        category.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Category Management</h2>
                    <p className="text-gray-600">Manage service categories and their settings</p>
                </div>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Category</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateCategory} className="space-y-4">
                            <div>
                                <Label htmlFor="category_name">Category Name</Label>
                                <Input
                                    id="category_name"
                                    value={formData.category_name}
                                    onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                                    placeholder="e.g., Plumbing, Electrical"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of this category"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label htmlFor="icon_url">Icon URL (Optional)</Label>
                                <Input
                                    id="icon_url"
                                    value={formData.icon_url}
                                    onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                                    placeholder="https://example.com/icon.svg"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="is_active">Active</Label>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Create Category
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                <CardContent className="p-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800">{error}</span>
                </div>
            )}

            {/* Categories Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading categories...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCategories.map((category) => (
                        <Card key={category.category_id} className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                            {category.icon_url ? (
                                                <img src={category.icon_url} alt={category.category_name} className="w-8 h-8" />
                                            ) : (
                                                <Tag className="w-6 h-6 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{category.category_name}</h3>
                                            <div className="flex items-center space-x-2 mt-1">
                                                {category.is_active ? (
                                                    <Badge variant="default" className="bg-green-100 text-green-800">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive">
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => startEdit(category)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteCategory(category.category_id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {category.description && (
                                    <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                                )}

                                <div className="text-xs text-gray-500">
                                    Created: {format(new Date(category.created_at), 'MMM dd, yyyy')}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {!isLoading && filteredCategories.length === 0 && (
                <div className="text-center py-12">
                    <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                    <p className="text-gray-600">
                        {searchQuery ? 'Try adjusting your search criteria.' : 'Create your first category to get started.'}
                    </p>
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={!!editingCategory} onOpenChange={(open) => !open && cancelEdit()}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateCategory} className="space-y-4">
                        <div>
                            <Label htmlFor="edit_category_name">Category Name</Label>
                            <Input
                                id="edit_category_name"
                                value={formData.category_name}
                                onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                                placeholder="e.g., Plumbing, Electrical"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit_description">Description</Label>
                            <Textarea
                                id="edit_description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of this category"
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit_icon_url">Icon URL (Optional)</Label>
                            <Input
                                id="edit_icon_url"
                                value={formData.icon_url}
                                onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                                placeholder="https://example.com/icon.svg"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="edit_is_active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="edit_is_active">Active</Label>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={cancelEdit}>
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Update Category
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
