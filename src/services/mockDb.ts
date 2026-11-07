import {
  Product,
  Category,
  StockAdjustment,
  PriceHistory,
  PromotionalOffer,
  Order,
  Customer,
  DeliveryPartner,
  OperationalAlert,
  AdminUser,
  OrderStatus,
  StockStatus,
  RideBooking,
  RideDriver,
  RideStatus,
  ParcelBooking,
  ParcelCourier,
  ParcelStatus,
  PartnerVerificationStatus,
  VerificationDocument,
  VerificationHistoryEvent,
  Store,
  CreateStoreInput,
  UpdateStoreInput,
} from '../types';
import {
  initialCategories,
  initialProducts,
  initialStockAdjustments,
  initialPriceHistories,
  initialOffers,
  initialOrders,
  initialCustomers,
  initialDeliveryPartners,
  initialStores,
  initialAlerts,
  initialAdminUser,
  initialSuperAdmin,
  initialStoreAdmin,
  initialRideDrivers,
  initialRideBookings,
  initialParcelCouriers,
  initialParcelBookings,
} from '../data/seedData';

const STORAGE_KEY = 'goshrii_mock_db_v2';

interface MockDatabaseState {
  products: Product[];
  categories: Category[];
  stockAdjustments: StockAdjustment[];
  priceHistories: PriceHistory[];
  offers: PromotionalOffer[];
  orders: Order[];
  customers: Customer[];
  deliveryPartners: DeliveryPartner[];
  stores: Store[];
  alerts: OperationalAlert[];
  adminUser: AdminUser;
  // Domain 2: Ride Booking
  rides: RideBooking[];
  drivers: RideDriver[];
  // Domain 3: Parcel Delivery
  parcels: ParcelBooking[];
  couriers: ParcelCourier[];
}

const getInitialState = (): MockDatabaseState => ({
  products: initialProducts,
  categories: initialCategories,
  stockAdjustments: initialStockAdjustments,
  priceHistories: initialPriceHistories,
  offers: initialOffers,
  orders: initialOrders,
  customers: initialCustomers,
  deliveryPartners: initialDeliveryPartners,
  stores: initialStores,
  alerts: initialAlerts,
  adminUser: initialAdminUser,
  rides: initialRideDrivers ? initialRideBookings : [],
  drivers: initialRideDrivers,
  parcels: initialParcelBookings,
  couriers: initialParcelCouriers,
});

export const computePartnerVerificationStatus = (partner: DeliveryPartner): PartnerVerificationStatus => {
  const today = new Date().toISOString().split('T')[0];
  const applicableDocs = partner.documents || [];

  const hasExpired = applicableDocs.some(
    (d) => d.isExpired || (d.expiryDate && d.expiryDate < today)
  );
  if (hasExpired) return 'EXPIRED';

  const hasRejected = applicableDocs.some((d) => d.status === 'REJECTED');
  if (hasRejected) return 'REJECTED';

  const hasMissingRequired = applicableDocs.some(
    (d) => d.isRequired && d.status === 'MISSING'
  );
  if (hasMissingRequired) return 'INCOMPLETE';

  const allRequiredVerified = applicableDocs
    .filter((d) => d.isRequired)
    .every((d) => d.status === 'VERIFIED');

  if (allRequiredVerified && applicableDocs.length > 0) return 'VERIFIED';

  return 'PENDING_REVIEW';
};

class MockDatabase {
  private state: MockDatabaseState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): MockDatabaseState {
    if (typeof window === 'undefined') return getInitialState();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        let deliveryPartners = parsed.deliveryPartners;
        if (
          !deliveryPartners ||
          deliveryPartners.length < initialDeliveryPartners.length ||
          !deliveryPartners[0]?.documents
        ) {
          deliveryPartners = initialDeliveryPartners;
        }

        // Recompute dynamic expiry
        const today = new Date().toISOString().split('T')[0];
        deliveryPartners = deliveryPartners.map((dp: DeliveryPartner) => {
          const docs = (dp.documents || []).map((doc) => {
            if (doc.expiryDate && doc.expiryDate < today) {
              return { ...doc, isExpired: true, status: 'EXPIRED' as const };
            }
            return doc;
          });
          const updated = { ...dp, documents: docs };
          return {
            ...updated,
            verificationStatus: computePartnerVerificationStatus(updated),
          };
        });

        return {
          ...getInitialState(),
          ...parsed,
          deliveryPartners,
          stores: parsed.stores || initialStores,
          rides: parsed.rides || initialRideBookings,
          drivers: parsed.drivers || initialRideDrivers,
          parcels: parsed.parcels || initialParcelBookings,
          couriers: parsed.couriers || initialParcelCouriers,
        };
      }
    } catch (e) {
      console.warn('Failed to parse mock DB from localStorage, using fresh seed data', e);
    }
    const fresh = getInitialState();
    this.saveState(fresh);
    return fresh;
  }

  private saveState(newState: MockDatabaseState) {
    this.state = newState;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      }
    } catch (e) {
      console.error('Failed to save mock state to localStorage', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public resetToSeedData(): void {
    const fresh = getInitialState();
    this.saveState(fresh);
  }

  // ==========================================
  // 1. COMMERCE REPOSITORY METHODS
  // ==========================================

  public getProducts(): Product[] {
    return [...this.state.products];
  }

  public getProductById(id: string): Product | undefined {
    return this.state.products.find((p) => p.id === id);
  }

  public addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'discountPercent' | 'availableQuantity' | 'stockStatus'>): Product {
    const now = new Date().toISOString();
    const id = `prod_${Date.now()}`;
    const discountPercent = productData.mrp > 0
      ? Math.max(0, Math.round(((productData.mrp - productData.sellingPrice) / productData.mrp) * 100))
      : 0;
    const availableQuantity = Math.max(0, productData.stockQuantity - productData.reservedQuantity);
    
    let stockStatus: StockStatus = 'IN_STOCK';
    if (availableQuantity === 0) stockStatus = 'OUT_OF_STOCK';
    else if (availableQuantity <= productData.lowStockThreshold) stockStatus = 'LOW_STOCK';

    const newProduct: Product = {
      ...productData,
      id,
      discountPercent,
      availableQuantity,
      stockStatus,
      createdAt: now,
      updatedAt: now,
    };

    const updatedCategories = this.state.categories.map((c) =>
      c.id === productData.categoryId
        ? { ...c, directProductCount: c.directProductCount + 1 }
        : c
    );

    this.saveState({
      ...this.state,
      products: [newProduct, ...this.state.products],
      categories: updatedCategories,
    });

    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product {
    const existing = this.getProductById(id);
    if (!existing) throw new Error(`Product with ID ${id} not found.`);

    const now = new Date().toISOString();
    const mrp = updates.mrp !== undefined ? updates.mrp : existing.mrp;
    const sellingPrice = updates.sellingPrice !== undefined ? updates.sellingPrice : existing.sellingPrice;
    const stockQuantity = updates.stockQuantity !== undefined ? updates.stockQuantity : existing.stockQuantity;
    const reservedQuantity = updates.reservedQuantity !== undefined ? updates.reservedQuantity : existing.reservedQuantity;
    const lowStockThreshold = updates.lowStockThreshold !== undefined ? updates.lowStockThreshold : existing.lowStockThreshold;

    const discountPercent = mrp > 0
      ? Math.max(0, Math.round(((mrp - sellingPrice) / mrp) * 100))
      : 0;
    const availableQuantity = Math.max(0, stockQuantity - reservedQuantity);

    let stockStatus: StockStatus = 'IN_STOCK';
    if (availableQuantity === 0) stockStatus = 'OUT_OF_STOCK';
    else if (availableQuantity <= lowStockThreshold) stockStatus = 'LOW_STOCK';

    const updatedProduct: Product = {
      ...existing,
      ...updates,
      mrp,
      sellingPrice,
      discountPercent,
      stockQuantity,
      reservedQuantity,
      availableQuantity,
      lowStockThreshold,
      stockStatus,
      updatedAt: now,
    };

    this.saveState({
      ...this.state,
      products: this.state.products.map((p) => (p.id === id ? updatedProduct : p)),
    });

    return updatedProduct;
  }

  public archiveProduct(id: string, archive = true): Product {
    return this.updateProduct(id, { isArchived: archive });
  }

  public adjustStock(params: {
    productId: string;
    type: 'ADD' | 'REMOVE' | 'SET';
    amount: number;
    reason: string;
  }): { product: Product; adjustment: StockAdjustment } {
    const product = this.getProductById(params.productId);
    if (!product) throw new Error(`Product ${params.productId} not found.`);

    const prevQty = product.stockQuantity;
    let newQty = prevQty;

    if (params.type === 'ADD') {
      newQty = prevQty + params.amount;
    } else if (params.type === 'REMOVE') {
      if (params.amount > prevQty) {
        throw new Error(`Cannot remove ${params.amount} units; current stock is ${prevQty}.`);
      }
      newQty = Math.max(0, prevQty - params.amount);
    } else if (params.type === 'SET') {
      if (params.amount < 0) throw new Error('Stock cannot be negative.');
      newQty = params.amount;
    }

    const adjustmentAmount = Math.abs(newQty - prevQty);

    const adjustment: StockAdjustment = {
      id: `adj_${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      type: params.type,
      adjustmentAmount,
      previousQuantity: prevQty,
      newQuantity: newQty,
      reason: params.reason,
      adminName: this.state.adminUser.name,
      timestamp: new Date().toISOString(),
    };

    const updatedProduct = this.updateProduct(product.id, {
      stockQuantity: newQty,
    });

    this.saveState({
      ...this.state,
      stockAdjustments: [adjustment, ...this.state.stockAdjustments],
    });

    return { product: updatedProduct, adjustment };
  }

  public getStockAdjustments(): StockAdjustment[] {
    return [...this.state.stockAdjustments];
  }

  public getCategories(): Category[] {
    return [...this.state.categories];
  }

  public getCategoryById(id: string): Category | undefined {
    return this.state.categories.find((c) => c.id === id);
  }

  public addCategory(cat: Omit<Category, 'id' | 'createdAt' | 'directProductCount'>): Category {
    const id = `cat_${Date.now()}`;
    const newCategory: Category = {
      ...cat,
      id,
      directProductCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.saveState({
      ...this.state,
      categories: [newCategory, ...this.state.categories],
    });

    return newCategory;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category {
    const existing = this.getCategoryById(id);
    if (!existing) throw new Error(`Category ${id} not found.`);

    const updated: Category = { ...existing, ...updates };
    this.saveState({
      ...this.state,
      categories: this.state.categories.map((c) => (c.id === id ? updated : c)),
    });
    return updated;
  }

  public archiveCategory(id: string, archive = true): Category {
    return this.updateCategory(id, { isArchived: archive });
  }

  public updateProductPrice(params: {
    productId: string;
    newMrp: number;
    newSellingPrice: number;
    reason: string;
  }): { product: Product; priceHistory: PriceHistory } {
    const product = this.getProductById(params.productId);
    if (!product) throw new Error(`Product ${params.productId} not found.`);

    if (params.newSellingPrice > params.newMrp) {
      throw new Error(`Selling price (₹${params.newSellingPrice}) cannot exceed MRP (₹${params.newMrp}).`);
    }

    const priceHistory: PriceHistory = {
      id: `prc_${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      previousMrp: product.mrp,
      newMrp: params.newMrp,
      previousSellingPrice: product.sellingPrice,
      newSellingPrice: params.newSellingPrice,
      reason: params.reason,
      adminName: this.state.adminUser.name,
      timestamp: new Date().toISOString(),
    };

    const updatedProduct = this.updateProduct(product.id, {
      mrp: params.newMrp,
      sellingPrice: params.newSellingPrice,
    });

    this.saveState({
      ...this.state,
      priceHistories: [priceHistory, ...this.state.priceHistories],
    });

    return { product: updatedProduct, priceHistory };
  }

  public getPriceHistories(): PriceHistory[] {
    return [...this.state.priceHistories];
  }

  public getOffers(): PromotionalOffer[] {
    return [...this.state.offers];
  }

  public addOffer(offer: Omit<PromotionalOffer, 'id' | 'createdAt'>): PromotionalOffer {
    const newOffer: PromotionalOffer = {
      ...offer,
      id: `off_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    this.saveState({
      ...this.state,
      offers: [newOffer, ...this.state.offers],
    });

    return newOffer;
  }

  public updateOffer(id: string, updates: Partial<PromotionalOffer>): PromotionalOffer {
    const existing = this.state.offers.find((o) => o.id === id);
    if (!existing) throw new Error(`Offer ${id} not found.`);

    const updated = { ...existing, ...updates };
    this.saveState({
      ...this.state,
      offers: this.state.offers.map((o) => (o.id === id ? updated : o)),
    });
    return updated;
  }

  public getOrders(): Order[] {
    return [...this.state.orders];
  }

  public getOrderById(id: string): Order | undefined {
    return this.state.orders.find((o) => o.id === id);
  }

  public updateOrderStatus(orderId: string, nextStatus: OrderStatus, note?: string): Order {
    const order = this.getOrderById(orderId);
    if (!order) throw new Error(`Order ${orderId} not found.`);

    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      PLACED: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PICKING', 'CANCELLED'],
      PICKING: ['PACKED', 'CANCELLED'],
      PACKED: ['OUT_FOR_DELIVERY', 'CANCELLED'],
      OUT_FOR_DELIVERY: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    };

    const validNext = allowedTransitions[order.orderStatus] || [];
    if (!validNext.includes(nextStatus)) {
      throw new Error(`Cannot transition order from ${order.orderStatus} to ${nextStatus}. Permitted: ${validNext.join(', ') || 'None'}`);
    }

    const now = new Date().toISOString();
    const updatedTimeline = [
      ...order.timeline,
      {
        status: nextStatus,
        timestamp: now,
        note: note || `Status advanced to ${nextStatus}`,
      },
    ];

    let updatedRiders = this.state.deliveryPartners;
    if (nextStatus === 'DELIVERED' && order.deliveryPartnerId) {
      updatedRiders = updatedRiders.map((r) =>
        r.id === order.deliveryPartnerId
          ? {
              ...r,
              status: 'AVAILABLE',
              activeOrderId: undefined,
              deliveriesToday: r.deliveriesToday + 1,
              totalDeliveries: r.totalDeliveries + 1,
              lastActiveAt: now,
            }
          : r
      );
    }

    const updatedOrder: Order = {
      ...order,
      orderStatus: nextStatus,
      timeline: updatedTimeline,
    };

    this.saveState({
      ...this.state,
      orders: this.state.orders.map((o) => (o.id === orderId ? updatedOrder : o)),
      deliveryPartners: updatedRiders,
    });

    return updatedOrder;
  }

  public getCustomers(): Customer[] {
    return [...this.state.customers];
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.state.customers.find((c) => c.id === id);
  }

  public getDeliveryPartners(): DeliveryPartner[] {
    return [...this.state.deliveryPartners];
  }

  public getDeliveryPartnerById(id: string): DeliveryPartner | undefined {
    return this.state.deliveryPartners.find((dp) => dp.id === id);
  }

  // ==========================================
  // STORES MANAGEMENT
  // ==========================================

  public getStores(): Store[] {
    return [...(this.state.stores || [])];
  }

  public getStoreById(id: string): Store | undefined {
    return (this.state.stores || []).find((s) => s.id === id);
  }

  public createStore(input: CreateStoreInput): Store {
    const nextNum = (this.state.stores?.length || 0) + 1;
    const id = `str_${String(nextNum).padStart(2, '0')}`;
    const newStore: Store = {
      id,
      storeName: input.storeName.trim(),
      userName: input.userName.trim(),
      email: input.email.trim(),
      password: input.password || 'store@2024',
      phone: input.phone.trim(),
      location: input.location.trim(),
      city: input.city?.trim() || 'Bengaluru',
      status: input.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
      operatingHours: input.operatingHours || '07:00 AM - 11:00 PM',
      totalOrders: 0,
      totalRevenue: 0,
      category: input.category || 'Grocery & Daily Essentials',
    };

    const nextStores = [newStore, ...(this.state.stores || [])];
    this.saveState({ ...this.state, stores: nextStores });
    return newStore;
  }

  public updateStore(id: string, updates: UpdateStoreInput): Store {
    const store = this.getStoreById(id);
    if (!store) throw new Error(`Store ${id} not found.`);

    const updated: Store = {
      ...store,
      ...updates,
      id: store.id,
      createdAt: store.createdAt,
    };

    const nextStores = (this.state.stores || []).map((s) => (s.id === id ? updated : s));
    this.saveState({ ...this.state, stores: nextStores });
    return updated;
  }

  public toggleStoreStatus(id: string): Store {
    const store = this.getStoreById(id);
    if (!store) throw new Error(`Store ${id} not found.`);
    const nextStatus = store.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return this.updateStore(id, { status: nextStatus });
  }

  public deleteStore(id: string): boolean {
    const prevLen = (this.state.stores || []).length;
    const nextStores = (this.state.stores || []).filter((s) => s.id !== id);
    if (nextStores.length === prevLen) return false;
    this.saveState({ ...this.state, stores: nextStores });
    return true;
  }

  public reviewPartnerDocument(params: {
    partnerId: string;
    documentId: string;
    decision: 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
    internalRemarks?: string;
    reviewerName?: string;
  }): DeliveryPartner {
    const partner = this.getDeliveryPartnerById(params.partnerId);
    if (!partner) throw new Error(`Delivery partner ${params.partnerId} not found.`);

    const now = new Date().toISOString();
    const reviewer = params.reviewerName || 'Shriya Verma (Ops Lead)';

    const updatedDocuments = (partner.documents || []).map((doc) => {
      if (doc.id === params.documentId) {
        if (params.decision === 'APPROVED') {
          return {
            ...doc,
            status: 'VERIFIED' as const,
            verifiedAt: now,
            verifiedBy: reviewer,
            rejectionReason: undefined,
            internalRemarks: params.internalRemarks || doc.internalRemarks,
          };
        } else {
          return {
            ...doc,
            status: 'REJECTED' as const,
            rejectionReason: params.rejectionReason || 'Document rejected by reviewer.',
            internalRemarks: params.internalRemarks || doc.internalRemarks,
            verifiedAt: now,
            verifiedBy: reviewer,
          };
        }
      }
      return doc;
    });

    const targetDoc = partner.documents?.find((d) => d.id === params.documentId);
    const historyEvent: VerificationHistoryEvent = {
      id: `vh_${Date.now()}`,
      documentId: params.documentId,
      documentType: targetDoc ? targetDoc.type : 'OTHER',
      documentTitle: targetDoc ? targetDoc.name : 'Document',
      action: params.decision === 'APPROVED' ? 'APPROVED' : 'REJECTED',
      timestamp: now,
      reviewerName: reviewer,
      reason: params.decision === 'REJECTED' ? params.rejectionReason : undefined,
      remarks: params.internalRemarks,
    };

    const tempUpdatedPartner: DeliveryPartner = {
      ...partner,
      documents: updatedDocuments,
      verificationHistory: [historyEvent, ...(partner.verificationHistory || [])],
    };

    const newVerificationStatus = computePartnerVerificationStatus(tempUpdatedPartner);

    const finalUpdatedPartner: DeliveryPartner = {
      ...tempUpdatedPartner,
      verificationStatus: newVerificationStatus,
    };

    this.saveState({
      ...this.state,
      deliveryPartners: this.state.deliveryPartners.map((dp) =>
        dp.id === params.partnerId ? finalUpdatedPartner : dp
      ),
    });

    return finalUpdatedPartner;
  }

  // ==========================================
  // 2. RIDE BOOKING REPOSITORY METHODS
  // ==========================================

  public getRides(): RideBooking[] {
    return [...this.state.rides];
  }

  public getRideById(id: string): RideBooking | undefined {
    return this.state.rides.find((r) => r.id === id);
  }

  public getRideDrivers(): RideDriver[] {
    return [...this.state.drivers];
  }

  public getRideDriverById(id: string): RideDriver | undefined {
    return this.state.drivers.find((d) => d.id === id);
  }

  public assignRideDriver(rideId: string, driverId: string): { ride: RideBooking; driver: RideDriver } {
    const ride = this.getRideById(rideId);
    if (!ride) throw new Error(`Ride ${rideId} not found.`);

    if (ride.rideStatus === 'RIDE_COMPLETED' || ride.rideStatus === 'CANCELLED') {
      throw new Error(`Cannot assign driver to a ${ride.rideStatus} ride.`);
    }

    const driver = this.getRideDriverById(driverId);
    if (!driver) throw new Error(`Driver ${driverId} not found.`);

    if (driver.availability !== 'AVAILABLE') {
      throw new Error(`Driver ${driver.name} is currently ${driver.availability}. Only AVAILABLE drivers can be assigned.`);
    }

    if (driver.accountStatus !== 'ACTIVE') {
      throw new Error(`Driver account is ${driver.accountStatus}.`);
    }

    const now = new Date().toISOString();

    // Update ride
    const updatedRide: RideBooking = {
      ...ride,
      rideStatus: 'DRIVER_ASSIGNED',
      assignedDriverId: driver.id,
      assignedDriverName: driver.name,
      assignedDriverPhone: driver.phone,
      assignedVehicleModel: driver.vehicleModel,
      assignedVehicleReg: driver.registrationNumber,
      timeline: [
        ...ride.timeline,
        {
          status: 'DRIVER_ASSIGNED',
          timestamp: now,
          note: `Assigned to driver ${driver.name} (${driver.vehicleModel}) by GOSHRII Ops.`,
        },
      ],
    };

    // Update driver state
    const updatedDriver: RideDriver = {
      ...driver,
      availability: 'ON_TRIP',
      activeRideId: ride.id,
      lastActiveAt: now,
    };

    this.saveState({
      ...this.state,
      rides: this.state.rides.map((r) => (r.id === rideId ? updatedRide : r)),
      drivers: this.state.drivers.map((d) => (d.id === driverId ? updatedDriver : d)),
    });

    return { ride: updatedRide, driver: updatedDriver };
  }

  public cancelRide(rideId: string, reason: string): RideBooking {
    const ride = this.getRideById(rideId);
    if (!ride) throw new Error(`Ride ${rideId} not found.`);

    if (ride.rideStatus === 'RIDE_COMPLETED') {
      throw new Error('Completed rides cannot be cancelled.');
    }

    if (ride.rideStatus === 'CANCELLED') {
      throw new Error('Ride is already cancelled.');
    }

    const now = new Date().toISOString();

    // Release assigned driver if any
    let updatedDrivers = this.state.drivers;
    if (ride.assignedDriverId) {
      updatedDrivers = updatedDrivers.map((d) =>
        d.id === ride.assignedDriverId
          ? {
              ...d,
              availability: 'AVAILABLE',
              activeRideId: undefined,
              cancelledRides: d.cancelledRides + 1,
              lastActiveAt: now,
            }
          : d
      );
    }

    const updatedRide: RideBooking = {
      ...ride,
      rideStatus: 'CANCELLED',
      cancellationReason: reason,
      timeline: [
        ...ride.timeline,
        {
          status: 'CANCELLED',
          timestamp: now,
          note: `Admin cancellation: ${reason}`,
        },
      ],
    };

    this.saveState({
      ...this.state,
      rides: this.state.rides.map((r) => (r.id === rideId ? updatedRide : r)),
      drivers: updatedDrivers,
    });

    return updatedRide;
  }

  // ==========================================
  // 3. PARCEL DELIVERY REPOSITORY METHODS
  // ==========================================

  public getParcels(): ParcelBooking[] {
    return [...this.state.parcels];
  }

  public getParcelById(id: string): ParcelBooking | undefined {
    return this.state.parcels.find((p) => p.id === id);
  }

  public getParcelByTrackingId(trackingId: string): ParcelBooking | undefined {
    const q = trackingId.trim().toUpperCase();
    return this.state.parcels.find(
      (p) => p.trackingId.toUpperCase() === q || p.id.toUpperCase() === q
    );
  }

  public getParcelCouriers(): ParcelCourier[] {
    return [...this.state.couriers];
  }

  public getParcelCourierById(id: string): ParcelCourier | undefined {
    return this.state.couriers.find((c) => c.id === id);
  }

  public createParcelBooking(
    data: Omit<ParcelBooking, 'id' | 'trackingId' | 'status' | 'createdAt' | 'timeline'>
  ): ParcelBooking {
    const now = new Date().toISOString();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const id = `PRC-${randomSuffix}`;
    const trackingId = `GOSH-TRK-${randomSuffix}`;

    const newParcel: ParcelBooking = {
      ...data,
      id,
      trackingId,
      status: 'CREATED',
      createdAt: now,
      timeline: [
        {
          status: 'CREATED',
          timestamp: now,
          location: data.sender.locality,
          note: 'Local point-to-point booking created in GOSHRII Ops Console.',
        },
      ],
    };

    this.saveState({
      ...this.state,
      parcels: [newParcel, ...this.state.parcels],
    });

    return newParcel;
  }

  public assignParcelCourier(parcelId: string, courierId: string): { parcel: ParcelBooking; courier: ParcelCourier } {
    const parcel = this.getParcelById(parcelId);
    if (!parcel) throw new Error(`Parcel ${parcelId} not found.`);

    const courier = this.getParcelCourierById(courierId);
    if (!courier) throw new Error(`Courier ${courierId} not found.`);

    const now = new Date().toISOString();

    const updatedParcel: ParcelBooking = {
      ...parcel,
      status: 'COURIER_ASSIGNED',
      assignedCourierId: courier.id,
      assignedCourierName: courier.name,
      assignedCourierPhone: courier.phone,
      assignedCourierVehicle: courier.vehicleType,
      timeline: [
        ...parcel.timeline,
        {
          status: 'COURIER_ASSIGNED',
          timestamp: now,
          location: courier.currentArea,
          note: `Assigned to courier partner ${courier.name}.`,
        },
      ],
    };

    const updatedCourier: ParcelCourier = {
      ...courier,
      availability: 'ON_PICKUP',
      activeParcelId: parcel.id,
      lastActiveAt: now,
    };

    this.saveState({
      ...this.state,
      parcels: this.state.parcels.map((p) => (p.id === parcelId ? updatedParcel : p)),
      couriers: this.state.couriers.map((c) => (c.id === courierId ? updatedCourier : c)),
    });

    return { parcel: updatedParcel, courier: updatedCourier };
  }

  // ==========================================
  // 4. PLATFORM CORE & ALERTS
  // ==========================================

  public getAlerts(): OperationalAlert[] {
    return [...this.state.alerts];
  }

  public markAlertAsRead(id: string): void {
    this.saveState({
      ...this.state,
      alerts: this.state.alerts.map((a) => (a.id === id ? { ...a, isRead: true } : a)),
    });
  }

  public getAdminUser(): AdminUser {
    return { ...this.state.adminUser };
  }

  // ==========================================
  // 5. AUTH — Credential Validation
  // ==========================================

  /**
   * Validates admin login credentials against the demo account.
   * Returns the AdminUser on success, or null on failure.
   * In production this would be a server-side API call.
   */
  public validateAdminCredentials(email: string, password: string): AdminUser | null {
    const trimmed = email.trim().toLowerCase();

    // 1. Admin — Full Access
    const isAdmin =
      (trimmed === 'admin@goshrii.in' || trimmed === 'admin') &&
      (password === 'admin' || password === 'goshrii@2024');

    if (isAdmin) {
      return {
        ...this.state.adminUser,
        role: 'admin',
        roleLabel: 'Admin',
        lastLogin: new Date().toISOString(),
      };
    }

    // 2. Store Manager — Commerce Only
    const matchedStore = (this.state.stores || []).find(
      (s) =>
        (trimmed === s.email.toLowerCase() || trimmed === s.userName.toLowerCase()) &&
        (password === s.password || password === 'store@2024' || password === 'store')
    );

    const isStoreManager =
      Boolean(matchedStore) ||
      ((trimmed === 'store@goshrii.in' || trimmed === 'store') &&
        (password === 'store@2024' || password === 'store'));

    if (isStoreManager) {
      return {
        id: matchedStore ? `admin_${matchedStore.id}` : initialStoreAdmin.id,
        name: matchedStore ? matchedStore.storeName : initialStoreAdmin.name,
        email: matchedStore ? matchedStore.email : initialStoreAdmin.email,
        role: 'store_manager',
        roleLabel: 'Store Manager',
        hubLocation: matchedStore
          ? `${matchedStore.storeName} (${matchedStore.location})`
          : initialStoreAdmin.hubLocation,
        lastLogin: new Date().toISOString(),
      };
    }

    return null;
  }
}

export const mockDb = new MockDatabase();
