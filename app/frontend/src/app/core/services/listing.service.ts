import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Listing, ListingCreateRequest, ListingSearchCriteria, ListingUpdateRequest } from '../models/listing.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ListingService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/listings`;

  search(criteria: ListingSearchCriteria = {}): Observable<Listing[]> {
    let params = new HttpParams();
    if (criteria.city) params = params.set('city', criteria.city);
    if (criteria.propertyType) params = params.set('propertyType', criteria.propertyType);
    if (criteria.minPrice) params = params.set('minPrice', criteria.minPrice.toString());
    if (criteria.maxPrice) params = params.set('maxPrice', criteria.maxPrice.toString());
    if (criteria.maxGuests) params = params.set('maxGuests', criteria.maxGuests.toString());
    return this.http.get<Listing[]>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Listing> {
    return this.http.get<Listing>(`${this.baseUrl}/${id}`);
  }

  getMyListings(): Observable<Listing[]> {
    return this.http.get<Listing[]>(`${this.baseUrl}/my`);
  }

  create(listing: ListingCreateRequest): Observable<Listing> {
    return this.http.post<Listing>(this.baseUrl, listing);
  }

  update(id: string, listing: ListingUpdateRequest): Observable<Listing> {
    return this.http.put<Listing>(`${this.baseUrl}/${id}`, listing);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
