import { Component, inject, OnInit, signal, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MessageService } from '../../core/services/message.service';
import { BookingService } from '../../core/services/booking.service';
import { ReviewService } from '../../core/services/review.service';
import { UserService } from '../../core/services/user.service';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, ImageUrlPipe],
  template: `
    <nav class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <a routerLink="/" class="flex items-center gap-2">
            <svg class="w-8 h-8 text-rose-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            <span class="text-xl font-bold text-rose-500">HessBnb</span>
          </a>

          <div class="hidden md:flex items-center gap-1">
            <a routerLink="/" routerLinkActive="bg-gray-100 text-rose-500" [routerLinkActiveOptions]="{exact: true}"
               class="px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
              Explorer
            </a>
            <a routerLink="/map" routerLinkActive="bg-gray-100 text-rose-500"
               class="px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
              Carte
            </a>
            @if (auth.isLoggedIn()) {
              <a routerLink="/my-listings" routerLinkActive="bg-gray-100 text-rose-500"
                 class="px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
                Mes annonces
              </a>
              <a routerLink="/my-bookings" routerLinkActive="bg-gray-100 text-rose-500"
                 class="relative px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
                Mes réservations
                @if (bookingBadgeCount() > 0) {
                  <span class="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {{ bookingBadgeCount() > 9 ? '9+' : bookingBadgeCount() }}
                  </span>
                }
              </a>
              <a routerLink="/conversations" routerLinkActive="bg-gray-100 text-rose-500"
                 class="relative px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
                Messages
                @if (unreadCount() > 0) {
                  <span class="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {{ unreadCount() > 9 ? '9+' : unreadCount() }}
                  </span>
                }
              </a>
            }
          </div>

          <div class="flex items-center gap-3">
            @if (auth.isLoggedIn()) {
              <a routerLink="/create-listing"
                 class="hidden md:block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition">
                Mettre en location
              </a>
              <div class="relative" #menuContainer>
                <button (click)="toggleMenu()" class="flex items-center gap-2 border border-gray-300 rounded-full px-3 py-2 hover:shadow-md transition">
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                  <div class="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center overflow-hidden">
                    @if (avatarUrl()) {
                      <img [src]="avatarUrl() | imageUrl" alt="Avatar" class="w-full h-full object-cover"/>
                    } @else {
                      <span class="text-white text-sm font-medium">{{ getInitials() }}</span>
                    }
                  </div>
                </button>

                @if (menuOpen) {
                  <div class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div class="px-4 py-2 border-b border-gray-100">
                      <p class="text-sm font-medium text-gray-900">{{ auth.getUserName() }}</p>
                    </div>
                    <a routerLink="/profile" (click)="menuOpen = false"
                       class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mon profil</a>
                    <a routerLink="/my-listings" (click)="menuOpen = false"
                       class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mes annonces</a>
                    <a routerLink="/my-bookings" (click)="menuOpen = false"
                       class="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Mes réservations
                      @if (bookingBadgeCount() > 0) {
                        <span class="w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {{ bookingBadgeCount() > 9 ? '9+' : bookingBadgeCount() }}
                        </span>
                      }
                    </a>
                    <a routerLink="/conversations" (click)="menuOpen = false"
                       class="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Messages
                      @if (unreadCount() > 0) {
                        <span class="w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {{ unreadCount() > 9 ? '9+' : unreadCount() }}
                        </span>
                      }
                    </a>
                    <div class="border-t border-gray-100 mt-1 pt-1">
                      <button (click)="auth.logout()" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Déconnexion
                      </button>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <button (click)="auth.login()" class="px-4 py-2 text-sm font-medium text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition">
                Connexion
              </button>
              <button (click)="auth.register()" class="px-4 py-2 text-sm font-medium text-rose-500 border border-rose-500 rounded-lg hover:bg-rose-50 transition">
                Inscription
              </button>
            }
          </div>
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent implements OnInit {
  auth = inject(AuthService);
  private messageService = inject(MessageService);
  private bookingService = inject(BookingService);
  private reviewService = inject(ReviewService);
  private userService = inject(UserService);
  menuOpen = false;
  @ViewChild('menuContainer') private menuContainer?: ElementRef;
  unreadCount = signal(0);
  bookingBadgeCount = signal(0);
  private pollInterval: ReturnType<typeof setInterval> | null = null;

  get avatarUrl() {
    return this.auth.avatarUrl;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.menuOpen && this.menuContainer && !this.menuContainer.nativeElement.contains(event.target)) {
      this.menuOpen = false;
    }
  }

  ngOnInit() {
    this.loadCounts();
    this.loadAvatar();
    this.pollInterval = setInterval(() => this.loadCounts(), 15000);
  }

  private loadAvatar() {
    if (!this.auth.isLoggedIn()) return;
    this.userService.getMe().subscribe({
      next: (user) => {
        this.auth.updateAvatarUrl(user.avatarUrl || null);
      },
      error: () => {},
    });
  }

  private loadCounts() {
    if (!this.auth.isLoggedIn()) return;
    this.messageService.getUnreadCount().subscribe({
      next: (count) => this.unreadCount.set(count),
      error: () => {},
    });
    forkJoin({
      received: this.bookingService.getReceivedBookings(),
      sent: this.bookingService.getMyBookings(),
    }).subscribe({
      next: ({ received, sent }) => {
        const pendingReceived = received.filter((b) => b.status === 'PENDING').length;
        const completedSent = sent.filter((b) => b.status === 'COMPLETED');
        if (completedSent.length === 0) {
          this.bookingBadgeCount.set(pendingReceived);
          return;
        }
        const checks = completedSent.map((b) => this.reviewService.existsByBooking(b.id));
        forkJoin(checks).subscribe({
          next: (results) => {
            const missingReviews = results.filter((exists) => !exists).length;
            this.bookingBadgeCount.set(pendingReceived + missingReviews);
          },
          error: () => this.bookingBadgeCount.set(pendingReceived),
        });
      },
      error: () => {},
    });
  }

  refreshAvatar() {
    this.loadAvatar();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  getInitials(): string {
    const name = this.auth.getUserName();
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.map((p) => p.charAt(0).toUpperCase()).join('').substring(0, 2);
  }
}
