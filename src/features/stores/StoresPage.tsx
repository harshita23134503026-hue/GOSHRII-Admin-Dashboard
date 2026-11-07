import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Store as StoreIcon, Eye, ShieldAlert, Plus, MapPin, User, Mail, Phone } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Store, CreateStoreInput, UpdateStoreInput } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchToolbar } from '../../components/ui/SearchToolbar';
import { FilterBar, FilterDropdown } from '../../components/ui/FilterControls';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PaginationControls } from '../../components/ui/PaginationControls';
import { StoreProfileDrawer } from './StoreProfileDrawer';
import { StoreFormDrawer } from './StoreFormDrawer';

export const StoresPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [storeToEdit, setStoreToEdit] = useState<Store | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Query stores
  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: () => adminService.getStores(),
  });

  // Create / Update Mutation
  const saveMutation = useMutation({
    mutationFn: async (data: CreateStoreInput) => {
      if (storeToEdit) {
        return adminService.updateStore(storeToEdit.id, data);
      }
      return adminService.createStore(data);
    },
    onSuccess: (savedStore) => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      setIsFormDrawerOpen(false);
      setStoreToEdit(null);
      if (selectedStore?.id === savedStore.id) {
        setSelectedStore(savedStore);
      }
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (storeId: string) => {
      return adminService.toggleStoreStatus(storeId);
    },
    onSuccess: (updatedStore) => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      if (selectedStore?.id === updatedStore.id) {
        setSelectedStore(updatedStore);
      }
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (storeId: string) => {
      return adminService.deleteStore(storeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      setSelectedStore(null);
    },
  });

  // Filter stores
  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          s.storeName.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.userName.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.phone.includes(q) ||
          s.location.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (selectedStatus !== 'ALL' && s.status !== selectedStatus) return false;

      return true;
    });
  }, [stores, searchQuery, selectedStatus]);

  const totalItems = filteredStores.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedStores = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStores.slice(start, start + pageSize);
  }, [filteredStores, currentPage, pageSize]);

  // Columns definition (matching customer directory)
  const columns: Column<Store>[] = [
    {
      key: 'id',
      header: 'STORE ID',
      render: (s) => (
        <span className="font-mono text-xs font-semibold text-ink-muted">{s.id}</span>
      ),
    },
    {
      key: 'storeName',
      header: 'STORE NAME',
      render: (s) => (
        <div>
          <p className="font-semibold text-ink-primary">{s.storeName}</p>
          <p className="text-[11px] text-ink-muted flex items-center gap-1 mt-0.5">
            <span className="text-brand-700 font-medium">{s.category || 'Commerce Store'}</span>
            <span>•</span>
            <span>{s.city}</span>
          </p>
        </div>
      ),
    },
    {
      key: 'userName',
      header: 'USER NAME',
      render: (s) => (
        <span className="font-mono text-xs font-semibold text-brand-800 bg-brand-50 px-2 py-0.5 rounded border border-brand-200/50">
          @{s.userName}
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'CONTACT PHONE',
      render: (s) => (
        <span className="font-mono text-xs text-ink-secondary">{s.phone}</span>
      ),
    },
    {
      key: 'email',
      header: 'EMAIL',
      render: (s) => (
        <span className="text-xs text-ink-secondary">{s.email}</span>
      ),
    },
    {
      key: 'location',
      header: 'LOCATION',
      render: (s) => (
        <span className="text-xs text-ink-secondary flex items-center gap-1 max-w-[220px] truncate" title={`${s.location}, ${s.city}`}>
          <MapPin className="w-3.5 h-3.5 text-ink-muted shrink-0" />
          <span className="truncate">{s.location}</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'ACCOUNT STATUS',
      render: (s) => <StatusBadge status={s.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'ACTION',
      align: 'right',
      render: (s) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedStore(s);
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          Profile
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Store Directory"
          description="Manage registered merchant stores, operator logins, contact coordinates, and fulfillment locations."
        />
        <button
          type="button"
          onClick={() => {
            setStoreToEdit(null);
            setIsFormDrawerOpen(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 rounded-xl transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Register Store
        </button>
      </div>

      {/* Compliance / Privacy Protocol Banner */}
      <div className="p-3 bg-brand-50/40 border border-brand-100 rounded-lg text-xs text-brand-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-brand-600 shrink-0" />
          <span>
            Administrative privacy protocol active: Store credentials, raw phone numbers and passwords are safe and manageable in this console.
          </span>
        </div>
        <span className="font-semibold text-brand-800 whitespace-nowrap">{stores.length} Accounts</span>
      </div>

      {/* Search Toolbar */}
      <SearchToolbar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        placeholder="Search stores by name, user name, phone or email..."
        count={paginatedStores.length}
        totalCount={totalItems}
        label="stores"
      />

      {/* Filter Bar */}
      <FilterBar
        onReset={() => {
          setSearchQuery('');
          setSelectedStatus('ALL');
          setCurrentPage(1);
        }}
        hasActiveFilters={Boolean(searchQuery) || selectedStatus !== 'ALL'}
      >
        <FilterDropdown
          label="Account Status"
          value={selectedStatus}
          onChange={(val) => {
            setSelectedStatus(val);
            setCurrentPage(1);
          }}
          options={[
            { label: 'All Accounts', value: 'ALL' },
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Inactive', value: 'INACTIVE' },
          ]}
        />
      </FilterBar>

      {/* Table */}
      <DataTable
        columns={columns}
        data={paginatedStores}
        keyExtractor={(s) => s.id}
        isLoading={isLoading}
        onRowClick={(s) => setSelectedStore(s)}
      />

      {/* Pagination */}
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

      {/* Store Profile Drawer (View Profile) */}
      <StoreProfileDrawer
        store={selectedStore}
        isOpen={Boolean(selectedStore)}
        onClose={() => setSelectedStore(null)}
        onEdit={(store) => {
          setStoreToEdit(store);
          setIsFormDrawerOpen(true);
        }}
        onToggleStatus={async (storeId) => {
          await toggleStatusMutation.mutateAsync(storeId);
        }}
        onDelete={async (storeId) => {
          await deleteMutation.mutateAsync(storeId);
        }}
      />

      {/* Store Form Drawer (Create / Edit) */}
      <StoreFormDrawer
        isOpen={isFormDrawerOpen}
        onClose={() => {
          setIsFormDrawerOpen(false);
          setStoreToEdit(null);
        }}
        onSubmit={async (data) => {
          await saveMutation.mutateAsync(data);
        }}
        storeToEdit={storeToEdit}
        isSubmitting={saveMutation.isPending}
      />
    </div>
  );
};

