import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
    serviceType: '' as 'chef' | 'catering' | '',
    selectedChefs: [] as any[],
    selectedVendor: null as any,
    eventId: ''
  };

  private serviceCart: any[] = [];
  private readonly STORAGE_KEY = 'bhagona_cart_data';
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();
  private readonly ORDERS_KEY = 'bhagona_orders';
  private readonly CUSTOMER_KEY = 'bhagona_customer_details';
  private currentRatingOrderId: string | null = null;

  constructor() {
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
      eventId: ''
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

  placeOrder(orderType: 'event' | 'service', customerDetails: any) {
    const orders = this.getOrders();
    const newOrder = {
      id: '#BHG-' + Math.floor(Math.random() * 90000 + 10000),
      orderType,
      date: new Date().toISOString().split('T')[0],
      status: 'upcoming',
      customerDetails,
      data: orderType === 'event' ? { ...this.eventBooking } : [...this.serviceCart],
      amount: orderType === 'event'
        ? this.calculateEventTotal()
        : this.calculateServiceTotal()
    };

    orders.unshift(newOrder); // Newest first
    localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
    this.saveCustomerDetails(customerDetails); // Persist details for next time
    return newOrder;
  }

  getOrders() {
    const stored = localStorage.getItem(this.ORDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  updateOrderRating(orderId: string, ratingData: any) {
    const orders = this.getOrders();
    const index = orders.findIndex((o: any) => o.id === orderId);
    if (index > -1) {
      orders[index].rating = ratingData;
      localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
    }
  }

  setCurrentRatingOrder(orderId: string | null) {
    this.currentRatingOrderId = orderId;
  }

  getCurrentRatingOrder() {
    return this.currentRatingOrderId;
  }

  updateOrderStatus(orderId: string, status: string) {
    const orders = this.getOrders();
    const index = orders.findIndex((o: any) => o.id === orderId);
    if (index > -1) {
      orders[index].status = status;
      localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
    }
  }

  private calculateEventTotal(): number {
    if (!this.eventBooking?.menuSelection) return 0;
    return this.eventBooking.menuSelection.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0);
  }

  private calculateServiceTotal(): number {
    return this.serviceCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getCartCount(): number {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const menuCount = (data.eventBooking?.menuSelection || []).length;
        const serviceCount = (data.serviceCart || []).reduce((sum: number, item: any) => sum + (Number(item.quantity) || 1), 0);
        const total = menuCount + serviceCount;
        this.cartCountSubject.next(total);
        return total;
      } catch (e) {
        console.error('Error parsing cart data for count', e);
      }
    }
    const count = this.calculateCurrentCount();
    this.cartCountSubject.next(count);
    return count;
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
