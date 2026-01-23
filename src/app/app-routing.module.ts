import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { EventDetailsComponent } from './pages/event-details/event-details.component';
import { ServiceDetailsComponent } from './pages/service-details/service-details.component';
import { CheckoutpageComponent } from './pages/checkoutpage/checkoutpage.component';
import { PaymentPageComponent } from './pages/payment-page/payment-page.component';
import { ThanksOrderComponent } from './pages/thanks-order/thanks-order.component';
import { OrderHistoryComponent } from './pages/order-history/order-history.component';
import { ReviewsComponent } from './pages/reviews/reviews.component';
import { MenuSelectionComponent } from './pages/menu-selection/menu-selection.component';
import { ServiceTypeComponent } from './pages/service-type/service-type.component';
import { ChefSelectionComponent } from './pages/chef-selection/chef-selection.component';
import { VendorSelectionComponent } from './pages/vendor-selection/vendor-selection.component';
import { EventsListComponent } from './pages/events-list/events-list.component';
import { ServicesListComponent } from './pages/services-list/services-list.component';
import { CartComponent } from './pages/cart/cart.component';

import { LoginComponent } from './pages/login/login.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'event-details/:id', component: EventDetailsComponent },
  { path: 'event-details', component: EventDetailsComponent },
  { path: 'service-details/:id', component: ServiceDetailsComponent },
  { path: 'service-details', component: ServiceDetailsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutpageComponent },
  { path: 'payment', component: PaymentPageComponent },
  { path: 'thanks-order', component: ThanksOrderComponent },
  { path: 'order-history', component: OrderHistoryComponent },
  { path: 'reviews', component: ReviewsComponent },
  { path: 'menu-selection', component: MenuSelectionComponent },
  { path: 'service-type', component: ServiceTypeComponent },
  { path: 'chef-selection', component: ChefSelectionComponent },
  { path: 'vendor-selection', component: VendorSelectionComponent },
  { path: 'events', component: EventsListComponent },
  { path: 'services', component: ServicesListComponent },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
