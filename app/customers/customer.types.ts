export interface CustomerCounts {
  orders: number;
  addresses: number;
}

export interface Customer {
  id: string;
  name: string | null;
  phone: string;
  code: string;
  role: "CUSTOMER" | "ADMIN";
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  _count?: CustomerCounts;
}

export interface CustomerAddress {
  id: string;
  city: string | null;
  country: string | null;
  district: string | null;
  region: string | null;
  street: string | null;
  street_number: string | null;
  postal_code: string | null;
  formatted_address: string | null;
  address_details: string | null;
  receiver_name: string;
  receiver_phone: string;
  address_type: string | null;
  is_default: boolean;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface CustomerAddressInput {
  city?: string;
  country?: string;
  district?: string;
  region?: string;
  street?: string;
  street_number?: string;
  postal_code?: string;
  formatted_address?: string;
  address_details?: string;
  receiver_name: string;
  receiver_phone: string;
  address_type?: string;
  is_default?: boolean;
  latitude: number;
  longitude: number;
}

export type OrderStatus = "PENDING" | "PREPARING" | "COMPLETED" | "CANCELLED";

export interface CustomerOrder {
  id: string;
  total_amount: string | number;
  status: OrderStatus;
  created_at: string;
  address?: {
    formatted_address: string | null;
    receiver_name: string;
  };
  _count?: {
    items: number;
  };
}

export interface CustomerDetail extends Customer {
  addresses: CustomerAddress[];
  orders: CustomerOrder[];
}

export interface CustomerListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface CustomerListResponse {
  data: Customer[];
  meta: {
    total: number;
    total_pages: number;
    page: number;
    limit: number;
  };
}

export interface CustomerUpdateInput {
  name?: string;
  is_active?: boolean;
}
