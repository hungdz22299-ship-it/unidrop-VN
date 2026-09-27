export type Role = 'user' | 'admin';
export interface User { id: string; name: string; email: string; password: string; phone?: string; role: Role; balance: number; avatar?: string; createdAt: string; }
export interface Category { id: string; slug: string; name: string; icon: string; description: string; }
export interface ProductDescriptionSection { title: string; content: string; }
export interface Product { id: string; name: string; slug: string; category: string; price: number; oldPrice?: number; image: string; images: string[]; rating: number; reviews: number; sold: number; stock: number; description: string; descriptionSections?: ProductDescriptionSection[]; tags: string[]; featured?: boolean; bestseller?: boolean; isNew?: boolean; onSale?: boolean; createdAt: string; }
export interface CartItem { productId: string; name: string; price: number; image: string; quantity: number; }
export interface OrderItem { productId: string; name: string; price: number; image: string; quantity: number; }
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export interface Order { id: string; userId: string; items: OrderItem[]; total: number; status: OrderStatus; shippingName: string; shippingPhone: string; shippingAddress: string; shippingProvince?: string; shippingDistrict?: string; shippingWard?: string; note?: string; paymentMethod: string; createdAt: string; refundProcessed?: boolean; stockRestored?: boolean; }
export type TransactionType = 'topup' | 'purchase' | 'refund';
export interface Transaction { id: string; userId: string; type: TransactionType; amount: number; description: string; orderId?: string; createdAt: string; balanceAfter?: number; }
export interface Promotion { id: string; code: string; description: string; discountType: 'percent' | 'fixed'; discountValue: number; minOrder: number; maxDiscount?: number; startDate: string; endDate: string; active: boolean; usedCount: number; }
