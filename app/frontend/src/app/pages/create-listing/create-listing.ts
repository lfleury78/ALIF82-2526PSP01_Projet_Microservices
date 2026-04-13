import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ListingService } from '../../core/services/listing.service';
import { GeocodingService } from '../../core/services/geocoding.service';
import { ListingCreateRequest, PropertyType } from '../../core/models/listing.model';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-create-listing',
  imports: [FormsModule, ImageUrlPipe],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-8">Mettre en location un logement</h1>

      <form (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 class="text-lg font-semibold text-gray-900">Informations générales</h2>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Titre de l'annonce <span class="text-rose-500">*</span></label>
            <input type="text" [(ngModel)]="form.title" name="title" maxlength="100"
                   [class]="inputClass(!form.title?.trim())"
                   placeholder="Bel appartement au coeur de Paris"/>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description <span class="text-rose-500">*</span></label>
            <textarea [(ngModel)]="form.description" name="description" rows="4"
                      [class]="inputClass(!form.description?.trim())"
                      placeholder="Décrivez votre logement..."></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Type de logement <span class="text-rose-500">*</span></label>
              <select [(ngModel)]="form.propertyType" name="propertyType"
                      class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-rose-500 focus:border-rose-500">
                <option value="APARTMENT">Appartement</option>
                <option value="HOUSE">Maison</option>
                <option value="STUDIO">Studio</option>
                <option value="VILLA">Villa</option>
                <option value="LOFT">Loft</option>
                <option value="ROOM">Chambre</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Prix par nuit (&euro;) <span class="text-rose-500">*</span></label>
              <input type="number" [(ngModel)]="form.pricePerNight" name="pricePerNight" min="1"
                     [class]="inputClass(form.pricePerNight < 1)"/>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Voyageurs max <span class="text-rose-500">*</span></label>
              <input type="number" [(ngModel)]="form.maxGuests" name="maxGuests" min="1"
                     [class]="inputClass(form.maxGuests < 1)"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Chambres <span class="text-rose-500">*</span></label>
              <input type="number" [(ngModel)]="form.bedrooms" name="bedrooms" min="0"
                     class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-rose-500 focus:border-rose-500"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Salles de bain <span class="text-rose-500">*</span></label>
              <input type="number" [(ngModel)]="form.bathrooms" name="bathrooms" min="0"
                     class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-rose-500 focus:border-rose-500"/>
            </div>
          </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 class="text-lg font-semibold text-gray-900">Adresse</h2>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Adresse <span class="text-rose-500">*</span></label>
            <input type="text" [(ngModel)]="form.address" name="address"
                   [class]="inputClass(!form.address?.trim())"
                   placeholder="123 Rue de la Paix"/>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ville <span class="text-rose-500">*</span></label>
              <input type="text" [(ngModel)]="form.city" name="city"
                     [class]="inputClass(!form.city?.trim())"
                     (keypress)="blockDigits($event)"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Code postal <span class="text-rose-500">*</span></label>
              <input type="text" [(ngModel)]="form.zipCode" name="zipCode" maxlength="10"
                     [class]="inputClass(!form.zipCode?.trim())"
                     (keypress)="blockLetters($event)"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Pays <span class="text-rose-500">*</span></label>
              <input type="text" [(ngModel)]="form.country" name="country"
                     [class]="inputClass(!form.country?.trim())"
                     (keypress)="blockDigits($event)"/>
            </div>
          </div>

          <div class="flex items-center gap-3 mt-2">
            <button type="button" (click)="verifyAddress()" [disabled]="geocoding()"
                    class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
              @if (geocoding()) {
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-500"></div>
                Vérification...
              } @else {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Vérifier l'adresse
              }
            </button>
            @if (addressVerified()) {
              <span class="text-sm text-green-600 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Adresse vérifiée
              </span>
            }
            @if (addressError()) {
              <span class="text-sm text-red-500">{{ addressError() }}</span>
            }
          </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 class="text-lg font-semibold text-gray-900">Équipements</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            @for (amenity of availableAmenities; track amenity) {
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" [checked]="form.amenities.includes(amenity)"
                       (change)="toggleAmenity(amenity)"
                       class="w-4 h-4 text-rose-500 border-gray-300 rounded focus:ring-rose-500"/>
                <span class="text-sm text-gray-700">{{ amenity }}</span>
              </label>
            }
          </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-xl p-6 space-y-4"
             [class.border-red-400]="submitted() && form.images.length === 0">
          <h2 class="text-lg font-semibold text-gray-900">Photos <span class="text-rose-500">*</span></h2>
          <p class="text-sm text-gray-500">Ajoutez des photos depuis votre PC ou collez des URLs</p>

          <div class="flex gap-3">
            <button type="button" (click)="imageInput.click()" [disabled]="uploadingImage()"
                    class="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-rose-400 hover:text-rose-500 transition">
              @if (uploadingImage()) {
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-500"></div>
                Upload...
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                Choisir des photos
              }
            </button>
            <button type="button" (click)="addImage()"
                    class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
              + Ajouter une URL
            </button>
            <input #imageInput type="file" accept="image/png,image/jpeg,image/webp" multiple class="hidden"
                   (change)="onImagesSelected($event)"/>
          </div>

          @if (form.images.length > 0) {
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              @for (img of form.images; track $index) {
                <div class="relative group">
                  @if (img.imageUrl && !img.imageUrl.startsWith('pending:')) {
                    <img [src]="img.imageUrl | imageUrl" class="w-full aspect-square object-cover rounded-lg border border-gray-200"/>
                  } @else {
                    <div class="w-full aspect-square bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                      <input type="url" [(ngModel)]="img.imageUrl" [name]="'img_' + $index" placeholder="https://..."
                             class="w-full h-full px-3 text-xs text-center border-0 bg-transparent focus:ring-0"/>
                    </div>
                  }
                  @if ($index === 0) {
                    <span class="absolute top-1 left-1 px-2 py-0.5 bg-rose-500 text-white text-xs rounded-full">Principale</span>
                  }
                  <button type="button" (click)="removeImage($index)"
                          class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs">
                    X
                  </button>
                </div>
              }
            </div>
          }
          @if (submitted() && form.images.length === 0) {
            <p class="text-sm text-red-500">Au moins une photo est requise.</p>
          }
        </div>

        @if (error()) {
          <p class="text-sm text-red-500">{{ error() }}</p>
        }

        <button type="submit" [disabled]="submitting()"
                class="w-full py-3 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 transition disabled:opacity-50">
          @if (submitting()) {
            Publication en cours...
          } @else {
            Publier l'annonce
          }
        </button>
      </form>
    </div>
  `,
})
export class CreateListingComponent {
  private listingService = inject(ListingService);
  private geocodingService = inject(GeocodingService);
  private http = inject(HttpClient);
  private router = inject(Router);

  submitting = signal(false);
  uploadingImage = signal(false);
  geocoding = signal(false);
  addressVerified = signal(false);
  addressError = signal('');
  error = signal('');
  submitted = signal(false);

  form: ListingCreateRequest = {
    title: '',
    description: '',
    propertyType: 'APARTMENT',
    address: '',
    city: '',
    zipCode: '',
    country: 'France',
    pricePerNight: 50,
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    amenities: [],
    images: [],
  };

  availableAmenities = [
    'WiFi', 'Climatisation', 'Chauffage', 'Cuisine', 'Lave-linge',
    'Sèche-linge', 'Parking', 'Piscine', 'Jacuzzi', 'TV',
    'Fer à repasser', 'Espace de travail',
  ];

  inputClass(isInvalid: boolean): string {
    const base = 'w-full rounded-lg px-4 py-2 focus:ring-rose-500 focus:border-rose-500 border';
    if (this.submitted() && isInvalid) return base + ' border-red-400 bg-red-50';
    return base + ' border-gray-300';
  }

  blockDigits(event: KeyboardEvent) {
    if (/\d/.test(event.key)) event.preventDefault();
  }

  blockLetters(event: KeyboardEvent) {
    if (/[a-zA-ZÀ-ÿ]/.test(event.key)) event.preventDefault();
  }

  verifyAddress() {
    if (!this.form.address?.trim() || !this.form.city?.trim() || !this.form.country?.trim()) {
      this.addressError.set('Remplissez l\'adresse, la ville et le pays.');
      return;
    }
    this.geocoding.set(true);
    this.addressError.set('');
    this.addressVerified.set(false);
    this.geocodingService.geocode(this.form.address, this.form.city, this.form.zipCode, this.form.country).subscribe({
      next: (result) => {
        this.geocoding.set(false);
        if (result) {
          this.form.latitude = result.latitude;
          this.form.longitude = result.longitude;
          this.addressVerified.set(true);
        } else {
          this.addressError.set('Adresse introuvable. Vérifiez les informations saisies.');
        }
      },
      error: () => {
        this.geocoding.set(false);
        this.addressError.set('Erreur lors de la vérification.');
      },
    });
  }

  toggleAmenity(amenity: string) {
    const idx = this.form.amenities.indexOf(amenity);
    if (idx >= 0) {
      this.form.amenities.splice(idx, 1);
    } else {
      this.form.amenities.push(amenity);
    }
  }

  onImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.uploadingImage.set(true);
    const files = Array.from(input.files);
    let uploaded = 0;
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      this.http.post<{ url: string }>(`${environment.apiUrl}/listings/upload`, formData).subscribe({
        next: (res) => {
          this.form.images.push({
            imageUrl: res.url,
            primary: this.form.images.length === 0,
            sortOrder: this.form.images.length,
          });
          uploaded++;
          if (uploaded === files.length) this.uploadingImage.set(false);
        },
        error: () => {
          uploaded++;
          if (uploaded === files.length) this.uploadingImage.set(false);
          this.error.set('Erreur lors de l\'upload d\'une image.');
        },
      });
    }
    input.value = '';
  }

  addImage() {
    this.form.images.push({ imageUrl: '', primary: this.form.images.length === 0, sortOrder: this.form.images.length });
  }

  removeImage(index: number) {
    this.form.images.splice(index, 1);
    this.form.images.forEach((img, i) => { img.sortOrder = i; img.primary = i === 0; });
  }

  onSubmit() {
    this.submitted.set(true);
    this.error.set('');

    if (!this.form.title?.trim() || !this.form.description?.trim() || !this.form.city?.trim()
        || !this.form.address?.trim() || !this.form.zipCode?.trim() || !this.form.country?.trim()) {
      this.error.set('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (this.form.pricePerNight < 1) {
      this.error.set('Le prix par nuit doit être supérieur à 0.');
      return;
    }
    if (this.form.maxGuests < 1) {
      this.error.set('Le nombre de voyageurs doit être supérieur à 0.');
      return;
    }

    const validImages = this.form.images.filter((img) => img.imageUrl.trim() !== '');
    if (validImages.length === 0) {
      this.error.set('Veuillez ajouter au moins une photo.');
      return;
    }

    this.submitting.set(true);

    const doCreate = () => {
      const payload = {
        ...this.form,
        images: this.form.images.filter((img) => img.imageUrl.trim() !== ''),
      };
      this.listingService.create(payload).subscribe({
        next: (listing) => {
          this.submitting.set(false);
          this.router.navigate(['/listing', listing.id]);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err.error?.detail || 'Erreur lors de la création.');
        },
      });
    };

    if (!this.form.latitude || !this.form.longitude) {
      this.geocodingService.geocode(this.form.address, this.form.city, this.form.zipCode, this.form.country).subscribe({
        next: (result) => {
          if (result) {
            this.form.latitude = result.latitude;
            this.form.longitude = result.longitude;
            this.addressVerified.set(true);
          } else {
            this.error.set('Adresse introuvable. Vérifiez les informations saisies.');
            this.submitting.set(false);
            return;
          }
          doCreate();
        },
        error: () => {
          doCreate();
        },
      });
    } else {
      doCreate();
    }
  }
}
