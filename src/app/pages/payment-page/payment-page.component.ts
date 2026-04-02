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
    const customerDetails = this.bookingService.getCustomerDetails();
    
    this.bookingService.placeOrder(this.orderType, customerDetails).subscribe({
      next: (res) => {
        this.isProcessing = false;
        if (res.success) {
          this.router.navigate(['/thanks-order'], { queryParams: { id: res.booking_id } });
        } else {
          alert('Failed to place order: ' + (res.error || 'Unknown error'));
        }
      },
      error: (err) => {
        this.isProcessing = false;
        console.error('Payment Error:', err);
        alert('An error occurred while processing your payment. Please try again.');
      }
    });
  }
}
