import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { ApiService } from '../../services/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-menu-selection',
  templateUrl: './menu-selection.component.html',
  styleUrl: './menu-selection.component.scss'
})
export class MenuSelectionComponent {
  categories: any[] = [];
  subcategories: any[] = [];
  allItems: any[] = [];
  filteredItems: any[] = [];

  selectedCategoryId: any = null;
  selectedSubcategoryId: any = null;
  searchTerm: string = '';

  isLoading: boolean = true;
  cart: any[] = [];

  constructor(
    private bookingService: BookingService,
    private apiService: ApiService,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit() {
    this.fetchInitialData();
    const existingBooking = this.bookingService.getEventBooking();
    if (existingBooking && existingBooking.menuSelection) {
      this.cart = [...existingBooking.menuSelection];
    }
  }

  fetchInitialData() {
    this.isLoading = true;
    forkJoin({
      categories: this.apiService.getMenuCategories(),
      subcategories: this.apiService.getMenuSubcategories(),
      items: this.apiService.getMenuItems()
    }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.categories.status) {
          this.categories = res.categories.data.sort((a: any, b: any) => a.id - b.id);
        }
        if (res.subcategories.status) this.subcategories = res.subcategories.data;
        if (res.items.status) this.allItems = res.items.data;

        // Set default selections
        if (this.categories.length > 0) {
          this.selectCategory(this.categories[0].id);
        }
      },
      error: (err) => {
        console.error('Error fetching menu data:', err);
        this.isLoading = false;
      }
    });
  }

  selectCategory(categoryId: any) {
    this.selectedCategoryId = categoryId;
    const CategorySubcategories = this.getCurrentCategorySubcategories();
    if (CategorySubcategories.length > 0) {
      this.selectSubcategory(CategorySubcategories[0].id);
    } else {
      this.selectedSubcategoryId = null;
      this.filterItems();
    }
  }

  selectSubcategory(subcategoryId: any) {
    this.selectedSubcategoryId = subcategoryId;
    this.filterItems();
  }

  getCurrentCategorySubcategories() {
    return this.subcategories.filter(sub =>
      sub.categories && sub.categories.some((cat: any) => cat.id == this.selectedCategoryId)
    );
  }

  filterItems() {
    let results = this.allItems.filter(item => {
      const matchCategory = item.menu_category_id == this.selectedCategoryId;
      const matchSubcategory = this.selectedSubcategoryId ? item.menu_subcategory_id == this.selectedSubcategoryId : true;
      return matchCategory && matchSubcategory;
    });

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      results = results.filter(item =>
        item.name.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term))
      );
    }

    this.filteredItems = results;
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.filterItems();
  }

  goBack() {
    this.location.back();
  }

  toggleSelection(item: any) {
    const itemId = item.id || item.menu_item_id || item.item_id || item.dish_id;
    const index = this.cart.findIndex(i => (i.id || i.menu_item_id || i.item_id || i.dish_id) == itemId);

    if (index > -1) {
      this.cart.splice(index, 1);
    } else {
      this.cart.push({ ...item, quantity: 1 });
    }
  }

  addToCart(item: any) {
    const itemId = item.id || item.menu_item_id || item.item_id || item.dish_id;
    const index = this.cart.findIndex(i => (i.id || i.menu_item_id || i.item_id || i.dish_id) == itemId);
    if (index > -1) {
      this.cart[index].quantity++;
    } else {
      this.cart.push({ ...item, quantity: 1 });
    }
  }

  removeFromCart(item: any) {
    const itemId = item.id || item.menu_item_id || item.item_id || item.dish_id;
    const index = this.cart.findIndex(i => (i.id || i.menu_item_id || i.item_id || i.dish_id) == itemId);
    if (index > -1) {
      if (this.cart[index].quantity > 1) {
        this.cart[index].quantity--;
      } else {
        this.cart.splice(index, 1);
      }
    }
  }

  getQuantity(item: any): number {
    const itemId = item.id || item.menu_item_id || item.item_id || item.dish_id;
    const cartItem = this.cart.find(i => (i.id || i.menu_item_id || i.item_id || i.dish_id) == itemId);
    return cartItem ? cartItem.quantity : 0;
  }

  isItemSelected(item: any) {
    const itemId = item.id || item.menu_item_id || item.item_id || item.dish_id;
    return this.cart.some(i => (i.id || i.menu_item_id || i.item_id || i.dish_id) == itemId);
  }

  get totalItems() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  get totalUniqueItems() {
    return this.cart.length;
  }

  get totalValue() {
    return this.cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
  }

  proceed() {
    this.bookingService.updateEventBooking({ menuSelection: this.cart });
    this.router.navigate(['/service-type']);
  }
}
