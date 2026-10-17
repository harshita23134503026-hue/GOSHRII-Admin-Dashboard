import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bike,
  CheckCircle2,
  Clock,
  Eye,
  Star,
  Zap,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  FileQuestion,
  XCircle,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { DeliveryPartner } from '../../types';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { SearchToolbar } from '../../components/ui/SearchToolbar';
import { FilterBar, FilterDropdown } from '../../components/ui/FilterControls';
import { DataTable, Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { VerificationStatusBadge } from './VerificationStatusBadge';
import { PartnerVerificationDrawer } from './PartnerVerificationDrawer';
import { formatRelativeTime, maskPhone } from '../../utils/formatters';

export const DeliveryPartnersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedVerification, setSelectedVerification] = useState('ALL');
  const [selectedVehicle, setSelectedVehicle] = useState('ALL');
  const [selectedPartner, setSelectedPartner] = useState<DeliveryPartner | null>(null);

  const { data: riders = [], isLoading: ridersLoading } = useQuery({
    queryKey: ['deliveryPartners'],
    queryFn: () => adminService.getDeliveryPartners(),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => adminService.getOrders(),
  });

  // Calculate dynamic KPI metrics derived directly from data
  const totalRiders = riders.length;
  const fullyVerifiedCount = riders.filter((r) => r.verificationStatus === 'VERIFIED').length;
  const pendingVerificationCount = riders.filter(
    (r) => r.verificationStatus === 'PENDING_REVIEW'
  ).length;
  const rejectedOrIncompleteCount = riders.filter(
    (r) => r.verificationStatus === 'REJECTED' || r.verificationStatus === 'INCOMPLETE'
  ).length;
  const expiredDocumentsCount = riders.filter((r) => r.verificationStatus === 'EXPIRED').length;

  // Filter riders by search query, verification status, vehicle, and availability
  const filteredRiders = useMemo(() => {
    return riders.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          r.name.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.phone.includes(q) ||
          r.vehicleType.toLowerCase().includes(q) ||
          (r.vehicleRegistrationNumber && r.vehicleRegistrationNumber.toLowerCase().includes(q));
        if (!matches) return false;
      }

      if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;
      if (selectedVerification !== 'ALL' && r.verificationStatus !== selectedVerification)
        return false;
      if (selectedVehicle !== 'ALL' && r.vehicleType !== selectedVehicle) return false;

      return true;
    });
  }, [riders, searchQuery, selectedStatus, selectedVerification, selectedVehicle]);

  // Current active order for selected partner
  const activeOrder = useMemo(() => {
    if (!selectedPartner || !selectedPartner.activeOrderId) return null;
    return orders.find((o) => o.id === selectedPartner.activeOrderId) || null;
  }, [orders, selectedPartner]);

  const partnerOrders = useMemo(() => {
    if (!selectedPartner) return [];
    return orders.filter((o) => o.deliveryPartnerId === selectedPartner.id);
  }, [orders, selectedPartner]);

  // Handler for document approval / rejection
  const handleReviewDocument = async (params: {
    partnerId: string;
    documentId: string;
    decision: 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
    internalRemarks?: string;
    reviewerName: string;
  }) => {
    const updated = await adminService.reviewPartnerDocument(params);
    await queryClient.invalidateQueries({ queryKey: ['deliveryPartners'] });
    setSelectedPartner(updated);
  };

  // Table Columns
  const columns: Column<DeliveryPartner>[] = [
    {
      key: 'id',
      header: 'Partner ID',
      render: (r) => <span className="font-mono text-xs font-semibold text-brand-700">{r.id}</span>,
    },
    {
      key: 'name',
      header: 'Partner Name',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          {r.profilePhotoUrl ? (
            <img
              src={r.profilePhotoUrl}
              alt={r.name}
              className="w-8 h-8 rounded-full object-cover shrink-0 border border-border-light"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-xs shrink-0">
              {r.name.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-semibold text-ink-primary">{r.name}</p>
            <p className="text-[11px] text-ink-muted">{r.currentHub}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (r) => (
        <span className="font-mono text-xs text-ink-secondary">{maskPhone(r.phone)}</span>
      ),
    },
    {
      key: 'vehicleType',
      header: 'Vehicle',
      render: (r) => (
        <span className="text-xs font-medium text-ink-secondary">
          {r.vehicleType === 'EV_SCOOTER'
            ? '⚡ EV Scooter'
            : r.vehicleType === 'BIKE'
            ? '🏍️ Motorbike'
            : '🚲 Bicycle'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Availability',
      render: (r) => <StatusBadge status={r.status} size="sm" />,
    },
    {
      key: 'verificationStatus',
      header: 'Verification Status',
      render: (r) => <VerificationStatusBadge status={r.verificationStatus} size="sm" />,
    },
    {
      key: 'deliveriesToday',
      header: 'Completed Today',
      align: 'right',
      render: (r) => <span className="font-semibold text-brand-700">{r.deliveriesToday}</span>,
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (r) => (
        <span className="inline-flex items-center gap-1 font-semibold text-xs text-amber-600">
          <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
          {r.rating}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPartner(r);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors border border-brand-200/60"
            title="Inspect KYC verification documents and audit trail"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>View Documents</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delivery Partner Document Verification & KYC"
        description="Inspect submitted identity, driving licence and vehicle compliance scans. Approve or reject KYC documents and audit fleet partner compliance."
      />

      {/* Top Verification & Fleet KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Total Partners"
          value={totalRiders}
          subtitle="Registered fleet partners"
          icon={Bike}
          onClick={() => {
            setSelectedVerification('ALL');
            setSelectedStatus('ALL');
          }}
        />

        <StatCard
          title="Fully Verified"
          value={fullyVerifiedCount}
          subtitle="KYC approved & active"
          icon={CheckCircle2}
          variant="success"
          trend={{ value: Math.round((fullyVerifiedCount / (totalRiders || 1)) * 100), isPositive: true }}
          onClick={() => setSelectedVerification('VERIFIED')}
        />

        <StatCard
          title="Pending Verification"
          value={pendingVerificationCount}
          subtitle="Awaiting admin review"
          icon={Clock}
          variant={pendingVerificationCount > 0 ? 'warning' : 'default'}
          onClick={() => setSelectedVerification('PENDING_REVIEW')}
        />

        <StatCard
          title="Rejected / Incomplete"
          value={rejectedOrIncompleteCount}
          subtitle="Resubmission required"
          icon={XCircle}
          variant={rejectedOrIncompleteCount > 0 ? 'danger' : 'default'}
          onClick={() => setSelectedVerification('REJECTED')}
        />

        <StatCard
          title="Expired Documents"
          value={expiredDocumentsCount}
          subtitle="Insurance / DL lapsed"
          icon={AlertTriangle}
          variant={expiredDocumentsCount > 0 ? 'danger' : 'default'}
          onClick={() => setSelectedVerification('EXPIRED')}
        />
      </div>

      {/* Search Toolbar */}
      <SearchToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search partners by name, ID, vehicle registration or phone..."
        count={filteredRiders.length}
        totalCount={totalRiders}
        label="partners"
      />

      {/* Filter Bar */}
      <FilterBar
        onReset={() => {
          setSearchQuery('');
          setSelectedStatus('ALL');
          setSelectedVerification('ALL');
          setSelectedVehicle('ALL');
        }}
        hasActiveFilters={
          Boolean(searchQuery) ||
          selectedStatus !== 'ALL' ||
          selectedVerification !== 'ALL' ||
          selectedVehicle !== 'ALL'
        }
      >
        <FilterDropdown
          label="Verification Status"
          value={selectedVerification}
          onChange={setSelectedVerification}
          options={[
            { label: 'All Statuses', value: 'ALL' },
            { label: 'Verified', value: 'VERIFIED' },
            { label: 'Pending Review', value: 'PENDING_REVIEW' },
            { label: 'Rejected', value: 'REJECTED' },
            { label: 'Incomplete', value: 'INCOMPLETE' },
            { label: 'Expired', value: 'EXPIRED' },
          ]}
        />

        <FilterDropdown
          label="Vehicle Type"
          value={selectedVehicle}
          onChange={setSelectedVehicle}
          options={[
            { label: 'All Vehicles', value: 'ALL' },
            { label: 'EV Scooter', value: 'EV_SCOOTER' },
            { label: 'Motorbike', value: 'BIKE' },
            { label: 'Bicycle', value: 'CYCLE' },
          ]}
        />

        <FilterDropdown
          label="Availability"
          value={selectedStatus}
          onChange={setSelectedStatus}
          options={[
            { label: 'All Fleet', value: 'ALL' },
            { label: 'Available', value: 'AVAILABLE' },
            { label: 'On Delivery', value: 'ON_DELIVERY' },
            { label: 'Offline', value: 'OFFLINE' },
          ]}
        />
      </FilterBar>

      {/* Partner Data Table */}
      <DataTable
        columns={columns}
        data={filteredRiders}
        keyExtractor={(r) => r.id}
        isLoading={ridersLoading}
        onRowClick={(r) => setSelectedPartner(r)}
      />

      {/* Partner Verification & Document Review Drawer */}
      <PartnerVerificationDrawer
        partner={selectedPartner}
        isOpen={Boolean(selectedPartner)}
        onClose={() => setSelectedPartner(null)}
        activeOrder={activeOrder}
        partnerOrders={partnerOrders}
        onReviewDocument={handleReviewDocument}
      />
    </div>
  );
};
