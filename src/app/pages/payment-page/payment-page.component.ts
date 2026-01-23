import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-payment-page',
  templateUrl: './payment-page.component.html',
  styleUrl: './payment-page.component.scss'
})
export class PaymentPageComponent {
  isProcessing: boolean = false;
  orderId: number = 0;

  constructor(
    private router: Router,
    private location: Location
  ) {
    this.orderId = 100000 + Math.floor(Math.random() * 900000);
  }

  goBack() {
    this.location.back();
  }

  payNow() {
    this.isProcessing = true;
    setTimeout(() => {
      this.isProcessing = false;
      this.router.navigate(['/thanks-order']);
    }, 2000);
  }
}
