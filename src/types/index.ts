export type FulfillmentType = 'delivery' | 'pickup';

export type OrderStatus =
  | 'new'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface ProductVariantSize {
  name: string; // e.g., 'صغير (S)' | 'وسط (M)' | 'كبير (L)' | '3 قطع' | '5 قطع' | '7 قطع'
  price: number;
}

export interface ProductAddition {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  nameEn?: string;
  categoryId: string;
  categoryName: string;
  price: number;
  description: string;
  image: string;
  isAvailable: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  sizes?: ProductVariantSize[];
  additions?: ProductAddition[];
  confidenceStatus: 'مؤكد من منيو ديسمبر 2025' | 'مرجع قديم - بحاجة لتأكيد' | 'قيد المراجعة';
  menuSource: string;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  nameEn?: string;
  iconName?: string;
  description?: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  nameEn: string;
  fee: number | null; // null if unconfigured
  isConfigured: boolean;
  isEnabled: boolean;
  estimatedMinutes: string;
}

export interface RestaurantInfo {
  name: string;
  nameAr: string;
  phone: string;
  whatsapp: string;
  address: string;
  addressShort: string;
  city: string;
  governorate: string;
  googleMapsUrl: string;
  googleRating: number;
  reviewsCount: number;
  openingHours: string;
  isOpen: boolean;
  headline: string;
  tagline: string;
  announcement: string;
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  name: string;
  image: string;
  selectedSize?: ProductVariantSize;
  selectedAdditions: ProductAddition[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  address: string;
  deliveryZoneId?: string;
  deliveryZoneName?: string;
  fulfillmentType: FulfillmentType;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: OrderCustomer;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'الدفع كاش عند الاستلام';
  status: OrderStatus;
  statusAr: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: Array<{
    status: OrderStatus;
    statusAr: string;
    timestamp: string;
    note?: string;
  }>;
}

export interface DashboardStats {
  totalOrders: number;
  todayOrders: number;
  todayRevenue: number;
  totalRevenue: number;
  newOrdersCount: number;
  preparingOrdersCount: number;
  completedOrdersCount: number;
  topSelling: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
}

export interface ScannedMenuSheet {
  id: string;
  title: string;
  date: string;
  priority: 'primary' | 'reference';
  imageUrl: string;
  description: string;
}
