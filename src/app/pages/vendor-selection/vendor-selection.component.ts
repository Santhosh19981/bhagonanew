import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { ApiService } from '../../services/api.service';
import { ResponsiveService } from '../../services/responsive.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vendor-selection',
  templateUrl: './vendor-selection.component.html',
  styleUrl: './vendor-selection.component.scss'
})
export class VendorSelectionComponent implements OnInit, OnDestroy {
  primaryVendor: any = null;
  serviceId: string | null = null;
  selectedService: any = null;
  isLoading: boolean = false;
  vendorTitle: string = 'Catering';
  isMobile: boolean = false;
  /** True when arriving from the event wizard's "Continue with Catering" (no serviceId in the URL). */
  isCateringFlow: boolean = false;
  private sub = new Subscription();

  vendors: any[] = [];

  ngOnInit() {
    this.sub.add(
      this.responsiveService.isMobile$.subscribe((isMobile: boolean) => this.isMobile = isMobile)
    );

    this.sub.add(
      this.route.queryParams.subscribe(params => {
        const serviceId = params['serviceId'];
        if (serviceId) {
          this.isCateringFlow = false;
          this.loadForService(String(serviceId));
        } else {
          // Event flow: show only catering vendors. The catering service id differs
          // per environment (e.g. QA vs prod), so resolve it by name instead of hardcoding.
          this.isCateringFlow = true;
          this.vendorTitle = 'Catering';
          this.resolveCateringService();
        }
      })
    );
  }

  private loadForService(serviceId: string) {
    this.serviceId = serviceId;
    this.fetchServiceDetails(serviceId);
    this.fetchVendors(serviceId);

    // Keep the previously selected vendor only if it belongs to this service
    const eventData = this.bookingService.getEventBooking();
    this.primaryVendor =
      eventData.selectedVendor && eventData.selectedVendor.serviceId === serviceId
        ? eventData.selectedVendor
        : null;
  }

  private resolveCateringService() {
    this.isLoading = true;
    this.vendors = [];
    this.primaryVendor = null;
    this.apiService.getServices().subscribe({
      next: (res: any) => {
        const services: any[] = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        const catering = services.find(s => /cater/i.test(s?.name || ''));
        if (catering) {
          this.loadForService(String(catering.service_id ?? catering.id));
        } else {
          this.isLoading = false;
          console.warn('Catering service not found in services list');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error resolving catering service:', err);
      }
    });
  }

  fetchServiceDetails(id: string) {
    // Loader is driven by fetchVendors; this call only fills the page context.
    this.apiService.getServiceItemsById(id).subscribe({
      next: (res: any) => {
        if (res.status === 'success' || res.status === true) {
          this.selectedService = res.data;
          if (this.selectedService) {
            this.selectedService.image_data = this.apiService.getImageUrl(this.selectedService.display_url || this.selectedService.image_data);
          }
          if (!this.isCateringFlow && this.selectedService?.name) {
            this.updateVendorTitle(this.selectedService.name);
          }
        }
      },
      error: (err) => {
        console.error('Error fetching service details:', err);
      }
    });
  }

  /** Menu item ids the customer picked on the menu page (catering flow only). */
  private get selectedMenuIds(): number[] {
    if (!this.isCateringFlow) return [];
    const menu = this.bookingService.getEventBooking().menuSelection || [];
    return [...new Set(menu.map((m: any) => Number(m.menu_item_id || m.id)).filter((n: number) => Number.isInteger(n) && n > 0))] as number[];
  }

  get selectedMenuCount(): number {
    return this.selectedMenuIds.length;
  }

  /** Guests entered on the event page (catering flow only). */
  get guestCount(): number {
    if (!this.isCateringFlow) return 0;
    return Math.max(Number(this.bookingService.getEventBooking().totalMembers) || 0, 0);
  }

  /**
   * "Add N more guests to unlock an offer": sends the customer back to the event details page
   * to change the veg / non-veg counts themselves. Nothing is added automatically; the page
   * shows how many guests unlock the offer and returns here once they save.
   */
  addGuestsForOffer(guests: number, event?: Event) {
    event?.stopPropagation();
    const n = Math.floor(Number(guests) || 0);
    const eventId = this.bookingService.getEventBooking().eventId;
    if (n <= 0 || !eventId) return;
    this.router.navigate(['/event-details', eventId], {
      queryParams: { returnTo: 'vendor-selection', addGuests: n }
    });
  }

  fetchVendors(serviceId: string) {
    this.isLoading = true;
    this.apiService.getVendorsByServiceId(serviceId, this.selectedMenuIds, this.guestCount).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.status === true) {
          this.vendors = (res.data || []).map((v: any) => {
            const pricing = v.menu_pricing || null;
            return {
              ...v,
              serviceId: serviceId, // Maintain compatibility
              image: this.apiService.getImageUrl(v.display_url || v.image || null),
              menuPricing: pricing,
              // Whole-order price for this vendor: subtotal, discount applied, upcoming offers
              summary: v.pricing_summary || null,
              // Price for the customer's selected menu at this vendor's rates (per guest)
              pricePerPlate: pricing ? pricing.per_plate_total : null,
              // A vendor who doesn't offer every selected dish can't take this order
              offersFullMenu: !pricing || (pricing.missing || []).length === 0,
              cuisine: v.cookingstyle || 'Multicuisine',
              level: v.level || 'Premium',
              rating: v.rating || '4.5'
            };
          });
          if (this.selectedMenuIds.length) {
            // Vendors who can serve the whole menu first, cheapest first
            // Vendors who can serve the whole menu first, then lowest final total (after discount)
            const cost = (v: any) => v.summary ? v.summary.total_after_discount : (v.pricePerPlate ?? 0) * Math.max(this.guestCount, 1);
            this.vendors.sort((a, b) =>
              (Number(b.offersFullMenu) - Number(a.offersFullMenu)) || (cost(a) - cost(b)));
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching vendors:', err);
      }
    });
  }

  updateVendorTitle(serviceName: string) {
    const name = serviceName.toLowerCase();
    if (name.includes('poultry')) {
      this.vendorTitle = 'Poultry';
    } else if (name.includes('kirana') || name.includes('grocery')) {
      this.vendorTitle = 'Grocery';
    } else if (name.includes('tent')) {
      this.vendorTitle = 'Tenthouse';
    } else if (name.includes('hall') || name.includes('venue')) {
      this.vendorTitle = 'Hall';
    } else {
      this.vendorTitle = 'Catering';
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  constructor(
    private bookingService: BookingService,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private responsiveService: ResponsiveService
  ) { }

  goBack() {
    this.location.back();
  }

  selectVendor(vendor: any) {
    if (this.isCateringFlow && vendor.offersFullMenu === false) return; // can't serve the chosen menu
    this.primaryVendor = vendor;
    this.proceed();
  }

  isVendorSelected(vendor: any) {
    return this.primaryVendor === vendor;
  }

  proceed() {
    if (!this.primaryVendor) return;

    if (this.isCateringFlow) {
      // Catering: the menu was chosen first, so re-price it at this vendor's rates and go to the cart.
      const booking = this.bookingService.getEventBooking();
      const menu = booking.menuSelection || [];
      if (!menu.length) {
        this.bookingService.updateEventBooking({ selectedVendor: this.primaryVendor });
        this.router.navigate(['/menu-selection']);
        return;
      }
      const priceById = new Map<number, number>(
        (this.primaryVendor.menuPricing?.items || []).map((i: any) => [Number(i.menu_item_id), Number(i.price)])
      );
      const repriced = menu.map((m: any) => {
        const id = Number(m.menu_item_id || m.id);
        const base = m.base_price !== undefined ? Number(m.base_price) : Number(m.price);
        return { ...m, base_price: base, price: priceById.has(id) ? priceById.get(id) : base };
      });
      this.bookingService.updateEventBooking({ selectedVendor: this.primaryVendor, menuSelection: repriced });
      this.router.navigate(['/cart']);
      return;
    }

    this.bookingService.updateEventBooking({ selectedVendor: this.primaryVendor });
    if (this.serviceId) {
      this.router.navigate(['/service-details', this.serviceId], { queryParams: { flow: 'service' } });
    } else {
      this.router.navigate(['/cart']);
    }
  }
}
