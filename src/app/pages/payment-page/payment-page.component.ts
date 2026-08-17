import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ResponsiveService } from '../../services/responsive.service';
import { Subscription } from 'rxjs';

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
  isMobile: boolean = false;
  private sub = new Subscription();
  private resizeListener: any = null;
  
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
    private location: Location,
    private responsiveService: ResponsiveService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.sub.add(
      this.responsiveService.isMobile$.subscribe((isMobile: boolean) => this.isMobile = isMobile)
    );

    this.route.queryParams.subscribe((params: any) => {
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
    this.sub.unsubscribe();
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  calculateBreakdown() {
    if (this.orderType === 'event') {
      const booking: any = this.bookingService.getEventBooking();
      this.subtotal = (booking.menuSelection || []).reduce((sum: number, item: any) => 
        sum + (Number(item.price) * (Number(booking.totalMembers) || 1)), 0);
    } else {
      const cart = this.bookingService.getServiceCart();
      this.subtotal = cart.reduce((acc, curr) => acc + (Number(curr.price) * Number(curr.quantity)), 0);
    }
    
    const serviceFee = this.subtotal * 0.05;
    this.gst = this.subtotal * 0.18;
    this.totalAmount = this.subtotal + serviceFee + this.gst;
  }

  loadBookingItems() {
    const booking = this.bookingService.getEventBooking();
    const cart = this.bookingService.getServiceCart();
    
    if (this.orderType === 'event') {
      this.bookingItems = booking.menuSelection.map((m: any) => ({
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
    
    this.bookingService.placeOrder(this.orderType, customerDetails, 'Online').subscribe({
      next: (res: any) => {
        if (res.success) {
          const booking_id = res.booking_id;
          const alphanumeric_order_id = res.order_id;

          const payload = {
            amount: this.totalAmount,
            currency: 'INR',
            booking_type: this.orderType,
            booking_id: booking_id,
            customer_id: this.authService.currentUserValue?.id,
            items: this.bookingItems
          };

          this.apiService.createRazorpayOrder(payload).subscribe({
            next: (rzpRes: any) => {
              if (rzpRes.status) {
                this.openRazorpayInline(rzpRes, booking_id, alphanumeric_order_id);
              } else {
                console.error('Razorpay order creation failed:', rzpRes.message);
                this.isProcessingOrder = false;
              }
            },
            error: (err: any) => {
              console.error('Razorpay order API error:', err);
              this.isProcessingOrder = false;
            }
          });
        }
      },
      error: (err: any) => {
        console.error('Booking creation failed', err);
        this.isProcessingOrder = false;
      }
    });
  }

  openRazorpayInline(orderData: any, booking_id: number, alphanumeric_order_id: string) {
    console.log('Opening Razorpay...');
    const target = document.getElementById('razorpay-inline-container');
    if (target) target.innerHTML = '';
    
    const options: any = {
      key: 'rzp_test_SgBxmI3d2kzrUL',
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'Bhagona Checkout',
      description: 'Order #' + alphanumeric_order_id,
      image: 'https://bhagona.com/assets/img/logo.png',
      order_id: orderData.order_id,
      handler: (response: any) => {
        this.ngZone.run(() => {
          this.verifyPayment(response, booking_id);
        });
      },
      prefill: {
        name: this.bookingService.getCustomerDetails()?.name || '',
        email: this.bookingService.getCustomerDetails()?.email || '',
        contact: this.bookingService.getCustomerDetails()?.mobile || ''
      },
      theme: {
        color: '#964F08'  // Brand brown-orange
      },
      modal: {
        backdropclose: false,
        ondismiss: () => {
          this.ngZone.run(() => {
            this.isProcessingOrder = false;
          });
        }
      }
    };

    try {
      this.isProcessingOrder = false;
      const rzp = new Razorpay(options);
      rzp.open();

      // Auto-intercept Razorpay test-mode bank simulator popup
      // Polls for the popup window and auto-clicks "Success" invisibly
      this.interceptTestBankPopup();

      // Embed Razorpay iframe inline in our page (only on desktop/tablet)
      const captureInterval = setInterval(() => {
        const rzpFrame = document.querySelector('iframe.razorpay-checkout-frame');
        const rzpContainer = document.querySelector('.razorpay-container');
        const targetDiv = document.getElementById('razorpay-inline-container');

        if (rzpFrame && targetDiv && rzpContainer) {
          const isMobileView = window.innerWidth < 768;

          if (isMobileView) {
            // On mobile, keep it as standard modal. Clean up interval.
            clearInterval(captureInterval);
            return;
          }

          // Unlock page scrolling (desktop only)
          document.body.style.overflow = 'auto';
          document.body.style.position = 'static';

          // Hide backdrop overlay (desktop only)
          const backdrop = document.querySelector('.razorpay-backdrop');
          if (backdrop) {
            (backdrop as HTMLElement).style.display = 'none';
            (backdrop as HTMLElement).style.opacity = '0';
          }

          // Dynamic positioning helper to align Razorpay container with the layout
          const updatePosition = () => {
            const rect = targetDiv.getBoundingClientRect();
            const absoluteTop = rect.top + window.pageYOffset;
            const absoluteLeft = rect.left + window.pageXOffset;

            (rzpContainer as HTMLElement).style.position = 'absolute';
            (rzpContainer as HTMLElement).style.top = `${absoluteTop}px`;
            (rzpContainer as HTMLElement).style.left = `${absoluteLeft}px`;
            (rzpContainer as HTMLElement).style.width = `${rect.width}px`;
            (rzpContainer as HTMLElement).style.height = `${rect.height}px`;
            (rzpContainer as HTMLElement).style.transform = 'none';
            (rzpContainer as HTMLElement).style.transformOrigin = 'top center';
            (rzpContainer as HTMLElement).style.boxShadow = 'none';
            (rzpContainer as HTMLElement).style.margin = '0';
            (rzpContainer as HTMLElement).style.borderRadius = '2.5rem';
            (rzpContainer as HTMLElement).style.overflow = 'hidden';
            (rzpContainer as HTMLElement).style.zIndex = '1000'; // Sits above our content card
          };

          // Apply initial positioning
          updatePosition();

          // Set up resize listener to update position dynamically
          this.resizeListener = updatePosition;
          window.addEventListener('resize', this.resizeListener);

          // Apply styling rules to clean up scrollbars/borders in document head
          const style = document.createElement('style');
          style.innerHTML = `
            .razorpay-container::-webkit-scrollbar { display: none; }
            .razorpay-container { -ms-overflow-style: none; scrollbar-width: none; border: none !important; }
            iframe.razorpay-checkout-frame { border: none !important; }
          `;
          document.head.appendChild(style);

          clearInterval(captureInterval);
        }
      }, 50);

      setTimeout(() => clearInterval(captureInterval), 5000);

    } catch (e) {
      console.error('Razorpay Error:', e);
      this.isProcessingOrder = false;
    }
  }

  /**
   * Intercepts Razorpay's test-mode bank simulator popup window
   * and auto-clicks "Success" so users never see it.
   */
  private interceptTestBankPopup() {
    let attempts = 0;
    const maxAttempts = 150; // 30 seconds max (150 × 200ms)

    const pollInterval = setInterval(() => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(pollInterval);
        return;
      }

      try {
        const popupWin = this.findRazorpayPopup();
        if (popupWin && !popupWin.closed) {
          const doc = popupWin.document;
          if (doc && doc.readyState === 'complete') {
            // Look for the green "Success" button on the bank sim page
            const buttons = doc.querySelectorAll('button, input[type="button"], a');
            let successBtn: HTMLElement | null = null;
            buttons.forEach((btn: Element) => {
              const text = (btn.textContent || (btn as HTMLInputElement).value || '').trim().toLowerCase();
              if (text === 'success' || text.includes('success')) {
                successBtn = btn as HTMLElement;
              }
            });

            if (successBtn) {
              console.log('[Razorpay Test] Auto-clicking Success on bank simulator');
              (successBtn as HTMLElement).click();
              clearInterval(pollInterval);
            }
          }
        }
      } catch (e) {
        // Cross-origin SecurityError expected while popup is loading — silently ignore
      }
    }, 200);
  }

  /**
   * Scans window properties to find the Razorpay bank popup window reference.
   */
  private findRazorpayPopup(): Window | null {
    const w = window as any;
    // Razorpay sometimes stores the popup reference directly
    if (w.CheckoutBridge?.popup && !w.CheckoutBridge.popup.closed) {
      return w.CheckoutBridge.popup;
    }
    // Fallback: scan all window-like properties
    for (const key of Object.keys(w)) {
      try {
        const val = w[key];
        if (
          val &&
          typeof val === 'object' &&
          typeof val.closed === 'boolean' &&
          val.closed === false &&
          val.location
        ) {
          const href = (val.location.href || '') as string;
          if (href.includes('razorpay') || href.includes('mocksharp')) {
            return val as Window;
          }
        }
      } catch (e) { /* cross-origin, skip */ }
    }
    return null;
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
      next: (res: any) => {
        this.isProcessing = false;
        if (res.status) {
          this.transactionId = rzpResponse.razorpay_payment_id;
          this.activeStep = 4; // Success
        } else {
          console.error('Payment verification failed:', res);
        }
      },
      error: (err: any) => {
        this.isProcessing = false;
        console.error('Verification error:', err);
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
