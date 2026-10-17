import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SearchToolbar } from '../../components/ui/SearchToolbar';
import { FilterDropdown, FilterOption } from '../../components/ui/FilterControls';
import { PaginationControls } from '../../components/ui/PaginationControls';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { RideDetailsDrawer } from './RideDetailsDrawer';
import { RideBooking } from '../../types';
import { formatCurrency, formatDate, maskPhone } from '../../utils/formatters';

export const RideBookingsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [selectedRide, setSelectedRide] = useState<RideBooking | null>(null);

  const { data: rides = [], isLoading: ridesLoading, refetch } = useQuery({
    queryKey: ['rides'],
    queryFn: () => adminService.getRides(),
  });

  const { data: drivers = [], isLoading: driversLoading } = useQuery({
    queryKey: ['rideDrivers'],
    queryFn: () => adminService.getRideDrivers(),
  });

  const isLoading = ridesLoading || driversLoading;

  const filteredRides = useMemo(() => {
    return rides.filter((ride) => {
      if (statusFilter !== 'ALL' && ride.rideStatus !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && ride.vehicleCategory !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const hit =
          ride.id.toLowerCase().includes(q) ||
          ride.passengerName.toLowerCase().includes(q) ||
          ride.passengerPhone.includes(q) ||
          (ride.assignedDriverName?.toLowerCase().includes(q) ?? false) ||
          (ride.assignedVehicleReg?.toLowerCase().includes(q) ?? false) ||
          ride.pickupArea.toLowerCase().includes(q) ||
          ride.destinationArea.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [rides, statusFilter, categoryFilter, searchQuery]);

  const paginatedRides = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRides.slice(start, start + pageSize);
  }, [filteredRides, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredRides.length / pageSize));

  const handleAssignDriver = async (rideId: string, driverId: string) => {
    await adminService.assignRideDriver(rideId, driverId);
    await queryClient.invalidateQueries({ queryKey: ['rides'] });
    await queryClient.invalidateQueries({ queryKey: ['rideDrivers'] });
    const updated = await adminService.getRideById(rideId);
    if (updated) setSelectedRide(updated);
  };

  const handleCancelRide = async (rideId: string, reason: string) => {
    await adminService.cancelRide(rideId, reason);
    await queryClient.invalidateQueries({ queryKey: ['rides'] });
    await queryClient.invalidateQueries({ queryKey: ['rideDrivers'] });
    const updated = await adminService.getRideById(rideId);
    if (updated) setSelectedRide(updated);
  };

  const statusOptions: FilterOption[] = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Requested', value: 'REQUESTED' },
    { label: 'Searching Driver', value: 'SEARCHING_DRIVER' },
    { label: 'Driver Assigned', value: 'DRIVER_ASSIGNED' },
    { label: 'Driver Arriving', value: 'DRIVER_ARRIVING' },
    { label: 'Ride Started', value: 'RIDE_STARTED' },
    { label: 'Ride Completed', value: 'RIDE_COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  const categoryOptions: FilterOption[] = [
    { label: 'All Categories', value: 'ALL' },
    { label: 'Auto', value: 'AUTO' },
    { label: 'Hatchback', value: 'HATCHBACK' },
    { label: 'Sedan', value: 'SEDAN' },
    { label: 'Premier SUV', value: 'PREMIER_SUV' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Ride Bookings"
          description="Complete management of passenger trips and driver dispatch"
        />
        <LoadingSkeleton type="table" count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ride Bookings"
        description="Complete management of passenger trips and driver dispatch"
        actions={
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-ink-primary bg-white border border-border-light rounded-lg hover:bg-surface-subtle transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        }
      />

      {/* Filters and Search */}
      <div className="space-y-3">
        <SearchToolbar
          placeholder="Search by ride ID, passenger, driver, plate, or area…"
          searchQuery={searchQuery}
          onSearchChange={(val: string) => {
            setSearchQuery(val);
            setCurrentPage(1);
          }}
          count={filteredRides.length}
          totalCount={rides.length}
          label="trips"
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

      {/* Table */}
      {paginatedRides.length === 0 ? (
        <EmptyState
          title="No Ride Bookings Found"
          description="No trip bookings match the current filters."
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
                  <th className="px-4 py-3">Ride ID</th>
                  <th className="px-4 py-3">Booked At</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Passenger</th>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">Distance</th>
                  <th className="px-4 py-3">Fare</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {paginatedRides.map((ride) => (
                  <tr
                    key={ride.id}
                    onClick={() => setSelectedRide(ride)}
                    className="hover:bg-surface-secondary/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-medium text-brand-600">{ride.id}</td>
                    <td className="px-4 py-3 text-ink-secondary whitespace-nowrap">
                      {formatDate(ride.bookingTime)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-surface-subtle border border-border-light rounded font-medium text-[11px] text-ink-primary">
                        {ride.vehicleCategory}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <span className="font-medium text-ink-primary">{ride.pickupArea}</span>
                      <span className="text-ink-muted mx-1.5">→</span>
                      <span className="text-ink-secondary">{ride.destinationArea}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink-primary">{ride.passengerName}</div>
                      <div className="text-[11px] text-ink-muted">
                        {maskPhone(ride.passengerPhone)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {ride.assignedDriverName ? (
                        <div>
                          <div className="font-medium text-ink-primary">
                            {ride.assignedDriverName}
                          </div>
                          <div className="text-[11px] font-mono text-ink-muted">
                            {ride.assignedVehicleReg}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-amber-700 font-medium px-1.5 py-0.5 bg-amber-50 rounded border border-amber-200">
                          Searching…
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-secondary whitespace-nowrap">
                      {ride.estimatedDistanceKm} km
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink-primary whitespace-nowrap">
                      {formatCurrency(ride.finalFare ?? ride.estimatedFare)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={ride.rideStatus} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRide(ride);
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
            totalItems={filteredRides.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <RideDetailsDrawer
        ride={selectedRide}
        isOpen={Boolean(selectedRide)}
        onClose={() => setSelectedRide(null)}
        availableDrivers={drivers}
        onAssignDriver={handleAssignDriver}
        onCancelRide={handleCancelRide}
      />
    </div>
  );
};
