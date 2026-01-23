import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-service-type',
  templateUrl: './service-type.component.html',
  styleUrl: './service-type.component.scss'
})
export class ServiceTypeComponent {
  constructor(
    private bookingService: BookingService,
    private router: Router,
    private location: Location
  ) { }

  goBack() {
    this.location.back();
  }

  selectService(type: 'chef' | 'catering') {
    this.bookingService.updateEventBooking({ serviceType: type });
    if (type === 'chef') {
      this.router.navigate(['/chef-selection']);
    } else {
      this.router.navigate(['/vendor-selection']);
    }
  }
}
