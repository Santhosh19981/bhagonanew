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
  private sub = new Subscription();

  vendors: any[] = [];

  ngOnInit() {
    this.sub.add(
      this.responsiveService.isMobile$.subscribe((isMobile: boolean) => this.isMobile = isMobile)
    );

    this.route.queryParams.subscribe(params => {
      this.serviceId = params['serviceId'];
      if (this.serviceId) {
        this.fetchServiceDetails(this.serviceId);
        this.fetchVendors(this.serviceId);

        // Check if the previously selected vendor matches the current service
        const eventData = this.bookingService.getEventBooking();
        if (eventData.selectedVendor && eventData.selectedVendor.serviceId === this.serviceId) {
          this.primaryVendor = eventData.selectedVendor;
        } else {
          this.primaryVendor = null; // Clear if service doesn't match
        }
      } else {
        this.fetchVendors('1'); // Default to catering if no serviceId
        this.vendorTitle = 'Catering';
        this.primaryVendor = null;
      }
    });
  }

  fetchServiceDetails(id: string) {
    this.isLoading = true;
    this.apiService.getServiceItemsById(id).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.status === 'success' || res.status === true) {
          this.selectedService = res.data;
          if (this.selectedService) {
            this.selectedService.image_data = this.apiService.getImageUrl(this.selectedService.display_url || this.selectedService.image_data);
          }
          this.updateVendorTitle(this.selectedService.name);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching service details:', err);
      }
    });
  }

  fetchVendors(serviceId: string) {
    this.isLoading = true;
    this.apiService.getVendorsByServiceId(serviceId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.status === true) {
          this.vendors = res.data.map((v: any) => ({
            ...v,
            serviceId: serviceId, // Maintain compatibility
            image: this.apiService.getImageUrl(v.display_url || v.image || null), 
            pricePerPlate: v.pricePerPlate || (Math.floor(Math.random() * 300) + 200), // Fallback price if missing
            cuisine: v.cookingstyle || 'Multicuisine',
            level: v.level || 'Premium',
            rating: v.rating || (4 + Math.random()).toFixed(1)
          }));
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
    this.primaryVendor = vendor;
    this.bookingService.updateEventBooking({
      selectedVendor: this.primaryVendor
    });
    
    if (this.serviceId) {
      this.router.navigate(['/service-details', this.serviceId], { queryParams: { flow: 'service' } });
    } else {
      this.router.navigate(['/cart']);
    }
  }

  isVendorSelected(vendor: any) {
    return this.primaryVendor === vendor;
  }

  proceed() {
    this.bookingService.updateEventBooking({
      selectedVendor: this.primaryVendor
    });
    if (this.serviceId) {
      this.router.navigate(['/service-details', this.serviceId], { queryParams: { flow: 'service' } });
    } else {
      this.router.navigate(['/cart']);
    }
  }
}
