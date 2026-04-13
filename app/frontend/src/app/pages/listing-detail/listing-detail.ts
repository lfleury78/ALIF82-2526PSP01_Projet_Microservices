import { Component, inject, OnInit, OnDestroy, signal, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ListingService } from '../../core/services/listing.service';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { MessageService } from '../../core/services/message.service';
import { UserService } from '../../core/services/user.service';
import { ReviewService } from '../../core/services/review.service';
import { Listing } from '../../core/models/listing.model';
import { Booking } from '../../core/models/booking.model';
import { User } from '../../core/models/user.model';
import { Review } from '../../core/models/review.model';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';
import * as L from 'leaflet';

interface ReviewWithUser extends Review {
  reviewer?: User;
  reviewerAvatarFailed?: boolean;
}

@Component({
  selector: 'app-listing-detail',
  imports: [FormsModule, ImageUrlPipe],
  template: `
    @if (loading()) {
      <div class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    } @else if (listing(); as l) {
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center gap-3 mb-2">
          <h1 class="text-2xl font-bold text-gray-900">{{ l.title }}</h1>
          @if (reviews().length > 0) {
            <div class="flex items-center gap-1 text-sm">
              <span class="text-yellow-500">&#9733;</span>
              <span class="font-semibold text-gray-900">{{ averageRating() }}</span>
              <span class="text-gray-500">({{ reviews().length }} avis)</span>
            </div>
          }
        </div>
        <p class="text-gray-600 mb-6">{{ l.city }}, {{ l.country }}</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl overflow-hidden mb-8">
          @if (l.images && l.images.length > 0) {
            <div class="aspect-square bg-gray-200">
              <img [src]="l.images[0].imageUrl | imageUrl" [alt]="l.title" class="w-full h-full object-cover"/>
            </div>
            @if (l.images.length > 1) {
              <div class="grid grid-cols-2 gap-2">
                @for (img of l.images.slice(1, 5); track img.imageUrl) {
                  <div class="aspect-square bg-gray-200">
                    <img [src]="img.imageUrl | imageUrl" [alt]="img.caption || l.title" class="w-full h-full object-cover"/>
                  </div>
                }
              </div>
            }
          } @else {
            <div class="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center col-span-2">
              <svg class="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4"/>
              </svg>
            </div>
          }
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div class="lg:col-span-2">
            <div class="flex items-center justify-between border-b border-gray-200 pb-6 mb-6">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">{{ getPropertyTypeLabel(l.propertyType) }}</h2>
                <p class="text-gray-500">
                  {{ l.maxGuests }} voyageurs · {{ l.bedrooms }} chambres · {{ l.bathrooms }} salles de bain
                </p>
              </div>
              @if (owner(); as o) {
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center overflow-hidden">
                    @if (o.avatarUrl) {
                      <img [src]="o.avatarUrl | imageUrl" [alt]="o.firstName" class="w-full h-full object-cover"
                           (error)="onOwnerAvatarError()"/>
                    }
                    @if (!o.avatarUrl || ownerAvatarFailed()) {
                      <span class="text-lg font-bold text-white">{{ o.firstName.charAt(0).toUpperCase() }}{{ o.lastName.charAt(0).toUpperCase() }}</span>
                    }
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ o.firstName }} {{ o.lastName }}</p>
                    <p class="text-xs text-gray-500">Propriétaire</p>
                  </div>
                </div>
              }
            </div>

            <div class="mb-8">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p class="text-gray-600 whitespace-pre-line">{{ l.description }}</p>
            </div>

            @if (l.amenities && l.amenities.length > 0) {
              <div class="mb-8">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Équipements</h3>
                <div class="grid grid-cols-2 gap-3">
                  @for (amenity of l.amenities; track amenity) {
                    <div class="flex items-center gap-2 text-gray-600">
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      {{ amenity }}
                    </div>
                  }
                </div>
              </div>
            }

            @if (bookedRanges().length > 0) {
              <div class="mb-8">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Dates indisponibles</h3>
                <div class="flex flex-wrap gap-2">
                  @for (range of bookedRanges(); track range.checkIn) {
                    <span class="px-3 py-1 bg-red-50 text-red-700 text-sm rounded-full border border-red-200">
                      {{ formatDate(range.checkIn) }} - {{ formatDate(range.checkOut) }}
                    </span>
                  }
                </div>
              </div>
            }

            <div class="mb-8">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Localisation</h3>
              <p class="text-gray-600 mb-3">{{ l.address }}, {{ l.zipCode }} {{ l.city }}, {{ l.country }}</p>
              @if (l.latitude && l.longitude) {
                <div id="detail-map" class="h-64 rounded-xl overflow-hidden border border-gray-200 z-0"></div>
              }
            </div>

            <div class="mb-8">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Avis
                @if (reviews().length > 0) {
                  <span class="text-base font-normal text-gray-500 ml-2">({{ reviews().length }})</span>
                }
              </h3>

              @if (reviewsLoading()) {
                <div class="flex justify-center py-6">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                </div>
              } @else if (reviews().length === 0) {
                <p class="text-gray-500 py-4">Aucun avis pour le moment.</p>
              } @else {
                <div class="space-y-6">
                  @for (review of reviews(); track review.id) {
                    <div class="border border-gray-200 rounded-xl p-5">
                      <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                          @if (review.reviewer?.avatarUrl && !review.reviewerAvatarFailed) {
                            <img [src]="review.reviewer!.avatarUrl! | imageUrl" [alt]="review.reviewer!.firstName"
                                 class="w-full h-full object-cover"
                                 (error)="onReviewerAvatarError(review)"/>
                          } @else if (review.reviewer) {
                            <span class="text-sm font-bold text-white">{{ review.reviewer.firstName.charAt(0).toUpperCase() }}{{ review.reviewer.lastName.charAt(0).toUpperCase() }}</span>
                          } @else {
                            <span class="text-sm font-bold text-white">?</span>
                          }
                        </div>
                        <div class="flex-1">
                          <p class="text-sm font-medium text-gray-900">
                            @if (review.reviewer) {
                              {{ review.reviewer.firstName }} {{ review.reviewer.lastName }}
                            } @else {
                              Utilisateur
                            }
                          </p>
                          <p class="text-xs text-gray-500">{{ formatReviewDate(review.createdAt) }}</p>
                        </div>
                        <div class="text-yellow-500 text-sm">
                          {{ getStars(review.rating) }}
                        </div>
                      </div>
                      <p class="text-gray-600 text-sm">{{ review.comment }}</p>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <div class="lg:col-span-1">
            <div class="sticky top-24 border border-gray-200 rounded-xl shadow-lg p-6">
              <div class="flex items-baseline gap-1 mb-6">
                <span class="text-2xl font-bold">{{ l.pricePerNight }} &euro;</span>
                <span class="text-gray-500">/ nuit</span>
              </div>

              @if (auth.isLoggedIn()) {
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-xs font-medium text-gray-700 mb-1">Arrivée</label>
                      <input type="date" [(ngModel)]="checkIn" [min]="today"
                             (change)="onCheckInChange()"
                             class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-rose-500 focus:border-rose-500"/>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-700 mb-1">Départ</label>
                      <input type="date" [(ngModel)]="checkOut" [min]="minCheckOut"
                             class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-rose-500 focus:border-rose-500"/>
                    </div>
                  </div>

                  @if (dateConflict()) {
                    <p class="text-xs text-red-500">Ces dates chevauchent une réservation existante.</p>
                  }

                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Voyageurs</label>
                    <input type="number" [(ngModel)]="guests" [min]="1" [max]="l.maxGuests"
                           class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-rose-500 focus:border-rose-500"/>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Message (optionnel)</label>
                    <textarea [(ngModel)]="message" rows="2"
                              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-rose-500 focus:border-rose-500"
                              placeholder="Un message pour le proprietaire..."></textarea>
                  </div>

                  @if (totalPrice() > 0) {
                    <div class="border-t border-gray-200 pt-4 space-y-2">
                      <div class="flex justify-between text-sm">
                        <span>{{ l.pricePerNight }} &euro; x {{ nights() }} nuits</span>
                        <span>{{ totalPrice() }} &euro;</span>
                      </div>
                      <div class="flex justify-between font-semibold border-t border-gray-200 pt-2">
                        <span>Total</span>
                        <span>{{ totalPrice() }} &euro;</span>
                      </div>
                    </div>
                  }

                  <button (click)="book()" [disabled]="booking() || dateConflict()"
                          class="w-full py-3 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 transition disabled:opacity-50">
                    @if (booking()) {
                      Réservation en cours...
                    } @else {
                      Réserver
                    }
                  </button>

                  @if (bookingError()) {
                    <p class="text-sm text-red-500 text-center">{{ bookingError() }}</p>
                  }
                  @if (bookingSuccess()) {
                    <p class="text-sm text-green-600 text-center">Réservation envoyée avec succès !</p>
                  }

                  <button (click)="contactOwner()" [disabled]="contactingOwner()"
                          class="w-full py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50">
                    @if (contactingOwner()) {
                      Ouverture...
                    } @else {
                      Contacter le propriétaire
                    }
                  </button>
                </div>
              } @else {
                <button (click)="auth.login()"
                        class="w-full py-3 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 transition">
                  Connectez-vous pour réserver
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ListingDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private listingService = inject(ListingService);
  private bookingService = inject(BookingService);
  private messageService = inject(MessageService);
  private userService = inject(UserService);
  private reviewService = inject(ReviewService);
  auth = inject(AuthService);

  listing = signal<Listing | null>(null);
  owner = signal<User | null>(null);
  loading = signal(true);
  booking = signal(false);
  bookingError = signal('');
  bookingSuccess = signal(false);
  bookedRanges = signal<{ checkIn: string; checkOut: string }[]>([]);
  contactingOwner = signal(false);
  ownerAvatarFailed = signal(false);
  reviews = signal<ReviewWithUser[]>([]);
  reviewsLoading = signal(true);
  private detailMap: L.Map | null = null;

  checkIn = '';
  checkOut = '';
  guests = 1;
  message = '';
  today = new Date().toISOString().split('T')[0];
  minCheckOut = this.today;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.listingService.getById(id).subscribe({
        next: (l) => {
          this.listing.set(l);
          this.loading.set(false);
          this.loadBookedDates(l.id);
          this.loadOwner(l.ownerId);
          this.loadReviews(l.id);
          if (l.latitude && l.longitude) {
            setTimeout(() => this.initDetailMap(l.latitude!, l.longitude!, l.title), 100);
          }
        },
        error: () => this.loading.set(false),
      });
    }
  }

  ngOnDestroy() {
    if (this.detailMap) {
      this.detailMap.remove();
      this.detailMap = null;
    }
  }

  private initDetailMap(lat: number, lng: number, title: string) {
    const el = document.getElementById('detail-map');
    if (!el) return;
    this.detailMap = L.map('detail-map', { center: [lat, lng], zoom: 14, scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.detailMap);
    const icon = L.divIcon({
      className: 'custom-marker',
      html: '<div class="w-8 h-8 bg-rose-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center"><svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
    L.marker([lat, lng], { icon }).addTo(this.detailMap);
  }

  private loadOwner(ownerId: string) {
    this.userService.getById(ownerId).subscribe({
      next: (user) => this.owner.set(user),
      error: () => {},
    });
  }

  private loadBookedDates(listingId: string) {
    this.bookingService.getByListing(listingId).subscribe({
      next: (bookings: Booking[]) => {
        const active = bookings
          .filter((b) => b.status === 'PENDING' || b.status === 'CONFIRMED')
          .map((b) => ({ checkIn: b.checkInDate, checkOut: b.checkOutDate }))
          .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
        this.bookedRanges.set(active);
      },
      error: () => {},
    });
  }

  private loadReviews(listingId: string) {
    this.reviewsLoading.set(true);
    this.reviewService.getByListing(listingId).subscribe({
      next: (reviews) => {
        const reviewsWithUser: ReviewWithUser[] = reviews.map((r) => ({ ...r }));
        this.reviews.set(reviewsWithUser);
        this.reviewsLoading.set(false);
        for (const review of reviewsWithUser) {
          this.userService.getById(review.reviewerId).subscribe({
            next: (user) => {
              this.reviews.update((list) =>
                list.map((r) => (r.id === review.id ? { ...r, reviewer: user } : r))
              );
            },
            error: () => {},
          });
        }
      },
      error: () => this.reviewsLoading.set(false),
    });
  }

  averageRating(): string {
    const r = this.reviews();
    if (r.length === 0) return '0';
    const avg = r.reduce((sum, rev) => sum + rev.rating, 0) / r.length;
    return avg.toFixed(1);
  }

  getStars(rating: number): string {
    return '\u2605'.repeat(rating) + '\u2606'.repeat(5 - rating);
  }

  formatReviewDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  onReviewerAvatarError(review: ReviewWithUser) {
    this.reviews.update((list) =>
      list.map((r) => (r.id === review.id ? { ...r, reviewerAvatarFailed: true } : r))
    );
  }

  dateConflict(): boolean {
    if (!this.checkIn || !this.checkOut) return false;
    return this.bookedRanges().some(
      (r) => this.checkIn < r.checkOut && this.checkOut > r.checkIn
    );
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  onCheckInChange() {
    if (this.checkIn) {
      const next = new Date(this.checkIn);
      next.setDate(next.getDate() + 1);
      this.minCheckOut = next.toISOString().split('T')[0];
      if (this.checkOut && this.checkOut <= this.checkIn) {
        this.checkOut = this.minCheckOut;
      }
    }
  }

  nights(): number {
    if (!this.checkIn || !this.checkOut) return 0;
    const diff = new Date(this.checkOut).getTime() - new Date(this.checkIn).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  totalPrice(): number {
    const l = this.listing();
    if (!l) return 0;
    return this.nights() * l.pricePerNight;
  }

  getPropertyTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      APARTMENT: 'Appartement entier',
      HOUSE: 'Maison entière',
      STUDIO: 'Studio entier',
      VILLA: 'Villa entière',
      LOFT: 'Loft entier',
      ROOM: 'Chambre privée',
    };
    return labels[type] || type;
  }

  book() {
    const l = this.listing();
    if (!l || !this.checkIn || !this.checkOut) {
      this.bookingError.set('Veuillez remplir les dates d\'arrivée et de départ.');
      return;
    }
    if (this.checkOut <= this.checkIn) {
      this.bookingError.set('La date de départ doit être après la date d\'arrivée.');
      return;
    }
    if (this.dateConflict()) {
      this.bookingError.set('Ces dates chevauchent une réservation existante.');
      return;
    }

    this.booking.set(true);
    this.bookingError.set('');
    this.bookingSuccess.set(false);

    this.bookingService
      .create({
        listingId: l.id,
        ownerId: l.ownerId,
        checkInDate: this.checkIn,
        checkOutDate: this.checkOut,
        guestsCount: this.guests,
        totalPrice: this.totalPrice(),
        message: this.message || undefined,
      })
      .subscribe({
        next: () => {
          this.booking.set(false);
          this.bookingSuccess.set(true);
          setTimeout(() => this.router.navigate(['/my-bookings']), 2000);
        },
        error: (err) => {
          this.booking.set(false);
          const detail = err.error?.detail || err.error?.message || '';
          if (detail.includes('overlap')) {
            this.bookingError.set('Ces dates sont déjà réservées. Choisissez d\'autres dates.');
          } else {
            this.bookingError.set(detail || 'Erreur lors de la réservation.');
          }
        },
      });
  }

  onOwnerAvatarError() {
    this.ownerAvatarFailed.set(true);
    const o = this.owner();
    if (o) {
      this.owner.set({ ...o, avatarUrl: undefined });
    }
  }

  contactOwner() {
    const l = this.listing();
    if (!l) return;
    this.contactingOwner.set(true);
    this.messageService.createOrGetConversation({
      listingId: l.id,
      recipientId: l.ownerId,
    }).subscribe({
      next: (conv) => {
        this.contactingOwner.set(false);
        this.router.navigate(['/conversation', conv.id]);
      },
      error: () => {
        this.contactingOwner.set(false);
        this.bookingError.set('Impossible de démarrer la conversation.');
      },
    });
  }
}
