import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.scss'
})
export class ReviewsComponent implements OnInit {
  ratings = {
    hygiene: 0,
    taste: 0,
    behavior: 0
  };
  comment: string = '';
  orderId: string | null = null;
  orderType: 'event' | 'service' = 'event';

  constructor(
    private router: Router,
    private bookingService: BookingService
  ) { }

  ngOnInit() {
    this.orderId = this.bookingService.getCurrentRatingOrder();
    if (this.orderId) {
      const orders = this.bookingService.getOrders();
      const order = orders.find((o: any) => o.id === this.orderId);
      if (order) {
        this.orderType = order.orderType;
      }
    } else {
      this.router.navigate(['/order-history']);
    }
  }

  get labels(): any {
    if (this.orderType === 'event') {
      return {
        cat1: { title: 'Hygiene', sub: 'Cleanliness & Setup' },
        cat2: { title: 'Food Taste', sub: 'Flavor & Presentation' },
        cat3: { title: 'Service', sub: 'Chef & Staff Behavior' }
      };
    } else {
      return {
        cat1: { title: 'Quality', sub: 'Standards' },
        cat2: { title: 'Timely Delivery', sub: 'Prompt & Reliable' },
        cat3: null
      };
    }
  }

  setRating(category: 'hygiene' | 'taste' | 'behavior', value: number) {
    (this.ratings as any)[category] = value;
  }

  isFormValid(): boolean {
    const hasCat1 = !!this.ratings.hygiene;
    const hasCat2 = !!this.ratings.taste;
    const hasCat3 = this.labels.cat3 ? !!this.ratings.behavior : true;
    return hasCat1 && hasCat2 && hasCat3;
  }

  submit() {
    if (this.orderId && this.isFormValid()) {
      this.bookingService.updateOrderRating(this.orderId, {
        ...this.ratings,
        comment: this.comment,
        date: new Date().toISOString().split('T')[0]
      });
      this.bookingService.setCurrentRatingOrder(null);
      this.router.navigate(['/order-history']);
    }
  }
}
