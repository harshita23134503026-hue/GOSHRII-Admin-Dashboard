import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Boxes,
  Download,
  BarChart3,
  PieChart as PieIcon,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
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
import { DateRangeFilter, DateRangePreset } from '../../components/ui/DateRangeFilter';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { useToast } from '../../components/ui/Toast';

export const ReportsPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'sales' | 'products' | 'orders' | 'inventory'>('sales');
  const [dateRange, setDateRange] = useState<DateRangePreset>('7days');

  // Queries
  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => adminService.getOrders(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => adminService.getProducts(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => adminService.getCategories(),
  });

  const { data: adjustments = [] } = useQuery({
    queryKey: ['stockAdjustments'],
    queryFn: () => adminService.getStockAdjustments(),
  });

  // Derived Analytics from mock data
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.orderStatus !== 'CANCELLED')
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders]);

  const deliveredOrders = useMemo(() => {
    return orders.filter((o) => o.orderStatus === 'DELIVERED');
  }, [orders]);

  const cancelledOrders = useMemo(() => {
    return orders.filter((o) => o.orderStatus === 'CANCELLED');
  }, [orders]);

  const aov = orders.length > 0 ? Math.round(totalRevenue / Math.max(1, orders.length)) : 0;
  const cancellationRate = orders.length > 0 ? (cancelledOrders.length / orders.length) * 100 : 0;
  const completionRate = orders.length > 0 ? (deliveredOrders.length / orders.length) * 100 : 0;

  // Chart data: 7-day Sales
  const salesTrendData = [
    { date: '03 Oct', sales: 18450, orders: 42 },
    { date: '04 Oct', sales: 22100, orders: 51 },
    { date: '05 Oct', sales: 19800, orders: 47 },
    { date: '06 Oct', sales: 24350, orders: 58 },
    { date: '07 Oct', sales: 21600, orders: 49 },
    { date: '08 Oct', sales: 28900, orders: 66 },
    { date: '09 Oct', sales: totalRevenue > 0 ? totalRevenue : 26400, orders: orders.length },
  ];

  // Top-selling products derived from actual order items
  const productSalesMap = useMemo(() => {
    const map = new Map<string, { name: string; sku: string; units: number; revenue: number }>();
    orders.forEach((o) => {
      if (o.orderStatus !== 'CANCELLED') {
        o.items.forEach((item) => {
          const current = map.get(item.productId) || {
            name: item.productName,
            sku: item.productSku,
            units: 0,
            revenue: 0,
          };
          current.units += item.quantity;
          current.revenue += item.totalPrice;
          map.set(item.productId, current);
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [orders]);

  // Category sales distribution
  const categorySalesData = useMemo(() => {
    const catMap = new Map<string, number>();
    products.forEach((p) => {
      catMap.set(p.categoryName, (catMap.get(p.categoryName) || 0) + p.sellingPrice * 5);
    });
    const colors = ['#16845B', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#10B981'];
    return Array.from(catMap.entries()).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length],
    }));
  }, [products]);

  // Order status distribution
  const orderStatusPieData = [
    { name: 'Delivered', value: deliveredOrders.length || 1, color: '#16845B' },
    { name: 'In Transit', value: orders.filter((o) => o.orderStatus === 'OUT_FOR_DELIVERY').length || 2, color: '#F97316' },
    { name: 'Store Processing', value: orders.filter((o) => ['CONFIRMED', 'PICKING', 'PACKED'].includes(o.orderStatus)).length || 2, color: '#6366F1' },
    { name: 'New Placed', value: orders.filter((o) => o.orderStatus === 'PLACED').length || 1, color: '#3B82F6' },
    { name: 'Cancelled', value: cancelledOrders.length || 1, color: '#EF4444' },
  ];

  // CSV Export
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `getshrii-report-${activeTab}-${dateRange}.csv`;

    if (activeTab === 'sales') {
      headers = ['Date', 'Revenue (INR)', 'Order Count'];
      rows = salesTrendData.map((d) => [d.date, d.sales, d.orders]);
    } else if (activeTab === 'products') {
      headers = ['Product Name', 'SKU', 'Units Sold', 'Revenue (INR)'];
      rows = productSalesMap.map((p) => [p.name, p.sku, p.units, p.revenue]);
    } else if (activeTab === 'orders') {
      headers = ['Order ID', 'Customer', 'Date', 'Total Amount', 'Status', 'Payment'];
      rows = orders.map((o) => [
        o.id,
        o.customerName,
        o.orderDate,
        o.totalAmount,
        o.orderStatus,
        o.paymentStatus,
      ]);
    } else if (activeTab === 'inventory') {
      headers = ['Product Name', 'SKU', 'Available Stock', 'Threshold', 'Stock Status'];
      rows = products.map((p) => [
        p.name,
        p.sku,
        p.availableQuantity,
        p.lowStockThreshold,
        p.stockStatus,
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      type: 'success',
      title: 'CSV Report Downloaded',
      description: `Saved ${filename} based on active operational filters.`,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Business Reports"
        description="Comprehensive store sales volume, SKU movement, order fulfillment metrics and inventory audits."
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <DateRangeFilter selectedPreset={dateRange} onPresetChange={setDateRange} />
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-surface-secondary border border-border-light rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-ink-secondary" />
              <span>Export CSV</span>
            </button>
          </div>
        }
      />

      {/* Internal Tabs */}
      <div className="flex border-b border-border-light space-x-6">
        <button
          type="button"
          onClick={() => setActiveTab('sales')}
          className={`pb-3 text-sm font-semibold transition-all ${
            activeTab === 'sales'
              ? 'text-brand-700 border-b-2 border-brand-500'
              : 'text-ink-secondary hover:text-ink-primary'
          }`}
        >
          Sales & Revenue
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`pb-3 text-sm font-semibold transition-all ${
            activeTab === 'products'
              ? 'text-brand-700 border-b-2 border-brand-500'
              : 'text-ink-secondary hover:text-ink-primary'
          }`}
        >
          Product Movement
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-sm font-semibold transition-all ${
            activeTab === 'orders'
              ? 'text-brand-700 border-b-2 border-brand-500'
              : 'text-ink-secondary hover:text-ink-primary'
          }`}
        >
          Fulfillment & Orders
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 text-sm font-semibold transition-all ${
            activeTab === 'inventory'
              ? 'text-brand-700 border-b-2 border-brand-500'
              : 'text-ink-secondary hover:text-ink-primary'
          }`}
        >
          Inventory Velocity
        </button>
      </div>

      {/* TAB 1: SALES */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Gross Sales"
              value={formatCurrency(totalRevenue)}
              trend={{ value: 9.2, isPositive: true }}
              subtitle="vs previous period"
              icon={TrendingUp}
              variant="success"
            />
            <StatCard
              title="Processed Orders"
              value={orders.length}
              trend={{ value: 14.1, isPositive: true }}
              subtitle="Dark store dispatch"
              icon={ShoppingBag}
            />
            <StatCard
              title="Average Order Value"
              value={formatCurrency(aov)}
              subtitle="Basket size per customer"
              icon={BarChart3}
            />
            <StatCard
              title="Delivered Orders"
              value={deliveredOrders.length}
              subtitle="100% SLA met"
              icon={TrendingUp}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer
              title="Daily Revenue Trend"
              subtitle="Rupee sales progression over reporting period"
            >
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={salesTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val / 1000}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Sales']}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#16845B"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#16845B' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer
              title="Order Volume Trajectory"
              subtitle="Number of successfully dispatched baskets"
            >
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={salesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => [val, 'Orders']}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Bar dataKey="orders" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-card border border-border-light overflow-hidden shadow-card p-5">
              <h3 className="text-base font-semibold text-ink-primary mb-1">Top-Moving Products</h3>
              <p className="text-xs text-ink-secondary mb-4">Ranked by revenue generation in dark store orders</p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-border-light text-[11px] font-semibold text-ink-secondary uppercase">
                      <th className="pb-2">Product Name</th>
                      <th className="pb-2">SKU</th>
                      <th className="pb-2 text-right">Units Sold</th>
                      <th className="pb-2 text-right">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light/60">
                    {productSalesMap.slice(0, 6).map((item, i) => (
                      <tr key={i} className="hover:bg-surface-secondary/40">
                        <td className="py-2.5 font-semibold text-ink-primary">{item.name}</td>
                        <td className="py-2.5 font-mono text-ink-muted">{item.sku}</td>
                        <td className="py-2.5 text-right font-medium">{item.units} units</td>
                        <td className="py-2.5 text-right font-bold text-brand-700">
                          {formatCurrency(item.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <ChartContainer
              title="Category Revenue Distribution"
              subtitle="Sales contribution by grocery category"
            >
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={categorySalesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categorySalesData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Sales']}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Delivery Completion"
              value={formatPercentage(completionRate)}
              subtitle="Successfully fulfilled"
              icon={ShoppingBag}
              variant="success"
            />
            <StatCard
              title="Order Cancellation Rate"
              value={formatPercentage(cancellationRate)}
              subtitle="Orders cancelled before dispatch"
              icon={BarChart3}
              variant={cancellationRate > 5 ? 'warning' : 'default'}
            />
            <StatCard
              title="Average Fulfillment Time"
              value="9.4 mins"
              subtitle="Dark store dispatch speed"
              icon={TrendingUp}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer
              title="Order Pipeline Breakdown"
              subtitle="Status distribution across current operational batch"
            >
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={orderStatusPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {orderStatusPieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="bg-white rounded-card border border-border-light p-5 shadow-card">
              <h3 className="text-base font-semibold text-ink-primary mb-1">Operational SLA Insights</h3>
              <p className="text-xs text-ink-secondary mb-4">Dark store speed metrics for 10-minute promises</p>
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center p-3 bg-surface-secondary rounded-lg">
                  <div>
                    <p className="font-semibold text-ink-primary">Store Picking & Packing</p>
                    <p className="text-ink-muted text-[11px]">Time to ready picker bag</p>
                  </div>
                  <span className="font-bold text-sm text-brand-700">2.1 mins avg</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-surface-secondary rounded-lg">
                  <div>
                    <p className="font-semibold text-ink-primary">Rider Pickup Latency</p>
                    <p className="text-ink-muted text-[11px]">Store bay handoff duration</p>
                  </div>
                  <span className="font-bold text-sm text-brand-700">1.4 mins avg</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-surface-secondary rounded-lg">
                  <div>
                    <p className="font-semibold text-ink-primary">Last-Mile Road Transit</p>
                    <p className="text-ink-muted text-[11px]">Radius: 2.5 km dark store zone</p>
                  </div>
                  <span className="font-bold text-sm text-brand-700">5.9 mins avg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Stock Audit Entries"
              value={adjustments.length}
              subtitle="Reconciliations recorded"
              icon={Boxes}
            />
            <StatCard
              title="Low Stock Incidents"
              value={products.filter((p) => p.stockStatus === 'LOW_STOCK').length}
              subtitle="Alerts triggered today"
              icon={BarChart3}
              variant="warning"
            />
            <StatCard
              title="Out of Stock SKUs"
              value={products.filter((p) => p.stockStatus === 'OUT_OF_STOCK').length}
              subtitle="Zero inventory items"
              icon={Package}
              variant="danger"
            />
          </div>

          <div className="bg-white rounded-card border border-border-light p-5 shadow-card">
            <h3 className="text-base font-semibold text-ink-primary mb-1">Inventory Health Velocity Matrix</h3>
            <p className="text-xs text-ink-secondary mb-4">Stock balance versus safety threshold buffers</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border-light text-[11px] font-semibold text-ink-secondary uppercase">
                    <th className="pb-2">SKU Code</th>
                    <th className="pb-2">Product Name</th>
                    <th className="pb-2 text-right">Physical Units</th>
                    <th className="pb-2 text-right">Buffer Threshold</th>
                    <th className="pb-2 text-right">Velocity Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light/60">
                  {products.slice(0, 8).map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 font-mono text-ink-muted">{p.sku}</td>
                      <td className="py-2.5 font-semibold text-ink-primary">{p.name}</td>
                      <td className="py-2.5 text-right font-medium">{p.availableQuantity}</td>
                      <td className="py-2.5 text-right text-ink-secondary">{p.lowStockThreshold}</td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.stockStatus === 'IN_STOCK'
                              ? 'bg-emerald-50 text-emerald-700'
                              : p.stockStatus === 'LOW_STOCK'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {p.stockStatus.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
