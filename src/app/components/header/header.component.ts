import { Component } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',


  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  cartCount$: Observable<number>;

  constructor(
    private bookingService: BookingService,
    public authService: AuthService,
    private router: Router
  ) {
    this.cartCount$ = this.bookingService.cartCount$;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
