import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { VehicleListComponent } from './features/vehicles/vehicle-list/vehicle-list.component';
import { VehicleDetailComponent } from './features/vehicles/vehicle-detail/vehicle-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: '/vehicles', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'vehicles', component: VehicleListComponent },
  { path: 'vehicles/:id', component: VehicleDetailComponent },
  { path: '**', redirectTo: '/vehicles' }
];