import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-service-details',
  templateUrl: './service-details.component.html',
  styleUrl: './service-details.component.scss'
})
export class ServiceDetailsComponent implements OnInit {
  cart: any[] = [];
  bookingData: any;
  serviceId: string = '';
  filteredItems: any[] = [];
  selectedService: any;
  isLoading: boolean = true;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private apiService: ApiService,
    private location: Location
  ) { }

  ngOnInit() {
    this.bookingData = this.bookingService.getEventBooking();
    this.cart = this.bookingService.getServiceCart();

    this.route.params.subscribe((params: any) => {
      this.serviceId = params['id'];
      if (this.serviceId) {
        this.fetchServiceDetails(this.serviceId);
      }
    });
  }

  fetchServiceDetails(id: string) {
    this.isLoading = true;
    this.apiService.getServiceItemsById(id).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.status === 'success') {
          this.selectedService = res.data;
          this.filteredItems = res.data.items || [];
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching service details:', err);
      }
    });
  }

  getFormattedTitle(id: string): string {
    if (!id) return 'Services';
    return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  goBack() {
    this.location.back();
  }

  addToCart(item: any) {
    const itemId = item.service_item_id || item.id;
    const existing = this.cart.find(i => (i.service_item_id || i.id) === itemId);
    if (existing) {
      existing.quantity++;
      if (!existing.parent_service_name) {
        existing.parent_service_name = this.selectedService.name;
      }
    } else {
      this.cart.push({
        ...item,
        quantity: 1,
        parent_service_name: this.selectedService.name
      });
    }
    this.bookingService.updateServiceCart(this.cart);
  }

  removeFromCart(item: any) {
    const itemId = item.service_item_id || item.id;
    const index = this.cart.findIndex(i => (i.service_item_id || i.id) === itemId);
    if (index > -1) {
      if (this.cart[index].quantity > 1) {
        this.cart[index].quantity--;
      } else {
        this.cart.splice(index, 1);
      }
    }
    this.bookingService.updateServiceCart(this.cart);
  }

  getQuantity(itemId: any): number {
    const item = this.cart.find(i => (i.service_item_id || i.id) === itemId);
    return item ? item.quantity : 0;
  }

  get currentServiceCart() {
    return this.cart.filter(cartItem =>
      this.filteredItems.some(serviceItem =>
        (serviceItem.service_item_id || serviceItem.id) === (cartItem.service_item_id || cartItem.id)
      )
    );
  }

  get totalItems() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  get totalValue() {
    return this.currentServiceCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  proceed() {
    this.bookingService.updateServiceCart(this.cart);
    this.router.navigate(['/cart']);
  }
}
