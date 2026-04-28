import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

declare var Razorpay: any;

@Component({
  selector: 'app-payment-page',
  templateUrl: './payment-page.component.html',
  styleUrl: './payment-page.component.scss'
})
export class PaymentPageComponent implements OnInit, OnDestroy {
  isProcessing: boolean = false;
  isProcessingOrder: boolean = true;
  orderType: 'event' | 'service' = 'event';
  totalAmount: number = 0;
  
  // Breakdown for the UI
  subtotal: number = 0;
  platformTax: number = 0;
  gst: number = 0;
  discount: number = 0;

  // UI State
  activeStep: number = 2; 
  transactionId: string = '';
  today: Date = new Date();
  bookingItems: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private apiService: ApiService,
    private authService: AuthService,
    private location: Location
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['type']) {
        this.orderType = params['type'];
      }
    });
    this.calculateBreakdown();
    this.loadBookingItems();
    
    // Safety check: if amount is 0, redirect back to home/cart
    if (this.totalAmount <= 0) {
      console.warn('Empty cart detected. Redirecting...');
      this.router.navigate(['/']);
      return;
    }

    // Auto-trigger Order Creation on Page Load
    setTimeout(() => {
      console.log('Initiating Payment Gateway...');
      this.initiateOrderCreation();
    }, 800);
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  calculateBreakdown() {
    if (this.orderType === 'event') {
      const booking: any = this.bookingService.getEventBooking();
      // Calculate subtotal for events: Sum of (item price * total members)
      this.subtotal = (booking.menuSelection || []).reduce((sum: number, item: any) => 
        sum + (Number(item.price) * (Number(booking.totalMembers) || 1)), 0);
    } else {
      const cart = this.bookingService.getServiceCart();
      this.subtotal = cart.reduce((acc, curr) => acc + (Number(curr.price) * Number(curr.quantity)), 0);
    }
    
    // Service Fee (5%) + GST (18%) as seen in UI
    const serviceFee = this.subtotal * 0.05;
    this.gst = this.subtotal * 0.18;
    this.totalAmount = this.subtotal + serviceFee + this.gst;
  }

  loadBookingItems() {
    const booking = this.bookingService.getEventBooking();
    const cart = this.bookingService.getServiceCart();
    
    if (this.orderType === 'event') {
      this.bookingItems = booking.menuSelection.map(m => ({
        name: m.item_name || m.name,
        price: m.price,
        quantity: booking.totalMembers
      }));
    } else {
      this.bookingItems = cart.map(c => ({
        name: c.name || c.service_name,
        price: c.price,
        quantity: c.quantity
      }));
    }
  }

  initiateOrderCreation() {
    this.isProcessingOrder = true;
    
    const customerDetails = this.bookingService.getCustomerDetails();
    
    // 1. First place the order in the database to get a booking_id
    this.bookingService.placeOrder(this.orderType, customerDetails, 'Online').subscribe({
      next: (res: any) => {
        if (res.success) {
          const booking_id = res.booking_id;
          const alphanumeric_order_id = res.order_id;

          // 2. Now create the Razorpay order with the real booking_id
          const payload = {
            amount: this.totalAmount,
            currency: 'INR',
            booking_type: this.orderType,
            booking_id: booking_id, // REAL ID FROM DATABASE
            customer_id: this.authService.currentUserValue?.id,
            items: this.bookingItems
          };

          this.apiService.createRazorpayOrder(payload).subscribe({
            next: (rzpRes: any) => {
              if (rzpRes.status) {
                // The backend returns order_id and amount at the top level, not in an order object
                this.openRazorpayInline(rzpRes, booking_id, alphanumeric_order_id);
              } else {
                console.error('Razorpay order creation failed:', rzpRes.message);
                alert(rzpRes.message || 'Payment initialization failed.');
                this.isProcessingOrder = false;
              }
            },
            error: (err) => {
              console.error('Razorpay order API error:', err);
              this.isProcessingOrder = false;
              alert('Could not connect to payment gateway. Please check your internet.');
            }
          });
        }
      },
      error: (err) => {
        console.error('Booking creation failed', err);
        this.isProcessingOrder = false;
        alert('Failed to initialize booking. Please try again.');
      }
    });
  }

  openRazorpayInline(orderData: any, booking_id: number, alphanumeric_order_id: string) {
    console.log('Force-Rendering Razorpay Inline...');
    const target = document.getElementById('razorpay-inline-container');
    if (target) target.innerHTML = ''; // Reset container
    
    const options: any = {
      key: 'rzp_test_SgBxmI3d2kzrUL',
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'Bhagona Checkout',
      description: 'Order #' + alphanumeric_order_id,
      image: 'https://bhagona.com/assets/img/logo.png',
      order_id: orderData.order_id,
      handler: (response: any) => {
        this.verifyPayment(response, booking_id);
      },
      prefill: {
        name: this.bookingService.getCustomerDetails()?.name || '',
        email: this.bookingService.getCustomerDetails()?.email || '',
        contact: this.bookingService.getCustomerDetails()?.mobile || ''
      },
      theme: {
        color: '#2563eb' 
      },
      modal: {
        backdropclose: false,
        ondismiss: () => {
          this.isProcessingOrder = false;
        }
      }
    };

    try {
      this.isProcessingOrder = false;
      const rzp = new Razorpay(options);
      rzp.open();

      // Aggressive capture logic
      const captureInterval = setInterval(() => {
        const rzpFrame = document.querySelector('iframe.razorpay-checkout-frame');
        const rzpContainer = document.querySelector('.razorpay-container');
        const targetDiv = document.getElementById('razorpay-inline-container');

        if (rzpFrame && targetDiv) {
          console.log('Razorpay UI Captured!');
          
          // 1. UNLOCK PAGE SCROLLING (Razorpay locks it by default)
          document.body.style.overflow = 'auto';
          document.body.style.position = 'static';

          // 2. Hide the backdrop overlay completely
          const backdrop = document.querySelector('.razorpay-backdrop');
          if (backdrop) {
            (backdrop as HTMLElement).style.display = 'none';
            (backdrop as HTMLElement).style.opacity = '0';
          }

          // 3. Force the container to be perfectly inline and ultra-compact
          if (rzpContainer) {
            (rzpContainer as HTMLElement).style.position = 'absolute';
            (rzpContainer as HTMLElement).style.top = '-5px'; 
            (rzpContainer as HTMLElement).style.left = '50%';
            (rzpContainer as HTMLElement).style.transform = 'translateX(-50%) scale(1.2)';
            (rzpContainer as HTMLElement).style.transformOrigin = 'top center';
            (rzpContainer as HTMLElement).style.width = '450px'; 
            (rzpContainer as HTMLElement).style.height = '540px'; 
            (rzpContainer as HTMLElement).style.boxShadow = 'none';
            (rzpContainer as HTMLElement).style.margin = '0';
            (rzpContainer as HTMLElement).style.borderRadius = '2.5rem';
            (rzpContainer as HTMLElement).style.overflow = 'hidden';
            (rzpContainer as HTMLElement).style.zIndex = '1';
            
            // Hide scrollbar completely
            const style = document.createElement('style');
            style.innerHTML = `
              .razorpay-container::-webkit-scrollbar { display: none; }
              .razorpay-container { -ms-overflow-style: none; scrollbar-width: none; }
            `;
            document.head.appendChild(style);
            
            targetDiv.style.position = 'relative';
            targetDiv.appendChild(rzpContainer);
          }

          clearInterval(captureInterval);
        }
      }, 50);

      // Timeout after 5 seconds to prevent infinite loop
      setTimeout(() => clearInterval(captureInterval), 5000);

    } catch (e) {
      console.error('Razorpay Error:', e);
      this.isProcessingOrder = false;
    }
  }

  verifyPayment(rzpResponse: any, booking_id: number) {
    this.isProcessing = true;
    const payload = {
      razorpay_order_id: rzpResponse.razorpay_order_id,
      razorpay_payment_id: rzpResponse.razorpay_payment_id,
      razorpay_signature: rzpResponse.razorpay_signature,
      booking_id: booking_id
    };

    this.apiService.verifyRazorpayPayment(payload).subscribe({
      next: (res) => {
        this.isProcessing = false;
        if (res.status) {
          this.transactionId = rzpResponse.razorpay_payment_id;
          this.activeStep = 4; // Success
        } else {
          alert('Payment verification failed.');
        }
      },
      error: (err) => {
        this.isProcessing = false;
        alert('Verification error.');
      }
    });
  }

  downloadReceipt() {
    window.print();
  }

  goToDashboard() {
    this.router.navigate(['/order-history']);
  }
}
