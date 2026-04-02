import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-partner-orders',
  template: `
    <div class="partner-dashboard p-6 min-h-screen bg-slate-50">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-black text-slate-800 mb-2">Partner Dashboard</h1>
        <p class="text-slate-500 mb-8 font-medium">Manage your incoming service requests</p>

        <div *ngIf="isLoading" class="flex justify-center p-12">
          <div class="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div *ngIf="!isLoading && orders.length === 0" class="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
          <i class="bi bi-inbox text-5xl text-slate-200 mb-4 inline-block"></i>
          <h3 class="text-xl font-bold text-slate-800">No pending requests</h3>
          <p class="text-slate-400 mt-1">You're all caught up!</p>
        </div>

        <div class="space-y-4">
          <div *ngFor="let order of orders" class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-3">
                  <span class="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-[10px] font-black rounded uppercase border border-yellow-100 italic">New Request</span>
                  <span class="text-xs font-bold text-slate-400 font-mono">#{{order.booking_id}}</span>
                </div>
                <h3 class="text-xl font-bold text-slate-800 mb-1">Event on {{order.event_date | date:'fullDate'}}</h3>
                <div class="flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                  <span class="flex items-center gap-1"><i class="bi bi-people"></i> {{order.total_members}} Guests</span>
                  <span class="flex items-center gap-1"><i class="bi bi-chat-left-text"></i> {{order.booking_type}}</span>
                </div>
              </div>

              <div class="flex gap-2">
                <button (click)="respond(order.booking_id, 'accepted')" 
                        class="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">
                  Accept Order
                </button>
                <button (click)="respond(order.booking_id, 'rejected')" 
                        class="px-6 py-3 bg-white text-rose-600 border-2 border-rose-100 rounded-2xl font-bold text-sm hover:bg-rose-50 transition-all">
                  Pass
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .partner-dashboard { font-family: 'Inter', sans-serif; }
  `]
})
export class PartnerOrdersComponent implements OnInit {
  orders: any[] = [];
  isLoading: boolean = false;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    const user = this.authService.currentUserValue;
    if (user) {
      this.isLoading = true;
      this.bookingService.getPartnerOrders(user.id, user.role).subscribe({
        next: (data) => {
          this.orders = data;
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    }
  }

  respond(bookingId: number, status: 'accepted' | 'rejected') {
    const user = this.authService.currentUserValue;
    if (user) {
      this.bookingService.respondToBooking(bookingId, user.id, user.role, status).subscribe({
        next: () => {
          alert(status === 'accepted' ? 'Order accepted! Check your schedule.' : 'Order passed to next available provider.');
          this.loadOrders();
        }
      });
    }
  }
}
