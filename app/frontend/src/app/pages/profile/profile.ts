import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, ImageUrlPipe],
  template: `
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-8">Mon profil</h1>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500"></div>
        </div>
      } @else if (user(); as u) {
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <div class="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
            <div class="relative group">
              <div class="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center overflow-hidden">
                @if (form.avatarUrl) {
                  <img [src]="form.avatarUrl | imageUrl" alt="Avatar" class="w-full h-full object-cover"/>
                } @else {
                  <span class="text-white text-2xl font-bold">
                    {{ form.firstName.charAt(0) || '?' }}{{ form.lastName.charAt(0) || '' }}
                  </span>
                }
              </div>
              <button type="button" (click)="avatarInput.click()"
                      class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </button>
              <input #avatarInput type="file" accept="image/png,image/jpeg,image/webp" class="hidden"
                     (change)="onAvatarSelected($event)"/>
            </div>
            @if (uploadingAvatar()) {
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-rose-500"></div>
            }
            <div>
              <h2 class="text-xl font-semibold text-gray-900">{{ form.firstName }} {{ form.lastName }}</h2>
              <p class="text-gray-500">{{ u.email }}</p>
              <p class="text-xs text-gray-400 mt-1">Cliquez sur l'avatar pour le changer</p>
            </div>
          </div>

          <form (ngSubmit)="onSave()" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Prenom</label>
                <input type="text" [(ngModel)]="form.firstName" name="firstName"
                       class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-rose-500 focus:border-rose-500"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input type="text" [(ngModel)]="form.lastName" name="lastName"
                       class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-rose-500 focus:border-rose-500"/>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Telephone</label>
              <input type="tel" [(ngModel)]="form.phone" name="phone"
                     class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-rose-500 focus:border-rose-500"
                     placeholder="+33 6 12 34 56 78"/>
            </div>

            @if (success()) {
              <p class="text-sm text-green-600">Profil mis a jour avec succes !</p>
            }
            @if (error()) {
              <p class="text-sm text-red-500">{{ error() }}</p>
            }

            <button type="submit" [disabled]="saving()"
                    class="w-full py-3 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 transition disabled:opacity-50">
              @if (saving()) {
                Sauvegarde...
              } @else {
                Sauvegarder
              }
            </button>
          </form>
        </div>
      } @else {
        <div class="text-center py-12">
          <p class="text-gray-500">Impossible de charger votre profil</p>
        </div>
      }
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private auth = inject(AuthService);

  user = signal<User | null>(null);
  loading = signal(true);
  saving = signal(false);
  success = signal(false);
  error = signal('');

  uploadingAvatar = signal(false);
  form = { firstName: '', lastName: '', phone: '', avatarUrl: '' };

  ngOnInit() {
    this.userService.getMe().subscribe({
      next: (user) => {
        this.user.set(user);
        this.form.firstName = user.firstName || '';
        this.form.lastName = user.lastName || '';
        this.form.phone = user.phone || '';
        this.form.avatarUrl = user.avatarUrl || '';
        this.loading.set(false);
      },
      error: () => {
        const profile = this.auth.userProfile();
        if (profile) {
          this.userService
            .createMe({ email: profile.email, firstName: profile.firstName, lastName: profile.lastName })
            .subscribe({
              next: (user) => {
                this.user.set(user);
                this.form.firstName = user.firstName;
                this.form.lastName = user.lastName;
                this.loading.set(false);
              },
              error: () => this.loading.set(false),
            });
        } else {
          this.loading.set(false);
        }
      },
    });
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
      this.error.set('Le fichier ne doit pas depasser 5 Mo.');
      return;
    }
    this.uploadingAvatar.set(true);
    this.userService.uploadAvatar(file).subscribe({
      next: (res) => {
        this.form.avatarUrl = res.url;
        this.uploadingAvatar.set(false);
        this.onSave();
      },
      error: () => {
        this.uploadingAvatar.set(false);
        this.error.set('Erreur lors de l\'upload de l\'avatar.');
      },
    });
  }

  onSave() {
    const u = this.user();
    if (!u) return;

    this.saving.set(true);
    this.success.set(false);
    this.error.set('');

    this.userService.update(u.id, this.form).subscribe({
      next: (updated) => {
        this.user.set(updated);
        this.auth.updateDisplayProfile(updated.firstName, updated.lastName, updated.avatarUrl);
        this.saving.set(false);
        this.success.set(true);
        setTimeout(() => this.success.set(false), 3000);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.detail || 'Erreur lors de la sauvegarde.');
      },
    });
  }
}
