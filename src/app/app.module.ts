import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

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
import { MenuSelectionComponent } from './pages/menu-selection/menu-selection.component';
import { ServiceTypeComponent } from './pages/service-type/service-type.component';
import { ChefSelectionComponent } from './pages/chef-selection/chef-selection.component';
import { VendorSelectionComponent } from './pages/vendor-selection/vendor-selection.component';
import { EventsListComponent } from './pages/events-list/events-list.component';
import { ServicesListComponent } from './pages/services-list/services-list.component';
import { CartComponent } from './pages/cart/cart.component';
import { LoginComponent } from './pages/login/login.component';
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
    ReviewsComponent,
    MenuSelectionComponent,
    ServiceTypeComponent,
    ChefSelectionComponent,
    VendorSelectionComponent,
    EventsListComponent,
    ServicesListComponent,
    CartComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

