export interface Listing {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  status: ListingStatus;
  amenities: string[];
  images: ListingImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ListingImage {
  id?: string;
  imageUrl: string;
  url?: string;
  caption?: string;
  primary?: boolean;
  sortOrder?: number;
  position?: number;
}

export interface ListingCreateRequest {
  title: string;
  description: string;
  propertyType: PropertyType;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: { imageUrl: string; primary: boolean; sortOrder: number }[];
}

export interface ListingUpdateRequest {
  title?: string;
  description?: string;
  propertyType?: PropertyType;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  pricePerNight?: number;
  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  images?: { imageUrl: string; primary: boolean; sortOrder: number }[];
}

export interface ListingSearchCriteria {
  city?: string;
  propertyType?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  maxGuests?: number;
}

export type PropertyType = 'APARTMENT' | 'HOUSE' | 'STUDIO' | 'VILLA' | 'LOFT' | 'ROOM';
export type ListingStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED';
