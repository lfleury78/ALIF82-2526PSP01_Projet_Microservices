import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { KeycloakAuthService } from '../../services/keycloak/keycloak';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule, NgbDropdownModule],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css',
})
export class NavBar implements OnInit {
  isAuthenticated = false;
  fullName: string = '';

  constructor(private keycloakService: KeycloakAuthService) {}

  ngOnInit(): void {
    this.isAuthenticated = this.keycloakService.isLoggedIn();
    this.fullName = this.keycloakService.getFullName();

    // Subscribe to user changes
    this.keycloakService.getUser().subscribe(() => {
      this.isAuthenticated = this.keycloakService.isLoggedIn();
      this.fullName = this.keycloakService.getFullName();
    });
  }

  login(): void {
    this.keycloakService.login();
  }

  logout(): void {
    this.keycloakService.logout();
  }
}
