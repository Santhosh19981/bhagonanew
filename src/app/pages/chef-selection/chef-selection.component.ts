import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-chef-selection',
  templateUrl: './chef-selection.component.html',
  styleUrl: './chef-selection.component.scss'
})
export class ChefSelectionComponent implements OnInit {
  primaryChef: any = null;
  alternateChefs: any[] = [];
  chefs: any[] = [];
  isLoading: boolean = true;

  constructor(
    private bookingService: BookingService,
    private apiService: ApiService,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit() {
    this.fetchChefs();
    const eventData = this.bookingService.getEventBooking();
    if (eventData.selectedChefs && eventData.selectedChefs.length > 0) {
      this.primaryChef = eventData.selectedChefs[0];
      this.alternateChefs = eventData.selectedChefs.slice(1);
    }
  }

  fetchChefs() {
    this.isLoading = true;
    this.apiService.getChefs().subscribe({
      next: (res: any) => {
        if (res.status && res.data) {
          this.chefs = res.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching chefs:', err);
        this.isLoading = false;
      }
    });
  }

  goBack() {
    this.location.back();
  }

  selectChef(chef: any) {
    const chefId = chef.id || chef.chef_id;

    // Check if already primary
    if (this.primaryChef && (this.primaryChef.id || this.primaryChef.chef_id) === chefId) {
      this.primaryChef = null;
      return;
    }

    // Check if in alternates
    const altIndex = this.alternateChefs.findIndex(c => (c.id || c.chef_id) === chefId);
    if (altIndex > -1) {
      this.alternateChefs.splice(altIndex, 1);
      return;
    }

    // Add to primary if empty
    if (!this.primaryChef) {
      this.primaryChef = chef;
    } else if (this.alternateChefs.length < 2) {
      // Add to alternates if less than 2
      this.alternateChefs.push(chef);
    }
  }

  isChefSelected(chef: any) {
    const chefId = chef.id || chef.chef_id;
    const isPrimary = this.primaryChef && (this.primaryChef.id || this.primaryChef.chef_id) === chefId;
    const isAlternate = this.alternateChefs.some(c => (c.id || c.chef_id) === chefId);
    return isPrimary || isAlternate;
  }

  proceed() {
    this.bookingService.updateEventBooking({
      selectedChefs: [this.primaryChef, ...this.alternateChefs]
    });
    this.router.navigate(['/cart']);
  }
}
