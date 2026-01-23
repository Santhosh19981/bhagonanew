import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private eventBooking = {
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

  constructor() { }

  updateEventBooking(data: Partial<typeof this.eventBooking>) {
    this.eventBooking = { ...this.eventBooking, ...data };
  }

  getEventBooking() {
    return this.eventBooking;
  }

  updateServiceCart(items: any[]) {
    this.serviceCart = items;
  }

  addToServiceCart(item: any) {
    const existing = this.serviceCart.find(i => i.id === item.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.serviceCart.push({ ...item, quantity: 1 });
    }
  }

  removeFromServiceCart(item: any) {
    const index = this.serviceCart.findIndex(i => i.id === item.id);
    if (index > -1) {
      if (this.serviceCart[index].quantity > 1) {
        this.serviceCart[index].quantity--;
      } else {
        this.serviceCart.splice(index, 1);
      }
    }
  }

  getServiceCart() {
    return this.serviceCart;
  }

  clearAll() {
    this.eventBooking = {
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
    this.serviceCart = [];
  }

  getCartCount(): number {
    const menuCount = this.eventBooking.menuSelection.length;
    const serviceCount = this.serviceCart.reduce((sum, item) => sum + item.quantity, 0);
    return menuCount + serviceCount;
  }
}
