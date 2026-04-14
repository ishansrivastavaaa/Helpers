export type Category = 
  | 'Housekeeping'
  | 'Plumbing'
  | 'Electrician'
  | 'Painting'
  | 'AC Repair'
  | 'RO Service'
  | 'Carpentry'
  | 'Gardening'
  | 'Pandit/Pooja'
  | 'Cook/Chef'
  | 'Medical Store'
  | 'General Store';

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Helper {
  id: string;
  name: string;
  category: Category;
  skills: string[];
  rating: number;
  reviewCount: number;
  priceRange: string;
  description: string;
  imageUrl: string;
  phone?: string;
  shopName?: string;
  shopAddress?: string;
  reviews: Review[];
  location?: { lat: number; lng: number };
  isAadhaarVerified?: boolean;
}
