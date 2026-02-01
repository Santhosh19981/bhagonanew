import { AfterViewInit, Component, OnInit } from '@angular/core';
import Swiper from 'swiper';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit, OnInit {
  events: any[] = [];
  services: any[] = [];

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.fetchEvents();
    this.fetchServices();
  }

  fetchEvents() {
    this.apiService.getEvents().subscribe({
      next: (res: any) => {
        if (res.status) {
          this.events = res.data.sort((a: any, b: any) => a.event_id - b.event_id);
        }
      },
      error: (err) => {
        console.error('Error fetching events:', err);
      }
    });
  }

  fetchServices() {
    this.apiService.getServices().subscribe({
      next: (res: any) => {
        if (res.status) {
          this.services = res.data.sort((a: any, b: any) => a.service_id - b.service_id);
        }
      },
      error: (err) => {
        console.error('Error fetching services:', err);
      }
    });
  }

  ngAfterViewInit() {
    new Swiper('.swiper', {
      modules: [Navigation, Pagination, Autoplay],
      loop: true,
      autoplay: {
        delay: 2500, // ⏱ slide every 2.5 seconds
        disableOnInteraction: false, // keeps autoplay even after user interaction
      },
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
    });
  }
}
