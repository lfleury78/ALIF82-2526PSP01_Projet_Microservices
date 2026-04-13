import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'map',
    loadComponent: () => import('./pages/map/map').then((m) => m.MapComponent),
  },
  {
    path: 'listing/:id',
    loadComponent: () =>
      import('./pages/listing-detail/listing-detail').then((m) => m.ListingDetailComponent),
  },
  {
    path: 'my-bookings',
    loadComponent: () =>
      import('./pages/my-bookings/my-bookings').then((m) => m.MyBookingsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'create-listing',
    loadComponent: () =>
      import('./pages/create-listing/create-listing').then((m) => m.CreateListingComponent),
    canActivate: [authGuard],
  },
  {
    path: 'my-listings',
    loadComponent: () =>
      import('./pages/my-listings/my-listings').then((m) => m.MyListingsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'edit-listing/:id',
    loadComponent: () =>
      import('./pages/edit-listing/edit-listing').then((m) => m.EditListingComponent),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'conversations',
    loadComponent: () =>
      import('./pages/conversations/conversations').then((m) => m.ConversationsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'conversation/:id',
    loadComponent: () =>
      import('./pages/conversation/conversation').then((m) => m.ConversationComponent),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
