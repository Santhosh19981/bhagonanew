import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private eventBooking = {
    eventName: '',
    eventDate: '',
    totalMembers: 0,
    vegGuests: 0,
    nonVegGuests: 0,
    menuSelection: [] as any[],
    serviceType: '' as 'chef' | 'catering' | 'service_booking' | '',
    selectedChefs: [] as any[],
    selectedVendor: null as any,
    eventId: '',
    serviceId: ''
  };

  private serviceCart: any[] = [];
  private readonly STORAGE_KEY = 'bhagona_cart_data';
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();
  private readonly CUSTOMER_KEY = 'bhagona_customer_details';
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private authService: AuthService) {
    this.loadFromLocalStorage();
    this.updateCartCount();
  }

  private saveToLocalStorage() {
    const data = {
      eventBooking: this.eventBooking,
      serviceCart: this.serviceCart
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    this.updateCartCount();
  }

  private loadFromLocalStorage() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.eventBooking) this.eventBooking = data.eventBooking;
        if (data.serviceCart) this.serviceCart = data.serviceCart;
      } catch (e) {
        console.error('Error loading cart from localStorage', e);
      }
    }
  }

  updateEventBooking(data: Partial<typeof this.eventBooking>) {
    this.eventBooking = { ...this.eventBooking, ...data };
    this.saveToLocalStorage();
  }

  getEventBooking() {
    return this.eventBooking;
  }

  updateServiceCart(items: any[]) {
    this.serviceCart = items;
    this.saveToLocalStorage();
  }

  addToServiceCart(item: any) {
    const itemId = item.service_item_id || item.id;
    const existing = this.serviceCart.find((i: any) => (i.service_item_id || i.id) === itemId);
    if (existing) {
      existing.quantity++;
    } else {
      this.serviceCart.push({ ...item, quantity: 1 });
    }
    this.saveToLocalStorage();
  }

  removeFromServiceCart(item: any) {
    const itemId = item.service_item_id || item.id;
    const index = this.serviceCart.findIndex((i: any) => (i.service_item_id || i.id) === itemId);
    if (index > -1) {
      if (this.serviceCart[index].quantity > 1) {
        this.serviceCart[index].quantity--;
      } else {
        this.serviceCart.splice(index, 1);
      }
    }
    this.saveToLocalStorage();
  }

  deleteFromServiceCart(item: any) {
    const itemId = item.service_item_id || item.id;
    const index = this.serviceCart.findIndex((i: any) => (i.service_item_id || i.id) === itemId);
    if (index > -1) {
      this.serviceCart.splice(index, 1);
    }
    this.saveToLocalStorage();
  }

  getServiceCart() {
    return this.serviceCart;
  }

  clearAll() {
    this.clearEventBooking();
    this.clearServiceCart();
  }

  clearEventBooking() {
    this.eventBooking = {
      eventName: '',
      eventDate: '',
      totalMembers: 0,
      vegGuests: 0,
      nonVegGuests: 0,
      menuSelection: [],
      serviceType: '',
      selectedChefs: [],
      selectedVendor: null,
      eventId: '',
      serviceId: ''
    };
    this.saveToLocalStorage();
  }

  clearServiceCart() {
    this.serviceCart = [];
    this.saveToLocalStorage();
  }

  saveCustomerDetails(details: any) {
    localStorage.setItem(this.CUSTOMER_KEY, JSON.stringify(details));
  }

  getCustomerDetails() {
    const stored = localStorage.getItem(this.CUSTOMER_KEY);
    return stored ? JSON.parse(stored) : {
      name: '',
      mobile: '',
      email: '',
      address: ''
    };
  }

  placeOrder(orderType: 'event' | 'service', customerDetails: any): Observable<any> {
    const user = this.authService.currentUserValue;
    if (!user) return of({ error: 'User not logged in' });

    const bookingData = {
      customer_user_id: user.id,
      event_id: this.eventBooking.eventId || null,
      service_id: this.eventBooking.serviceId || null,
      event_date: this.eventBooking.eventDate || new Date().toISOString().split('T')[0],
      total_members: this.eventBooking.totalMembers || 0,
      veg_guests: this.eventBooking.vegGuests || 0,
      non_veg_guests: this.eventBooking.nonVegGuests || 0,
      booking_type: orderType === 'event' ? (this.eventBooking.serviceType === 'chef' ? 'chef_booking' : 'catering_booking') : 'service_booking',
      primary_chef_user_id: this.eventBooking.selectedChefs[0]?.user_id || null,
      alternate_chef1_user_id: this.eventBooking.selectedChefs[1]?.user_id || null,
      alternate_chef2_user_id: this.eventBooking.selectedChefs[2]?.user_id || null,
      primary_vendor_user_id: this.eventBooking.selectedVendor?.user_id || null,
      alternate_vendor1_user_id: null,
      alternate_vendor2_user_id: null
    };

    return this.http.post<any>(`${this.apiUrl}/bookings`, bookingData).pipe(
      switchMap(res => {
        const bookingId = res.booking_id;
        const items = orderType === 'event' ? this.eventBooking.menuSelection : this.serviceCart;
        const itemRequests = items.map(item => 
          this.http.post(`${this.apiUrl}/bookings/${bookingId}/menu-items`, {
            menu_item_id: item.menu_item_id || item.id,
            quantity: item.quantity || 1,
            price: item.price || 0
          })
        );
        return forkJoin(itemRequests).pipe(map(() => ({ success: true, booking_id: bookingId })));
      }),
      tap(() => this.clearAll())
    );
  }

  getOrders(): Observable<any[]> {
    const user = this.authService.currentUserValue;
    if (!user) return of([]);
    return this.http.get<any>(`${this.apiUrl}/orders/customer/${user.id}`).pipe(
      map(res => res.data || [])
    );
  }

  getOrderDetail(bookingId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/bookings/${bookingId}`);
  }

  updateOrderStatus(orderId: string | number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/orders/${orderId}/status`, { booking_status: status });
  }

  // --- PARTNER METHODS ---
  getPartnerOrders(userId: string | number, role: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/bookings/partner/${userId}?role=${role}`).pipe(
      map(res => res.data || [])
    );
  }

  respondToBooking(bookingId: number, userId: string | number, role: string, status: 'accepted' | 'rejected', comments: string = ''): Observable<any> {
    return this.http.post(`${this.apiUrl}/bookings/respond`, {
      booking_id: bookingId,
      user_id: userId,
      role: role,
      acceptance_status: status,
      comments: comments
    });
  }

  getCartCount(): number {
    return this.calculateCurrentCount();
  }

  private updateCartCount() {
    const count = this.calculateCurrentCount();
    this.cartCountSubject.next(count);
  }

  private calculateCurrentCount(): number {
    const menuCount = (this.eventBooking.menuSelection || []).length;
    const serviceCount = (this.serviceCart || []).reduce((sum: number, item: any) => sum + (Number(item.quantity) || 1), 0);
    return menuCount + serviceCount;
  }
}
