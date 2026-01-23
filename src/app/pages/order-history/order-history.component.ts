import { Component } from '@angular/core';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.scss'
})
export class OrderHistoryComponent {
  activeTab: 'upcoming' | 'processing' | 'completed' = 'upcoming';

  orders = [
    { id: '#BHG-92834', event: 'Marriage Ceremony', date: '2025-12-30', status: 'upcoming', amount: 45000, items: 3, chef: 'Chef Rajesh' },
    { id: '#BHG-91023', event: 'Birthday Party', date: '2025-12-25', status: 'processing', amount: 15000, items: 5, chef: 'Chef Priya' },
    { id: '#BHG-89234', event: 'Baby Shower', date: '2025-11-15', status: 'completed', amount: 22000, items: 4, chef: 'Chef Michael' }
  ];

  get filteredOrders() {
    return this.orders.filter(o => o.status === this.activeTab);
  }

  markStart(order: any) {
    order.status = 'processing';
  }
}
