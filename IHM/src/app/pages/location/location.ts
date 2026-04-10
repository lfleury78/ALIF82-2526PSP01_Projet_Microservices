import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { KeycloakAuthService } from '../../services/keycloak/keycloak';
import { MessagerieService } from '../../services/messagerie/messagerie.service';

@Component({
  selector: 'app-location',
  imports: [CommonModule, RouterModule],
  templateUrl: './location.html',
  styleUrl: './location.css',
})
export class Location implements OnInit {
  selectedLocation: any = null;
  isAuthenticated = false;

  // Hardcoded current user — auth integration comes later
  private readonly currentUserId = 1;

  constructor(
    private keycloakService: KeycloakAuthService,
    private messagerieService: MessagerieService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLocation();
    this.isAuthenticated = this.keycloakService.isLoggedIn();
  }

  loadLocation(): void {
    this.selectedLocation = {
      id: 1,
      hostId: 2,
      name: 'Location 1',
      description: "Description détaillée de Location 1. C'est une magnifique propriété avec une vue spectaculaire.",
      price: '100',
      city: 'Paris',
      country: 'France',
      capacity: 4,
      image:
        'https://imgs.search.brave.com/WKzJpWv8MjY58GkSvwk38vkrV_vY5oY-sGOeyXvaAmA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Y2VudHVyeTIxLmZy/L2ltYWdlc0JpZW4v/czMvMjAyLzI0NjQv/YzIxXzIwMl8yNDY0/XzE2Mzc2XzhfOEQ5/Q0UyOTYtMkIzOS00/Nzg1LTlEODktOUJF/RUZCRkQ1RUI4Lmpw/Zw',
    };
  }

  login(): void {
    this.keycloakService.login();
  }

  contactHost(): void {
    if (!this.selectedLocation) {
      return;
    }

    const hostId: number = this.selectedLocation.hostId ?? this.selectedLocation.id;
    const annonceId: number = this.selectedLocation.id;

    this.messagerieService
      .createConversation(this.currentUserId, hostId, annonceId)
      .subscribe({
        next: (conversation) => {
          this.router.navigate(['/messages'], {
            queryParams: { conversationId: conversation.idConversation },
          });
        },
        error: (err) => {
          console.error('Erreur lors de la création de la conversation:', err);
        },
      });
  }
}
