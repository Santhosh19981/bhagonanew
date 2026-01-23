import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-menu-selection',
  templateUrl: './menu-selection.component.html',
  styleUrl: './menu-selection.component.scss'
})
export class MenuSelectionComponent {
  activeTab: 'veg' | 'non-veg' = 'veg';
  cart: any[] = [];

  vegMenu = [
    { id: 1, name: 'Paneer Butter Masala', description: 'Creamy paneer in rich tomato gravy', price: 250, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500', type: 'veg' },
    { id: 2, name: 'Dal Makhani', description: 'Overnight cooked black lentils with cream', price: 200, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500', type: 'veg' },
    { id: 3, name: 'Vegetable Biryani', description: 'Fragrant basmati rice with seasonal veggies', price: 180, image: 'https://images.unsplash.com/photo-1563379091339-03b17af4a4f8?w=500', type: 'veg' },
    { id: 7, name: 'Paneer Tikka', description: 'Grilled cottage cheese with bell peppers', price: 220, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500', type: 'veg' },
    { id: 8, name: 'Malai Kofta', description: 'Fried potato and paneer balls in creamy gravy', price: 280, image: 'https://images.unsplash.com/photo-1626074353765-517a631f4082?w=500', type: 'veg' },
    { id: 9, name: 'Hakka Noodles', description: 'Stir-fried noodles with crisp vegetables', price: 150, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500', type: 'veg' },
    { id: 10, name: 'Mix Veg Curry', description: 'Assorted seasonal vegetables in spicy gravy', price: 190, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500', type: 'veg' },
    { id: 11, name: 'Palak Paneer', description: 'Cottage cheese in thick spinach puree', price: 240, image: 'https://images.unsplash.com/photo-1601050638917-062e245a16d5?w=500', type: 'veg' }
  ];

  nonVegMenu = [
    { id: 4, name: 'Chicken Biryani', description: 'Classic hyderabadi style chicken biryani', price: 300, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500', type: 'non-veg' },
    { id: 5, name: 'Mutton Curry', description: 'Slow cooked tender mutton in spicy gravy', price: 450, image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=500', type: 'non-veg' },
    { id: 6, name: 'Fish Fry', description: 'Crispy fried fish marinated in spices', price: 350, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500', type: 'non-veg' },
    { id: 12, name: 'Chicken Tandoori', description: 'Roasted chicken marinated in yogurt and spices', price: 380, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500', type: 'non-veg' },
    { id: 13, name: 'Butter Chicken', description: 'Chunks of grilled chicken in a smooth buttery gravy', price: 420, image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500', type: 'non-veg' },
    { id: 14, name: 'Egg Curry', description: 'Boiled eggs in a flavorful onion-tomato gravy', price: 180, image: 'https://images.unsplash.com/photo-1591465001581-2c069bcfa992?w=500', type: 'non-veg' },
    { id: 15, name: 'Mutton Biryani', description: 'Royal basmati rice cooked with succulent mutton', price: 550, image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500', type: 'non-veg' },
    { id: 16, name: 'Chicken 65', description: 'Spicy, deep-fried chicken appetizer', price: 250, image: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=500', type: 'non-veg' }
  ];

  constructor(
    private bookingService: BookingService,
    private router: Router,
    private location: Location
  ) { }

  goBack() {
    this.location.back();
  }

  toggleSelection(item: any) {
    const index = this.cart.findIndex(i => i.id === item.id);
    if (index > -1) {
      this.cart.splice(index, 1);
    } else {
      this.cart.push({ ...item, quantity: 1 });
    }
  }

  get totalItems() {
    return this.cart.length;
  }

  isItemSelected(itemId: number) {
    return this.cart.some(i => i.id === itemId);
  }

  proceed() {
    this.bookingService.updateEventBooking({ menuSelection: this.cart });
    this.router.navigate(['/service-type']);
  }
}
