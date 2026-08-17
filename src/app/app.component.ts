import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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

  constructor(private responsiveService: ResponsiveService) {}

  ngOnInit(): void {
    AOS.init({
      duration: 1000,
      once: true,
    });
    this.responsiveService.isMobile$.subscribe(isMobile => {
      this.isMobile = isMobile;
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
