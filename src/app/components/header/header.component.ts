import { Component } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',


  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  constructor(
    private bookingService: BookingService,
    public authService: AuthService,
    private router: Router
  ) { }

  get cartCount(): number {
    return this.bookingService.getCartCount();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
