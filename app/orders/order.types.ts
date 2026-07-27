export type OrderStatus = "PENDING" | "PREPARING" | "COMPLETED" | "CANCELLED";

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PREPARING",
  "COMPLETED",
  "CANCELLED",
];

/** Mirrors backend ALLOWED_TRANSITIONS */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PREPARING", "CANCELLED"],
  PREPARING: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const ORDER_STATUS_CLASS: Record<OrderStatus, string> = {
  PENDING: "bg-secondary text-secondary-foreground",
  PREPARING: "bg-primary text-primary-foreground",
  COMPLETED: "bg-muted text-muted-foreground border",
  CANCELLED: "bg-destructive text-destructive-foreground",
};

export interface OrderAddress {
  id: string;
  receiver_name: string;
  receiver_phone: string;
  formatted_address: string | null;
  city: string | null;
  street: string | null;
  postal_code: string | null;
  address_type: string | null;
  latitude: number;
  longitude: number;
}

export interface OrderAddon {
  addon_id?: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderLine {
  id: string;
  variant_id: string;
  product_name: string;
  variant_name: string;
  variant_sku: string | null;
  quantity: number;
  unit_price: number | string;
  total_price: number | string;
  attributes: Record<string, string> | null;
  addons: OrderAddon[] | null;
}

export interface Order {
  id: string;
  status: OrderStatus;
  total_amount: number | string;
  user_id: string;
  address: OrderAddress;
  items: OrderLine[];
  created_at: string;
  updated_at: string;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  user_id?: string;
}

export interface OrderListResponse {
  data: Order[];
  meta: {
    total: number;
    total_pages: number;
    page: number;
    limit: number;
  };
}

export interface OrderStatusUpdateInput {
  status: OrderStatus;
}
