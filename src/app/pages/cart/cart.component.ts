import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  eventBooking: any;
  serviceCart: any[] = [];

  constructor(
    private bookingService: BookingService,
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

  removeFromServiceCart(item: any) {
    this.bookingService.removeFromServiceCart(item);
    this.serviceCart = this.bookingService.getServiceCart();
  }

  addToServiceCart(item: any) {
    this.bookingService.addToServiceCart(item);
    this.serviceCart = this.bookingService.getServiceCart();
  }

  get serviceTotal() {
    return this.serviceCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  get eventTotal() {
    let total = 0;
    if (this.eventBooking.menuSelection) {
      total += this.eventBooking.menuSelection.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0);
    }
    return total;
  }

  get grandTotal() {
    return this.serviceTotal + this.eventTotal;
  }

  checkout() {
    this.router.navigate(['/checkout']);
  }
}
