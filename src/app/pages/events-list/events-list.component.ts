import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-events-list',
    templateUrl: './events-list.component.html',
    styleUrl: './events-list.component.scss'
})
export class EventsListComponent implements OnInit {
    events: any[] = [];
    isLoading: boolean = true;

    constructor(
        private location: Location,
        private apiService: ApiService
    ) { }

    ngOnInit() {
        this.fetchEvents();
    }

    fetchEvents() {
        this.isLoading = true;
        this.apiService.getEvents().subscribe({
            next: (res: any) => {
                this.isLoading = false;
                if (res.status) {
                    this.events = res.data.sort((a: any, b: any) => a.event_id - b.event_id);
                }
            },
            error: (err) => {
                this.isLoading = false;
                console.error('Error fetching events:', err);
            }
        });
    }

    goBack() {
        this.location.back();
    }
}
