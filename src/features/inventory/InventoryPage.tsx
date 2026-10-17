import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  Boxes,
  Package,
  AlertTriangle,
  PackageX,
  History,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Product, StockAdjustment } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { SearchToolbar } from '../../components/ui/SearchToolbar';
import { FilterBar, FilterDropdown } from '../../components/ui/FilterControls';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PaginationControls } from '../../components/ui/PaginationControls';
import { StockAdjustmentDrawer } from './StockAdjustmentDrawer';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import { useToast } from '../../components/ui/Toast';

export const InventoryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get('search') || '';
  const initialStock = searchParams.get('stock') || 'ALL';

  const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStock, setSelectedStock] = useState(initialStock);
  const [selectedProductForAdjustment, setSelectedProductForAdjustment] = useState<Product | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Queries
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => adminService.getProducts(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => adminService.getCategories(),
  });

  const { data: adjustments = [], isLoading: adjustmentsLoading } = useQuery({
    queryKey: ['stockAdjustments'],
    queryFn: () => adminService.getStockAdjustments(),
  });

  // Stock Adjustment Mutation
  const adjustmentMutation = useMutation({
    mutationFn: (params: {
      productId: string;
      type: 'ADD' | 'REMOVE' | 'SET';
      amount: number;
      reason: string;
    }) => adminService.adjustStock(params),
    onSuccess: ({ product }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockAdjustments'] });
      toast({
        type: 'success',
        title: 'Stock Adjusted Successfully',
        description: `${product.name} is now updated to ${product.stockQuantity} units (${product.availableQuantity} available).`,
      });
    },
    onError: (err: any) => {
      toast({
        type: 'error',
        title: 'Stock Adjustment Failed',
        description: err.message || 'Could not adjust stock.',
      });
    },
  });

  // Calculate KPIs
  const totalSkus = products.length;
  const totalUnits = products.reduce((sum, p) => sum + p.availableQuantity, 0);
  const lowStockCount = products.filter((p) => p.stockStatus === 'LOW_STOCK').length;
  const outOfStockCount = products.filter((p) => p.stockStatus === 'OUT_OF_STOCK').length;

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (selectedCategory !== 'ALL' && p.categoryId !== selectedCategory) return false;
      if (selectedStock !== 'ALL' && p.stockStatus !== selectedStock) return false;

      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedStock]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedStock('ALL');
    setCurrentPage(1);
    setSearchParams({});
  };

  // Inventory Table Columns
  const inventoryColumns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Item & SKU',
      render: (p) => (
        <div className="flex items-center gap-3 min-w-[200px]">
          <img
            src={p.imageUrl}
            alt={p.name}
            className="w-9 h-9 rounded object-cover border border-border-light shrink-0"
          />
          <div className="min-w-0">
            <p className="font-semibold text-ink-primary truncate">{p.name}</p>
            <p className="text-[11px] text-ink-muted">
              {p.packSize} • <span className="font-mono">{p.sku}</span>
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
      key: 'stockQuantity',
      header: 'Total Physical',
      align: 'right',
      render: (p) => <span className="font-medium text-ink-primary">{p.stockQuantity}</span>,
    },
    {
      key: 'reservedQuantity',
      header: 'Reserved',
      align: 'right',
      render: (p) => (
        <span className="text-ink-secondary">
          {p.reservedQuantity > 0 ? (
            <span className="text-amber-700 font-medium">({p.reservedQuantity})</span>
          ) : (
            '0'
          )}
        </span>
      ),
    },
    {
      key: 'availableQuantity',
      header: 'Available to Sell',
      align: 'right',
      render: (p) => (
        <span
          className={`font-bold text-sm ${
            p.availableQuantity === 0
              ? 'text-red-600'
              : p.availableQuantity <= p.lowStockThreshold
              ? 'text-amber-600'
              : 'text-brand-700'
          }`}
        >
          {p.availableQuantity}
        </span>
      ),
    },
    {
      key: 'lowStockThreshold',
      header: 'Threshold',
      align: 'right',
      render: (p) => <span className="text-xs text-ink-muted">{p.lowStockThreshold} units</span>,
    },
    {
      key: 'stockStatus',
      header: 'Stock Status',
      render: (p) => <StatusBadge status={p.stockStatus} size="sm" />,
    },
    {
      key: 'updatedAt',
      header: 'Last Audit',
      render: (p) => <span className="text-ink-muted">{formatRelativeTime(p.updatedAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (p) => (
        <button
          type="button"
          onClick={() => setSelectedProductForAdjustment(p)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
        >
          <Boxes className="w-3.5 h-3.5" />
          Adjust Stock
        </button>
      ),
    },
  ];

  // History Table Columns
  const historyColumns: Column<StockAdjustment>[] = [
    {
      key: 'productName',
      header: 'Product',
      render: (a) => (
        <div>
          <p className="font-semibold text-ink-primary">{a.productName}</p>
          <p className="font-mono text-[11px] text-ink-muted">{a.productSku}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Action',
      render: (a) => {
        const badges = {
          ADD: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          REMOVE: 'bg-red-50 text-red-800 border-red-200',
          SET: 'bg-blue-50 text-blue-800 border-blue-200',
        };
        return (
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${badges[a.type]}`}>
            {a.type}
          </span>
        );
      },
    },
    {
      key: 'delta',
      header: 'Units Changed',
      render: (a) => (
        <div className="font-semibold">
          {a.type === 'ADD' && <span className="text-emerald-700">+{a.adjustmentAmount}</span>}
          {a.type === 'REMOVE' && <span className="text-red-600">-{a.adjustmentAmount}</span>}
          {a.type === 'SET' && <span className="text-blue-700">Set to {a.newQuantity}</span>}
        </div>
      ),
    },
    {
      key: 'progression',
      header: 'Stock Flow',
      render: (a) => (
        <div className="text-xs text-ink-secondary">
          {a.previousQuantity} → <strong className="text-ink-primary">{a.newQuantity}</strong>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Audit Reason',
      render: (a) => <span className="text-xs text-ink-secondary">{a.reason}</span>,
    },
    {
      key: 'adminName',
      header: 'Acting Officer',
      render: (a) => <span className="text-xs font-medium text-slate-700">{a.adminName}</span>,
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (a) => <span className="text-xs text-ink-muted">{formatDate(a.timestamp)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dark Store Inventory"
        description="Physical stock levels, reservation allocations, low-stock safety thresholds and adjustment audit logs."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Active SKUs"
          value={totalSkus}
          subtitle="Managed in dark store"
          icon={Package}
        />
        <StatCard
          title="Available Units"
          value={totalUnits}
          subtitle="Available-to-sell inventory"
          icon={Boxes}
          variant="success"
        />
        <StatCard
          title="Low-Stock Alerts"
          value={lowStockCount}
          subtitle="Below safety threshold"
          icon={AlertTriangle}
          variant={lowStockCount > 0 ? 'warning' : 'default'}
          onClick={() => {
            setSelectedStock('LOW_STOCK');
            setActiveTab('inventory');
          }}
        />
        <StatCard
          title="Out-of-Stock SKUs"
          value={outOfStockCount}
          subtitle="Immediate replenishment needed"
          icon={PackageX}
          variant={outOfStockCount > 0 ? 'danger' : 'default'}
          onClick={() => {
            setSelectedStock('OUT_OF_STOCK');
            setActiveTab('inventory');
          }}
        />
      </div>

      {/* Internal Tabs: Live Inventory vs History */}
      <div className="flex border-b border-border-light space-x-6">
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 text-sm font-semibold transition-all relative ${
            activeTab === 'inventory'
              ? 'text-brand-700 border-b-2 border-brand-500'
              : 'text-ink-secondary hover:text-ink-primary'
          }`}
        >
          Physical Stock Inventory ({filteredProducts.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'text-brand-700 border-b-2 border-brand-500'
              : 'text-ink-secondary hover:text-ink-primary'
          }`}
        >
          <History className="w-4 h-4" />
          Stock Adjustment Audit Log ({adjustments.length})
        </button>
      </div>

      {activeTab === 'inventory' ? (
        <div className="space-y-4">
          {/* Search Toolbar */}
          <SearchToolbar
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              setCurrentPage(1);
            }}
            placeholder="Search items by product name, SKU, or brand..."
            count={paginatedProducts.length}
            totalCount={totalItems}
            label="SKUs"
          />

          {/* Filter Bar */}
          <FilterBar
            onReset={handleResetFilters}
            hasActiveFilters={Boolean(searchQuery) || selectedCategory !== 'ALL' || selectedStock !== 'ALL'}
          >
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
              label="Stock Level"
              value={selectedStock}
              onChange={(val) => {
                setSelectedStock(val);
                setCurrentPage(1);
              }}
              options={[
                { label: 'All Stock Levels', value: 'ALL' },
                { label: 'In Stock', value: 'IN_STOCK' },
                { label: 'Low Stock', value: 'LOW_STOCK' },
                { label: 'Out of Stock', value: 'OUT_OF_STOCK' },
              ]}
            />
          </FilterBar>

          {/* Table */}
          <DataTable
            columns={inventoryColumns}
            data={paginatedProducts}
            keyExtractor={(p) => p.id}
            isLoading={productsLoading}
          />

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
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-surface-secondary border border-border-light rounded-lg text-xs text-ink-secondary flex items-center justify-between">
            <span>
              All adjustments are stored atomically with reason codes and admin signatures.
            </span>
            <span className="font-semibold text-ink-primary">{adjustments.length} audit entries</span>
          </div>

          <DataTable
            columns={historyColumns}
            data={adjustments}
            keyExtractor={(a) => a.id}
            isLoading={adjustmentsLoading}
          />
        </div>
      )}

      {/* Adjust Stock Drawer */}
      <StockAdjustmentDrawer
        product={selectedProductForAdjustment}
        isOpen={Boolean(selectedProductForAdjustment)}
        onClose={() => setSelectedProductForAdjustment(null)}
        onConfirm={async (params) => {
          await adjustmentMutation.mutateAsync(params);
        }}
      />
    </div>
  );
};
