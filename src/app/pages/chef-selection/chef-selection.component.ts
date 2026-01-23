import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-chef-selection',
  templateUrl: './chef-selection.component.html',
  styleUrl: './chef-selection.component.scss'
})
export class ChefSelectionComponent {
  primaryChef: any = null;
  alternateChefs: any[] = [];

  chefs = [
    { id: 1, name: 'Chef Rajesh Kumar', experience: '15 Years', specialty: 'Indian Mughlai', rating: 4.8, image: 'https://img.freepik.com/free-photo/portrait-confident-smiling-male-chef-white-uniform_171337-5131.jpg' },
    { id: 2, name: 'Chef Priya Singh', experience: '10 Years', specialty: 'South Indian & Tandoor', rating: 4.9, image: 'https://img.freepik.com/free-photo/female-chef-working-kitchen_23-2148763212.jpg' },
    { id: 3, name: 'Chef Michael Chen', experience: '12 Years', specialty: 'Indo-Chinese', rating: 4.7, image: 'https://img.freepik.com/free-photo/chef-smiling-camera-kitchen_23-2148763189.jpg' },
    { id: 4, name: 'Chef Abdullah Ali', experience: '20 Years', specialty: 'Biryani & Kebabs', rating: 5.0, image: 'https://img.freepik.com/free-photo/vertical-shot-man-white-chef-uniform-posing-with-arms-crossed_181624-52319.jpg' },
    { id: 5, name: 'Chef Sarah Johnson', experience: '8 Years', specialty: 'Continental & Desserts', rating: 4.6, image: 'https://img.freepik.com/free-photo/young-female-chef-white-uniform-holding-plate-with-cookies-standing-over-blue-background_141793-13887.jpg' },
    { id: 6, name: 'Chef Vikram Roy', experience: '14 Years', specialty: 'Bengali Fusion', rating: 4.8, image: 'https://img.freepik.com/free-photo/portrait-cook-smiling-camera_23-2148329182.jpg' },
    { id: 7, name: 'Chef Anita Desai', experience: '11 Years', specialty: 'Gujarati Special', rating: 4.7, image: 'https://img.freepik.com/free-photo/happy-attractive-chef-standing-kitchen-smiling-camera_23-2148763213.jpg' },
    { id: 8, name: 'Chef Sanjay Gupta', experience: '18 Years', specialty: 'Street Food & Snacks', rating: 4.9, image: 'https://img.freepik.com/free-photo/chef-cooking-kitchen-restaurant_23-2148835061.jpg' }
  ];

  constructor(
    private bookingService: BookingService,
    private router: Router,
    private location: Location
  ) { }

  goBack() {
    this.location.back();
  }

  selectChef(chef: any) {
    if (this.primaryChef === chef) {
      this.primaryChef = null;
    } else if (this.alternateChefs.includes(chef)) {
      this.alternateChefs = this.alternateChefs.filter(c => c !== chef);
    } else {
      if (!this.primaryChef) {
        this.primaryChef = chef;
      } else if (this.alternateChefs.length < 2) {
        this.alternateChefs.push(chef);
      }
    }
  }

  isChefSelected(chef: any) {
    return this.primaryChef === chef || this.alternateChefs.includes(chef);
  }

  proceed() {
    this.bookingService.updateEventBooking({
      selectedChefs: [this.primaryChef, ...this.alternateChefs]
    });
    this.router.navigate(['/cart']);
  }
}
