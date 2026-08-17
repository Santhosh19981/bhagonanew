import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { ResponsiveService } from '../../services/responsive.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-service-type',
  templateUrl: './service-type.component.html',
  styleUrl: './service-type.component.scss'
})
export class ServiceTypeComponent implements OnInit, OnDestroy {
  isMobile: boolean = false;
  private sub = new Subscription();

  constructor(
    private bookingService: BookingService,
    private router: Router,
    private location: Location,
    private responsiveService: ResponsiveService
  ) { }

  ngOnInit() {
    this.sub.add(
      this.responsiveService.isMobile$.subscribe(isMobile => {
        this.isMobile = isMobile;
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

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
