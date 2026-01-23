import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
    selector: 'app-events-list',
    templateUrl: './events-list.component.html',
    styleUrl: './events-list.component.scss'
})
export class EventsListComponent {
    constructor(private location: Location) { }

    goBack() {
        this.location.back();
    }
    events = [
        {
            id: 'marriage',
            name: 'Marriage',
            description: 'Celebrate your union with exquisite flavors and impeccable service.',
            image: 'assets/Events-new/Marriage.png',
            quote: 'Two hearts become one, a journey just begun.'
        },
        {
            id: 'birthday',
            name: 'Birthday',
            description: 'Make every birthday a delicious celebration to remember.',
            image: 'assets/Events-new/Birthday.png',
            quote: 'Another year older, brighter, and bold with wings.'
        },
        {
            id: 'baby-shower',
            name: 'Baby Shower',
            description: 'Welcoming new life with warmth, care, and great food.',
            image: 'assets/Events-new/Baby-Shower.png',
            quote: 'Little hands and tiny feet, a bundle of joy we can’t wait to meet.'
        },
        {
            id: 'engagement',
            name: 'Engagement',
            description: 'A beautiful promise deserves a beautiful culinary experience.',
            image: 'assets/Events-new/Engagement.png',
            quote: 'A promise made for a beautiful forever.'
        },
        {
            id: 'puberty-ceremony',
            name: 'Puberty Ceremony',
            description: 'Stepping into a new chapter with grace and traditional tastes.',
            image: 'assets/Events-new/Puberty-Ceremony.png',
            quote: 'A step into tradition, growth, and grace.'
        },
        {
            id: 'funeral',
            name: 'Funeral',
            description: 'Respectful and dignified catering during sensitive times.',
            image: 'assets/Events-new/Funeral.png',
            quote: 'Gone from sight, but in our hearts eternally.'
        }
    ];
}
