import { Routes } from '@angular/router';
import { Locations } from './pages/locations/locations';
import { Location } from './pages/location/location';

export const routes: Routes = [
  {
    path: '',
    component: Locations,
  },
  {
    path: 'location',
    component: Location,
  }
];
