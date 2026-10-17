import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Star, CheckCircle2, Clock, User, Car, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { SearchToolbar } from '../../components/ui/SearchToolbar';
import { FilterDropdown, FilterOption } from '../../components/ui/FilterControls';
import { PaginationControls } from '../../components/ui/PaginationControls';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { DriverDetailsDrawer } from './DriverDetailsDrawer';
import { RideDetailsDrawer } from './RideDetailsDrawer';
import { RideDriver, RideBooking } from '../../types';
import { formatCurrency, formatDate, maskPhone } from '../../utils/formatters';

export const DriversVehiclesPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [selectedDriver, setSelectedDriver] = useState<RideDriver | null>(null);
  const [selectedRide, setSelectedRide] = useState<RideBooking | null>(null);

  const { data: drivers = [], isLoading: driversLoading, refetch } = useQuery({
    queryKey: ['rideDrivers'],
    queryFn: () => adminService.getRideDrivers(),
  });

  const { data: rides = [] } = useQuery({
    queryKey: ['rides'],
    queryFn: () => adminService.getRides(),
  });

  // Fleet stats
  const availableCount = drivers.filter((d) => d.availability === 'AVAILABLE').length;
  const onTripCount = drivers.filter((d) => d.availability === 'ON_TRIP').length;
  const offlineCount = drivers.filter((d) => d.availability === 'OFFLINE').length;

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      if (availabilityFilter !== 'ALL' && d.availability !== availabilityFilter) return false;
      if (categoryFilter !== 'ALL' && d.vehicleCategory !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const hit =
          d.name.toLowerCase().includes(q) ||
          d.phone.includes(q) ||
          d.vehicleModel.toLowerCase().includes(q) ||
          d.registrationNumber.toLowerCase().includes(q) ||
          d.currentLocationName.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [drivers, availabilityFilter, categoryFilter, searchQuery]);

  const paginatedDrivers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDrivers.slice(start, start + pageSize);
  }, [filteredDrivers, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredDrivers.length / pageSize));

  const selectedDriverRides = useMemo(() => {
    if (!selectedDriver) return [];
    return rides.filter((r) => r.assignedDriverId === selectedDriver.id);
  }, [selectedDriver, rides]);

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

  const availabilityOptions: FilterOption[] = [
    { label: 'All Availabilities', value: 'ALL' },
    { label: 'Available', value: 'AVAILABLE' },
    { label: 'On Trip', value: 'ON_TRIP' },
    { label: 'Offline', value: 'OFFLINE' },
  ];

  const categoryOptions: FilterOption[] = [
    { label: 'All Categories', value: 'ALL' },
    { label: 'Auto', value: 'AUTO' },
    { label: 'Hatchback', value: 'HATCHBACK' },
    { label: 'Sedan', value: 'SEDAN' },
    { label: 'Premier SUV', value: 'PREMIER_SUV' },
  ];

  if (driversLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Drivers & Vehicles"
          description="Fleet operations, vehicle verification, and real-time availability"
        />
        <LoadingSkeleton type="table" count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Drivers & Vehicles"
        description="Fleet operations, vehicle verification, and real-time availability"
        actions={
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-ink-primary bg-white border border-border-light rounded-lg hover:bg-surface-subtle transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Fleet
          </button>
        }
      />

      {/* Fleet KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Fleet"
          value={drivers.length}
          subtitle="Registered driver partners"
          icon={Car}
        />
        <StatCard
          title="Available Now"
          value={availableCount}
          trend={{ value: Math.round((availableCount / (drivers.length || 1)) * 100), isPositive: true }}
          icon={CheckCircle2}
          subtitle="Ready for dispatch"
        />
        <StatCard
          title="On Trip"
          value={onTripCount}
          icon={Clock}
          subtitle="Currently carrying a passenger"
        />
        <StatCard
          title="Offline / Off-Duty"
          value={offlineCount}
          icon={User}
          subtitle="Unavailable for dispatch"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <SearchToolbar
          placeholder="Search by name, phone, vehicle model, or plate…"
          searchQuery={searchQuery}
          onSearchChange={(val: string) => {
            setSearchQuery(val);
            setCurrentPage(1);
          }}
          count={filteredDrivers.length}
          totalCount={drivers.length}
          label="drivers"
          rightSlot={
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              <FilterDropdown
                label="Availability"
                value={availabilityFilter}
                options={availabilityOptions}
                onChange={(val: string) => {
                  setAvailabilityFilter(val);
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

      {/* Drivers Table */}
      {paginatedDrivers.length === 0 ? (
        <EmptyState
          title="No Driver Partners Found"
          description="No drivers match the current filters."
          action={{
            label: 'Clear Filters',
            onClick: () => {
              setAvailabilityFilter('ALL');
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
                  <th className="px-4 py-3">Driver Partner</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Plate</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Trips Done</th>
                  <th className="px-4 py-3">Earnings</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {paginatedDrivers.map((driver) => {
                  const availBadge = {
                    AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    ON_TRIP: 'bg-sky-50 text-sky-700 border-sky-200',
                    OFFLINE: 'bg-slate-100 text-slate-600 border-slate-200',
                  }[driver.availability] ?? 'bg-slate-100 text-slate-600 border-slate-200';

                  return (
                    <tr
                      key={driver.id}
                      onClick={() => setSelectedDriver(driver)}
                      className="hover:bg-surface-secondary/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-ink-primary">{driver.name}</div>
                        <div className="text-[11px] text-ink-muted">{maskPhone(driver.phone)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-ink-primary">{driver.vehicleModel}</div>
                        <div className="text-[11px] text-ink-secondary">
                          {driver.currentLocationName}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[11px] font-medium bg-surface-subtle px-2 py-0.5 rounded border border-border-light text-ink-primary">
                          {driver.registrationNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-surface-subtle border border-border-light rounded font-medium text-[11px] text-ink-primary">
                          {driver.vehicleCategory}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                          <span className="font-medium text-ink-primary">
                            {driver.rating.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-ink-primary">
                        {driver.completedRides}
                      </td>
                      <td className="px-4 py-3 font-medium text-ink-primary">
                        {formatCurrency(driver.totalEarnings)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${availBadge}`}
                        >
                          {driver.availability.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDriver(driver);
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-md transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredDrivers.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <DriverDetailsDrawer
        driver={selectedDriver}
        isOpen={Boolean(selectedDriver)}
        onClose={() => setSelectedDriver(null)}
        driverRides={selectedDriverRides}
        onSelectRide={(ride) => setSelectedRide(ride)}
      />

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
