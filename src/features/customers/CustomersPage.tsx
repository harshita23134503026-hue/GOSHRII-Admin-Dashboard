import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Eye, ShieldAlert, ShoppingBag } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Customer } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchToolbar } from '../../components/ui/SearchToolbar';
import { FilterBar, FilterDropdown } from '../../components/ui/FilterControls';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PaginationControls } from '../../components/ui/PaginationControls';
import { CustomerProfileDrawer } from './CustomerProfileDrawer';
import { formatCurrency, formatDate, maskEmail, maskPhone } from '../../utils/formatters';

export const CustomersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Queries
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => adminService.getCustomers(),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => adminService.getOrders(),
  });

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          c.name.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q);
        if (!matches) return false;
      }

      if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;

      return true;
    });
  }, [customers, searchQuery, selectedStatus]);

  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  // Orders for selected customer
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter((o) => o.customerId === selectedCustomer.id);
  }, [orders, selectedCustomer]);

  // Columns
  const columns: Column<Customer>[] = [
    {
      key: 'id',
      header: 'Customer ID',
      render: (c) => <span className="font-mono text-xs font-semibold text-ink-muted">{c.id}</span>,
    },
    {
      key: 'name',
      header: 'Customer Name',
      render: (c) => (
        <div>
          <p className="font-semibold text-ink-primary">{c.name}</p>
          <p className="text-[11px] text-ink-muted">{maskEmail(c.email)}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Contact Phone',
      render: (c) => <span className="font-mono text-xs text-ink-secondary">{maskPhone(c.phone)}</span>,
    },
    {
      key: 'totalOrders',
      header: 'Orders',
      align: 'right',
      render: (c) => <span className="font-semibold text-ink-primary">{c.totalOrders}</span>,
    },
    {
      key: 'totalSpend',
      header: 'Lifetime Spend',
      align: 'right',
      render: (c) => (
        <span className="font-bold text-brand-700">{formatCurrency(c.totalSpend)}</span>
      ),
    },
    {
      key: 'lastOrderDate',
      header: 'Last Order',
      render: (c) => <span className="text-xs text-ink-secondary">{formatDate(c.lastOrderDate, false)}</span>,
    },
    {
      key: 'status',
      header: 'Account Status',
      render: (c) => <StatusBadge status={c.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (c) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedCustomer(c);
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
      <PageHeader
        title="Customer Directory (Read-Only)"
        description="Customer directory with masked contact details, order frequencies and address books."
      />

      {/* Compliance Information Card */}
      <div className="p-3 bg-brand-50/40 border border-brand-100 rounded-lg text-xs text-brand-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-brand-600 shrink-0" />
          <span>
            Administrative privacy protocol active: Customer credentials, raw phone numbers and passwords are safe and uneditable in this console.
          </span>
        </div>
        <span className="font-semibold text-brand-800 whitespace-nowrap">{customers.length} Accounts</span>
      </div>

      {/* Search Toolbar */}
      <SearchToolbar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        placeholder="Search customers by name, phone or email..."
        count={paginatedCustomers.length}
        totalCount={totalItems}
        label="customers"
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
        data={paginatedCustomers}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        onRowClick={(c) => setSelectedCustomer(c)}
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

      {/* Customer Profile Drawer */}
      <CustomerProfileDrawer
        customer={selectedCustomer}
        customerOrders={customerOrders}
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
};
