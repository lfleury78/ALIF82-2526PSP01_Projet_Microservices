import { Routes } from '@angular/router';
import { Locations } from './pages/locations/locations';
import { Location } from './pages/location/location';
import { Reservations } from './pages/reservations/reservations';
import { MakeReservation } from './pages/make-reservation/make-reservation';
import { MyLocations } from './pages/my-locations/my-locations';
import { Messages } from './pages/messages/messages';

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
    path: 'my-locations',
    component: MyLocations,
  },
  {
    path: 'reservations',
    component: Reservations,
  },
  {
    path: 'messages',
    component: Messages,
  },
];
