import { Component, OnInit, OnDestroy } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { Router } from '@angular/router';
import { ResponsiveService } from '../../services/responsive.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.scss'
})
export class OrderHistoryComponent implements OnInit, OnDestroy {
  activeTab: string = 'upcoming'; // Matches backend status
  orders: any[] = [];
  expandedOrderId: number | null = null;
  activeOrder: any = null;
  isLoading: boolean = false;
  isMobile: boolean = false;
  private sub = new Subscription();

  constructor(
    private bookingService: BookingService,
    private router: Router,
    private responsiveService: ResponsiveService
  ) { }

  ngOnInit() {
    this.sub.add(
      this.responsiveService.isMobile$.subscribe(isMobile => {
        this.isMobile = isMobile;
      })
    );
    this.loadOrders();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
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

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.loadOrders(); // Re-fetch data whenever tab changes
  }

  get filteredOrders() {
    // Note: status from backend might be 'accepted', 'upcoming', 'processing', 'completed', 'cancelled', 'confirmed'
    if (this.activeTab === 'upcoming') {
      return this.orders.filter(o => o.status === 'accepted' || o.status === 'upcoming' || o.status === 'confirmed');
    }
    return this.orders.filter(o => o.status === this.activeTab);
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
    this.bookingService.updateOrderStatus(order.id, 'processing').subscribe(() => this.loadOrders());
  }

  markCompleted(order: any) {
    this.bookingService.updateOrderStatus(order.id, 'completed').subscribe(() => this.loadOrders());
  }

  trackByOrderId(index: number, order: any) {
    return order.id;
  }

  rateExperience(order: any) {
    this.bookingService.setCurrentRatingOrder(order.booking_id);
    this.router.navigate(['/reviews']);
  }

  getOrderIconInfo(order: any, index: number) {
    const infos = [
      { bg: 'bg-[#FFEADB]', icon: 'bi-restaurant', text: 'text-[#964F08]' },
      { bg: 'bg-[#F9E0D9]', icon: 'bi-cake2-fill', text: 'text-[#8c402b]' },
      { bg: 'bg-[#FFF2D4]', icon: 'bi-fire', text: 'text-[#a66a15]' },
      { bg: 'bg-[#FFE3D1]', icon: 'bi-egg-fried', text: 'text-[#964F08]' }
    ];
    return infos[index % 4];
  }

  getImageUrl(path: string | null): string {
    if (!path) return 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
    if (path.startsWith('data:') || path.startsWith('http')) return path;
    const baseUrl = 'http://localhost:3000';
    return path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
  }
}
