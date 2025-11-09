import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Components
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './pages/home/home.component';
import { EventDetailsComponent } from './pages/event-details/event-details.component';
import { ServiceDetailsComponent } from './pages/service-details/service-details.component';
import { CheckoutpageComponent } from './pages/checkoutpage/checkoutpage.component';
import { PaymentPageComponent } from './pages/payment-page/payment-page.component';
import { ThanksOrderComponent } from './pages/thanks-order/thanks-order.component';
import { OrderHistoryComponent } from './pages/order-history/order-history.component';
import { ReviewsComponent } from './pages/reviews/reviews.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    EventDetailsComponent,
    ServiceDetailsComponent,
    CheckoutpageComponent,
    PaymentPageComponent,
    ThanksOrderComponent,
    OrderHistoryComponent,
    ReviewsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
