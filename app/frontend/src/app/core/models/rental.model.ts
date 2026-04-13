export interface Rental {
  id: string;
  bookingId: string;
  listingId: string;
  tenantId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  totalAmount: number;
  status: RentalStatus;
  createdAt: string;
  updatedAt: string;
}

export type RentalStatus = 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
