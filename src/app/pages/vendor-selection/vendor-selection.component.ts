import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-vendor-selection',
  templateUrl: './vendor-selection.component.html',
  styleUrl: './vendor-selection.component.scss'
})
export class VendorSelectionComponent {
  primaryVendor: any = null;
  alternateVendors: any[] = [];

  vendors = [
    { id: 1, name: 'Royal Catering Services', cuisine: 'Multicuisine', pricePerPlate: 450, rating: 4.8, image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=500' },
    { id: 2, name: 'Heritage Flavors', cuisine: 'Traditional Indian', pricePerPlate: 350, rating: 4.9, image: 'https://images.unsplash.com/photo-1596797038558-48530368bb6e?w=500' },
    { id: 3, name: 'Spice Route Caterers', cuisine: 'North Indian & Continental', pricePerPlate: 550, rating: 4.7, image: 'https://images.unsplash.com/photo-1547928501-a26203991206?w=500' },
    { id: 4, name: 'Green Garden Buffet', cuisine: 'Pure Vegetarian', pricePerPlate: 300, rating: 5.0, image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=500' },
    { id: 5, name: 'Oceanic Delights', cuisine: 'Seafood Special', pricePerPlate: 650, rating: 4.6, image: 'https://images.unsplash.com/photo-1551218808-94e220e0310a?w=500' },
    { id: 6, name: 'Global Gourmet', cuisine: 'International Fusion', pricePerPlate: 800, rating: 4.9, image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4d7f1b?w=500' },
    { id: 7, name: 'The Kebab Station', cuisine: 'Middle Eastern', pricePerPlate: 400, rating: 4.7, image: 'https://images.unsplash.com/photo-1544124499-58d085955030?w=500' },
    { id: 8, name: 'Classic Banquets', cuisine: 'Standard Indian', pricePerPlate: 380, rating: 4.5, image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=500' }
  ];

  constructor(
    private bookingService: BookingService,
    private router: Router,
    private location: Location
  ) { }

  goBack() {
    this.location.back();
  }

  selectVendor(vendor: any) {
    if (this.primaryVendor === vendor) {
      this.primaryVendor = null;
    } else if (this.alternateVendors.includes(vendor)) {
      this.alternateVendors = this.alternateVendors.filter(v => v !== vendor);
    } else {
      if (!this.primaryVendor) {
        this.primaryVendor = vendor;
      } else if (this.alternateVendors.length < 2) {
        this.alternateVendors.push(vendor);
      }
    }
  }

  isVendorSelected(vendor: any) {
    return this.primaryVendor === vendor || this.alternateVendors.includes(vendor);
  }

  proceed() {
    this.bookingService.updateEventBooking({
      selectedVendor: this.primaryVendor
    });
    this.router.navigate(['/cart']);
  }
}
