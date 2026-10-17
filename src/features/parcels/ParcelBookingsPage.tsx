import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SearchToolbar } from '../../components/ui/SearchToolbar';
import { FilterDropdown, FilterOption } from '../../components/ui/FilterControls';
import { PaginationControls } from '../../components/ui/PaginationControls';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ParcelDetailsDrawer } from './ParcelDetailsDrawer';
import { AddParcelDrawer } from './AddParcelDrawer';
import { ParcelBooking } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const ParcelBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [selectedParcel, setSelectedParcel] = useState<ParcelBooking | null>(null);
  const [showAddDrawer, setShowAddDrawer] = useState(false);

  const { data: parcels = [], isLoading: parcelsLoading, refetch } = useQuery({
    queryKey: ['parcels'],
    queryFn: () => adminService.getParcels(),
  });

  const { data: couriers = [] } = useQuery({
    queryKey: ['parcelCouriers'],
    queryFn: () => adminService.getParcelCouriers(),
  });

  const filteredParcels = useMemo(() => {
    return parcels.filter((p) => {
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && p.parcel.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const hit =
          p.id.toLowerCase().includes(q) ||
          p.trackingId.toLowerCase().includes(q) ||
          p.sender.name.toLowerCase().includes(q) ||
          p.sender.locality.toLowerCase().includes(q) ||
          p.recipient.name.toLowerCase().includes(q) ||
          p.recipient.locality.toLowerCase().includes(q) ||
          (p.assignedCourierName?.toLowerCase().includes(q) ?? false);
        if (!hit) return false;
      }
      return true;
    });
  }, [parcels, statusFilter, categoryFilter, searchQuery]);

  const paginatedParcels = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredParcels.slice(start, start + pageSize);
  }, [filteredParcels, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredParcels.length / pageSize));

  const handleAssignCourier = async (parcelId: string, courierId: string) => {
    await adminService.assignParcelCourier(parcelId, courierId);
    await queryClient.invalidateQueries({ queryKey: ['parcels'] });
    await queryClient.invalidateQueries({ queryKey: ['parcelCouriers'] });
    const updated = await adminService.getParcelById(parcelId);
    if (updated) setSelectedParcel(updated);
  };

  const handleParcelCreated = async () => {
    await queryClient.invalidateQueries({ queryKey: ['parcels'] });
    setShowAddDrawer(false);
  };

  const statusOptions: FilterOption[] = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Created (Unassigned)', value: 'CREATED' },
    { label: 'Courier Assigned', value: 'COURIER_ASSIGNED' },
    { label: 'Pickup in Progress', value: 'PICKUP_IN_PROGRESS' },
    { label: 'Picked Up', value: 'PICKED_UP' },
    { label: 'In Transit', value: 'IN_TRANSIT' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Pickup Failed', value: 'PICKUP_FAILED' },
    { label: 'Delivery Failed', value: 'DELIVERY_FAILED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  const categoryOptions: FilterOption[] = [
    { label: 'All Categories', value: 'ALL' },
    { label: 'Documents', value: 'DOCUMENTS' },
    { label: 'Clothing', value: 'CLOTHING' },
    { label: 'Electronics', value: 'ELECTRONICS' },
    { label: 'Household', value: 'HOUSEHOLD' },
    { label: 'Food / Gifts', value: 'FOOD_GIFTS' },
    { label: 'Other', value: 'OTHER' },
  ];

  if (parcelsLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Parcel Bookings"
          description="Manage all local point-to-point delivery bookings"
        />
        <LoadingSkeleton type="table" count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parcel Bookings"
        description="Manage all local point-to-point delivery bookings"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-ink-primary bg-white border border-border-light rounded-lg hover:bg-surface-subtle transition-colors shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setShowAddDrawer(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              New Parcel Booking
            </button>
          </div>
        }
      />

      {/* Filters and Search Toolbar */}
      <div className="space-y-3">
        <SearchToolbar
          placeholder="Search by tracking ID, booking ID, sender, recipient, or courier…"
          searchQuery={searchQuery}
          onSearchChange={(val: string) => {
            setSearchQuery(val);
            setCurrentPage(1);
          }}
          count={filteredParcels.length}
          totalCount={parcels.length}
          label="parcels"
          rightSlot={
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              <FilterDropdown
                label="Status"
                value={statusFilter}
                options={statusOptions}
                onChange={(val: string) => {
                  setStatusFilter(val);
                  setCurrentPage(1);
                }}
              />
              <FilterDropdown
                label="Category"
                value={categoryFilter}
                options={categoryOptions}
                onChange={(val: string) => {
                  setCategoryFilter(val);
                  setCurrentPage(1);
                }}
              />
            </div>
          }
        />
      </div>

      {/* Parcels Table */}
      {paginatedParcels.length === 0 ? (
        <EmptyState
          title="No Parcel Bookings Found"
          description="No delivery bookings match the current filters."
          action={{
            label: 'Clear Filters',
            onClick: () => {
              setStatusFilter('ALL');
              setCategoryFilter('ALL');
              setSearchQuery('');
              setCurrentPage(1);
            },
          }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-border-light shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-secondary/70 border-b border-border-light text-ink-secondary uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Tracking ID</th>
                  <th className="px-4 py-3">Created At</th>
                  <th className="px-4 py-3">Sender</th>
                  <th className="px-4 py-3">Recipient</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Weight</th>
                  <th className="px-4 py-3">Courier</th>
                  <th className="px-4 py-3">Fee</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {paginatedParcels.map((parcel) => (
                  <tr
                    key={parcel.id}
                    onClick={() => setSelectedParcel(parcel)}
                    className="hover:bg-surface-secondary/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-mono font-medium text-brand-600">
                        {parcel.trackingId}
                      </div>
                      <div className="text-[11px] text-ink-muted">{parcel.id}</div>
                    </td>
                    <td className="px-4 py-3 text-ink-secondary whitespace-nowrap">
                      {formatDate(parcel.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink-primary truncate max-w-[110px]">
                        {parcel.sender.name}
                      </div>
                      <div className="text-[11px] text-ink-secondary">
                        {parcel.sender.locality}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink-primary truncate max-w-[110px]">
                        {parcel.recipient.name}
                      </div>
                      <div className="text-[11px] text-ink-secondary">
                        {parcel.recipient.locality}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-surface-subtle border border-border-light rounded font-medium text-[11px] text-ink-primary">
                        {parcel.parcel.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">
                      {parcel.parcel.weightKg} kg
                    </td>
                    <td className="px-4 py-3">
                      {parcel.assignedCourierName ? (
                        <span className="font-medium text-ink-primary">
                          {parcel.assignedCourierName}
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-700 font-medium px-1.5 py-0.5 bg-amber-50 rounded border border-amber-200">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink-primary whitespace-nowrap">
                      {formatCurrency(parcel.deliveryFee)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={parcel.status} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedParcel(parcel);
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-md transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredParcels.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Parcel Details Drawer */}
      <ParcelDetailsDrawer
        parcel={selectedParcel}
        isOpen={Boolean(selectedParcel)}
        onClose={() => setSelectedParcel(null)}
        availableCouriers={couriers}
        onAssignCourier={handleAssignCourier}
        onNavigateToTracking={(trackingId) => {
          navigate(`/parcels/tracking?q=${trackingId}`);
          setSelectedParcel(null);
        }}
      />

      {/* Add Parcel Booking Drawer */}
      <AddParcelDrawer
        isOpen={showAddDrawer}
        onClose={() => setShowAddDrawer(false)}
        onSuccess={handleParcelCreated}
      />
    </div>
  );
};
