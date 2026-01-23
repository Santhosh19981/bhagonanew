import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-service-details',
  templateUrl: './service-details.component.html',
  styleUrl: './service-details.component.scss'
})
export class ServiceDetailsComponent implements OnInit {
  cart: any[] = [];
  bookingData: any;
  serviceId: string = '';
  filteredItems: any[] = [];
  selectedService: any;

  services = [
    {
      id: 'function-halls',
      name: 'Function Halls',
      description: 'Elegant venues tailored for your special gatherings and grand celebrations.',
      image: 'assets/Services-New/Function-Hall.png',
      tag: 'Venues'
    },
    {
      id: 'grocery',
      name: 'Kirana / Grocery',
      description: 'Premium quality ingredients and groceries delivered for your event needs.',
      image: 'assets/Services-New/Grocery.png',
      tag: 'Supplies'
    },
    {
      id: 'poultry',
      name: 'Poultry & Mutton',
      description: 'Fresh, high-quality poultry and mutton sourced from trusted partners.',
      image: 'assets/Services-New/Poultry.png',
      tag: 'Fresh Meat'
    },
    {
      id: 'vegetables',
      name: 'Vegetables & Leafs',
      description: 'Farm-fresh vegetables and organic leafy greens delivered to your site.',
      image: 'assets/Services-New/Vegetables.png',
      tag: 'Organic'
    },
    {
      id: 'tenthouse',
      name: 'Tenthouse & Vessels',
      description: 'Complete equipment support including premium tents and cooking vessels.',
      image: 'assets/Services-New/⁠Tenthouse.png',
      tag: 'Equipment'
    }
  ];

  allServiceItems: { [key: string]: any[] } = {
    'function-halls': [
      { id: 101, name: 'Royal Grand Ballroom', weight: '500+ Capacity', price: 50000, category: 'Function Hall', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500', description: 'Luxurious ballroom with chandelier lighting' },
      { id: 102, name: 'Classic Marriage Mandapam', weight: '200+ Capacity', price: 25000, category: 'Mandapam', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500', description: 'Traditional mandapam for ceremonies' },
      { id: 103, name: 'Open Lawn Garden', weight: '1000+ Capacity', price: 75000, category: 'Outdoor', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500', description: 'Spacious outdoor venue with garden' },
      { id: 104, name: 'Banquet Hall Premium', weight: '300+ Capacity', price: 35000, category: 'Banquet', image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=500', description: 'Modern banquet with AC facilities' },
      { id: 105, name: 'Terrace Party Hall', weight: '150+ Capacity', price: 20000, category: 'Terrace', image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=500', description: 'Rooftop venue with city views' },
      { id: 106, name: 'Heritage Convention Center', weight: '800+ Capacity', price: 100000, category: 'Convention', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500', description: 'Grand convention center for large events' }
    ],
    'grocery': [
      { id: 201, name: 'Basmati Rice', weight: '25kg', price: 3200, category: 'Grocery', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', description: 'Premium aged basmati rice' },
      { id: 202, name: 'Refined Oil', weight: '15L', price: 2100, category: 'Grocery', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500', description: 'Pure refined cooking oil' },
      { id: 203, name: 'Premium Ghee', weight: '1kg', price: 650, category: 'Grocery', image: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=500', description: 'Pure cow ghee' },
      { id: 204, name: 'Wheat Flour', weight: '10kg', price: 450, category: 'Grocery', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500', description: 'Whole wheat atta' },
      { id: 205, name: 'Sugar', weight: '5kg', price: 250, category: 'Grocery', image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=500', description: 'Refined white sugar' },
      { id: 206, name: 'Pulses Mix Pack', weight: '5kg', price: 800, category: 'Grocery', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500', description: 'Assorted dal varieties' },
      { id: 207, name: 'Spices Combo', weight: '2kg', price: 1200, category: 'Grocery', image: 'https://images.unsplash.com/photo-1596040033229-a0b3b83b7e0f?w=500', description: 'Essential spice collection' },
      { id: 208, name: 'Salt', weight: '5kg', price: 80, category: 'Grocery', image: 'https://images.unsplash.com/photo-1607672632458-9eb56696346b?w=500', description: 'Iodized table salt' }
    ],
    'poultry': [
      { id: 301, name: 'Fresh Chicken', weight: '1kg', price: 220, category: 'Poultry', image: 'https://images.unsplash.com/photo-1606722590583-6951b5ea92ce?w=500', description: 'Farm fresh chicken' },
      { id: 302, name: 'Tender Mutton', weight: '1kg', price: 750, category: 'Meat', image: 'https://images.unsplash.com/photo-1602491993910-ec993fa2ce21?w=500', description: 'Premium quality mutton' },
      { id: 303, name: 'Premium Prawns', weight: '500g', price: 450, category: 'Seafood', image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=500', description: 'Fresh sea prawns' },
      { id: 304, name: 'Fish Fillet', weight: '1kg', price: 380, category: 'Seafood', image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=500', description: 'Boneless fish fillet' },
      { id: 305, name: 'Chicken Breast', weight: '500g', price: 150, category: 'Poultry', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500', description: 'Boneless chicken breast' },
      { id: 306, name: 'Mutton Chops', weight: '1kg', price: 850, category: 'Meat', image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=500', description: 'Premium mutton chops' },
      { id: 307, name: 'Crab', weight: '500g', price: 600, category: 'Seafood', image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=500', description: 'Fresh sea crab' },
      { id: 308, name: 'Eggs', weight: '30 pieces', price: 180, category: 'Poultry', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500', description: 'Farm fresh eggs' }
    ],
    'vegetables': [
      { id: 401, name: 'Organic Tomato', weight: '1kg', price: 40, category: 'Vegetables', image: 'https://images.unsplash.com/photo-1582284540020-8ac903f44f44?w=500', description: 'Fresh organic tomatoes' },
      { id: 402, name: 'Fresh Onions', weight: '5kg', price: 150, category: 'Vegetables', image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=500', description: 'Quality onions' },
      { id: 403, name: 'Potato', weight: '5kg', price: 120, category: 'Vegetables', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500', description: 'Fresh potatoes' },
      { id: 404, name: 'Carrot', weight: '1kg', price: 60, category: 'Vegetables', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500', description: 'Organic carrots' },
      { id: 405, name: 'Beans', weight: '500g', price: 35, category: 'Vegetables', image: 'https://images.unsplash.com/photo-1602096816361-e18e8b2e5a47?w=500', description: 'Fresh green beans' },
      { id: 406, name: 'Cabbage', weight: '1 piece', price: 25, category: 'Vegetables', image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=500', description: 'Fresh cabbage' },
      { id: 407, name: 'Spinach', weight: '500g', price: 30, category: 'Leafy', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500', description: 'Organic spinach' },
      { id: 408, name: 'Coriander Leaves', weight: '200g', price: 20, category: 'Leafy', image: 'https://images.unsplash.com/photo-1607623488235-e2e9f28e8a7e?w=500', description: 'Fresh coriander' },
      { id: 409, name: 'Curry Leaves', weight: '100g', price: 15, category: 'Leafy', image: 'https://images.unsplash.com/photo-1599909533730-f9d49c0c9b4d?w=500', description: 'Fresh curry leaves' },
      { id: 410, name: 'Capsicum', weight: '500g', price: 50, category: 'Vegetables', image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500', description: 'Colorful bell peppers' }
    ],
    'tenthouse': [
      { id: 501, name: 'Golden Tent', weight: '1 Unit', price: 5000, category: 'Equipment', image: 'https://images.unsplash.com/photo-1523050853864-4bf8198f395f?w=500', description: 'Premium wedding tent' },
      { id: 502, name: 'Ceremonial Vessels Set', weight: '50 Pieces', price: 3500, category: 'Equipment', image: 'https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?w=500', description: 'Traditional cooking vessels' },
      { id: 503, name: 'Dining Tables', weight: '10 Units', price: 8000, category: 'Furniture', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500', description: 'Banquet dining tables' },
      { id: 504, name: 'Chairs Set', weight: '100 Pieces', price: 5000, category: 'Furniture', image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=500', description: 'Comfortable seating chairs' },
      { id: 505, name: 'Stage Decoration', weight: '1 Set', price: 15000, category: 'Decoration', image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=500', description: 'Complete stage setup' },
      { id: 506, name: 'Lighting System', weight: '1 Set', price: 12000, category: 'Equipment', image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=500', description: 'Professional lighting' },
      { id: 507, name: 'Sound System', weight: '1 Set', price: 10000, category: 'Equipment', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500', description: 'High-quality audio system' },
      { id: 508, name: 'Cooking Stove', weight: '5 Units', price: 4000, category: 'Equipment', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500', description: 'Industrial cooking stoves' }
    ]
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private location: Location
  ) { }

  ngOnInit() {
    this.bookingData = this.bookingService.getEventBooking();

    this.route.params.subscribe(params => {
      this.serviceId = params['id'];
      if (this.serviceId && this.allServiceItems[this.serviceId]) {
        this.filteredItems = this.allServiceItems[this.serviceId];
        this.selectedService = this.services.find(s => s.id === this.serviceId);
      } else {
        // Default to poultry/meat if no specific ID match (fallback)
        this.filteredItems = this.allServiceItems['poultry'];
        this.selectedService = this.services.find(s => s.id === 'poultry');
      }
    });
  }

  getFormattedTitle(id: string): string {
    if (!id) return 'Services';
    return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  goBack() {
    this.location.back();
  }

  addToCart(item: any) {
    const existing = this.cart.find(i => i.id === item.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({ ...item, quantity: 1 });
    }
  }

  removeFromCart(item: any) {
    const index = this.cart.findIndex(i => i.id === item.id);
    if (index > -1) {
      if (this.cart[index].quantity > 1) {
        this.cart[index].quantity--;
      } else {
        this.cart.splice(index, 1);
      }
    }
  }

  getQuantity(itemId: any): number {
    const item = this.cart.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  }

  get totalItems() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  get totalValue() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  proceed() {
    this.bookingService.updateServiceCart(this.cart);
    this.router.navigate(['/cart']);
  }
}
