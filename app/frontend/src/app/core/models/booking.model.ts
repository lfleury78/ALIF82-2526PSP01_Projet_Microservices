export interface Booking {
  id: string;
  listingId: string;
  tenantId: string;
  ownerId: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  totalPrice: number;
  status: BookingStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingCreateRequest {
  listingId: string;
  ownerId: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  totalPrice: number;
  message?: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
