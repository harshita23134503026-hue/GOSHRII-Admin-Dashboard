import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  TrendingUp,
  Package,
  AlertTriangle,
  Clock,
  PackageX,
  Bike,
  PlusCircle,
  Boxes,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { adminService } from '../../services/adminService';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { ChartContainer } from '../../components/ui/ChartContainer';
import { DateRangeFilter, DateRangePreset } from '../../components/ui/DateRangeFilter';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatCurrency, formatRelativeTime, formatDate } from '../../utils/formatters';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRangePreset>('7days');

  // Derived mock data queries
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => adminService.getOrders(),
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => adminService.getProducts(),
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => adminService.getAlerts(),
  });

  const { data: riders = [] } = useQuery({
    queryKey: ['deliveryPartners'],
    queryFn: () => adminService.getDeliveryPartners(),
  });

  const isLoading = ordersLoading || productsLoading || alertsLoading;

  // Derive metrics dynamically from shared mock state
  const totalRevenue = orders
    .filter((o) => o.orderStatus !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const activeProductsCount = products.filter((p) => p.isActive && !p.isArchived).length;
  const lowStockCount = products.filter((p) => p.stockStatus === 'LOW_STOCK' && !p.isArchived).length;
  const outOfStockCount = products.filter((p) => p.stockStatus === 'OUT_OF_STOCK' && !p.isArchived).length;
  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'PLACED').length;
  const activeDeliveriesCount = orders.filter((o) => o.orderStatus === 'OUT_FOR_DELIVERY').length;

  // Chart data: Realistic revenue timeline
  const revenueTrendData = [
    { date: '03 Oct', revenue: 18450, orders: 42 },
    { date: '04 Oct', revenue: 22100, orders: 51 },
    { date: '05 Oct', revenue: 19800, orders: 47 },
    { date: '06 Oct', revenue: 24350, orders: 58 },
    { date: '07 Oct', revenue: 21600, orders: 49 },
    { date: '08 Oct', revenue: 28900, orders: 66 },
    { date: '09 Oct', revenue: totalRevenue > 0 ? totalRevenue : 26400, orders: orders.length },
  ];

  // Order status distribution
  const statusCounts = orders.reduce((acc, o) => {
    acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const orderDistributionData = [
    { name: 'Delivered', count: statusCounts['DELIVERED'] || 1, color: '#16845B' },
    { name: 'Out Delivery', count: statusCounts['OUT_FOR_DELIVERY'] || 2, color: '#F97316' },
    { name: 'Picking/Packed', count: (statusCounts['PICKING'] || 0) + (statusCounts['PACKED'] || 0) + 1, color: '#6366F1' },
    { name: 'Placed', count: statusCounts['PLACED'] || 1, color: '#3B82F6' },
    { name: 'Cancelled', count: statusCounts['CANCELLED'] || 1, color: '#94A3B8' },
  ];

  // Recent 5 orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Store Operations Dashboard" description="Overview of Koramangala Hub operations" />
        <LoadingSkeleton type="stats" count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><LoadingSkeleton type="chart" /></div>
          <div><LoadingSkeleton type="card" count={2} /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Date Filter and Quick Actions */}
      <PageHeader
        title="Store Operations Dashboard"
        description="Real-time operational health, inventory alerts, and fulfillment pipeline for Dark Store #104."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <DateRangeFilter
              selectedPreset={dateRange}
              onPresetChange={setDateRange}
            />
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-sm transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add Product
            </button>
          </div>
        }
      />

      {/* Primary KPI Cards (4 columns on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={orders.length}
          subtitle="Processed today"
          trend={{ value: 12.4, isPositive: true }}
          icon={ShoppingBag}
          onClick={() => navigate('/orders')}
        />
        <StatCard
          title="Net Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle="All confirmed channels"
          trend={{ value: 8.6, isPositive: true }}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Active Products"
          value={activeProductsCount}
          subtitle="Live on dark store catalog"
          icon={Package}
          onClick={() => navigate('/products')}
        />
        <StatCard
          title="Low-stock Items"
          value={lowStockCount}
          subtitle="Threshold breached"
          icon={AlertTriangle}
          variant={lowStockCount > 0 ? 'warning' : 'default'}
          onClick={() => navigate('/inventory?stock=LOW_STOCK')}
        />
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/orders?status=PLACED')}
          className="bg-white rounded-card border border-border-light p-3.5 flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-ink-secondary">Pending Confirmation</p>
              <h4 className="text-lg font-bold text-ink-primary">{pendingOrdersCount} orders</h4>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-ink-muted" />
        </div>

        <div
          onClick={() => navigate('/inventory?stock=OUT_OF_STOCK')}
          className="bg-white rounded-card border border-border-light p-3.5 flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <PackageX className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-ink-secondary">Out of Stock</p>
              <h4 className="text-lg font-bold text-ink-primary">{outOfStockCount} items</h4>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-ink-muted" />
        </div>

        <div
          onClick={() => navigate('/delivery-partners')}
          className="bg-white rounded-card border border-border-light p-3.5 flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-ink-secondary">Active Deliveries</p>
              <h4 className="text-lg font-bold text-ink-primary">{activeDeliveriesCount} on road</h4>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-ink-muted" />
        </div>
      </div>

      {/* Main Charts & Action Required Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Revenue Trend Chart (2 columns on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <ChartContainer
            title="Revenue Performance Trend"
            subtitle="7-day gross sales volume in INR"
          >
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Revenue']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#16845B"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#16845B' }}
                  activeDot={{ r: 6, fill: '#16845B' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer
            title="Order Status Pipeline"
            subtitle="Current active batch distribution across fulfillment stages"
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={orderDistributionData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={11} tickLine={false} width={90} />
                <Tooltip
                  formatter={(val: any) => [val, 'Orders']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {orderDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Right: Action Required Panel */}
        <div className="bg-white rounded-card border border-border-light p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border-light mb-4">
              <div>
                <h3 className="text-base font-semibold text-ink-primary">Action Required</h3>
                <p className="text-xs text-ink-secondary">High-priority operational exceptions</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                {alerts.length} Pending
              </span>
            </div>

            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => navigate(alert.linkTo)}
                  className="p-3 rounded-lg border border-border-light hover:border-slate-300 hover:bg-surface-secondary/40 transition-colors cursor-pointer text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-ink-primary">{alert.title}</p>
                    <ExternalLink className="w-3.5 h-3.5 text-ink-muted shrink-0 mt-0.5" />
                  </div>
                  <p className="text-ink-secondary mt-1 line-clamp-2">{alert.description}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-ink-muted">
                    <span>{formatRelativeTime(alert.timestamp)}</span>
                    <span className="font-medium text-brand-700">Review & Fix →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border-light">
            <h4 className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-2.5">
              Hub Quick Actions
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => navigate('/inventory')}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-ink-primary bg-surface-secondary hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Boxes className="w-3.5 h-3.5 text-ink-secondary" />
                Adjust Stock
              </button>
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-ink-primary bg-surface-secondary hover:bg-slate-200 rounded-lg transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-ink-secondary" />
                Live Orders
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Compact Table */}
      <div className="bg-white rounded-card border border-border-light overflow-hidden shadow-card">
        <div className="p-4 sm:p-5 border-b border-border-light flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-ink-primary">Recent Customer Orders</h3>
            <p className="text-xs text-ink-secondary">Real-time store picking and dispatch queue</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-ink-primary">
            <thead>
              <tr className="bg-surface-secondary border-b border-border-light text-[11px] font-semibold text-ink-secondary uppercase tracking-wider">
                <th className="px-5 py-3">Order ID</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Placed Time</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light/60">
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => navigate('/orders')}
                  className="hover:bg-surface-secondary/50 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3.5 font-mono font-semibold text-brand-700">{order.id}</td>
                  <td className="px-5 py-3.5 font-medium">{order.customerName}</td>
                  <td className="px-5 py-3.5 text-ink-secondary">{formatDate(order.orderDate)}</td>
                  <td className="px-5 py-3.5 text-ink-secondary">{order.items.length} items</td>
                  <td className="px-5 py-3.5 font-semibold">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={order.orderStatus} size="sm" />
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium text-brand-700 hover:text-brand-800">
                    Details →
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
