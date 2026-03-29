import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Product {
    id: bigint;
    inStock: boolean;
    name: string;
    createdAt: bigint;
    description: string;
    sizes: Array<string>;
    imageUrl: string;
    category: string;
    subcategory: string;
    price: bigint;
}
export interface OrderType {
    id: bigint;
    customerName: string;
    status: string;
    trackingNumber: string;
    customerPhone: string;
    shippingCountry: string;
    ownerPrincipal: string;
    createdAt: bigint;
    shippingZip: string;
    shippingStreet: string;
    shippingCity: string;
    totalAmount: bigint;
    stripePaymentIntentId: string;
    items: Array<OrderItem>;
    orderNumber: bigint;
    orderNotes: string;
    customerEmail: string;
    shippingState: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface OrderItem {
    size: string;
    productId: bigint;
    productName: string;
    quantity: bigint;
    price: bigint;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface Customer {
    zip: string;
    street: string;
    country: string;
    city: string;
    name: string;
    email: string;
    state: string;
    phone: string;
}
export interface UserProfile {
    name: string;
    email: string;
    phone: string;
}
export interface http_header {
    value: string;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(product: Product): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimAdminWithBackupCode(code: string): Promise<boolean>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createOrder(order: OrderType): Promise<bigint>;
    deleteProduct(id: bigint): Promise<void>;
    getAllCustomers(): Promise<Array<Customer>>;
    getAllOrders(): Promise<Array<OrderType>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContactInfo(): Promise<{
        whatsapp: string;
        email: string;
    }>;
    getMyOrders(): Promise<Array<OrderType>>;
    getOrderById(id: bigint): Promise<OrderType | null>;
    getOrderByIdAndPhone(id: bigint, phone: string): Promise<OrderType | null>;
    getOrdersByEmail(email: string): Promise<Array<OrderType>>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUpiId(): Promise<string>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isPaymentConfigured(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setContactInfo(whatsapp: string, email: string): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    setUpiId(id: string): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateOrderStatus(orderId: bigint, newStatus: string): Promise<void>;
    updateOrderTracking(orderId: bigint, trackingNumber: string): Promise<void>;
    updateProduct(id: bigint, updatedProduct: Product): Promise<void>;
}
