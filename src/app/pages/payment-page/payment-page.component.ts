import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-payment-page',
  templateUrl: './payment-page.component.html',
  styleUrl: './payment-page.component.scss'
})
export class PaymentPageComponent implements OnInit {
  isProcessing: boolean = false;
  orderId: number = 0;
  orderType: 'event' | 'service' = 'event';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private location: Location
  ) {
    this.orderId = 100000 + Math.floor(Math.random() * 900000);
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['type']) {
        this.orderType = params['type'];
      }
    });
  }

  goBack() {
    this.location.back();
  }

  payNow() {
    this.isProcessing = true;
    setTimeout(() => {
      // 1. Place Order
      const customerDetails = this.bookingService.getCustomerDetails();
      this.bookingService.placeOrder(this.orderType, customerDetails);

      // 2. Clear respective cart
      if (this.orderType === 'event') {
        this.bookingService.clearEventBooking();
      } else {
        this.bookingService.clearServiceCart();
      }

      this.isProcessing = false;
      this.router.navigate(['/thanks-order']);
    }, 2000);
  }
}
