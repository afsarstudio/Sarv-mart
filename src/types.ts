export type ProductCategory =
  | 'Groceries'
  | 'Daily Grocery Items'
  | 'Dairy'
  | 'Bakery'
  | 'Stationery'
  | 'Kitchen'
  | 'Household'
  | 'Beauty'
  | 'Personal Care'
  | 'Electronics'
  | 'Daily Essentials';

export interface Product {
  id: string;
  name: string;
  hindiName?: string;
  category: ProductCategory;
  subcategory: string;
  brand: string;
  price: number; // Selling price in INR
  mrp: number; // Maximum Retail Price
  unit: string; // e.g., '1 kg', '500 g', '1 L', 'Pack of 2'
  stock: number;
  rating: number;
  reviewsCount: number;
  image: string;
  isBestSeller?: boolean;
  isTrending?: boolean;
  isOrganic?: boolean;
  isNew?: boolean;
  discountPercent: number;
  description: string;
  nutrition?: {
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
    fiber?: string;
  };
  specifications?: Record<string, string>;
  gstRate: number; // e.g., 0, 5, 12, 18
  barcode: string;
}

export interface CategoryItem {
  id: string;
  name: ProductCategory;
  iconName: string;
  image: string;
  itemCount: number;
  subcategories: string[];
  bannerBg: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderAddress {
  fullName: string;
  phone: string;
  streetAddress: string;
  landmark: string;
  area: string; // e.g. Behta Bazar, Alambagh, Gomti Nagar
  city: string; // Lucknow
  pincode: string; // e.g. 226026
  addressType: 'Home' | 'Work' | 'Other';
  lat?: number;
  lng?: number;
}

export type OrderStatus = 'pending' | 'packing' | 'dispatched' | 'delivered' | 'cancelled';

export type NotificationChannel = 'SMS' | 'WhatsApp' | 'Email';
export type NotificationMilestone = 'confirmation' | 'packing' | 'dispatched' | 'out_for_delivery' | 'delivered';

export interface NotificationLog {
  id: string;
  orderId: string;
  milestone: NotificationMilestone;
  channel: NotificationChannel;
  recipient: string;
  title: string;
  message: string;
  timestamp: string;
  status: 'Sent' | 'Delivered' | 'Read';
}

export interface DeliveryRider {
  id: string;
  name: string;
  phone: string;
  vehicleNo: string;
  rating: number;
  totalDeliveries: number;
  isOnline: boolean;
  currentLocation: { lat: number; lng: number };
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  gstAmount: number;
  deliveryFee: number;
  totalAmount: number;
  status: OrderStatus;
  address: OrderAddress;
  deliverySlot: string; // e.g., 'Today 8:00 AM - 10:00 AM'
  paymentMethod: 'UPI' | 'Card' | 'COD' | 'Wallet';
  paymentStatus: 'Pending' | 'Paid';
  otp: string; // 4-digit OTP for delivery verification
  rider?: DeliveryRider;
  createdAt: string;
  estimatedDelivery: string;
  invoiceNumber: string;
  gstin?: string;
  notifications?: NotificationLog[];
  liveCoordinates?: {
    lat: number;
    lng: number;
    distanceRemainingKm: number;
    etaMinutes: number;
    speedKmh: number;
    currentLandmark: string;
  };
}

export interface POSItem {
  product: Product;
  quantity: number;
  customDiscountPercent: number;
  itemTotal: number;
}

export interface POSBill {
  id: string;
  billNo: string;
  items: POSItem[];
  subtotal: number;
  totalGst: number;
  discount: number;
  finalTotal: number;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Credit';
  customerName?: string;
  customerPhone?: string;
  customerBirthOrAnniversary?: string;
  whatsappOptIn?: boolean;
  cashierName: string;
  timestamp: string;
  paidAmount: number;
  changeAmount: number;
  isOfflineSync?: boolean;
}

export interface CapturedCustomer {
  id: string;
  name: string;
  phone: string;
  whatsappOptIn: boolean;
  specialOccasion?: string;
  city?: string;
  totalBillsCount: number;
  totalSpent: number;
  lastBillDate: string;
  lastBillNo: string;
  capturedSource: 'POS_PRINT' | 'ONLINE_ORDER';
  whatsappOfferSentCount?: number;
  tags?: string[];
}

export interface Coupon {
  code: string;
  title: string;
  description: string;
  discountType: 'flat' | 'percentage';
  discountValue: number; // Amount or %
  minOrderValue: number;
  maxDiscount?: number;
  validTill: string;
  isActive: boolean;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  rewardPoints: number;
  walletBalance: number;
  savedAddresses: OrderAddress[];
  defaultPincode: string;
  gstin?: string;
}

export interface CustomerReview {
  id: string;
  userName: string;
  userCity: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
  productName?: string;
}

export type ViewMode = 'storefront' | 'pos' | 'admin' | 'delivery' | 'customer_account';
export type StorePage =
  | 'home'
  | 'shop'
  | 'categories'
  | 'offers'
  | 'checkout'
  | 'track_order'
  | 'about'
  | 'contact'
  | 'faq'
  | 'privacy'
  | 'returns'
  | 'terms';
