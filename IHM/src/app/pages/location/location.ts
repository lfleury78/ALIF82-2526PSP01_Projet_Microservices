import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { KeycloakAuthService } from '../../services/keycloak/keycloak';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../models/review.model';

@Component({
  selector: 'app-location',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './location.html',
  styleUrl: './location.css',
})
export class Location implements OnInit, OnDestroy {
  selectedLocation: any = null;
  isAuthenticated = false;
  authChecked = false;
  reviews: Review[] = [];
  currentUsername = '';

  private userSubscription?: Subscription;

  newReview = {
    rating: 5,
    comment: ''
  };

  listLocations = [
    {
      id: 1,
      name: 'Location 1',
      description: 'Description détaillée de Location 1. C\'est une magnifique propriété avec une vue spectaculaire.',
      price: '100',
      city: 'Paris',
      country: 'France',
      capacity: 4,
      image: 'https://imgs.search.brave.com/WKzJpWv8MjY58GkSvwk38vkrV_vY5oY-sGOeyXvaAmA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cuY2VudHVyeTIxLmZyL2ltYWdlc0JpZW4vczMvMjAyLzI0NjQvYzIxXzIwMl8yNDY0XzE2Mzc2XzhfOEQ5Q0UyOTYtMkIzOS00Nzg1LTlEODktOUJFUZCRkQ1RUI4LmpwZw'
    },
    {
      id: 2,
      name: 'Location 2',
      description: 'Description détaillée de Location 2. Appartement cosy au centre-ville.',
      price: '120',
      city: 'Lyon',
      country: 'France',
      capacity: 2,
      image: 'https://imgs.search.brave.com/WKzJpWv8MjY58GkSvwk38vkrV_vY5oY-sGOeyXvaAmA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cuY2VudHVyeTIxLmZyL2ltYWdlc0JpZW4vczMvMjAyLzI0NjQvYzIxXzIwMl8yNDY0XzE2Mzc2XzhfOEQ5Q0UyOTYtMkIzOS00Nzg1LTlEODktOUJFUZCRkQ1RUI4LmpwZw'
    },
    {
      id: 3,
      name: 'Location 3',
      description: 'Description détaillée de Location 3. Maison spacieuse idéale pour les familles.',
      price: '150',
      city: 'Marseille',
      country: 'France',
      capacity: 6,
      image: 'https://imgs.search.brave.com/WKzJpWv8MjY58GkSvwk38vkrV_vY5oY-sGOeyXvaAmA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cuY2VudHVyeTIxLmZyL2ltYWdlc0JpZW4vczMvMjAyLzI0NjQvYzIxXzIwMl8yNDY0XzE2Mzc2XzhfOEQ5Q0UyOTYtMkIzOS00Nzg1LTlEODktOUJFUZCRkQ1RUI4LmpwZw'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private keycloakService: KeycloakAuthService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.loadLocation(id);
      this.loadReviews();
    });

    this.userSubscription = this.keycloakService.getUser().subscribe(user => {
      this.isAuthenticated = !!user;
      this.currentUsername = user?.username || this.keycloakService.getFullName() || '';
      this.authChecked = true;
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  loadLocation(id: number): void {
    this.selectedLocation = this.listLocations.find(location => location.id === id) || null;
  }

  loadReviews(): void {
    if (!this.selectedLocation) return;

    this.reviewService.getReviewsByLocationId(this.selectedLocation.id).subscribe(data => {
      this.reviews = data;
    });
  }

  submitReview(): void {
    if (!this.selectedLocation || !this.newReview.comment.trim() || !this.currentUsername) {
      return;
    }

    this.reviewService.addReview({
      id: 0,
      locationId: this.selectedLocation.id,
      author: this.currentUsername,
      rating: this.newReview.rating,
      comment: this.newReview.comment,
      createdAt: ''
    }).subscribe(() => {
      this.newReview = {
        rating: 5,
        comment: ''
      };
      this.loadReviews();
    });
  }

  login(): void {
    this.keycloakService.login();
  }
}
