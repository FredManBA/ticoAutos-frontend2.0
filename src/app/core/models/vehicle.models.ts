export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  description: string;
  imageUrl: string;
  isSold: boolean;
  ownerId: number;
  ownerName: string;  
  createdAt: string;
}

export interface VehicleFilter {
  brand?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  isSold?: boolean;
  page: number;
  pageSize: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AnswerResponse {
  id: number;
  content: string;
  createdAt: string;
}

export interface QuestionResponse {
  id: number;
  content: string;
  createdAt: string;
  vehicleId: number;
  askerId: number;
  askerName: string;
  answer: AnswerResponse | null;
}