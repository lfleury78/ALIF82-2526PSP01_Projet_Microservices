import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking, BookingCreateRequest } from '../models/booking.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/bookings`;

  getById(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.baseUrl}/${id}`);
  }

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/my`);
  }

  getReceivedBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/received`);
  }

  getByListing(listingId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/listing/${listingId}`);
  }

  create(booking: BookingCreateRequest): Observable<Booking> {
    return this.http.post<Booking>(this.baseUrl, booking);
  }

  confirm(id: string): Observable<Booking> {
    return this.http.patch<Booking>(`${this.baseUrl}/${id}/confirm`, {});
  }

  cancel(id: string): Observable<Booking> {
    return this.http.patch<Booking>(`${this.baseUrl}/${id}/cancel`, {});
  }
}
