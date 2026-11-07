import { mockDb } from './mockDb';
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
  RideBooking,
  RideDriver,
  ParcelBooking,
  ParcelCourier,
  Store,
  CreateStoreInput,
  UpdateStoreInput,
} from '../types';

// Simulate realistic network delay for async loading states
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const adminService = {
  // Products
  async getProducts(): Promise<Product[]> {
    await delay(120);
    return mockDb.getProducts();
  },

  async getProductById(id: string): Promise<Product | undefined> {
    await delay(100);
    return mockDb.getProductById(id);
  },

  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'discountPercent' | 'availableQuantity' | 'stockStatus'>): Promise<Product> {
    await delay(180);
    return mockDb.addProduct(data);
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    await delay(180);
    return mockDb.updateProduct(id, updates);
  },

  async archiveProduct(id: string, archive = true): Promise<Product> {
    await delay(150);
    return mockDb.archiveProduct(id, archive);
  },

  // Inventory
  async adjustStock(params: {
    productId: string;
    type: 'ADD' | 'REMOVE' | 'SET';
    amount: number;
    reason: string;
  }): Promise<{ product: Product; adjustment: StockAdjustment }> {
    await delay(200);
    return mockDb.adjustStock(params);
  },

  async getStockAdjustments(): Promise<StockAdjustment[]> {
    await delay(120);
    return mockDb.getStockAdjustments();
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    await delay(100);
    return mockDb.getCategories();
  },

  async createCategory(cat: Omit<Category, 'id' | 'createdAt' | 'directProductCount'>): Promise<Category> {
    await delay(160);
    return mockDb.addCategory(cat);
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    await delay(160);
    return mockDb.updateCategory(id, updates);
  },

  async archiveCategory(id: string, archive = true): Promise<Category> {
    await delay(140);
    return mockDb.archiveCategory(id, archive);
  },

  // Pricing
  async updatePrice(params: {
    productId: string;
    newMrp: number;
    newSellingPrice: number;
    reason: string;
  }): Promise<{ product: Product; priceHistory: PriceHistory }> {
    await delay(180);
    return mockDb.updateProductPrice(params);
  },

  async getPriceHistories(): Promise<PriceHistory[]> {
    await delay(100);
    return mockDb.getPriceHistories();
  },

  // Offers
  async getOffers(): Promise<PromotionalOffer[]> {
    await delay(100);
    return mockDb.getOffers();
  },

  async createOffer(offer: Omit<PromotionalOffer, 'id' | 'createdAt'>): Promise<PromotionalOffer> {
    await delay(160);
    return mockDb.addOffer(offer);
  },

  async updateOffer(id: string, updates: Partial<PromotionalOffer>): Promise<PromotionalOffer> {
    await delay(150);
    return mockDb.updateOffer(id, updates);
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    await delay(140);
    return mockDb.getOrders();
  },

  async getOrderById(id: string): Promise<Order | undefined> {
    await delay(100);
    return mockDb.getOrderById(id);
  },

  async updateOrderStatus(orderId: string, nextStatus: OrderStatus, note?: string): Promise<Order> {
    await delay(200);
    return mockDb.updateOrderStatus(orderId, nextStatus, note);
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    await delay(120);
    return mockDb.getCustomers();
  },

  async getCustomerById(id: string): Promise<Customer | undefined> {
    await delay(100);
    return mockDb.getCustomerById(id);
  },

  // Delivery Partners
  async getDeliveryPartners(): Promise<DeliveryPartner[]> {
    await delay(120);
    return mockDb.getDeliveryPartners();
  },

  async getDeliveryPartnerById(id: string): Promise<DeliveryPartner | undefined> {
    await delay(100);
    return mockDb.getDeliveryPartnerById(id);
  },

  async reviewPartnerDocument(params: {
    partnerId: string;
    documentId: string;
    decision: 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
    internalRemarks?: string;
    reviewerName?: string;
  }): Promise<DeliveryPartner> {
    await delay(200);
    return mockDb.reviewPartnerDocument(params);
  },

  // STORES
  async getStores(): Promise<Store[]> {
    await delay(120);
    return mockDb.getStores();
  },

  async getStoreById(id: string): Promise<Store | undefined> {
    await delay(80);
    return mockDb.getStoreById(id);
  },

  async createStore(data: CreateStoreInput): Promise<Store> {
    await delay(200);
    return mockDb.createStore(data);
  },

  async updateStore(id: string, updates: UpdateStoreInput): Promise<Store> {
    await delay(180);
    return mockDb.updateStore(id, updates);
  },

  async toggleStoreStatus(id: string): Promise<Store> {
    await delay(150);
    return mockDb.toggleStoreStatus(id);
  },

  async deleteStore(id: string): Promise<boolean> {
    await delay(150);
    return mockDb.deleteStore(id);
  },

  // RIDE BOOKINGS
  async getRides(): Promise<RideBooking[]> {
    await delay(130);
    return mockDb.getRides();
  },

  async getRideById(id: string): Promise<RideBooking | undefined> {
    await delay(90);
    return mockDb.getRideById(id);
  },

  async assignRideDriver(rideId: string, driverId: string): Promise<{ ride: RideBooking; driver: RideDriver }> {
    await delay(220);
    return mockDb.assignRideDriver(rideId, driverId);
  },

  async cancelRide(rideId: string, reason: string): Promise<RideBooking> {
    await delay(220);
    return mockDb.cancelRide(rideId, reason);
  },

  async getRideDrivers(): Promise<RideDriver[]> {
    await delay(120);
    return mockDb.getRideDrivers();
  },

  async getRideDriverById(id: string): Promise<RideDriver | undefined> {
    await delay(90);
    return mockDb.getRideDriverById(id);
  },

  // PARCEL DELIVERIES
  async getParcels(): Promise<ParcelBooking[]> {
    await delay(130);
    return mockDb.getParcels();
  },

  async getParcelById(id: string): Promise<ParcelBooking | undefined> {
    await delay(90);
    return mockDb.getParcelById(id);
  },

  async getParcelByTrackingId(trackingId: string): Promise<ParcelBooking | undefined> {
    await delay(120);
    return mockDb.getParcelByTrackingId(trackingId);
  },

  async createParcelBooking(
    data: Omit<ParcelBooking, 'id' | 'trackingId' | 'status' | 'createdAt' | 'timeline'>
  ): Promise<ParcelBooking> {
    await delay(250);
    return mockDb.createParcelBooking(data);
  },

  async assignParcelCourier(
    parcelId: string,
    courierId: string
  ): Promise<{ parcel: ParcelBooking; courier: ParcelCourier }> {
    await delay(220);
    return mockDb.assignParcelCourier(parcelId, courierId);
  },

  async getParcelCouriers(): Promise<ParcelCourier[]> {
    await delay(120);
    return mockDb.getParcelCouriers();
  },

  async getParcelCourierById(id: string): Promise<ParcelCourier | undefined> {
    await delay(90);
    return mockDb.getParcelCourierById(id);
  },

  // Alerts
  async getAlerts(): Promise<OperationalAlert[]> {
    await delay(80);
    return mockDb.getAlerts();
  },

  async markAlertAsRead(id: string): Promise<void> {
    await delay(80);
    mockDb.markAlertAsRead(id);
  },

  // Admin
  async getAdminUser(): Promise<AdminUser> {
    return mockDb.getAdminUser();
  },

  // Reset
  resetDemoData(): void {
    mockDb.resetToSeedData();
  },
};
