export interface Review {
  id: string;
  listingId: string;
  bookingId: string;
  reviewerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewCreateRequest {
  listingId: string;
  bookingId: string;
  rating: number;
  comment: string;
}
