import { Injectable, signal } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
}

@Injectable({
  providedIn: 'root',
})
export class KeycloakAuthService {
  private userSubject = new BehaviorSubject<UserProfile | null>(null);
  public user$ = this.userSubject.asObservable();
  public isAuthenticated = signal(false);

  constructor(private keycloakService: KeycloakService) {
    this.initializeKeycloak();
  }

  private async initializeKeycloak(): Promise<void> {
    try {
      const authenticated = await this.keycloakService.isLoggedIn();
      this.isAuthenticated.set(authenticated);

      if (authenticated) {
        const userProfile = await this.keycloakService.loadUserProfile();
        const user: UserProfile = {
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          email: userProfile.email,
          username: userProfile.username,
        };
        this.userSubject.next(user);
      }
    } catch (error) {
      console.error('Keycloak initialization error:', error);
      this.isAuthenticated.set(false);
    }
  }

  public login(): void {
    this.keycloakService.login();
  }

  public logout(): void {
    this.keycloakService.logout();
  }

  public getUser(): Observable<UserProfile | null> {
    return this.user$;
  }

  public async getToken(): Promise<string | undefined> {
    return await this.keycloakService.getToken();
  }

  public isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  public getFullName(): string {
    const user = this.userSubject.getValue();
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.username || 'Utilisateur';
  }
}
