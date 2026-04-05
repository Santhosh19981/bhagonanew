import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-thanks-order',
  templateUrl: './thanks-order.component.html',
  styleUrl: './thanks-order.component.scss'
})
export class ThanksOrderComponent implements OnInit {
  bookingData: any;
  orderId: string = '';
  eventDate: string = '';

  constructor(private bookingService: BookingService, private route: ActivatedRoute) {
    this.bookingData = this.bookingService.getEventBooking();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.orderId = params['id'];
      }
      if (params['date']) {
        this.eventDate = params['date'];
      }
    });
  }
}
