import { Component, inject, OnInit, OnDestroy, signal, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ListingService } from '../../core/services/listing.service';
import { Listing } from '../../core/models/listing.model';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  imports: [ImageUrlPipe],
  template: `
    <div class="relative h-[calc(100vh-64px)]">
      <div id="map" class="w-full h-full z-0"></div>

      @if (loading()) {
        <div class="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
        </div>
      }

      @if (selectedListing()) {
        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-2xl transition"
             (click)="goToListing(selectedListing()!.id)">
          <div class="aspect-video bg-gray-200">
            @if (selectedListing()!.images && selectedListing()!.images.length > 0) {
              <img [src]="selectedListing()!.images[0].imageUrl | imageUrl" [alt]="selectedListing()!.title"
                   class="w-full h-full object-cover"/>
            }
          </div>
          <div class="p-3">
            <h3 class="font-medium text-gray-900 truncate">{{ selectedListing()!.title }}</h3>
            <p class="text-sm text-gray-500">{{ selectedListing()!.city }}, {{ selectedListing()!.country }}</p>
            <p class="text-sm mt-1">
              <span class="font-semibold">{{ selectedListing()!.pricePerNight }} &euro;</span>
              <span class="text-gray-500"> / nuit</span>
            </p>
          </div>
          <button (click)="closeCard($event)"
                  class="absolute top-2 right-2 w-6 h-6 bg-white/90 text-gray-600 rounded-full flex items-center justify-center text-xs hover:bg-white shadow">
            X
          </button>
        </div>
      }
    </div>
  `,
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  private listingService = inject(ListingService);
  private router = inject(Router);
  private imageUrlPipe = new ImageUrlPipe();

  loading = signal(true);
  selectedListing = signal<Listing | null>(null);
  private map: L.Map | null = null;
  private listings: Listing[] = [];

  ngOnInit() {
    this.listingService.search().subscribe({
      next: (data) => {
        this.listings = data.filter((l) => l.latitude && l.longitude);
        this.loading.set(false);
        this.addMarkers();
      },
      error: () => this.loading.set(false),
    });
  }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private initMap() {
    this.map = L.map('map', {
      center: [46.8, 2.5],
      zoom: 6,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);
  }

  private addMarkers() {
    if (!this.map) return;

    const priceIcon = (price: number) => {
      const label = `${price} €`;
      const width = label.length * 8 + 20;
      return L.divIcon({
        className: 'custom-marker',
        html: `<div style="white-space:nowrap;padding:4px 10px;background:white;border:2px solid #f43f5e;border-radius:9999px;box-shadow:0 2px 6px rgba(0,0,0,0.15);font-size:12px;font-weight:700;color:#e11d48;text-align:center;">${label}</div>`,
        iconSize: [width, 28],
        iconAnchor: [width / 2, 14],
      });
    };

    for (const listing of this.listings) {
      const marker = L.marker([listing.latitude!, listing.longitude!], {
        icon: priceIcon(listing.pricePerNight),
      }).addTo(this.map!);

      marker.on('click', () => {
        this.selectedListing.set(listing);
      });
    }

    if (this.listings.length > 0) {
      const bounds = L.latLngBounds(
        this.listings.map((l) => [l.latitude!, l.longitude!] as L.LatLngTuple),
      );
      this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }

  goToListing(id: string) {
    this.router.navigate(['/listing', id]);
  }

  closeCard(event: Event) {
    event.stopPropagation();
    this.selectedListing.set(null);
  }
}
