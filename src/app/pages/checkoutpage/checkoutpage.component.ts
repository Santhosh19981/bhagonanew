import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-checkoutpage',
  templateUrl: './checkoutpage.component.html',
  styleUrl: './checkoutpage.component.scss'
})
export class CheckoutpageComponent implements OnInit {
  eventBooking: any;
  serviceCart: any[] = [];
  customerDetails = {
    name: '',
    mobile: '',
    email: '',
    address: ''
  };
  formError: string = '';

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit() {
    this.eventBooking = this.bookingService.getEventBooking();
    this.serviceCart = this.bookingService.getServiceCart();
  }

  goBack() {
    this.location.back();
  }

  get eventTotal() {
    if (!this.eventBooking?.menuSelection) return 0;
    return this.eventBooking.menuSelection.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0);
  }

  get serviceTotal() {
    return this.serviceCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  get totalValue() {
    return this.eventTotal + this.serviceTotal;
  }

  confirmOrder() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    if (!this.isFormValid()) {
      this.formError = 'Please fill in all mandatory fields correctly.';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.router.navigate(['/payment']);
  }

  isFormValid(): boolean {
    const { name, mobile, email, address } = this.customerDetails;
    return !!(name && mobile && mobile.length === 10 && /^\d+$/.test(mobile) && email && email.includes('@') && address);
  }

  onMobileInput(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9]/g, '');
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    this.customerDetails.mobile = value;
    input.value = value;
  }
}
