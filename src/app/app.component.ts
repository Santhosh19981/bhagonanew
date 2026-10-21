import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import * as AOS from 'aos';
import { ResponsiveService } from './services/responsive.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  isMobile: boolean = false;
  showSplash: boolean = true;
  fadeSplash: boolean = false;
  isLaunchingSoon: boolean = false;

  constructor(
    private responsiveService: ResponsiveService,
    private router: Router
  ) {}

  ngOnInit(): void {
    AOS.init({
      duration: 1000,
      once: true,
    });
    this.responsiveService.isMobile$.subscribe(isMobile => {
      this.isMobile = isMobile;
    });

    // Detect initial and subsequent route changes
    const initialPath = window.location.pathname;
    this.isLaunchingSoon = (initialPath === '/' || initialPath === '' || initialPath.startsWith('/launching-soon'));

    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects.split('?')[0];
      this.isLaunchingSoon = (url === '/' || url === '' || url === '/launching-soon');
    });

    // Fade out splash screen transition
    setTimeout(() => {
      this.fadeSplash = true;
      setTimeout(() => {
        this.showSplash = false;
      }, 500);
    }, 2200);
  }
}
