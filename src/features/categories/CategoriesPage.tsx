import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Layers, ArrowRight, RotateCcw } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Category } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchToolbar } from '../../components/ui/SearchToolbar';
import { FilterBar, FilterDropdown } from '../../components/ui/FilterControls';
import { CategoryCard } from '../../components/ui/CategoryCard';
import { CategoryFormDrawer } from './CategoryFormDrawer';
import { DetailsDrawer } from '../../components/ui/DetailsDrawer';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../components/ui/Toast';

export const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisibility, setSelectedVisibility] = useState('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Category | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => adminService.getCategories(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => adminService.createCategory(data),
    onSuccess: (newCat) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        type: 'success',
        title: 'Category Created',
        description: `${newCat.name} has been added.`,
      });
    },
    onError: (err: any) => {
      toast({
        type: 'error',
        title: 'Failed to Create Category',
        description: err.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Category> }) =>
      adminService.updateCategory(id, updates),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        type: 'success',
        title: 'Category Updated',
        description: `Changes saved for ${updated.name}.`,
      });
    },
    onError: (err: any) => {
      toast({
        type: 'error',
        title: 'Update Failed',
        description: err.message,
      });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: ({ id, archive }: { id: string; archive: boolean }) =>
      adminService.archiveCategory(id, archive),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setArchiveTarget(null);
      toast({
        type: 'info',
        title: updated.isArchived ? 'Category Archived' : 'Category Restored',
        description: `${updated.name} visibility updated.`,
      });
    },
  });

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q));
        if (!matches) return false;
      }

      if (selectedVisibility === 'ACTIVE' && (!c.isActive || c.isArchived)) return false;
      if (selectedVisibility === 'HIDDEN' && (c.isActive || c.isArchived)) return false;
      if (selectedVisibility === 'ARCHIVED' && !c.isArchived) return false;
      if (selectedVisibility !== 'ARCHIVED' && c.isArchived) return false;

      return true;
    });
  }, [categories, searchQuery, selectedVisibility]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedVisibility('ALL');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Category Hierarchy"
        description="Organize quick-commerce catalog into browsable parent and sub-taxonomies."
        actions={
          <button
            type="button"
            onClick={() => {
              setEditingCategory(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add Category
          </button>
        }
      />

      {/* Search Toolbar */}
      <SearchToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search category title, slug or keywords..."
        count={filteredCategories.length}
        totalCount={categories.length}
        label="categories"
      />

      {/* Filter Bar */}
      <FilterBar
        onReset={handleResetFilters}
        hasActiveFilters={Boolean(searchQuery) || selectedVisibility !== 'ALL'}
      >
        <FilterDropdown
          label="Visibility"
          value={selectedVisibility}
          onChange={setSelectedVisibility}
          options={[
            { label: 'All Categories', value: 'ALL' },
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Hidden', value: 'HIDDEN' },
            { label: 'Archived', value: 'ARCHIVED' },
          ]}
        />
      </FilterBar>

      {/* Categories Flash Cards Grid */}
      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onView={(c) => setViewingCategory(c)}
              onEdit={(c) => {
                setEditingCategory(c);
                setIsFormOpen(true);
              }}
              onViewProducts={(c) => {
                navigate(`/products?category=${c.id}`);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-card border border-border-light p-10 text-center">
          <p className="text-base font-semibold text-ink-primary mb-1">No categories found</p>
          <p className="text-xs text-ink-secondary max-w-sm mx-auto mb-4">
            Try adjusting your search query or visibility filter.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-700 bg-brand-50 rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>
      )}

      {/* Category Detail Drawer */}
      <DetailsDrawer
        isOpen={Boolean(viewingCategory)}
        onClose={() => setViewingCategory(null)}
        title={viewingCategory?.name || 'Category'}
        subtitle={`Slug: /${viewingCategory?.slug}`}
        badge={<StatusBadge status={viewingCategory?.isActive ? 'ACTIVE' : 'HIDDEN'} />}
        footer={
          viewingCategory && (
            <>
              <button
                type="button"
                onClick={() => {
                  const target = viewingCategory;
                  setViewingCategory(null);
                  setArchiveTarget(target);
                }}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-border-light rounded-lg hover:bg-surface-subtle"
              >
                {viewingCategory.isArchived ? 'Restore' : 'Archive'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = viewingCategory;
                  setViewingCategory(null);
                  setEditingCategory(target);
                  setIsFormOpen(true);
                }}
                className="px-3.5 py-2 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg"
              >
                Edit Category
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate(`/products?category=${viewingCategory.id}`);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-sm"
              >
                <span>View Assigned Products ({viewingCategory.directProductCount})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )
        }
      >
        {viewingCategory && (
          <div className="space-y-5">
            <div className="relative aspect-16/9 rounded-lg overflow-hidden border">
              <img
                src={viewingCategory.imageUrl}
                alt={viewingCategory.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4 bg-surface-secondary/70 rounded-lg border text-xs leading-relaxed text-ink-secondary">
              <p className="font-semibold text-ink-primary mb-1">Description</p>
              {viewingCategory.description || 'No description entered.'}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-border-light">
                <span className="text-ink-muted">Assigned Direct SKUs</span>
                <p className="text-xl font-bold text-ink-primary mt-1">
                  {viewingCategory.directProductCount}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-border-light">
                <span className="text-ink-muted">Hierarchy Level</span>
                <p className="text-sm font-semibold text-brand-700 mt-1">
                  {viewingCategory.parentName ? `Sub of ${viewingCategory.parentName}` : 'Root Category'}
                </p>
              </div>
            </div>

            <div className="space-y-1 pt-2 border-t text-[11px] text-ink-muted">
              <div className="flex justify-between">
                <span>Created:</span>
                <span className="text-ink-secondary">{formatDate(viewingCategory.createdAt)}</span>
              </div>
            </div>
          </div>
        )}
      </DetailsDrawer>

      {/* Category Form Drawer */}
      <CategoryFormDrawer
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCategory(null);
        }}
        categories={categories}
        initialCategory={editingCategory}
        onSubmit={async (data) => {
          const parent = categories.find((c) => c.id === data.parentId);
          const payload = {
            ...data,
            parentName: parent ? parent.name : null,
          };

          if (editingCategory) {
            await updateMutation.mutateAsync({
              id: editingCategory.id,
              updates: payload,
            });
          } else {
            await createMutation.mutateAsync({
              ...payload,
              isArchived: false,
            });
          }
        }}
      />

      {/* Archive Category Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        onConfirm={() => {
          if (archiveTarget) {
            archiveMutation.mutate({
              id: archiveTarget.id,
              archive: !archiveTarget.isArchived,
            });
          }
        }}
        title={archiveTarget?.isArchived ? 'Restore Category?' : 'Archive Category?'}
        description={
          archiveTarget && archiveTarget.directProductCount > 0
            ? `Warning: "${archiveTarget.name}" currently has ${archiveTarget.directProductCount} assigned products. Archiving will hide the category from customer navigation.`
            : `Are you sure you want to change the status of "${archiveTarget?.name}"?`
        }
        confirmLabel={archiveTarget?.isArchived ? 'Restore' : 'Archive'}
        variant={archiveTarget?.isArchived ? 'info' : 'warning'}
        isLoading={archiveMutation.isPending}
      />
    </div>
  );
};
