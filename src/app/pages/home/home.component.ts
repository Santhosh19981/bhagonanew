import { AfterViewInit, Component, OnInit, OnDestroy } from '@angular/core';
import Swiper from 'swiper';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { ApiService } from '../../services/api.service';
import { ResponsiveService } from '../../services/responsive.service';
import { BookingService } from '../../services/booking.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit, OnInit, OnDestroy {
  events: any[] = [];
  services: any[] = [];
  chefs: any[] = [];
  
  isMobile: boolean = false;
  showOnboarding: boolean = false;
  onboardingStep: number = 0;
  cartCount: number = 0;
  isLoading: boolean = true;
  private loadingStates = { events: true, services: true, chefs: true };
  
  showLocationModal: boolean = false;
  loadingLocation: boolean = false;
  locationSearchQuery: string = '';
  selectedLocation: string = 'Delhi, India';
  popularCities: string[] = ['Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Noida'];
  
  eventsSwiper: any;
  servicesSwiper: any;
  
  private sub = new Subscription();

  constructor(
    private apiService: ApiService,
    private responsiveService: ResponsiveService,
    private bookingService: BookingService
  ) { }

  ngOnInit() {
    this.selectedLocation = localStorage.getItem('selectedLocation') || 'Delhi, India';
    this.sub.add(
      this.responsiveService.isMobile$.subscribe(val => {
        this.isMobile = val;
        if (this.isMobile) {
          const onboarded = localStorage.getItem('bhagona_onboarded');
          this.showOnboarding = onboarded !== 'true';
        }
      })
    );
    this.sub.add(
      this.bookingService.cartCount$.subscribe((count: number) => {
        this.cartCount = count;
      })
    );

    this.fetchEvents();
    this.fetchServices();
    this.fetchChefs();
  }

  checkLoading() {
    if (!this.loadingStates.events && !this.loadingStates.services && !this.loadingStates.chefs) {
      this.isLoading = false;
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    if (this.eventsSwiper) {
      this.eventsSwiper.destroy(true, true);
    }
    if (this.servicesSwiper) {
      this.servicesSwiper.destroy(true, true);
    }
  }

  nextOnboarding() {
    if (this.onboardingStep < 2) {
      this.onboardingStep++;
    } else {
      this.completeOnboarding();
    }
  }

  skipOnboarding() {
    this.completeOnboarding();
  }

  completeOnboarding() {
    localStorage.setItem('bhagona_onboarded', 'true');
    this.showOnboarding = false;
  }

  openLocationModal() {
    this.showLocationModal = true;
    this.locationSearchQuery = '';
  }

  closeLocationModal() {
    this.showLocationModal = false;
  }

  selectCity(city: string) {
    this.selectedLocation = `${city}, India`;
    localStorage.setItem('selectedLocation', this.selectedLocation);
    this.closeLocationModal();
  }

  selectManualLocation() {
    if (this.locationSearchQuery && this.locationSearchQuery.trim()) {
      this.selectedLocation = this.locationSearchQuery.trim();
      localStorage.setItem('selectedLocation', this.selectedLocation);
      this.closeLocationModal();
    }
  }

  getCurrentLocation() {
    this.loadingLocation = true;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`, {
            headers: {
              'Accept-Language': 'en'
            }
          })
            .then(res => res.json())
            .then(data => {
              if (data && data.address) {
                const city = data.address.city || data.address.town || data.address.suburb || data.address.village || data.address.state || 'Detected Location';
                const country = data.address.country || 'India';
                this.selectedLocation = `${city}, ${country}`;
              } else {
                this.selectedLocation = `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
              }
              localStorage.setItem('selectedLocation', this.selectedLocation);
              this.closeLocationModal();
              this.loadingLocation = false;
            })
            .catch(err => {
              console.error('Nominatim reverse geocoding failed, falling back to coordinates:', err);
              this.selectedLocation = `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
              localStorage.setItem('selectedLocation', this.selectedLocation);
              this.closeLocationModal();
              this.loadingLocation = false;
            });
        },
        (error) => {
          console.warn('Geolocation permission denied or error, trying IP fallback:', error);
          this.getIPLocation();
        },
        { timeout: 8000 }
      );
    } else {
      this.getIPLocation();
    }
  }

  getIPLocation() {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data && data.city) {
          const city = data.city;
          const country = data.country_name || 'India';
          this.selectedLocation = `${city}, ${country}`;
        } else {
          this.selectedLocation = 'Delhi, India';
        }
        localStorage.setItem('selectedLocation', this.selectedLocation);
        this.closeLocationModal();
        this.loadingLocation = false;
      })
      .catch(err => {
        console.error('IP Geolocation failed:', err);
        this.selectedLocation = 'Delhi, India';
        this.closeLocationModal();
        this.loadingLocation = false;
      });
  }

  getShortName(name: string): string {
    const n = (name || '').trim();
    if (n.toLowerCase().includes('function')) return 'Function halls';
    if (n.toLowerCase().includes('kirana')) return 'Kirana';
    if (n.toLowerCase().includes('poultry')) return 'Poultry';
    if (n.toLowerCase().includes('vegetable')) return 'Vegetables';
    if (n.toLowerCase().includes('tent')) return 'Tenthouse';
    if (n.toLowerCase().includes('dairy')) return 'Dairy';
    if (n.toLowerCase().includes('beverage')) return 'Beverage';
    return n.split(' ')[0];
  }

  getServiceIcon(name: string): string {
    const n = (name || '').toLowerCase();
    if (n.includes('hall') || n.includes('venue')) return 'bi-building';
    if (n.includes('kirana') || n.includes('grocery')) return 'bi-cart3';
    if (n.includes('poultry') || n.includes('mutton') || n.includes('meat')) return 'bi-droplet';
    if (n.includes('veg') && !n.includes('beverage')) return 'bi-circle';
    if (n.includes('tent') || n.includes('vessel') || n.includes('decor')) return 'bi-house-door';
    if (n.includes('dairy') || n.includes('milk')) return 'bi-cup-hot';
    if (n.includes('beverage') || n.includes('drink') || n.includes('refresh')) return 'bi-glass-wine';
    if (n.includes('dessert') || n.includes('sweet')) return 'bi-cake2';
    if (n.includes('photo') || n.includes('camera')) return 'bi-camera';
    if (n.includes('music') || n.includes('band')) return 'bi-music-note-beamed';
    if (n.includes('paint') || n.includes('entertain') || n.includes('joker') || n.includes('game')) return 'bi-emoji-smile';
    if (n.includes('trans') || n.includes('truck') || n.includes('delivery')) return 'bi-truck';
    return 'bi-award';
  }

  initEventsSwiper() {
    setTimeout(() => {
      if (this.eventsSwiper) {
        this.eventsSwiper.destroy(true, true);
      }
      this.eventsSwiper = new Swiper('.swiper-events', {
        modules: [Pagination],
        slidesPerView: 'auto',
        spaceBetween: 16,
        pagination: { el: '.swiper-pagination-events', clickable: true },
      });
    }, 100);
  }

  initServicesSwiper() {
    setTimeout(() => {
      if (this.servicesSwiper) {
        this.servicesSwiper.destroy(true, true);
      }
      this.servicesSwiper = new Swiper('.swiper-services', {
        modules: [Pagination],
        slidesPerView: 'auto',
        spaceBetween: 16,
        pagination: { el: '.swiper-pagination-services', clickable: true },
      });
    }, 100);
  }

  fetchChefs() {
    this.apiService.getChefs().subscribe({
      next: (res: any) => {
        if (res.status) {
          this.chefs = (res.data || []).map((c: any) => ({
            ...c,
            image: this.apiService.getImageUrl(c.display_url || c.image)
          })).slice(0, 4); // Limit to top 4 popular chefs
        }
        this.loadingStates.chefs = false;
        this.checkLoading();
      },
      error: (err) => {
        console.error('Error fetching chefs:', err);
        this.loadingStates.chefs = false;
        this.checkLoading();
      }
    });
  }

  fetchEvents() {
    this.apiService.getEvents().subscribe({
      next: (res: any) => {
        if (res.status) {
          this.events = (res.data || []).map((e: any) => ({
            ...e,
            image_url: this.apiService.getImageUrl(e.display_url || e.image_url)
          })).sort((a: any, b: any) => a.event_id - b.event_id);
          this.initEventsSwiper();
        }
        this.loadingStates.events = false;
        this.checkLoading();
      },
      error: (err) => {
        console.error('Error fetching events:', err);
        this.loadingStates.events = false;
        this.checkLoading();
      }
    });
  }

  fetchServices() {
    this.apiService.getServices().subscribe({
      next: (res: any) => {
        if (res.status) {
          this.services = (res.data || []).map((s: any) => ({
            ...s,
            image_data: this.apiService.getImageUrl(s.display_url || s.image_data)
          })).sort((a: any, b: any) => a.service_id - b.service_id);
          this.initServicesSwiper();
        }
        this.loadingStates.services = false;
        this.checkLoading();
      },
      error: (err) => {
        console.error('Error fetching services:', err);
        this.loadingStates.services = false;
        this.checkLoading();
      }
    });
  }

  ngAfterViewInit() {
    if (!this.isMobile) {
      setTimeout(() => {
        new Swiper('.swiper', {
          modules: [Navigation, Pagination, Autoplay],
          loop: true,
          autoplay: {
            delay: 2500,
            disableOnInteraction: false,
          },
          pagination: { el: '.swiper-pagination', clickable: true },
          navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        });
      }, 500);
    }
  }
}
