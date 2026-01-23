import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
    selector: 'app-services-list',
    templateUrl: './services-list.component.html',
    styleUrl: './services-list.component.scss'
})
export class ServicesListComponent {
    constructor(private location: Location) { }

    goBack() {
        this.location.back();
    }
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
}
