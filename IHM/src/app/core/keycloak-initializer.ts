import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { environment } from '../../environments/environment';

export function initializeKeycloak(keycloakService: KeycloakService): () => Promise<boolean> {
  return () =>
    keycloakService.init({
      config: {
        url: environment.KEYCLOAK_URL,
        realm: environment.KEYCLOAK_REALM,
        clientId: environment.KEYCLOAK_CLIENTID,
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
