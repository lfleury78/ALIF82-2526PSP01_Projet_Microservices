import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private baseUrl = 'https://nominatim.openstreetmap.org';

  constructor(private http: HttpClient) {}

  geocode(address: string, city: string, zipCode: string, country: string): Observable<GeocodingResult | null> {
    const query = `${address}, ${zipCode} ${city}, ${country}`;
    const params = {
      q: query,
      format: 'json',
      limit: '1',
      addressdetails: '1',
    };
    return this.http.get<any[]>(`${this.baseUrl}/search`, { params }).pipe(
      map((results) => {
        if (!results || results.length === 0) return null;
        return {
          latitude: parseFloat(results[0].lat),
          longitude: parseFloat(results[0].lon),
          displayName: results[0].display_name,
        };
      }),
      catchError(() => of(null)),
    );
  }
}
