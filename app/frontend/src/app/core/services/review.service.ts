import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review, ReviewCreateRequest } from '../models/review.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/reviews`;

  getByListing(listingId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/listing/${listingId}`);
  }

  create(request: ReviewCreateRequest): Observable<Review> {
    return this.http.post<Review>(this.baseUrl, request);
  }

  existsByBooking(bookingId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/booking/${bookingId}/exists`);
  }
}
