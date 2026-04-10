import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { KeycloakAuthService } from '../../services/keycloak/keycloak';

@Component({
  selector: 'app-location',
  imports: [CommonModule, RouterModule],
  templateUrl: './location.html',
  styleUrl: './location.css',
})
export class Location implements OnInit {
  selectedLocation: any = null;
  isAuthenticated = false;

  constructor(private keycloakService: KeycloakAuthService) {}

  ngOnInit(): void {
    this.loadLocation();
    this.isAuthenticated = this.keycloakService.isLoggedIn();
  }

  loadLocation(): void {
    this.selectedLocation = {
      id: 1,
      name: 'Location 1',
      description: 'Description détaillée de Location 1. C\'est une magnifique propriété avec une vue spectaculaire.',
      price: '100',
      city: 'Paris',
      country: 'France',
      capacity: 4
    };
  }

  login(): void {
    this.keycloakService.login();
  }
}
