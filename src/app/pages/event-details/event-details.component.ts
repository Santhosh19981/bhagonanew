import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.scss'
})
export class EventDetailsComponent {
  eventDate: string = '';
  totalMembers: number = 0;
  vegGuests: number = 0;
  nonVegGuests: number = 0;
  selectedEvent: any;
  isLoading: boolean = true;
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
    private apiService: ApiService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const eventId = params['id'];
      if (eventId) {
        this.fetchEventDetails(eventId);
      } else {
        // If no ID provided, maybe redirect or show default
        this.router.navigate(['/events']);
      }
    });
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
          if (!this.selectedEvent.image && this.selectedEvent.image_url) {
            this.selectedEvent.image = this.selectedEvent.image_url;
          }
          this.bookingService.updateEventBooking({ eventId: id });
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

  selectMenu() {
    this.bookingService.updateEventBooking({
      eventDate: this.eventDate,
      totalMembers: this.totalMembers,
      vegGuests: this.vegGuests,
      nonVegGuests: this.nonVegGuests
    });
    this.router.navigate(['/menu-selection']);
  }

  updateTotal() {
    this.totalMembers = this.vegGuests + this.nonVegGuests;
  }
}
