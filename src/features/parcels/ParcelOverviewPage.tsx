import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Truck,
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
import { formatCurrency, formatDate } from '../../utils/formatters';

export const ParcelOverviewPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: parcels = [], isLoading: parcelsLoading } = useQuery({
    queryKey: ['parcels'],
    queryFn: () => adminService.getParcels(),
  });

  const { data: couriers = [], isLoading: couriersLoading } = useQuery({
    queryKey: ['parcelCouriers'],
    queryFn: () => adminService.getParcelCouriers(),
  });

  const isLoading = parcelsLoading || couriersLoading;

  // Computed metrics
  const activeDeliveries = parcels.filter((p) =>
    ['COURIER_ASSIGNED', 'PICKUP_IN_PROGRESS', 'PICKED_UP', 'IN_TRANSIT'].includes(p.status)
  );
  const deliveredParcels = parcels.filter((p) => p.status === 'DELIVERED');
  const failedParcels = parcels.filter(
    (p) => p.status === 'PICKUP_FAILED' || p.status === 'DELIVERY_FAILED'
  );
  const pendingAssignment = parcels.filter((p) => p.status === 'CREATED');

  const totalRevenue = parcels
    .filter((p) => p.status !== 'CANCELLED')
    .reduce((sum, p) => sum + p.deliveryFee, 0);

  const availableCouriers = couriers.filter((c) => c.availability === 'AVAILABLE');

  // Category breakdown
  const catCounts = parcels.reduce((acc, p) => {
    acc[p.parcel.category] = (acc[p.parcel.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const catChartData = Object.entries(catCounts).map(([name, count], i) => ({
    name,
    count,
    color: ['#16845B', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#94A3B8'][i % 6],
  }));

  // Weekly bookings demo data
  const weeklyData = [
    { day: 'Mon', bookings: 18 },
    { day: 'Tue', bookings: 25 },
    { day: 'Wed', bookings: 22 },
    { day: 'Thu', bookings: 31 },
    { day: 'Fri', bookings: 27 },
    { day: 'Sat', bookings: 38 },
    { day: 'Sun', bookings: parcels.length > 0 ? parcels.length : 15 },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Parcel Overview"
          description="Point-to-point delivery operations, volume, and courier utilization"
        />
        <LoadingSkeleton type="card" count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parcel Overview"
        description="Point-to-point delivery operations, volume, and courier utilization"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/parcels/tracking')}
              className="px-3.5 py-2 text-xs font-medium text-ink-primary bg-white border border-border-light rounded-lg hover:bg-surface-subtle transition-colors shadow-2xs"
            >
              Tracking Console
            </button>
            <button
              type="button"
              onClick={() => navigate('/parcels/bookings')}
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
          title="Active Deliveries"
          value={activeDeliveries.length}
          trend={{ value: 14, isPositive: true }}
          icon={Truck}
          subtitle={`${pendingAssignment.length} awaiting courier`}
        />
        <StatCard
          title="Delivered"
          value={deliveredParcels.length}
          trend={{ value: 96, isPositive: true }}
          icon={CheckCircle2}
          subtitle={`${failedParcels.length} failed / returned`}
        />
        <StatCard
          title="Delivery Revenue"
          value={formatCurrency(totalRevenue)}
          trend={{ value: 8, isPositive: true }}
          icon={TrendingUp}
          subtitle="Gross delivery fees collected"
        />
        <StatCard
          title="Available Couriers"
          value={availableCouriers.length}
          icon={Package}
          subtitle={`${couriers.length} total courier partners`}
        />
      </div>

      {/* Attention Alert for unassigned parcels */}
      {pendingAssignment.length > 0 && (
        <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-900">
                {pendingAssignment.length} parcel{pendingAssignment.length === 1 ? '' : 's'} waiting for courier assignment
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Senders are waiting for pickup. Assign available couriers to these bookings.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/parcels/bookings')}
            className="px-3 py-1.5 text-xs font-medium text-amber-900 bg-white border border-amber-300 rounded-lg hover:bg-amber-100/50 transition-colors shrink-0"
          >
            Assign Couriers
          </button>
        </div>
      )}

      {/* Failed deliveries alert */}
      {failedParcels.length > 0 && (
        <div className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-700 shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-rose-900">
                {failedParcels.length} delivery exception{failedParcels.length === 1 ? '' : 's'} require attention
              </p>
              <p className="text-xs text-rose-700 mt-0.5">
                Review failed pickups and deliveries to initiate rescheduling or return-to-sender.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/parcels/bookings')}
            className="px-3 py-1.5 text-xs font-medium text-rose-900 bg-white border border-rose-300 rounded-lg hover:bg-rose-100/50 transition-colors shrink-0"
          >
            Review Exceptions
          </button>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartContainer
            title="Daily Parcel Volume"
            subtitle="Number of new bookings across the past 7 days"
          >
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="day"
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
                      if (active && payload?.length) {
                        return (
                          <div className="bg-white p-3 rounded-lg shadow-md border border-border-light text-xs">
                            <p className="font-semibold text-ink-primary">
                              {payload[0].payload.day}
                            </p>
                            <p className="text-brand-600">
                              Bookings: {payload[0].payload.bookings}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="bookings" fill="#16845B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>
        </div>

        <div>
          <ChartContainer
            title="Parcel Category Breakdown"
            subtitle="Composition by parcel content type"
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
                    innerRadius={45}
                    outerRadius={72}
                    paddingAngle={3}
                  >
                    {catChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 w-full pt-2 border-t border-border-light text-xs">
                {catChartData.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-ink-secondary truncate">{cat.name}:</span>
                    <span className="font-semibold text-ink-primary">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartContainer>
        </div>
      </div>

      {/* Recent Parcel Bookings Table */}
      <div className="bg-white rounded-xl border border-border-light shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-border-light flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-ink-primary">Recent Parcel Bookings</h3>
            <p className="text-xs text-ink-secondary mt-0.5">
              Latest point-to-point delivery requests
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/parcels/bookings')}
            className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
          >
            View All ({parcels.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-secondary/70 border-b border-border-light text-ink-secondary uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Tracking ID</th>
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
              {parcels.slice(0, 5).map((parcel) => (
                <tr
                  key={parcel.id}
                  className="hover:bg-surface-secondary/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-mono font-medium text-brand-600">
                      {parcel.trackingId}
                    </div>
                    <div className="text-[11px] text-ink-muted">{parcel.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink-primary truncate max-w-[120px]">
                      {parcel.sender.name}
                    </div>
                    <div className="text-[11px] text-ink-secondary">
                      {parcel.sender.locality}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink-primary truncate max-w-[120px]">
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
                      <span className="text-[11px] text-amber-700 font-medium">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-ink-primary">
                    {formatCurrency(parcel.deliveryFee)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={parcel.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => navigate('/parcels/tracking')}
                      className="px-2.5 py-1 text-[11px] font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-md transition-colors"
                    >
                      Track
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
