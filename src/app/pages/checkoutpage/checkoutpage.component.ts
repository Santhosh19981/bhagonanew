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
  groupedServices: any[] = [];
  activeTab: any = 'event';
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
    this.customerDetails = this.bookingService.getCustomerDetails();

    // Default to service tab if no event is booked
    if (!this.eventBooking.eventId && this.serviceCart.length > 0) {
      this.activeTab = 'service';
    }

    this.prepareGroupedServices();
  }

  private prepareGroupedServices() {
    const groups: { [key: string]: any[] } = {};
    this.serviceCart.forEach(item => {
      const groupName = item.parent_service_name || item.service_name || item.category || 'Other Services';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(item);
    });
    this.groupedServices = Object.keys(groups).map(name => ({
      name,
      items: groups[name]
    }));
  }

  setTab(tab: 'event' | 'service') {
    this.activeTab = tab;
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

  get currentSubtotal() {
    return this.activeTab === 'event' ? this.eventTotal : this.serviceTotal;
  }

  get totalValue() {
    // Total reflects only the currently selected tab (Event or Service)
    return this.activeTab === 'event' ? this.eventTotal : this.serviceTotal;
  }

  confirmOrder() {
    // 1. Mandatory Form Validation
    if (!this.isFormValid()) {
      this.formError = 'Please fill in all mandatory fields correctly.';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. Auth Check
    if (!this.authService.isLoggedIn()) {
      // Save details to service before redirecting
      this.bookingService.saveCustomerDetails(this.customerDetails);
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    // 3. Save details and redirect to payment
    this.bookingService.saveCustomerDetails(this.customerDetails);
    this.router.navigate(['/payment'], { queryParams: { type: this.activeTab } });
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
