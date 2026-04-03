import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

export function initializeKeycloak(keycloakService: KeycloakService): () => Promise<boolean> {
  return () =>
    keycloakService.init({
      config: {
        url: 'http://localhost:8080',
        realm: 'HessBnb',
        clientId: 'frontend_app',
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri:
          window.location.origin + '/assets/silent-check-sso.html',
      },
      shouldAddToken: (request) => {
        const { method, url } = request;
        const isGetRequest = 'GET' === method.toUpperCase();
        const acceptablePath = ['assets', 'documents'].some((path) =>
          url.toLowerCase().includes(path.toLowerCase())
        );
        return !isGetRequest || !acceptablePath;
      },
    });
}

export const keycloakAuthProvider = {
  provide: APP_INITIALIZER,
  useFactory: initializeKeycloak,
  deps: [KeycloakService],
  multi: true,
};
