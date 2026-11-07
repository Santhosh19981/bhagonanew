import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { ApiService } from '../../services/api.service';
import { ResponsiveService } from '../../services/responsive.service';
import { forkJoin, Subscription } from 'rxjs';

@Component({
  selector: 'app-menu-selection',
  templateUrl: './menu-selection.component.html',
  styleUrl: './menu-selection.component.scss'
})
export class MenuSelectionComponent implements OnInit, OnDestroy {
  categories: any[] = [];
  subcategories: any[] = [];
  allItems: any[] = [];
  filteredItems: any[] = [];

  selectedCategoryId: any = null;
  selectedSubcategoryId: any = null;
  searchTerm: string = '';

  isLoading: boolean = true;
  loadError: boolean = false;
  readonly fallbackImage = 'assets/Events-new/Marriage.png';
  cart: any[] = [];
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
      this.responsiveService.isMobile$.subscribe((isMobile: boolean) => {
        this.isMobile = isMobile;
      })
    );

    const existingBooking = this.bookingService.getEventBooking();
    if (existingBooking && existingBooking.menuSelection) {
      // Menu is select-only (no quantities): normalise any older saved carts to 1 each
      this.cart = existingBooking.menuSelection.map((i: any) => ({ ...i, quantity: 1 }));
    }
    this.fetchInitialData();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  fetchInitialData() {
    this.loadError = false;

    // 1) Paint instantly from the last saved menu (if any)
    const cached = {
      categories: this.apiService.getCachedSnapshot('/menu-categories'),
      subcategories: this.apiService.getCachedSnapshot('/menu-subcategories'),
      items: this.apiService.getCachedSnapshot('/menu-items')
    };
    const hasCache = !!(cached.categories && cached.subcategories && cached.items);
    if (hasCache) {
      this.applyMenuData(cached);
    }
    this.isLoading = !hasCache;

    // 2) Refresh from the server (timeout + retry + stale fallback live in ApiService)
    this.sub.add(
      forkJoin({
        categories: this.apiService.getMenuCategories(),
        subcategories: this.apiService.getMenuSubcategories(),
        items: this.apiService.getMenuItems()
      }).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.applyMenuData(res);
        },
        error: (err) => {
          console.error('Error fetching menu data:', err);
          this.isLoading = false;
          this.loadError = !hasCache;
        }
      })
    );
  }

  private applyMenuData(res: any) {
    const prevCategory = this.selectedCategoryId;
    const prevSubcategory = this.selectedSubcategoryId;

    if (res.categories?.status) {
      this.categories = [...res.categories.data].sort((a: any, b: any) => a.id - b.id);
    }
    if (res.subcategories?.status) this.subcategories = res.subcategories.data;
    if (res.items?.status) this.allItems = res.items.data;

    this.syncCartWithMenu();

    // Keep the user's current tab when fresh data arrives; otherwise pick defaults
    if (prevCategory != null && this.categories.some(c => c.id == prevCategory)) {
      this.selectedCategoryId = prevCategory;
      const subs = this.getCurrentCategorySubcategories();
      this.currentSubcategories = subs;
      if (prevSubcategory != null && subs.some(s => s.id == prevSubcategory)) {
        this.selectedSubcategoryId = prevSubcategory;
        this.filterItems();
      } else {
        this.selectCategory(prevCategory);
      }
    } else if (this.categories.length > 0) {
      this.selectCategory(this.categories[0].id);
    }
  }

  /** Refresh image/price of items already in the cart from the latest menu data. */
  private syncCartWithMenu() {
    if (!this.cart.length || !this.allItems.length) return;
    const byId = new Map<any, any>();
    for (const item of this.allItems) {
      byId.set(String(item.id || item.menu_item_id || item.item_id || item.dish_id), item);
    }
    this.cart = this.cart.map(c => {
      const fresh = byId.get(String(c.id || c.menu_item_id || c.item_id || c.dish_id));
      return fresh ? { ...c, image_url: fresh.image_url, display_url: fresh.display_url } : c;
    });
  }

  getItemImage(item: any): string {
    return this.apiService.getImageUrl(item?.display_url || item?.image_url) || this.fallbackImage;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.endsWith(this.fallbackImage)) {
      img.src = this.fallbackImage;
    }
  }

  trackByItem(_index: number, item: any) {
    return item.id || item.menu_item_id || item.item_id || item.dish_id || _index;
  }

  selectCategory(categoryId: any) {
    this.selectedCategoryId = categoryId;
    const CategorySubcategories = this.getCurrentCategorySubcategories();
    this.currentSubcategories = CategorySubcategories;
    // Keep the same course when switching diet (e.g. Veg Biryanies -> Non-Veg Biryanies)
    const sameName = CategorySubcategories.find(s =>
      this.selectedSubcategoryId != null &&
      (s.id == this.selectedSubcategoryId ||
        (s.name || '').trim().toLowerCase() === (this.subcategories.find(x => x.id == this.selectedSubcategoryId)?.name || '').trim().toLowerCase())
    );
    if (sameName) {
      this.selectSubcategory(sameName.id);
    } else if (CategorySubcategories.length > 0) {
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

  /** Subcategories linked to the selected category, in creation order (cached for the template). */
  currentSubcategories: any[] = [];

  getCurrentCategorySubcategories() {
    return this.subcategories
      .filter(sub => sub.categories && sub.categories.some((cat: any) => cat.id == this.selectedCategoryId))
      .sort((a: any, b: any) => (Number(a.id) || 0) - (Number(b.id) || 0));
  }

  getCategoryImage(cat: any): string | null {
    return this.apiService.getImageUrl(cat?.display_url || cat?.image);
  }

  /** 'veg' | 'nonveg' | null based on the name (used for the diet symbol / pill dot). */
  dietType(name: string): 'veg' | 'nonveg' | null {
    const n = (name || '').toLowerCase();
    if (/non[\s-]*veg/.test(n)) return 'nonveg';
    if (/veg/.test(n)) return 'veg';
    return null;
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
