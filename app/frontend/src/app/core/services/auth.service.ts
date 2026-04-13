import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';

export interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  keycloakId: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private keycloak: Keycloak | null = null;
  private _isLoggedIn = signal(false);
  private _userProfile = signal<UserProfile | null>(null);
  private _avatarUrl = signal<string | null>(null);

  readonly isLoggedIn = this._isLoggedIn.asReadonly();
  readonly userProfile = this._userProfile.asReadonly();
  readonly avatarUrl = this._avatarUrl.asReadonly();

  async init(): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    try {
      this.keycloak = new Keycloak({
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId,
      });

      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        checkLoginIframe: false,
        pkceMethod: 'S256',
      });

      this._isLoggedIn.set(authenticated);

      if (authenticated) {
        const tokenParsed = this.keycloak.tokenParsed;
        if (tokenParsed) {
          this._userProfile.set({
            keycloakId: tokenParsed['sub'] ?? '',
            email: tokenParsed['email'] ?? '',
            firstName: tokenParsed['given_name'] ?? '',
            lastName: tokenParsed['family_name'] ?? '',
          });

          this.ensureUserExists();
        }

        setInterval(() => {
          this.keycloak?.updateToken(70).catch(() => {
            this.logout();
          });
        }, 60000);
      }

      return authenticated;
    } catch (error) {
      console.error('[Auth] Keycloak init failed:', error);
      this._isLoggedIn.set(false);
      return false;
    }
  }

  updateDisplayProfile(firstName: string, lastName: string, avatarUrl?: string) {
    const current = this._userProfile();
    if (current) {
      this._userProfile.set({ ...current, firstName, lastName });
    }
    if (avatarUrl !== undefined) {
      this._avatarUrl.set(avatarUrl || null);
    }
  }

  updateAvatarUrl(url: string | null) {
    this._avatarUrl.set(url);
  }

  login(): void {
    this.keycloak?.login({ redirectUri: window.location.origin });
  }

  register(): void {
    this.keycloak?.register({ redirectUri: window.location.origin });
  }

  logout(): void {
    this._isLoggedIn.set(false);
    this._userProfile.set(null);
    this.keycloak?.logout({ redirectUri: window.location.origin });
  }

  getToken(): string | undefined {
    return this.keycloak?.token;
  }

  getKeycloakId(): string | undefined {
    return this.keycloak?.subject;
  }

  getUserName(): string {
    const profile = this._userProfile();
    if (profile) {
      return `${profile.firstName} ${profile.lastName}`.trim() || profile.email || '';
    }
    return '';
  }

  hasRole(role: string): boolean {
    return this.keycloak?.hasRealmRole(role) ?? false;
  }

  private ensureUserExists(): void {
    const profile = this._userProfile();
    if (!profile) return;
    const apiUrl = `${environment.apiUrl}/users`;
    this.http.get(`${apiUrl}/me`).subscribe({
      error: () => {
        this.http.post(`${apiUrl}/me`, {
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
        }).subscribe({
          next: () => {},
          error: () => {},
        });
      },
    });
  }
}
