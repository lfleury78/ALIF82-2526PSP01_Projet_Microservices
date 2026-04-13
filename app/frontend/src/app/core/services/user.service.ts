import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User, UserCreateRequest, UserUpdateRequest } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/users`;
  private cache = new Map<string, User>();

  getById(id: string): Observable<User> {
    if (this.cache.has(id)) {
      return of(this.cache.get(id)!);
    }
    return this.http.get<User>(`${this.baseUrl}/${id}`).pipe(
      tap((user) => this.cache.set(id, user))
    );
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/me`);
  }

  createMe(user: UserCreateRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/me`, user);
  }

  update(id: string, user: UserUpdateRequest): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, user);
  }

  uploadAvatar(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.baseUrl}/upload-avatar`, formData);
  }
}
