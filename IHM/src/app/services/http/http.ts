import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Http {
  constructor(private httpClient: HttpClient) {}

  getRequest(url: string): Observable<any> {
    return this.httpClient.get<any>(url).pipe(
      tap(res => console.log('Réponse du serveur:', res)),
      catchError(error => {
        console.error('Erreur de requête:', error);
        return of(null);
      })
    );
  }
}
