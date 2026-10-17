import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { adminService } from '../../services/adminService';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { ChartContainer } from '../../components/ui/ChartContainer';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { RideDetailsDrawer } from './RideDetailsDrawer';
import { RideBooking } from '../../types';
import { formatCurrency, formatDate, maskPhone } from '../../utils/formatters';

export const RideOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedRide, setSelectedRide] = useState<RideBooking | null>(null);

  const { data: rides = [], isLoading: ridesLoading } = useQuery({
    queryKey: ['rides'],
    queryFn: () => adminService.getRides(),
  });

  const { data: drivers = [], isLoading: driversLoading } = useQuery({
    queryKey: ['rideDrivers'],
    queryFn: () => adminService.getRideDrivers(),
  });

  const isLoading = ridesLoading || driversLoading;

  // Computed metrics
  const activeRides = rides.filter((r) =>
    ['REQUESTED', 'SEARCHING_DRIVER', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 'RIDE_STARTED'].includes(
      r.rideStatus
    )
  );
  const completedRides = rides.filter((r) => r.rideStatus === 'RIDE_COMPLETED');
  const cancelledRides = rides.filter((r) => r.rideStatus === 'CANCELLED');
  const unassignedRides = rides.filter(
    (r) =>
      (r.rideStatus === 'REQUESTED' || r.rideStatus === 'SEARCHING_DRIVER') &&
      !r.assignedDriverId
  );

  const totalFare = rides
    .filter((r) => r.rideStatus !== 'CANCELLED')
    .reduce((sum, r) => sum + (r.finalFare ?? r.estimatedFare), 0);

  const onlineDrivers = drivers.filter(
    (d) => d.availability === 'AVAILABLE' || d.availability === 'ON_TRIP'
  );
  const driversOnTrip = drivers.filter((d) => d.availability === 'ON_TRIP');
  const utilization =
    onlineDrivers.length > 0
      ? Math.round((driversOnTrip.length / onlineDrivers.length) * 100)
      : 0;

  // Category distribution
  const catCounts = rides.reduce((acc, r) => {
    acc[r.vehicleCategory] = (acc[r.vehicleCategory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const catChartData = [
    { name: 'Auto', count: catCounts['AUTO'] || 0, color: '#F59E0B' },
    { name: 'Hatchback', count: catCounts['HATCHBACK'] || 0, color: '#16845B' },
    { name: 'Sedan', count: catCounts['SEDAN'] || 0, color: '#3B82F6' },
    { name: 'Premier SUV', count: catCounts['PREMIER_SUV'] || 0, color: '#8B5CF6' },
  ];

  // Demo hourly chart data
  const hourlyData = [
    { hour: '08:00', rides: 14 },
    { hour: '10:00', rides: 28 },
    { hour: '12:00', rides: 22 },
    { hour: '14:00', rides: 19 },
    { hour: '16:00', rides: 32 },
    { hour: '18:00', rides: 45 },
    { hour: '20:00', rides: 38 },
  ];

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Ride Overview"
          description="Live dispatch monitoring, fleet utilization, and booking demand"
        />
        <LoadingSkeleton type="card" count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ride Overview"
        description="Live dispatch monitoring, fleet utilization, and booking demand"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/rides/drivers')}
              className="px-3.5 py-2 text-xs font-medium text-ink-primary bg-white border border-border-light rounded-lg hover:bg-surface-subtle transition-colors shadow-2xs"
            >
              Drivers & Vehicles
            </button>
            <button
              type="button"
              onClick={() => navigate('/rides/bookings')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors shadow-2xs"
            >
              All Bookings
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Trips"
          value={activeRides.length}
          trend={{ value: 18, isPositive: true }}
          icon={Car}
          subtitle={`${unassignedRides.length} awaiting dispatch`}
        />
        <StatCard
          title="Completed Today"
          value={completedRides.length}
          trend={{ value: 94, isPositive: true }}
          icon={CheckCircle2}
          subtitle={`${cancelledRides.length} cancelled`}
        />
        <StatCard
          title="Gross Bookings"
          value={formatCurrency(totalFare)}
          trend={{ value: 12, isPositive: true }}
          icon={TrendingUp}
          subtitle="Across all vehicle categories"
        />
        <StatCard
          title="Fleet Utilization"
          value={`${utilization}%`}
          trend={{ value: utilization, isPositive: utilization > 50 }}
          icon={Car}
          subtitle={`${driversOnTrip.length} currently on trip`}
        />
      </div>

      {/* Attention Alert */}
      {unassignedRides.length > 0 && (
        <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-900">
                {unassignedRides.length} ride{unassignedRides.length === 1 ? '' : 's'} awaiting driver allocation
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Passengers are waiting. Assign available drivers to prevent SLA breaches.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/rides/bookings')}
            className="px-3 py-1.5 text-xs font-medium text-amber-900 bg-white border border-amber-300 rounded-lg hover:bg-amber-100/50 transition-colors shrink-0"
          >
            Dispatch Now
          </button>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartContainer
            title="Hourly Trip Demand"
            subtitle="Ride booking volume throughout the operating day"
          >
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-md border border-border-light text-xs">
                            <p className="font-semibold text-ink-primary">
                              {payload[0].payload.hour}
                            </p>
                            <p className="text-brand-600">Trips: {payload[0].payload.rides}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="rides" fill="#16845B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>
        </div>

        <div>
          <ChartContainer
            title="Fleet Category Share"
            subtitle="Bookings by vehicle category"
          >
            <div className="h-64 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={catChartData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={76}
                    paddingAngle={3}
                  >
                    {catChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 w-full pt-2 border-t border-border-light text-xs">
                {catChartData.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-ink-secondary">{cat.name}:</span>
                    <span className="font-semibold text-ink-primary">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartContainer>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-xl border border-border-light shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-border-light flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-ink-primary">Live & Recent Bookings</h3>
            <p className="text-xs text-ink-secondary mt-0.5">
              Latest trip requests across all operational zones
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/rides/bookings')}
            className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
          >
            View All ({rides.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-secondary/70 border-b border-border-light text-ink-secondary uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Ride ID</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Passenger</th>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Fare</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {rides.slice(0, 6).map((ride) => (
                <tr
                  key={ride.id}
                  onClick={() => setSelectedRide(ride)}
                  className="hover:bg-surface-secondary/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono font-medium text-brand-600">{ride.id}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-surface-subtle border border-border-light rounded font-medium text-[11px] text-ink-primary">
                      {ride.vehicleCategory}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
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
                      <span className="text-[11px] text-amber-700 font-medium">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-ink-primary">
                    {formatCurrency(ride.finalFare ?? ride.estimatedFare)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={ride.rideStatus} />
                  </td>
                  <td className="px-4 py-3 text-right">
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
      </div>

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
