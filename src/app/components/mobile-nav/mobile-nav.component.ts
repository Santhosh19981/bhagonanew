import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mobile-nav',
  templateUrl: './mobile-nav.component.html',
  styleUrl: './mobile-nav.component.scss'
})
export class MobileNavComponent implements OnInit {
  currentUrl: string = '';
  cartCount: number = 0;

  // Routes where bottom navigation should be hidden
  hiddenRoutes = [
    '/login',
    '/payment',
    '/thanks-order',
    '/checkout'
  ];

  constructor(
    private router: Router,
    private bookingService: BookingService,
    public authService: AuthService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = event.urlAfterRedirects || event.url;
    });
  }

  ngOnInit() {
    this.currentUrl = this.router.url;
    this.bookingService.cartCount$.subscribe((count: number) => {
      this.cartCount = count;
    });
  }

  shouldShowNav(): boolean {
    // Hide during onboarding on the home route
    const onboarded = localStorage.getItem('bhagona_onboarded');
    if ((this.currentUrl.startsWith('/home') || this.currentUrl === '/') && onboarded !== 'true') {
      return false;
    }
    
    // Hide for blacklisted routes
    const isHidden = this.hiddenRoutes.some(route => this.currentUrl.startsWith(route));
    return !isHidden;
  }

  isActive(route: string): boolean {
    if (route === '/home') {
      return this.currentUrl.startsWith('/home') || this.currentUrl === '/' || this.currentUrl === '';
    }
    return this.currentUrl.startsWith(route);
  }
}
