import { Component } from '@angular/core';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-thanks-order',
  templateUrl: './thanks-order.component.html',
  styleUrl: './thanks-order.component.scss'
})
export class ThanksOrderComponent {
  bookingData: any;

  constructor(private bookingService: BookingService) {
    this.bookingData = this.bookingService.getEventBooking();
  }
}
