import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ListingService } from '../../core/services/listing.service';
import { Listing } from '../../core/models/listing.model';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';

@Component({
  selector: 'app-my-listings',
  imports: [RouterLink, ImageUrlPipe],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Mes annonces</h1>
        <a routerLink="/create-listing"
           class="px-6 py-2 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 transition">
          + Nouvelle annonce
        </a>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500"></div>
        </div>
      } @else if (listings().length === 0) {
        <div class="text-center py-16">
          <svg class="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune annonce</h3>
          <p class="text-gray-500 mb-6">Commencez à mettre en location votre logement</p>
          <a routerLink="/create-listing"
             class="px-6 py-3 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 transition">
            Créer une annonce
          </a>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (listing of listings(); track listing.id) {
            <div class="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition">
              <div class="aspect-video bg-gray-200">
                @if (listing.images && listing.images.length > 0) {
                  <img [src]="listing.images[0].imageUrl | imageUrl" [alt]="listing.title" class="w-full h-full object-cover"/>
                } @else {
                  <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4"/>
                    </svg>
                  </div>
                }
              </div>
              <div class="p-4">
                <div class="flex justify-between items-start mb-2">
                  <h3 class="font-medium text-gray-900 truncate">{{ listing.title }}</h3>
                  <span [class]="listing.status === 'ACTIVE'
                    ? 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800'
                    : 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600'">
                    {{ listing.status === 'ACTIVE' ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <p class="text-sm text-gray-500">{{ listing.city }} · {{ listing.pricePerNight }} &euro;/nuit</p>
                @if (deletingId() === listing.id) {
                  <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p class="text-sm text-gray-700 mb-3">Supprimer cette annonce ? Cette action est irréversible.</p>
                    <div class="flex gap-2">
                      <button (click)="confirmDelete(listing.id)"
                              class="flex-1 px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium">
                        Confirmer
                      </button>
                      <button (click)="cancelDelete()"
                              class="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                        Annuler
                      </button>
                    </div>
                  </div>
                } @else {
                  <div class="flex gap-2 mt-4">
                    <a [routerLink]="['/listing', listing.id]"
                       class="flex-1 text-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                      Voir
                    </a>
                    <a [routerLink]="['/edit-listing', listing.id]"
                       class="flex-1 text-center px-3 py-2 text-sm border border-rose-300 text-rose-600 rounded-lg hover:bg-rose-50 transition">
                      Modifier
                    </a>
                    <button (click)="deleteListing(listing.id)"
                            class="px-3 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition">
                      Supprimer
                    </button>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class MyListingsComponent implements OnInit {
  private listingService = inject(ListingService);

  listings = signal<Listing[]>([]);
  loading = signal(true);
  deletingId = signal<string | null>(null);

  ngOnInit() {
    this.listingService.getMyListings().subscribe({
      next: (data) => {
        this.listings.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  deleteListing(id: string) {
    this.deletingId.set(id);
  }

  cancelDelete() {
    this.deletingId.set(null);
  }

  confirmDelete(id: string) {
    this.listingService.delete(id).subscribe({
      next: () => {
        this.listings.update((list) => list.filter((l) => l.id !== id));
        this.deletingId.set(null);
      },
    });
  }
}
