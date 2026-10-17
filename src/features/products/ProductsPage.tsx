import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  LayoutGrid,
  List,
  PlusCircle,
  Eye,
  Edit3,
  Archive,
  RotateCcw,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Product, StockStatus } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchToolbar } from '../../components/ui/SearchToolbar';
import { FilterBar, FilterDropdown } from '../../components/ui/FilterControls';
import { ProductCard } from '../../components/ui/ProductCard';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PaginationControls } from '../../components/ui/PaginationControls';
import { ProductDetailsDrawer } from './ProductDetailsDrawer';
import { ProductFormDrawer } from './ProductFormDrawer';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useToast } from '../../components/ui/Toast';

export const ProductsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state persistence
  const initialSearch = searchParams.get('search') || '';
  const initialStock = searchParams.get('stock') || 'ALL';
  const initialCategory = searchParams.get('category') || 'ALL';

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedStock, setSelectedStock] = useState<string>(initialStock);
  const [selectedVisibility, setSelectedVisibility] = useState<string>('ALL');
  const [onlyDiscounted, setOnlyDiscounted] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('recently_updated');

  // Drawers & Dialog state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Product | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Fetch products and categories
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => adminService.getProducts(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => adminService.getCategories(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => {
      const cat = categories.find((c) => c.id === data.categoryId);
      return adminService.createProduct({
        ...data,
        categoryName: cat?.name || 'Uncategorized',
        reservedQuantity: 0,
        isArchived: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        type: 'success',
        title: 'Product Created',
        description: 'New product has been added to the dark store catalog.',
      });
    },
    onError: (err: any) => {
      toast({
        type: 'error',
        title: 'Creation Failed',
        description: err.message || 'Could not save product.',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Product> }) =>
      adminService.updateProduct(id, updates),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (selectedProduct?.id === updated.id) {
        setSelectedProduct(updated);
      }
      toast({
        type: 'success',
        title: 'Product Updated',
        description: `Changes saved for ${updated.name}.`,
      });
    },
    onError: (err: any) => {
      toast({
        type: 'error',
        title: 'Update Failed',
        description: err.message || 'Could not update product.',
      });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: ({ id, archive }: { id: string; archive: boolean }) =>
      adminService.archiveProduct(id, archive),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setArchiveTarget(null);
      if (selectedProduct?.id === updated.id) {
        setSelectedProduct(updated);
      }
      toast({
        type: 'info',
        title: updated.isArchived ? 'Product Archived' : 'Product Restored',
        description: `${updated.name} status updated.`,
      });
    },
  });

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Category
      if (selectedCategory !== 'ALL' && p.categoryId !== selectedCategory) {
        return false;
      }

      // Stock Status
      if (selectedStock !== 'ALL' && p.stockStatus !== selectedStock) {
        return false;
      }

      // Visibility
      if (selectedVisibility === 'ACTIVE' && (!p.isActive || p.isArchived)) return false;
      if (selectedVisibility === 'HIDDEN' && (p.isActive || p.isArchived)) return false;
      if (selectedVisibility === 'ARCHIVED' && !p.isArchived) return false;
      if (selectedVisibility !== 'ARCHIVED' && p.isArchived) return false;

      // Discounted
      if (onlyDiscounted && p.discountPercent <= 0) return false;

      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedStock, selectedVisibility, onlyDiscounted]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price_asc') return a.sellingPrice - b.sellingPrice;
      if (sortBy === 'price_desc') return b.sellingPrice - a.sellingPrice;
      if (sortBy === 'quantity') return b.availableQuantity - a.availableQuantity;
      // Default: recently updated
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [filteredProducts, sortBy]);

  // Paginated items
  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedProducts.slice(start, start + pageSize);
  }, [sortedProducts, currentPage, pageSize]);

  // Handle Search Input update + URL sync
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setSearchParams((prev) => {
      if (query) prev.set('search', query);
      else prev.delete('search');
      return prev;
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedStock('ALL');
    setSelectedVisibility('ALL');
    setOnlyDiscounted(false);
    setCurrentPage(1);
    setSearchParams({});
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedCategory !== 'ALL' ||
    selectedStock !== 'ALL' ||
    selectedVisibility !== 'ALL' ||
    onlyDiscounted;

  // Table Columns
  const tableColumns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product Details',
      render: (p) => (
        <div className="flex items-center gap-3 min-w-[220px]">
          <img
            src={p.imageUrl}
            alt={p.name}
            className="w-10 h-10 rounded-md object-cover border border-border-light shrink-0"
          />
          <div className="min-w-0">
            <p className="font-semibold text-ink-primary truncate hover:text-brand-600 transition-colors">
              {p.name}
            </p>
            <p className="text-[11px] text-ink-muted">
              {p.brand} • <span className="font-mono">{p.sku}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'categoryName',
      header: 'Category',
      render: (p) => <span className="text-xs text-ink-secondary">{p.categoryName}</span>,
    },
    {
      key: 'packSize',
      header: 'Pack Size',
      render: (p) => <span className="text-xs font-medium text-ink-primary">{p.packSize}</span>,
    },
    {
      key: 'sellingPrice',
      header: 'Price',
      render: (p) => (
        <div>
          <span className="font-bold text-ink-primary">{formatCurrency(p.sellingPrice)}</span>
          {p.mrp > p.sellingPrice && (
            <span className="text-[11px] text-ink-muted line-through ml-1.5">
              {formatCurrency(p.mrp)}
            </span>
          )}
          {p.discountPercent > 0 && (
            <span className="ml-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {p.discountPercent}%
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'availableQuantity',
      header: 'Stock',
      render: (p) => (
        <div>
          <span className="font-semibold text-ink-primary">{p.availableQuantity}</span>
          <span className="text-[11px] text-ink-muted ml-1">avail</span>
        </div>
      ),
    },
    {
      key: 'stockStatus',
      header: 'Status',
      render: (p) => <StatusBadge status={p.stockStatus} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProduct(p);
              setIsDetailOpen(true);
            }}
            className="p-1 rounded text-ink-muted hover:text-ink-primary hover:bg-slate-100"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEditingProduct(p);
              setIsFormOpen(true);
            }}
            className="p-1 rounded text-brand-600 hover:text-brand-700 hover:bg-brand-50"
            title="Edit Product"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        title="Product Catalog"
        description="Manage dark store products, SKUs, pack sizes, inventory thresholds and pricing."
        actions={
          <button
            type="button"
            onClick={() => {
              setEditingProduct(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add Product
          </button>
        }
      />

      {/* Search Toolbar & View Mode Switcher */}
      <SearchToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        placeholder="Search products by title, SKU code, or brand..."
        count={paginatedProducts.length}
        totalCount={totalItems}
        label="products"
        rightSlot={
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="inline-flex p-1 bg-surface-secondary border border-border-light rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-ink-primary shadow-xs'
                    : 'text-ink-muted hover:text-ink-primary'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-ink-primary shadow-xs'
                    : 'text-ink-muted hover:text-ink-primary'
                }`}
                title="Table view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        }
      />

      {/* Filter Bar */}
      <FilterBar onReset={handleResetFilters} hasActiveFilters={hasActiveFilters}>
        <FilterDropdown
          label="Category"
          value={selectedCategory}
          onChange={(val) => {
            setSelectedCategory(val);
            setCurrentPage(1);
          }}
          options={[
            { label: 'All Categories', value: 'ALL' },
            ...categories.map((c) => ({ label: c.name, value: c.id })),
          ]}
        />

        <FilterDropdown
          label="Stock Status"
          value={selectedStock}
          onChange={(val) => {
            setSelectedStock(val);
            setCurrentPage(1);
          }}
          options={[
            { label: 'All Levels', value: 'ALL' },
            { label: 'In Stock', value: 'IN_STOCK' },
            { label: 'Low Stock', value: 'LOW_STOCK' },
            { label: 'Out of Stock', value: 'OUT_OF_STOCK' },
          ]}
        />

        <FilterDropdown
          label="Visibility"
          value={selectedVisibility}
          onChange={(val) => {
            setSelectedVisibility(val);
            setCurrentPage(1);
          }}
          options={[
            { label: 'All Products', value: 'ALL' },
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Hidden', value: 'HIDDEN' },
            { label: 'Archived', value: 'ARCHIVED' },
          ]}
        />

        <label className="flex items-center gap-1.5 cursor-pointer ml-1 select-none">
          <input
            type="checkbox"
            checked={onlyDiscounted}
            onChange={(e) => {
              setOnlyDiscounted(e.target.checked);
              setCurrentPage(1);
            }}
            className="w-3.5 h-3.5 text-brand-600 rounded border-border-light focus:ring-brand-500"
          />
          <span className="text-xs text-ink-secondary">Discounted Only</span>
        </label>

        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-xs text-ink-secondary">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs bg-white border border-border-light rounded-md px-2 py-1 text-ink-primary font-medium focus:outline-none"
          >
            <option value="recently_updated">Recently Updated</option>
            <option value="name">Product Name (A-Z)</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="quantity">Stock Quantity</option>
          </select>
        </div>
      </FilterBar>

      {/* Main Grid or Table Presentation */}
      {viewMode === 'grid' ? (
        paginatedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onView={(p) => {
                  setSelectedProduct(p);
                  setIsDetailOpen(true);
                }}
                onEdit={(p) => {
                  setEditingProduct(p);
                  setIsFormOpen(true);
                }}
                onArchive={(p) => setArchiveTarget(p)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-card border border-border-light p-10 text-center">
            <p className="text-base font-semibold text-ink-primary mb-1">No products match criteria</p>
            <p className="text-xs text-ink-secondary max-w-sm mx-auto mb-4">
              Try clearing some active filters or modifying your search keyword.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-700 bg-brand-50 rounded-lg"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          </div>
        )
      ) : (
        <DataTable
          columns={tableColumns}
          data={paginatedProducts}
          keyExtractor={(p) => p.id}
          isLoading={productsLoading}
          onRowClick={(p) => {
            setSelectedProduct(p);
            setIsDetailOpen(true);
          }}
        />
      )}

      {/* Pagination Controls */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        pageSizeOptions={[8, 12, 24, 48]}
      />

      {/* Product Details Drawer */}
      <ProductDetailsDrawer
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={(p) => {
          setIsDetailOpen(false);
          setEditingProduct(p);
          setIsFormOpen(true);
        }}
        onArchive={(p) => {
          setIsDetailOpen(false);
          setArchiveTarget(p);
        }}
      />

      {/* Product Form Drawer (Create / Edit) */}
      <ProductFormDrawer
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
        categories={categories}
        initialProduct={editingProduct}
        onSubmit={async (data) => {
          if (editingProduct) {
            await updateMutation.mutateAsync({
              id: editingProduct.id,
              updates: data,
            });
          } else {
            await createMutation.mutateAsync(data);
          }
        }}
      />

      {/* Confirmation Dialog for Archiving / Restoring */}
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
        title={archiveTarget?.isArchived ? 'Restore Product?' : 'Archive Product?'}
        description={
          archiveTarget?.isArchived
            ? `Restoring "${archiveTarget?.name}" will make it available in the active catalog listing.`
            : `Archiving "${archiveTarget?.name}" removes it from the customer catalog while preserving historical order logs and inventory records.`
        }
        confirmLabel={archiveTarget?.isArchived ? 'Restore' : 'Archive Product'}
        variant={archiveTarget?.isArchived ? 'info' : 'warning'}
        isLoading={archiveMutation.isPending}
      />
    </div>
  );
};
