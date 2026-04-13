import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ListingService } from '../../core/services/listing.service';
import { Listing, ListingSearchCriteria, PropertyType } from '../../core/models/listing.model';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';

@Component({
  selector: 'app-home',
  imports: [FormsModule, RouterLink, ImageUrlPipe],
  template: `
    <div class="bg-gradient-to-r from-rose-500 to-pink-600 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">Trouvez votre prochain logement</h1>
        <p class="text-lg text-rose-100 mb-8">Explorez des milliers de logements partout en France</p>

        <div class="max-w-4xl mx-auto bg-white rounded-2xl md:rounded-full shadow-xl p-4 md:p-2">
          <div class="flex flex-col md:flex-row items-center gap-3 md:gap-2">
            <div class="flex-1 w-full">
              <input type="text" [(ngModel)]="searchCity" placeholder="Où allez-vous ?"
                     class="w-full px-5 py-3 rounded-xl md:rounded-full text-gray-700 focus:outline-none text-sm border border-gray-200 md:border-0"
                     (keyup.enter)="onSearch()"/>
            </div>
            <div class="w-full md:w-40">
              <select [(ngModel)]="searchType" class="w-full px-4 py-3 rounded-xl md:rounded-full text-gray-700 focus:outline-none text-sm bg-gray-50 border border-gray-200 md:border-0">
                <option value="">Tous types</option>
                <option value="APARTMENT">Appartement</option>
                <option value="HOUSE">Maison</option>
                <option value="STUDIO">Studio</option>
                <option value="VILLA">Villa</option>
                <option value="LOFT">Loft</option>
                <option value="ROOM">Chambre</option>
              </select>
            </div>
            <div class="w-full md:w-32">
              <input type="number" [(ngModel)]="searchGuests" placeholder="Voyageurs" min="1"
                     class="w-full px-4 py-3 rounded-xl md:rounded-full text-gray-700 focus:outline-none text-sm bg-gray-50 border border-gray-200 md:border-0"/>
            </div>
            <div class="w-full md:w-auto flex gap-2">
              <button (click)="onSearch()"
                      class="flex-1 md:flex-none px-8 py-3 bg-rose-500 text-white rounded-xl md:rounded-full hover:bg-rose-600 transition font-medium text-sm flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                Rechercher
              </button>
              @if (hasActiveFilters()) {
                <button (click)="resetSearch()"
                        class="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl md:rounded-full hover:bg-gray-200 transition text-sm flex items-center justify-center"
                        title="Réinitialiser">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        @for (type of propertyTypes; track type.value) {
          <button (click)="filterByType(type.value)"
                  [class]="selectedType === type.value
                    ? 'flex flex-col items-center min-w-[80px] px-4 py-3 border-b-2 border-rose-500 text-rose-500'
                    : 'flex flex-col items-center min-w-[80px] px-4 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'">
            <span class="text-2xl mb-1">{{ type.icon }}</span>
            <span class="text-xs font-medium whitespace-nowrap">{{ type.label }}</span>
          </button>
        }
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      @if (loading()) {
        <div class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
        </div>
      } @else if (listings().length === 0) {
        <div class="text-center py-20">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-1">Aucun logement trouvé</h3>
          <p class="text-gray-500">Essayez de modifier vos critères de recherche</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          @for (listing of listings(); track listing.id) {
            <a [routerLink]="['/listing', listing.id]" class="group cursor-pointer">
              <div class="aspect-square rounded-xl overflow-hidden bg-gray-200 mb-3">
                @if (listing.images && listing.images.length > 0) {
                  <img [src]="listing.images[0].imageUrl | imageUrl" [alt]="listing.title"
                       class="w-full h-full object-cover group-hover:scale-105 transition duration-300"/>
                } @else {
                  <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4"/>
                    </svg>
                  </div>
                }
              </div>
              <div>
                <div class="flex justify-between items-start">
                  <h3 class="font-medium text-gray-900 truncate">{{ listing.city }}, {{ listing.country }}</h3>
                </div>
                <p class="text-sm text-gray-500 truncate">{{ listing.title }}</p>
                <p class="text-sm text-gray-500">{{ listing.maxGuests }} voyageurs · {{ listing.bedrooms }} ch. · {{ listing.bathrooms }} sdb.</p>
                <p class="mt-1">
                  <span class="font-semibold">{{ listing.pricePerNight }} &euro;</span>
                  <span class="text-gray-500"> / nuit</span>
                </p>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
})
export class HomeComponent implements OnInit {
  private listingService = inject(ListingService);

  listings = signal<Listing[]>([]);
  loading = signal(true);

  searchCity = '';
  searchType = '';
  searchGuests: number | null = null;
  selectedType = '';

  propertyTypes = [
    { value: '', icon: '🏠', label: 'Tous' },
    { value: 'APARTMENT', icon: '🏢', label: 'Appartement' },
    { value: 'HOUSE', icon: '🏡', label: 'Maison' },
    { value: 'STUDIO', icon: '🏨', label: 'Studio' },
    { value: 'VILLA', icon: '🏖️', label: 'Villa' },
    { value: 'LOFT', icon: '🏗️', label: 'Loft' },
    { value: 'ROOM', icon: '🛏️', label: 'Chambre' },
  ];

  ngOnInit() {
    this.loadListings();
  }

  onSearch() {
    this.selectedType = this.searchType;
    this.loadListings();
  }

  filterByType(type: string) {
    this.selectedType = type;
    this.searchType = type;
    this.loadListings();
  }

  hasActiveFilters(): boolean {
    return !!this.searchCity || !!this.searchType || !!this.searchGuests;
  }

  resetSearch() {
    this.searchCity = '';
    this.searchType = '';
    this.searchGuests = null;
    this.selectedType = '';
    this.loadListings();
  }

  private loadListings() {
    this.loading.set(true);
    const criteria: ListingSearchCriteria = {};
    if (this.searchCity) criteria.city = this.searchCity;
    if (this.selectedType) criteria.propertyType = this.selectedType as PropertyType;
    if (this.searchGuests) criteria.maxGuests = this.searchGuests;

    this.listingService.search(criteria).subscribe({
      next: (data) => {
        this.listings.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.listings.set([]);
        this.loading.set(false);
      },
    });
  }
}
