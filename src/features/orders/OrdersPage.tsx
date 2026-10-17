import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Order, OrderStatus } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { SearchToolbar } from '../../components/ui/SearchToolbar';
import { FilterBar, FilterDropdown } from '../../components/ui/FilterControls';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PaginationControls } from '../../components/ui/PaginationControls';
import { OrderDetailsDrawer } from './OrderDetailsDrawer';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useToast } from '../../components/ui/Toast';

export const OrdersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialStatus = searchParams.get('status') || 'ALL';
  const initialSearch = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => adminService.getOrders(),
  });

  // State Transition Mutation
  const statusMutation = useMutation({
    mutationFn: ({ orderId, nextStatus, note }: { orderId: string; nextStatus: OrderStatus; note?: string }) =>
      adminService.updateOrderStatus(orderId, nextStatus, note),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['deliveryPartners'] });
      setSelectedOrder(updatedOrder);
      toast({
        type: 'success',
        title: 'Order Status Updated',
        description: `Order ${updatedOrder.id} is now ${updatedOrder.orderStatus}.`,
      });
    },
    onError: (err: any) => {
      toast({
        type: 'error',
        title: 'Transition Denied',
        description: err.message,
      });
    },
  });

  // Summary Metrics
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'PLACED').length;
  const inProgressCount = orders.filter((o) =>
    ['CONFIRMED', 'PICKING', 'PACKED', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)
  ).length;
  const deliveredCount = orders.filter((o) => o.orderStatus === 'DELIVERED').length;

  // Filter Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          (o.deliveryPartnerName && o.deliveryPartnerName.toLowerCase().includes(q));
        if (!matches) return false;
      }

      if (selectedStatus !== 'ALL' && o.orderStatus !== selectedStatus) return false;
      if (selectedPaymentStatus !== 'ALL' && o.paymentStatus !== selectedPaymentStatus) return false;

      return true;
    });
  }, [orders, searchQuery, selectedStatus, selectedPaymentStatus]);

  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedPaymentStatus('ALL');
    setCurrentPage(1);
    setSearchParams({});
  };

  // Columns
  const columns: Column<Order>[] = [
    {
      key: 'id',
      header: 'Order ID',
      render: (o) => (
        <span className="font-mono font-bold text-brand-700 hover:underline">
          {o.id}
        </span>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (o) => (
        <div>
          <p className="font-semibold text-ink-primary">{o.customerName}</p>
          <p className="text-[11px] text-ink-muted">{o.deliveryAddress.area}</p>
        </div>
      ),
    },
    {
      key: 'orderDate',
      header: 'Placed Time',
      render: (o) => <span className="text-xs text-ink-secondary">{formatDate(o.orderDate)}</span>,
    },
    {
      key: 'items',
      header: 'Items',
      render: (o) => (
        <span className="text-xs text-ink-secondary font-medium">
          {o.items.length} {o.items.length === 1 ? 'item' : 'items'}
        </span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Order Total',
      align: 'right',
      render: (o) => (
        <span className="font-bold text-ink-primary">{formatCurrency(o.totalAmount)}</span>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (o) => <StatusBadge status={o.paymentStatus} size="sm" />,
    },
    {
      key: 'orderStatus',
      header: 'Order Status',
      render: (o) => <StatusBadge status={o.orderStatus} size="sm" />,
    },
    {
      key: 'deliveryPartner',
      header: 'Fulfillment / Rider',
      render: (o) => (
        <span className="text-xs text-ink-secondary">
          {o.deliveryPartnerName ? o.deliveryPartnerName : <span className="text-ink-muted italic">Store Queue</span>}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (o) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOrder(o);
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order Processing & Dispatch"
        description="Fulfillment queue, picker bag allocation, rider dispatches and order lifecycle management."
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Total Orders"
          value={totalOrdersCount}
          subtitle="Processed at Koramangala Hub"
          icon={ShoppingBag}
        />
        <StatCard
          title="Pending Confirmation"
          value={pendingOrdersCount}
          subtitle="Awaiting picker acceptance"
          icon={Clock}
          variant={pendingOrdersCount > 0 ? 'warning' : 'default'}
          onClick={() => {
            setSelectedStatus('PLACED');
            setCurrentPage(1);
          }}
        />
        <StatCard
          title="In Fulfillment Pipeline"
          value={inProgressCount}
          subtitle="Picking, packing & dispatched"
          icon={Truck}
        />
        <StatCard
          title="Successfully Delivered"
          value={deliveredCount}
          subtitle="Completed deliveries"
          icon={CheckCircle2}
          variant="success"
          onClick={() => {
            setSelectedStatus('DELIVERED');
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Search Toolbar */}
      <SearchToolbar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        placeholder="Search orders by Order ID (ORD-...), customer name, or phone..."
        count={paginatedOrders.length}
        totalCount={totalItems}
        label="orders"
      />

      {/* Filter Bar */}
      <FilterBar
        onReset={handleResetFilters}
        hasActiveFilters={Boolean(searchQuery) || selectedStatus !== 'ALL' || selectedPaymentStatus !== 'ALL'}
      >
        <FilterDropdown
          label="Order Status"
          value={selectedStatus}
          onChange={(val) => {
            setSelectedStatus(val);
            setCurrentPage(1);
          }}
          options={[
            { label: 'All Statuses', value: 'ALL' },
            { label: 'Placed (New)', value: 'PLACED' },
            { label: 'Confirmed', value: 'CONFIRMED' },
            { label: 'Picking', value: 'PICKING' },
            { label: 'Packed', value: 'PACKED' },
            { label: 'Out for Delivery', value: 'OUT_FOR_DELIVERY' },
            { label: 'Delivered', value: 'DELIVERED' },
            { label: 'Cancelled', value: 'CANCELLED' },
          ]}
        />

        <FilterDropdown
          label="Payment Status"
          value={selectedPaymentStatus}
          onChange={(val) => {
            setSelectedPaymentStatus(val);
            setCurrentPage(1);
          }}
          options={[
            { label: 'All Payments', value: 'ALL' },
            { label: 'Paid', value: 'PAID' },
            { label: 'Pending', value: 'PENDING' },
            { label: 'Failed', value: 'FAILED' },
            { label: 'Refunded', value: 'REFUNDED' },
          ]}
        />
      </FilterBar>

      {/* Orders Table */}
      <DataTable
        columns={columns}
        data={paginatedOrders}
        keyExtractor={(o) => o.id}
        isLoading={isLoading}
        onRowClick={(o) => setSelectedOrder(o)}
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

      {/* Order Details Drawer */}
      <OrderDetailsDrawer
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onAdvanceStatus={async (orderId, nextStatus, note) => {
          await statusMutation.mutateAsync({ orderId, nextStatus, note });
        }}
      />
    </div>
  );
};
