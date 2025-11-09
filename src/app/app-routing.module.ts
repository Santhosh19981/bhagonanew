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

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'event-details', component: EventDetailsComponent },
  { path: 'service-details', component: ServiceDetailsComponent },
  { path: 'checkout', component: CheckoutpageComponent },
  { path: 'payment', component: PaymentPageComponent },
  { path: 'thanks-order', component: ThanksOrderComponent },
  { path: 'order-history', component: OrderHistoryComponent },
  { path: 'reviews', component: ReviewsComponent },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
