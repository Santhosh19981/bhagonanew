import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.scss'
})
export class OrderHistoryComponent implements OnInit {
  activeTab: string = 'accepted'; // Matches backend status
  orders: any[] = [];
  expandedOrderId: number | null = null;
  activeOrder: any = null;
  isLoading: boolean = false;

  constructor(
    private bookingService: BookingService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    this.bookingService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.isLoading = false;
      }
    });
  }

  get filteredOrders() {
    // Note: status from backend might be 'accepted', 'upcoming', 'processing', 'completed', 'cancelled'
    if (this.activeTab === 'upcoming') {
      return this.orders.filter(o => o.booking_status === 'accepted' || o.booking_status === 'upcoming');
    }
    return this.orders.filter(o => o.booking_status === this.activeTab);
  }

  toggleOrder(bookingId: number) {
    if (this.expandedOrderId === bookingId) {
      this.expandedOrderId = null;
      this.activeOrder = null;
    } else {
      this.expandedOrderId = bookingId;
      this.bookingService.getOrderDetail(bookingId).subscribe({
        next: (res) => {
          this.activeOrder = res;
        },
        error: (err) => {
          console.error('Error loading order details:', err);
        }
      });
    }
  }

  markStart(order: any) {
    this.bookingService.updateOrderStatus(order.order_id, 'processing').subscribe(() => this.loadOrders());
  }

  markCompleted(order: any) {
    this.bookingService.updateOrderStatus(order.order_id, 'completed').subscribe(() => this.loadOrders());
  }

  trackByOrderId(index: number, order: any) {
    return order.order_id;
  }

  rateExperience(order: any) {
    // Current logic: navigate to reviews page
    this.router.navigate(['/reviews'], { queryParams: { booking_id: order.booking_id } });
  }
}
