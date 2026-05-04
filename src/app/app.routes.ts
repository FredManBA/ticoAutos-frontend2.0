import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { VerifyEmailComponent } from './features/auth/verify-email/verify-email.component';
import { GoogleCallbackComponent } from './features/auth/google-callback/google-callback.component';
import { VehicleListComponent } from './features/vehicles/vehicle-list/vehicle-list.component';
import { VehicleDetailComponent } from './features/vehicles/vehicle-detail/vehicle-detail.component';
import { MyVehiclesComponent } from './features/vehicles/my-vehicles/my-vehicles.component';
import { PublishVehicleComponent } from './features/vehicles/publish-vehicle/publish-vehicle.component';
import { EditVehicleComponent } from './features/vehicles/edit-vehicle/edit-vehicle.component';
import { authGuard } from './core/guards/auth.guard';


/** 
 * Routes of the application, defining the navigation paths and associated components.
 * The 'my-vehicles' route is protected by AuthGuard, ensuring only authenticated users can access it.
 * The wildcard route '**' redirects any unknown paths to the vehicle listing page.
 */
export const routes: Routes = [
  { path: 'my-vehicles/:id/edit', component: EditVehicleComponent, canActivate: [authGuard] },
  { path: 'my-vehicles/new', component: PublishVehicleComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/vehicles', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'auth/google/callback', component: GoogleCallbackComponent },
  { path: 'vehicles', component: VehicleListComponent },
  { path: 'vehicles/:id', component: VehicleDetailComponent },
  { path: 'my-vehicles', component: MyVehiclesComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/vehicles' }
];
