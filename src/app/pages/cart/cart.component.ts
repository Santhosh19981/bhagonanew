import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  eventBooking: any;
  serviceCart: any[] = [];
  groupedServiceCart: any[] = [];
  isMobile: boolean = false;

  /** Volume discount on the catering order: { applied, discount_amount, rule } */
  discount: any = null;
  /** Offers the customer can still unlock by adding guests (from vendor selection pricing). */
  upcomingOffers: any[] = [];

  constructor(
    private bookingService: BookingService,
    private apiService: ApiService,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit() {
    this.isMobile = window.innerWidth < 768;
    this.refreshCartData();
    this.loadPricing();
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  refreshCartData() {
    this.eventBooking = this.bookingService.getEventBooking();
    this.serviceCart = this.bookingService.getServiceCart();
    this.groupCartItems();
  }

  private groupCartItems() {
    const groups: { [key: string]: any[] } = {};
    this.serviceCart.forEach(item => {
      // Fallback logic for missing parent_service_name
      const groupName = item?.parent_service_name || item?.category || 'Standalone Services';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(item);
    });

    this.groupedServiceCart = Object.keys(groups).map(key => ({
      serviceName: key,
      items: groups[key]
    }));
  }

  // ---- Catering details ----

  get vendor(): any {
    return this.eventBooking?.selectedVendor || null;
  }

  get hasEventMenu(): boolean {
    return (this.eventBooking?.menuSelection || []).length > 0;
  }

  get guests(): number {
    return Math.max(Number(this.eventBooking?.totalMembers) || 0, 0);
  }

  get vegGuests(): number {
    return Number(this.eventBooking?.vegGuests) || 0;
  }

  get nonVegGuests(): number {
    return Number(this.eventBooking?.nonVegGuests) || 0;
  }

  /** Price of one plate: every selected dish once, at the chosen vendor's rates. */
  get pricePerPlate(): number {
    return (this.eventBooking?.menuSelection || []).reduce((sum: number, item: any) => sum + (Number(item.price) || 0), 0);
  }

  /** Food bill before discount: plate price x guests (matches what the payment page charges). */
  get eventTotal(): number {
    return this.pricePerPlate * (this.guests || 1);
  }

  get discountAmount(): number {
    const amount = this.discount?.applied ? Number(this.discount.discount_amount) || 0 : 0;
    return Math.min(Math.max(amount, 0), this.eventTotal);
  }

  get discountLabel(): string {
    const r = this.discount?.rule;
    if (!r) return '';
    if (r.value && r.cond) return `${r.value} on ${r.cond}`; // already-shaped summary rule
    const val = r.discount_type === 'percentage' ? `${r.discount_value}% off` : `₹${Number(r.discount_value).toLocaleString('en-IN')} off`;
    const cond = r.rule_type === 'guest_count' ? `${r.min_value}+ guests` : `bill ₹${Number(r.min_value).toLocaleString('en-IN')}+`;
    return `${val} · ${cond}`;
  }

  get serviceTotal() {
    return this.serviceCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  /** Amount fees and GST are charged on: everything after the discount (same as checkout/payment). */
  get taxableTotal() {
    return Math.max(this.serviceTotal + this.eventTotal - this.discountAmount, 0);
  }

  /** Platform service fee, 5%. */
  get serviceFee() {
    return this.taxableTotal * 0.05;
  }

  /** GST, 18%. */
  get gst() {
    return this.taxableTotal * 0.18;
  }

  get grandTotal() {
    return this.taxableTotal + this.serviceFee + this.gst;
  }

  /**
   * Use the pricing summary computed on vendor selection when it still matches this order;
   * otherwise ask the server for the discount on the current guest count and bill.
   */
  private loadPricing() {
    if (!this.hasEventMenu) return;
    const summary = this.vendor?.summary;
    if (summary && Number(summary.guests) === this.guests && Math.round(Number(summary.subtotal)) === Math.round(this.eventTotal)) {
      this.discount = summary;
      this.upcomingOffers = summary.upcoming || [];
      return;
    }
    this.apiService.getApplicableDiscount(this.vendor?.user_id || null, this.guests, this.eventTotal).subscribe({
      next: (res: any) => this.discount = res?.status ? res.data : null,
      error: () => this.discount = null
    });
  }

  /** Same as on vendor selection: change the guest count on the event page, then come back via partners. */
  addGuestsForOffer(guests: number) {
    const n = Math.floor(Number(guests) || 0);
    if (n <= 0 || !this.eventBooking?.eventId) return;
    this.router.navigate(['/event-details', this.eventBooking.eventId], {
      queryParams: { returnTo: 'vendor-selection', addGuests: n }
    });
  }

  goBack() {
    this.location.back();
  }

  removeFromServiceCart(item: any) {
    this.bookingService.removeFromServiceCart(item);
    this.refreshCartData();
  }

  addToServiceCart(item: any) {
    this.bookingService.addToServiceCart(item);
    this.refreshCartData();
  }

  deleteFromServiceCart(item: any) {
    this.bookingService.deleteFromServiceCart(item);
    this.refreshCartData();
  }

  checkout() {
    this.router.navigate(['/checkout']);
  }
}
