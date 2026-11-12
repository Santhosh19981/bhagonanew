import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { ApiService } from '../../services/api.service';
import { ResponsiveService } from '../../services/responsive.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.scss'
})
export class EventDetailsComponent implements OnInit, OnDestroy {
  eventDate: string = '';
  totalMembers: number = 0;
  vegGuests: number = 0;
  nonVegGuests: number = 0;
  selectedEvent: any;
  isLoading: boolean = true;
  isMobile: boolean = false;
  
  readonly MAX_VEG: number = 5000;
  readonly MAX_NON_VEG: number = 10000;
  vegError: string = '';
  nonVegError: string = '';
  minDate: string = '';

  /** Set when the customer came from a vendor offer ("Add N guests"): save returns to vendor selection. */
  returnTo: string | null = null;
  /** Guests needed to unlock the offer, and the guest count when the page opened. */
  offerGuestsNeeded: number = 0;
  private guestsAtOpen: number = 0;

  private sub = new Subscription();
  events = [
    {
      id: 'marriage',
      name: 'Marriage',
      description: 'Celebrate your union with exquisite flavors and impeccable service.',
      image: 'assets/Events-new/Marriage.png',
      quote: 'Two hearts become one, a journey just begun.'
    },
    {
      id: 'birthday',
      name: 'Birthday',
      description: 'Make every birthday a delicious celebration to remember.',
      image: 'assets/Events-new/Birthday.png',
      quote: 'Another year older, brighter, and bold with wings.'
    },
    {
      id: 'baby-shower',
      name: 'Baby Shower',
      description: 'Welcoming new life with warmth, care, and great food.',
      image: 'assets/Events-new/Baby-Shower.png',
      quote: 'Little hands and tiny feet, a bundle of joy we can’t wait to meet.'
    },
    {
      id: 'engagement',
      name: 'Engagement',
      description: 'A beautiful promise deserves a beautiful culinary experience.',
      image: 'assets/Events-new/Engagement.png',
      quote: 'A promise made for a beautiful forever.'
    },
    {
      id: 'puberty-ceremony',
      name: 'Puberty Ceremony',
      description: 'Stepping into a new chapter with grace and traditional tastes.',
      image: 'assets/Events-new/Puberty-Ceremony.png',
      quote: 'A step into tradition, growth, and grace.'
    },
    {
      id: 'funeral',
      name: 'Funeral',
      description: 'Respectful and dignified catering during sensitive times.',
      image: 'assets/Events-new/Funeral.png',
      quote: 'Gone from sight, but in our hearts eternally.'
    }
  ];

  constructor(
    private bookingService: BookingService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private apiService: ApiService,
    private responsiveService: ResponsiveService
  ) { }

  ngOnInit() {
    this.sub.add(
      this.responsiveService.isMobile$.subscribe((isMobile: boolean) => {
        this.isMobile = isMobile;
      })
    );

    const qp = this.route.snapshot.queryParamMap;
    this.returnTo = qp.get('returnTo') === 'vendor-selection' ? 'vendor-selection' : null;
    this.offerGuestsNeeded = this.returnTo ? Math.max(Math.floor(Number(qp.get('addGuests')) || 0), 0) : 0;

    this.sub.add(this.route.params.subscribe(params => {
      const eventId = params['id'];
      if (eventId) {
        this.restoreOrResetBooking(eventId);
        this.guestsAtOpen = this.totalMembers;
        this.fetchEventDetails(eventId);
      } else {
        // If no ID provided, maybe redirect or show default
        this.router.navigate(['/events']);
      }
    }));

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.minDate = `${yyyy}-${mm}-${dd}`;
  }

  /**
   * Only restore saved details when the user comes back to the SAME event
   * (e.g. Back from the menu page). Opening a different event, or a booking
   * whose date has already passed, starts with a clean form.
   */
  private restoreOrResetBooking(eventId: any) {
    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const existing = this.bookingService.getEventBooking();
    const sameEvent = !!existing?.eventId && String(existing.eventId) === String(eventId);
    const dateExpired = !!existing?.eventDate && existing.eventDate < todayIso;

    // reset local form state
    this.eventDate = '';
    this.vegGuests = 0;
    this.nonVegGuests = 0;
    this.totalMembers = 0;
    this.vegError = '';
    this.nonVegError = '';

    if (sameEvent && !dateExpired) {
      if (existing.eventDate) this.eventDate = existing.eventDate;
      if (existing.vegGuests) this.onVegChange(existing.vegGuests);
      if (existing.nonVegGuests) this.onNonVegChange(existing.nonVegGuests);
      this.updateTotal();
      return;
    }

    // Different event (or stale booking): drop the previous event's details & menu
    if (existing && (existing.eventId || existing.eventDate || existing.menuSelection?.length)) {
      this.bookingService.clearEventBooking();
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  fetchEventDetails(id: any) {
    console.log('Fetching details for event ID:', id);
    this.isLoading = true;
    this.apiService.getEventById(id).subscribe({
      next: (res: any) => {
        console.log('API Response for Event Details:', res);
        this.isLoading = false;
        if (res.status && res.data) {
          this.selectedEvent = res.data;
          // Map API data to component structure if needed
          this.selectedEvent.image = this.apiService.getImageUrl(this.selectedEvent.display_url || this.selectedEvent.image_url || this.selectedEvent.image);
          this.bookingService.updateEventBooking({
            eventId: id,
            eventName: this.selectedEvent.name
          });
        } else {
          console.warn('Event details not found or status false, redirecting...');
          this.router.navigate(['/events']);
        }
      },
      error: (err) => {
        console.error('Error fetching event details:', err);
        this.isLoading = false;
        this.router.navigate(['/events']);
      }
    });
  }

  goBack() {
    this.location.back();
  }

  onlyNumbers(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
    if (allowedKeys.includes(event.key)) {
      return;
    }
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

  onVegChange(value: any, inputEl?: HTMLInputElement) {
    if (value === null || value === undefined || value === '') {
      this.vegGuests = null as any;
      this.vegError = '';
      this.updateTotal();
      return;
    }
    let strVal = String(value).replace(/[^0-9]/g, '');
    if (!strVal) {
      this.vegGuests = null as any;
      if (inputEl) inputEl.value = '';
      this.vegError = '';
      this.updateTotal();
      return;
    }
    if (strVal.length > 1 && strVal.startsWith('0')) {
      strVal = strVal.replace(/^0+/, '') || '0';
    }
    const parsed = Math.floor(Number(strVal));
    if (isNaN(parsed) || parsed < 0) {
      this.vegGuests = 0;
      this.vegError = 'Please enter a valid guest count';
    } else if (parsed > this.MAX_VEG) {
      this.vegGuests = parsed;
      this.vegError = `Maximum limit is ${this.MAX_VEG.toLocaleString()} vegetarian guests`;
    } else {
      this.vegGuests = parsed;
      this.vegError = '';
    }
    if (inputEl && inputEl.value !== strVal) {
      inputEl.value = strVal;
    }
    this.updateTotal();
  }

  focusVegInput(input: HTMLInputElement) {
    if (!input) return;
    input.focus();
    if (this.vegGuests === 0 || !this.vegGuests || input.value === '0') {
      input.value = '';
      this.vegGuests = null as any;
      this.updateTotal();
    } else {
      setTimeout(() => {
        try {
          const len = input.value.length;
          input.setSelectionRange(len, len);
        } catch (e) {}
      }, 0);
    }
  }

  onVegFocus(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    if (this.vegGuests === 0 || !this.vegGuests || input.value === '0') {
      input.value = '';
      this.vegGuests = null as any;
      this.updateTotal();
    } else {
      setTimeout(() => {
        try {
          if (input && input.selectionStart !== input.selectionEnd) {
            const len = input.value.length;
            input.setSelectionRange(len, len);
          }
        } catch (e) {}
      }, 0);
    }
  }

  onVegBlur(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    if (!input.value || this.vegGuests === null || this.vegGuests === undefined) {
      this.vegGuests = 0;
      input.value = '0';
      this.vegError = '';
      this.updateTotal();
    }
  }

  onNonVegChange(value: any, inputEl?: HTMLInputElement) {
    if (value === null || value === undefined || value === '') {
      this.nonVegGuests = null as any;
      this.nonVegError = '';
      this.updateTotal();
      return;
    }
    let strVal = String(value).replace(/[^0-9]/g, '');
    if (!strVal) {
      this.nonVegGuests = null as any;
      if (inputEl) inputEl.value = '';
      this.nonVegError = '';
      this.updateTotal();
      return;
    }
    if (strVal.length > 1 && strVal.startsWith('0')) {
      strVal = strVal.replace(/^0+/, '') || '0';
    }
    const parsed = Math.floor(Number(strVal));
    if (isNaN(parsed) || parsed < 0) {
      this.nonVegGuests = 0;
      this.nonVegError = 'Please enter a valid guest count';
    } else if (parsed > this.MAX_NON_VEG) {
      this.nonVegGuests = parsed;
      this.nonVegError = `Maximum limit is ${this.MAX_NON_VEG.toLocaleString()} non-vegetarian guests`;
    } else {
      this.nonVegGuests = parsed;
      this.nonVegError = '';
    }
    if (inputEl && inputEl.value !== strVal) {
      inputEl.value = strVal;
    }
    this.updateTotal();
  }

  focusNonVegInput(input: HTMLInputElement) {
    if (!input) return;
    input.focus();
    if (this.nonVegGuests === 0 || !this.nonVegGuests || input.value === '0') {
      input.value = '';
      this.nonVegGuests = null as any;
      this.updateTotal();
    } else {
      setTimeout(() => {
        try {
          const len = input.value.length;
          input.setSelectionRange(len, len);
        } catch (e) {}
      }, 0);
    }
  }

  onNonVegFocus(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    if (this.nonVegGuests === 0 || !this.nonVegGuests || input.value === '0') {
      input.value = '';
      this.nonVegGuests = null as any;
      this.updateTotal();
    } else {
      setTimeout(() => {
        try {
          if (input && input.selectionStart !== input.selectionEnd) {
            const len = input.value.length;
            input.setSelectionRange(len, len);
          }
        } catch (e) {}
      }, 0);
    }
  }

  onNonVegBlur(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    if (!input.value || this.nonVegGuests === null || this.nonVegGuests === undefined) {
      this.nonVegGuests = 0;
      input.value = '0';
      this.nonVegError = '';
      this.updateTotal();
    }
  }

  adjustVeg(delta: number) {
    const current = Number(this.vegGuests) || 0;
    const nextVal = current + delta;
    if (nextVal < 0) {
      this.onVegChange(0);
      return;
    }
    if (nextVal > this.MAX_VEG) {
      this.vegGuests = nextVal;
      this.vegError = `Maximum limit is ${this.MAX_VEG.toLocaleString()} vegetarian guests`;
      this.updateTotal();
      return;
    }
    this.onVegChange(nextVal);
  }

  adjustNonVeg(delta: number) {
    const current = Number(this.nonVegGuests) || 0;
    const nextVal = current + delta;
    if (nextVal < 0) {
      this.onNonVegChange(0);
      return;
    }
    if (nextVal > this.MAX_NON_VEG) {
      this.nonVegGuests = nextVal;
      this.nonVegError = `Maximum limit is ${this.MAX_NON_VEG.toLocaleString()} non-vegetarian guests`;
      this.updateTotal();
      return;
    }
    this.onNonVegChange(nextVal);
  }

  updateTotal() {
    this.totalMembers = (Number(this.vegGuests) || 0) + (Number(this.nonVegGuests) || 0);
  }

  get isValid(): boolean {
    const veg = Number(this.vegGuests) || 0;
    const nonVeg = Number(this.nonVegGuests) || 0;
    return (
      !!this.eventDate &&
      this.totalMembers > 0 &&
      veg >= 0 &&
      veg <= this.MAX_VEG &&
      nonVeg >= 0 &&
      nonVeg <= this.MAX_NON_VEG &&
      !this.vegError &&
      !this.nonVegError
    );
  }

  selectMenu() {
    if (!this.isValid) {
      return;
    }
    this.bookingService.updateEventBooking({
      eventName: this.selectedEvent?.name,
      eventDate: this.eventDate,
      totalMembers: this.totalMembers,
      vegGuests: Number(this.vegGuests) || 0,
      nonVegGuests: Number(this.nonVegGuests) || 0
    });
    // Came from a vendor offer: the menu is already chosen, so go straight back to re-priced partners.
    this.router.navigate([this.returnTo === 'vendor-selection' ? '/vendor-selection' : '/menu-selection']);
  }

  /** Guest total that unlocks the offer the customer clicked. */
  get offerTargetGuests(): number {
    return this.guestsAtOpen + this.offerGuestsNeeded;
  }

  /** Guests still to add before the offer unlocks (0 once reached). */
  get offerGuestsRemaining(): number {
    return Math.max(this.offerTargetGuests - this.totalMembers, 0);
  }
}
