/**
 * Core Type Definitions for GOSHRII Admin Console
 * Domains: Quick-Commerce (Grocery), Ride Booking, and Local Point-to-Point Parcel Delivery
 */

// ==========================================
// 1. QUICK-COMMERCE (GROCERY) TYPES
// ==========================================

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  packSize: string; // e.g. "500 g", "1 L", "Pack of 2"
  mrp: number; // Maximum Retail Price
  sellingPrice: number;
  discountPercent: number;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  stockStatus: StockStatus;
  isActive: boolean;
  isArchived: boolean;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId?: string | null;
  parentName?: string | null;
  imageUrl: string;
  isActive: boolean;
  isArchived: boolean;
  directProductCount: number;
  createdAt: string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  type: 'ADD' | 'REMOVE' | 'SET';
  adjustmentAmount: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  adminName: string;
  timestamp: string;
}

export interface PriceHistory {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  previousMrp: number;
  newMrp: number;
  previousSellingPrice: number;
  newSellingPrice: number;
  reason: string;
  adminName: string;
  timestamp: string;
}

export type OfferDiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';
export type OfferStatus = 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'DISABLED';

export interface PromotionalOffer {
  id: string;
  title: string;
  code?: string;
  type: OfferDiscountType;
  discountValue: number;
  targetType: 'ALL' | 'CATEGORY' | 'PRODUCT';
  targetId?: string;
  targetName?: string;
  startDate: string;
  endDate: string;
  status: OfferStatus;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productSku: string;
  imageUrl: string;
  packSize: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PICKING'
  | 'PACKED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'UPI' | 'CREDIT_CARD' | 'NET_BANKING' | 'CASH_ON_DELIVERY';

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface OrderRefundInfo {
  amount: number;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  reason: string;
  processedAt?: string;
}

export interface OrderDeliveryAddress {
  street: string;
  area: string;
  city: string;
  pincode: string;
  landmark?: string;
}

export interface Order {
  id: string; // e.g. "ORD-9412"
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: OrderDeliveryAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  deliveryPartnerPhone?: string;
  estimatedDeliveryMinutes?: number;
  orderDate: string;
  timeline: OrderTimelineEvent[];
  refundInfo?: OrderRefundInfo;
}

export interface CustomerAddress {
  id: string;
  tag: 'Home' | 'Work' | 'Other';
  fullAddress: string;
  isDefault: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpend: number;
  lastOrderDate: string;
  joinedDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  addresses: CustomerAddress[];
  supportTicketsCount: number;
}

export type RiderStatus = 'AVAILABLE' | 'ON_DELIVERY' | 'OFFLINE';
export type VehicleType = 'BIKE' | 'EV_SCOOTER' | 'CYCLE';

export type PartnerVerificationStatus =
  | 'VERIFIED'
  | 'PENDING_REVIEW'
  | 'REJECTED'
  | 'INCOMPLETE'
  | 'EXPIRED';

export type VerificationDocumentType =
  | 'AADHAAR_CARD'
  | 'DRIVING_LICENCE'
  | 'PAN_CARD'
  | 'VEHICLE_RC'
  | 'VEHICLE_INSURANCE'
  | 'PROFILE_PHOTO'
  | 'VEHICLE_PHOTO'
  | 'OTHER';

export type VerificationDocumentStatus =
  | 'VERIFIED'
  | 'PENDING_REVIEW'
  | 'REJECTED'
  | 'EXPIRED'
  | 'MISSING';

export interface VerificationDocument {
  id: string;
  type: VerificationDocumentType;
  name: string;
  documentNumberMasked?: string;
  status: VerificationDocumentStatus;
  submittedAt?: string;
  expiryDate?: string;
  isExpired?: boolean;
  fileType: 'IMAGE' | 'PDF';
  frontUrl?: string;
  backUrl?: string;
  hasBackSide: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  internalRemarks?: string;
  isRequired: boolean;
}

export interface VerificationHistoryEvent {
  id: string;
  documentId?: string;
  documentType: VerificationDocumentType;
  documentTitle: string;
  action: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'RESUBMITTED' | 'EXPIRED';
  timestamp: string;
  reviewerName?: string;
  reason?: string;
  remarks?: string;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  email: string;
  profilePhotoUrl?: string;
  vehicleType: VehicleType;
  vehicleRegistrationNumber?: string;
  status: RiderStatus;
  verificationStatus: PartnerVerificationStatus;
  activeOrderId?: string;
  deliveriesToday: number;
  totalDeliveries: number;
  rating: number;
  joinedDate: string;
  lastActiveAt: string;
  currentHub: string;
  documents: VerificationDocument[];
  verificationHistory: VerificationHistoryEvent[];
}

// ==========================================
// STORE MANAGEMENT DOMAIN TYPES
// ==========================================

export interface Store {
  id: string;
  storeName: string;
  userName: string;
  email: string;
  password?: string;
  phone: string;
  location: string;
  city: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  operatingHours?: string;
  totalOrders?: number;
  totalRevenue?: number;
  category?: string;
}

export type CreateStoreInput = Omit<Store, 'id' | 'createdAt'> & {
  confirmPassword?: string;
};

export type UpdateStoreInput = Partial<CreateStoreInput>;

// ==========================================
// 2. RIDE BOOKING DOMAIN TYPES
// ==========================================

export type RideStatus =
  | 'REQUESTED'
  | 'SEARCHING_DRIVER'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_ARRIVING'
  | 'RIDE_STARTED'
  | 'RIDE_COMPLETED'
  | 'CANCELLED';

export type VehicleCategory = 'AUTO' | 'HATCHBACK' | 'SEDAN' | 'PREMIER_SUV';
export type RideDriverAvailability = 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE';
export type DriverAccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export interface RideDriver {
  id: string; // e.g. "dr_01"
  name: string;
  phone: string;
  vehicleCategory: VehicleCategory;
  vehicleModel: string; // e.g. "Maruti Suzuki Dzire"
  registrationNumber: string; // e.g. "KA-01-MJ-4821"
  availability: RideDriverAvailability;
  accountStatus: DriverAccountStatus;
  rating: number;
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  activeRideId?: string;
  totalEarnings: number;
  joinedDate: string;
  lastActiveAt: string;
  currentLocationName: string;
}

export interface RideTimelineEvent {
  status: RideStatus;
  timestamp: string;
  note?: string;
}

export interface RideBooking {
  id: string; // e.g. "RIDE-4091"
  passengerName: string;
  passengerPhone: string;
  customerId?: string;
  pickupAddress: string;
  pickupArea: string;
  destinationAddress: string;
  destinationArea: string;
  vehicleCategory: VehicleCategory;
  bookingType: 'IMMEDIATE' | 'SCHEDULED';
  estimatedDistanceKm: number;
  estimatedDurationMinutes: number;
  estimatedFare: number;
  finalFare?: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  rideStatus: RideStatus;
  assignedDriverId?: string;
  assignedDriverName?: string;
  assignedDriverPhone?: string;
  assignedVehicleModel?: string;
  assignedVehicleReg?: string;
  bookingTime: string;
  cancellationReason?: string;
  timeline: RideTimelineEvent[];
}

// ==========================================
// 3. LOCAL PARCEL DELIVERY DOMAIN TYPES
// ==========================================

export type ParcelStatus =
  | 'CREATED'
  | 'COURIER_ASSIGNED'
  | 'PICKUP_IN_PROGRESS'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'PICKUP_FAILED'
  | 'DELIVERY_FAILED'
  | 'RETURN_REQUESTED'
  | 'RETURNING_TO_SENDER'
  | 'RETURNED_TO_SENDER';

export type ParcelCategory =
  | 'DOCUMENTS'
  | 'CLOTHING'
  | 'ELECTRONICS'
  | 'HOUSEHOLD'
  | 'FOOD_GIFTS'
  | 'OTHER';

export type CourierAvailability = 'AVAILABLE' | 'ON_PICKUP' | 'IN_TRANSIT' | 'OFFLINE';

export interface ParcelCourier {
  id: string; // e.g. "courier_01"
  name: string;
  phone: string;
  vehicleType: 'BIKE' | 'EV_SCOOTER' | 'MINI_VAN';
  availability: CourierAvailability;
  activeParcelId?: string;
  deliveriesToday: number;
  totalDeliveries: number;
  rating: number;
  joinedDate: string;
  lastActiveAt: string;
  currentArea: string;
}

export interface ParcelPartyInfo {
  name: string;
  phone: string;
  address: string;
  locality: string;
  landmark?: string;
  instructions?: string;
}

export interface ParcelPackageInfo {
  category: ParcelCategory;
  description: string;
  weightKg: number;
  dimensionsCm?: string;
  handlingNotes?: string;
}

export interface ParcelTimelineEvent {
  status: ParcelStatus;
  timestamp: string;
  location?: string;
  note?: string;
}

export interface ParcelBooking {
  id: string; // e.g. "PRC-8102"
  trackingId: string; // e.g. "GOSH-TRK-7412"
  sender: ParcelPartyInfo;
  recipient: ParcelPartyInfo;
  parcel: ParcelPackageInfo;
  deliveryType: 'LOCAL_POINT_TO_POINT';
  pickupScheduledTime?: string;
  deliveryFee: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: ParcelStatus;
  assignedCourierId?: string;
  assignedCourierName?: string;
  assignedCourierPhone?: string;
  assignedCourierVehicle?: string;
  createdAt: string;
  timeline: ParcelTimelineEvent[];
  failureReason?: string;
}

// ==========================================
// 4. PLATFORM CORE & ALERTS
// ==========================================

export type AlertType =
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'PENDING_ORDER'
  | 'DELAYED_DELIVERY'
  | 'RIDE_UNASSIGNED'
  | 'RIDE_CANCELLED'
  | 'PARCEL_PENDING'
  | 'PARCEL_FAILED'
  | 'CRITICAL';

export interface OperationalAlert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  severity: 'warning' | 'error' | 'info';
  linkTo: string;
  timestamp: string;
  isRead: boolean;
}

export type AdminRole = 'admin' | 'store_manager';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  roleLabel: string;
  hubLocation: string;
  lastLogin: string;
}

export interface AdminPreferences {
  tablePageSize: number;
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MMM DD, YYYY';
  enableSoundAlerts: boolean;
  compactTableDensity: boolean;
}
