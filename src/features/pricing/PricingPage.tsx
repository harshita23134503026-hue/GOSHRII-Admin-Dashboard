import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag, Edit3, PlusCircle, History, Sparkles, CheckCircle2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Product, PromotionalOffer } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchToolbar } from '../../components/ui/SearchToolbar';
import { FilterBar, FilterDropdown } from '../../components/ui/FilterControls';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PaginationControls } from '../../components/ui/PaginationControls';
import { EditPriceDrawer } from './EditPriceDrawer';
import { OfferFormDrawer } from './OfferFormDrawer';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useToast } from '../../components/ui/Toast';

export const PricingPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'pricing' | 'offers'>('pricing');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedProductForPriceEdit, setSelectedProductForPriceEdit] = useState<Product | null>(null);

  const [isOfferDrawerOpen, setIsOfferDrawerOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<PromotionalOffer | null>(null);

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

  const { data: offers = [], isLoading: offersLoading } = useQuery({
    queryKey: ['offers'],
    queryFn: () => adminService.getOffers(),
  });

  // Price Update Mutation
  const priceMutation = useMutation({
    mutationFn: (params: {
      productId: string;
      newMrp: number;
      newSellingPrice: number;
      reason: string;
    }) => adminService.updatePrice(params),
    onSuccess: ({ product }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['priceHistories'] });
      toast({
        type: 'success',
        title: 'Price Updated Successfully',
        description: `${product.name} is now priced at ${formatCurrency(product.sellingPrice)} (MRP ${formatCurrency(product.mrp)}).`,
      });
    },
    onError: (err: any) => {
      toast({
        type: 'error',
        title: 'Price Update Failed',
        description: err.message,
      });
    },
  });

  // Offer Mutations
  const createOfferMutation = useMutation({
    mutationFn: (data: any) => {
      const cat = categories.find((c) => c.id === data.targetId);
      return adminService.createOffer({
        ...data,
        targetName: cat ? cat.name : 'All Catalog',
      });
    },
    onSuccess: (newOffer) => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast({
        type: 'success',
        title: 'Offer Campaign Launched',
        description: `Promo code ${newOffer.code} is now live.`,
      });
    },
  });

  const updateOfferMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PromotionalOffer> }) =>
      adminService.updateOffer(id, updates),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast({
        type: 'success',
        title: 'Offer Updated',
        description: `Campaign ${updated.title} updated.`,
      });
    },
  });

  // Filter products
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

      return true;
    });
  }, [products, searchQuery, selectedCategory]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Pricing Columns
  const pricingColumns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product & SKU',
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
      key: 'mrp',
      header: 'MRP',
      align: 'right',
      render: (p) => (
        <span className="text-xs font-medium text-ink-secondary">{formatCurrency(p.mrp)}</span>
      ),
    },
    {
      key: 'sellingPrice',
      header: 'Selling Price',
      align: 'right',
      render: (p) => (
        <span className="text-sm font-bold text-brand-700">{formatCurrency(p.sellingPrice)}</span>
      ),
    },
    {
      key: 'discountPercent',
      header: 'Calculated Discount',
      align: 'right',
      render: (p) => (
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
            p.discountPercent > 0
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'text-ink-muted'
          }`}
        >
          {p.discountPercent > 0 ? `${p.discountPercent}% OFF` : '0%'}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Last Modified',
      render: (p) => <span className="text-xs text-ink-muted">{formatDate(p.updatedAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (p) => (
        <button
          type="button"
          onClick={() => setSelectedProductForPriceEdit(p)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Edit Price
        </button>
      ),
    },
  ];

  // Offers Columns
  const offerColumns: Column<PromotionalOffer>[] = [
    {
      key: 'title',
      header: 'Offer Campaign',
      render: (o) => (
        <div>
          <p className="font-semibold text-ink-primary">{o.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100">
              {o.code}
            </span>
            <span className="text-[11px] text-ink-muted">
              Scope: {o.targetName || 'All Products'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'discountValue',
      header: 'Discount Rule',
      render: (o) => (
        <span className="font-bold text-xs text-ink-primary">
          {o.type === 'PERCENTAGE' ? `${o.discountValue}% Flat` : `₹${o.discountValue} Off`}
        </span>
      ),
    },
    {
      key: 'validity',
      header: 'Active Schedule',
      render: (o) => (
        <div className="text-xs text-ink-secondary">
          {formatDate(o.startDate, false)} to {formatDate(o.endDate, false)}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (o) => <StatusBadge status={o.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (o) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingOffer(o);
              setIsOfferDrawerOpen(true);
            }}
            className="p-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50 rounded"
            title="Edit Offer"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pricing & Promotional Offers"
        description="Manage product selling prices, MRP bounds, margin rules and customer discount campaigns."
        actions={
          activeTab === 'offers' && (
            <button
              type="button"
              onClick={() => {
                setEditingOffer(null);
                setIsOfferDrawerOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Create Offer
            </button>
          )
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-border-light space-x-6">
        <button
          type="button"
          onClick={() => setActiveTab('pricing')}
          className={`pb-3 text-sm font-semibold transition-all ${
            activeTab === 'pricing'
              ? 'text-brand-700 border-b-2 border-brand-500'
              : 'text-ink-secondary hover:text-ink-primary'
          }`}
        >
          Product Pricing & MRP ({products.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('offers')}
          className={`pb-3 text-sm font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'offers'
              ? 'text-brand-700 border-b-2 border-brand-500'
              : 'text-ink-secondary hover:text-ink-primary'
          }`}
        >
          <Sparkles className="w-4 h-4 text-brand-600" />
          Promotional Campaigns ({offers.length})
        </button>
      </div>

      {activeTab === 'pricing' ? (
        <div className="space-y-4">
          <SearchToolbar
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              setCurrentPage(1);
            }}
            placeholder="Search products by title, SKU, or brand..."
            count={paginatedProducts.length}
            totalCount={totalItems}
            label="products"
          />

          <FilterBar
            onReset={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setCurrentPage(1);
            }}
            hasActiveFilters={Boolean(searchQuery) || selectedCategory !== 'ALL'}
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
          </FilterBar>

          <DataTable
            columns={pricingColumns}
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
              Offers apply transparent discounts during checkout without modifying master catalog base prices.
            </span>
            <span className="font-semibold text-ink-primary">{offers.length} active campaigns</span>
          </div>

          <DataTable
            columns={offerColumns}
            data={offers}
            keyExtractor={(o) => o.id}
            isLoading={offersLoading}
          />
        </div>
      )}

      {/* Edit Price Drawer */}
      <EditPriceDrawer
        product={selectedProductForPriceEdit}
        isOpen={Boolean(selectedProductForPriceEdit)}
        onClose={() => setSelectedProductForPriceEdit(null)}
        onConfirm={async (params) => {
          await priceMutation.mutateAsync(params);
        }}
      />

      {/* Offer Form Drawer */}
      <OfferFormDrawer
        isOpen={isOfferDrawerOpen}
        onClose={() => {
          setIsOfferDrawerOpen(false);
          setEditingOffer(null);
        }}
        categories={categories}
        initialOffer={editingOffer}
        onSubmit={async (data) => {
          if (editingOffer) {
            await updateOfferMutation.mutateAsync({
              id: editingOffer.id,
              updates: data,
            });
          } else {
            await createOfferMutation.mutateAsync(data);
          }
        }}
      />
    </div>
  );
};
