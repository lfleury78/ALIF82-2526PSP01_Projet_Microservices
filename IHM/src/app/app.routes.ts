import { Routes } from '@angular/router';
import { Locations } from './pages/locations/locations';
import { Location } from './pages/location/location';
import { Reservations } from './pages/reservations/reservations';
import { MakeReservation } from './pages/make-reservation/make-reservation';

export const routes: Routes = [
  {
    path: '',
    component: Locations,
  },
  {
    path: 'location',
    component: Location,
  },
  {
    path: 'make-reservation',
    component: MakeReservation,
  },
  {
    path: 'reservations',
    component: Reservations,
  }
];
