import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.scss'
})
export class OrderHistoryComponent implements OnInit {
  activeTab: 'upcoming' | 'processing' | 'completed' = 'upcoming';
  orders: any[] = [];
  expandedOrderId: string | null = null;
  activeOrder: any = null;

  constructor(
    private bookingService: BookingService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orders = this.bookingService.getOrders();
  }

  get filteredOrders() {
    return this.orders.filter(o => o.status === this.activeTab);
  }

  toggleOrder(orderId: string) {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

  markStart(order: any) {
    this.bookingService.updateOrderStatus(order.id, 'processing');
    this.loadOrders();
  }

  markCompleted(order: any) {
    this.bookingService.updateOrderStatus(order.id, 'completed');
    this.loadOrders();
  }

  trackByOrderId(index: number, order: any) {
    return order.id;
  }

  rateExperience(order: any) {
    this.bookingService.setCurrentRatingOrder(order.id);
    this.router.navigate(['/reviews']);
  }
}
