import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { ResponsiveService } from '../../services/responsive.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-checkoutpage',
  templateUrl: './checkoutpage.component.html',
  styleUrl: './checkoutpage.component.scss'
})
export class CheckoutpageComponent implements OnInit, OnDestroy {
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
  isMobile: boolean = false;
  /** Volume discount for the current tab: { applied, discount_amount, rule } */
  discount: any = null;
  private sub = new Subscription();

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private location: Location,
    private responsiveService: ResponsiveService
  ) { }

  ngOnInit() {
    this.sub.add(
      this.responsiveService.isMobile$.subscribe((isMobile: boolean) => this.isMobile = isMobile)
    );

    this.eventBooking = this.bookingService.getEventBooking();
    this.serviceCart = this.bookingService.getServiceCart();
    this.customerDetails = this.bookingService.getCustomerDetails();

    // Default to service tab if no event is booked or event has no selected items
    if (this.serviceCart.length > 0 && (!this.eventBooking.eventId || !this.eventBooking.menuSelection || this.eventBooking.menuSelection.length === 0)) {
      this.activeTab = 'service';
    }

    this.prepareGroupedServices();
    this.loadDiscount();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
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
    this.loadDiscount();
  }

  goBack() {
    this.location.back();
  }

  get eventTotal() {
    if (!this.eventBooking?.menuSelection) return 0;
    // Plate price x guests, matching what the payment page charges
    const guests = Number(this.eventBooking.totalMembers) || 1;
    return this.eventBooking.menuSelection.reduce((sum: number, item: any) => sum + (Number(item.price) || 0) * guests, 0);
  }

  get serviceTotal() {
    return this.serviceCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  get currentSubtotal() {
    return this.activeTab === 'event' ? this.eventTotal : this.serviceTotal;
  }

  /** Discount on the current tab's subtotal, capped at the subtotal. */
  get discountAmount(): number {
    const amount = this.discount?.applied ? Number(this.discount.discount_amount) || 0 : 0;
    return Math.min(Math.max(amount, 0), this.currentSubtotal);
  }

  get discountLabel(): string {
    const r = this.discount?.rule;
    if (!r) return '';
    const val = r.discount_type === 'percentage' ? `${r.discount_value}% off` : `₹${Number(r.discount_value).toLocaleString('en-IN')} off`;
    const cond = r.rule_type === 'guest_count' ? `${r.min_value}+ guests` : `bill ₹${Number(r.min_value).toLocaleString('en-IN')}+`;
    return `${val} · ${cond}`;
  }

  /**
   * Amount that fees and GST are charged on: the current tab's subtotal after the discount.
   * Matches the payment page, so the total shown here is what the customer pays.
   */
  get totalValue() {
    return Math.max(this.currentSubtotal - this.discountAmount, 0);
  }

  /** Same lookup the payment page does, so both pages show the same discount. */
  private loadDiscount() {
    const tab = this.activeTab;
    const booking = this.eventBooking || {};
    const vendorId = tab === 'event' && booking.serviceType === 'chef'
      ? booking.selectedChefs?.[0]?.user_id || null
      : booking.selectedVendor?.user_id || null;
    const guests = tab === 'event' ? Number(booking.totalMembers) || 0 : 0;
    this.discount = null;
    if (this.currentSubtotal <= 0) return;
    this.apiService.getApplicableDiscount(vendorId, guests, this.currentSubtotal).subscribe({
      next: (res: any) => { if (this.activeTab === tab) this.discount = res?.status ? res.data : null; },
      error: () => { if (this.activeTab === tab) this.discount = null; }
    });
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
