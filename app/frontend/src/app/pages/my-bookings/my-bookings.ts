import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../core/services/booking.service';
import { ReviewService } from '../../core/services/review.service';
import { Booking } from '../../core/models/booking.model';
import { ReviewCreateRequest } from '../../core/models/review.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-my-bookings',
  imports: [RouterLink, DatePipe, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Mes réservations</h1>

      <div class="flex gap-4 border-b border-gray-200 mb-6">
        <button (click)="activeTab = 'sent'" [class]="activeTab === 'sent'
          ? 'pb-3 border-b-2 border-rose-500 text-rose-500 font-medium text-sm'
          : 'pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 text-sm'">
          Mes demandes
        </button>
        <button (click)="activeTab = 'received'; loadReceived()" [class]="activeTab === 'received'
          ? 'pb-3 border-b-2 border-rose-500 text-rose-500 font-medium text-sm'
          : 'pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 text-sm'">
          Demandes reçues
        </button>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500"></div>
        </div>
      } @else {
        @let bookings = activeTab === 'sent' ? myBookings() : receivedBookings();
        @if (bookings.length === 0) {
          <div class="text-center py-12">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p class="text-gray-500">Aucune réservation pour le moment</p>
          </div>
        } @else {
          <div class="space-y-4">
            @for (b of bookings; track b.id) {
              <div class="border border-gray-200 rounded-xl p-6 hover:shadow-md transition">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <span [class]="getStatusClass(b.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                        {{ getStatusLabel(b.status) }}
                      </span>
                      <a [routerLink]="['/listing', b.listingId]" class="text-sm text-rose-500 hover:underline">
                        Voir l'annonce
                      </a>
                    </div>
                    <p class="text-gray-900 font-medium">
                      {{ b.checkInDate | date:'d MMM yyyy':'':'fr' }} → {{ b.checkOutDate | date:'d MMM yyyy':'':'fr' }}
                    </p>
                    <p class="text-sm text-gray-500">{{ b.guestsCount }} voyageur(s) · {{ b.totalPrice }} &euro; total</p>
                    @if (b.message) {
                      <p class="text-sm text-gray-400 mt-1 italic">"{{ b.message }}"</p>
                    }
                  </div>
                  <div class="flex gap-2 items-center">
                    @if (confirmingAction()?.id === b.id) {
                      <div class="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                        <p class="text-sm text-gray-700">{{ confirmingAction()?.type === 'confirm' ? 'Confirmer cette réservation ?' : 'Annuler cette réservation ?' }}</p>
                        <button (click)="executeAction()"
                                [class]="confirmingAction()?.type === 'confirm'
                                  ? 'px-3 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 transition font-medium'
                                  : 'px-3 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition font-medium'">
                          Oui
                        </button>
                        <button (click)="cancelAction()"
                                class="px-3 py-1 border border-gray-300 text-gray-600 rounded-lg text-xs hover:bg-gray-100 transition">
                          Non
                        </button>
                      </div>
                    } @else {
                      @if (activeTab === 'received' && b.status === 'PENDING') {
                        <button (click)="askConfirm(b.id)" class="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition">
                          Confirmer
                        </button>
                      }
                      @if (b.status === 'PENDING' || b.status === 'CONFIRMED') {
                        <button (click)="askCancel(b.id)" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition">
                          Annuler
                        </button>
                      }
                      @if (activeTab === 'sent' && b.status === 'COMPLETED') {
                        @if (reviewExistsMap().get(b.id)) {
                          <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Avis déjà laissé
                          </span>
                        } @else {
                          <button (click)="toggleReviewForm(b.id)"
                                  class="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 transition">
                            Laisser un avis
                          </button>
                        }
                      }
                    }
                  </div>
                </div>

                @if (activeReviewBookingId() === b.id) {
                  <div class="mt-4 border-t border-gray-200 pt-4">
                    <div class="space-y-3">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Note</label>
                        <div class="flex gap-1">
                          @for (star of [1, 2, 3, 4, 5]; track star) {
                            <button type="button" (click)="reviewRating.set(star)"
                                    class="text-2xl transition-colors"
                                    [class]="star <= reviewRating() ? 'text-yellow-500' : 'text-gray-300'">
                              &#9733;
                            </button>
                          }
                        </div>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
                        <textarea [(ngModel)]="reviewComment" rows="3"
                                  class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-rose-500 focus:border-rose-500"
                                  placeholder="Partagez votre experience..."></textarea>
                      </div>
                      @if (reviewError()) {
                        <p class="text-sm text-red-500">{{ reviewError() }}</p>
                      }
                      <div class="flex gap-2">
                        <button (click)="submitReview(b)" [disabled]="reviewSubmitting()"
                                class="px-4 py-2 bg-rose-500 text-white rounded-lg text-sm hover:bg-rose-600 transition disabled:opacity-50">
                          @if (reviewSubmitting()) {
                            Envoi...
                          } @else {
                            Envoyer l'avis
                          }
                        </button>
                        <button (click)="toggleReviewForm(null)"
                                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition">
                          Annuler
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
      }
    </div>
  `,
})
export class MyBookingsComponent implements OnInit {
  private bookingService = inject(BookingService);
  private reviewService = inject(ReviewService);

  myBookings = signal<Booking[]>([]);
  receivedBookings = signal<Booking[]>([]);
  loading = signal(true);
  activeTab: 'sent' | 'received' = 'sent';

  confirmingAction = signal<{ id: string; type: 'confirm' | 'cancel' } | null>(null);
  reviewExistsMap = signal<Map<string, boolean>>(new Map());
  activeReviewBookingId = signal<string | null>(null);
  reviewRating = signal(5);
  reviewComment = '';
  reviewSubmitting = signal(false);
  reviewError = signal('');

  ngOnInit() {
    this.bookingService.getMyBookings().subscribe({
      next: (data) => {
        this.myBookings.set(data);
        this.loading.set(false);
        this.checkReviewsForCompletedBookings(data);
      },
      error: () => this.loading.set(false),
    });
  }

  private checkReviewsForCompletedBookings(bookings: Booking[]) {
    const completed = bookings.filter((b) => b.status === 'COMPLETED');
    for (const booking of completed) {
      this.reviewService.existsByBooking(booking.id).subscribe({
        next: (exists) => {
          this.reviewExistsMap.update((map) => {
            const newMap = new Map(map);
            newMap.set(booking.id, exists);
            return newMap;
          });
        },
        error: () => {},
      });
    }
  }

  toggleReviewForm(bookingId: string | null) {
    if (this.activeReviewBookingId() === bookingId) {
      this.activeReviewBookingId.set(null);
    } else {
      this.activeReviewBookingId.set(bookingId);
      this.reviewRating.set(5);
      this.reviewComment = '';
      this.reviewError.set('');
    }
  }

  submitReview(booking: Booking) {
    if (this.reviewRating() < 1 || this.reviewRating() > 5) {
      this.reviewError.set('Veuillez choisir une note entre 1 et 5.');
      return;
    }
    if (!this.reviewComment.trim()) {
      this.reviewError.set('Veuillez écrire un commentaire.');
      return;
    }

    this.reviewSubmitting.set(true);
    this.reviewError.set('');

    const request: ReviewCreateRequest = {
      listingId: booking.listingId,
      bookingId: booking.id,
      rating: this.reviewRating(),
      comment: this.reviewComment.trim(),
    };

    this.reviewService.create(request).subscribe({
      next: () => {
        this.reviewSubmitting.set(false);
        this.activeReviewBookingId.set(null);
        this.reviewExistsMap.update((map) => {
          const newMap = new Map(map);
          newMap.set(booking.id, true);
          return newMap;
        });
      },
      error: (err) => {
        this.reviewSubmitting.set(false);
        this.reviewError.set(err.error?.detail || err.error?.message || 'Erreur lors de l\'envoi de l\'avis.');
      },
    });
  }

  loadReceived() {
    if (this.receivedBookings().length > 0) return;
    this.loading.set(true);
    this.bookingService.getReceivedBookings().subscribe({
      next: (data) => {
        this.receivedBookings.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  askConfirm(id: string) {
    this.confirmingAction.set({ id, type: 'confirm' });
  }

  askCancel(id: string) {
    this.confirmingAction.set({ id, type: 'cancel' });
  }

  cancelAction() {
    this.confirmingAction.set(null);
  }

  executeAction() {
    const action = this.confirmingAction();
    if (!action) return;
    this.confirmingAction.set(null);

    if (action.type === 'confirm') {
      this.bookingService.confirm(action.id).subscribe({
        next: (updated) => {
          this.receivedBookings.update((list) => list.map((b) => (b.id === action.id ? updated : b)));
        },
      });
    } else {
      this.bookingService.cancel(action.id).subscribe({
        next: (updated) => {
          this.myBookings.update((list) => list.map((b) => (b.id === action.id ? updated : b)));
          this.receivedBookings.update((list) => list.map((b) => (b.id === action.id ? updated : b)));
        },
      });
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmée',
      CANCELLED: 'Annulée',
      COMPLETED: 'Terminée',
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }
}
