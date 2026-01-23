import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.scss'
})
export class ReviewsComponent {
  ratings = {
    hygiene: 0,
    taste: 0,
    behavior: 0
  };
  comment: string = '';

  constructor(private router: Router) { }

  setRating(category: 'hygiene' | 'taste' | 'behavior', value: number) {
    (this.ratings as any)[category] = value;
  }

  submit() {
    // Logic to submit review
    alert('Thank you for your feedback!');
    this.router.navigate(['/order-history']);
  }
}
