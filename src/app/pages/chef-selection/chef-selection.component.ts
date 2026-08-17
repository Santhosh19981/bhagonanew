import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { ApiService } from '../../services/api.service';
import { ResponsiveService } from '../../services/responsive.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chef-selection',
  templateUrl: './chef-selection.component.html',
  styleUrl: './chef-selection.component.scss'
})
export class ChefSelectionComponent implements OnInit, OnDestroy {
  primaryChef: any = null;
  alternateChefs: any[] = [];
  chefs: any[] = [];
  isLoading: boolean = true;
  isMobile: boolean = false;
  private sub = new Subscription();

  constructor(
    private bookingService: BookingService,
    private apiService: ApiService,
    private router: Router,
    private location: Location,
    private responsiveService: ResponsiveService
  ) { }

  ngOnInit() {
    this.sub.add(
      this.responsiveService.isMobile$.subscribe(isMobile => this.isMobile = isMobile)
    );
    this.fetchChefs();
    const eventData = this.bookingService.getEventBooking();
    if (eventData.selectedChefs && eventData.selectedChefs.length > 0) {
      this.primaryChef = eventData.selectedChefs[0];
      this.alternateChefs = eventData.selectedChefs.slice(1);
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  fetchChefs() {
    this.isLoading = true;
    this.apiService.getChefs().subscribe({
      next: (res: any) => {
        if (res.status && res.data) {
          this.chefs = (res.data || []).map((c: any) => ({
            ...c,
            image: this.apiService.getImageUrl(c.display_url || c.image)
          }));
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

    // Toggle off if already primary
    if (this.primaryChef && (this.primaryChef.id || this.primaryChef.chef_id) === chefId) {
      this.primaryChef = null;
      this.saveToBooking();
      return;
    }

    // Toggle off if already in alternates (reassign array to trigger change detection)
    const altIndex = this.alternateChefs.findIndex(c => (c.id || c.chef_id) === chefId);
    if (altIndex > -1) {
      this.alternateChefs = this.alternateChefs.filter((_, i) => i !== altIndex);
      this.saveToBooking();
      return;
    }

    // Add as primary if slot is empty
    if (!this.primaryChef) {
      this.primaryChef = chef;
      this.saveToBooking();
      return;
    }

    // Add as alternate (max 2)
    if (this.alternateChefs.length < 2) {
      this.alternateChefs = [...this.alternateChefs, chef];
      this.saveToBooking();
    }
  }

  private saveToBooking() {
    const allChefs = this.primaryChef
      ? [this.primaryChef, ...this.alternateChefs]
      : [...this.alternateChefs];
    this.bookingService.updateEventBooking({ selectedChefs: allChefs });
  }

  isChefSelected(chef: any) {
    const chefId = chef.id || chef.chef_id;
    const isPrimary = this.primaryChef && (this.primaryChef.id || this.primaryChef.chef_id) === chefId;
    const isAlternate = this.alternateChefs.some(c => (c.id || c.chef_id) === chefId);
    return isPrimary || isAlternate;
  }

  proceed() {
    this.saveToBooking();
    this.router.navigate(['/checkout']);
  }
}
