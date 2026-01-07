import { Routes } from '@angular/router';
import { CarListComponent } from './components/car/car-list/car-list.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'car' },
  { path: 'car', component: CarListComponent },
  { path: '**', redirectTo: 'car' }
];
