import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Product {
    id: bigint;
    inStock: boolean;
    name: string;
    createdAt: bigint;
    description: string;
    sizes: Array<string>;
    imageUrl: string;
    category: string;
    price: bigint;
}
export interface OrderType {
    id: bigint;
    customerName: string;
    status: string;
    customerPhone: string;
    shippingCountry: string;
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
export interface OrderItem {
    size: string;
    productId: bigint;
    productName: string;
    quantity: bigint;
    price: bigint;
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(product: Product): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrder(order: OrderType): Promise<bigint>;
    deleteProduct(id: bigint): Promise<void>;
    getAllCustomers(): Promise<Array<Customer>>;
    getAllOrders(): Promise<Array<OrderType>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getOrderById(id: bigint): Promise<OrderType | null>;
    getOrdersByEmail(email: string): Promise<Array<OrderType>>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getUpiId(): Promise<string>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isPaymentConfigured(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setUpiId(id: string): Promise<void>;
    updateOrderStatus(orderId: bigint, newStatus: string): Promise<void>;
    updateProduct(id: bigint, updatedProduct: Product): Promise<void>;
}
