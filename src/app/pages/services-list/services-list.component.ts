import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-services-list',
    templateUrl: './services-list.component.html',
    styleUrl: './services-list.component.scss'
})
export class ServicesListComponent implements OnInit {
    services: any[] = [];
    isLoading: boolean = true;

    constructor(
        private location: Location,
        private apiService: ApiService
    ) { }

    ngOnInit() {
        this.fetchServices();
    }

    fetchServices() {
        this.isLoading = true;
        this.apiService.getServices().subscribe({
            next: (res: any) => {
                this.isLoading = false;
                if (res.status) {
                    this.services = res.data.sort((a: any, b: any) => a.service_id - b.service_id);
                }
            },
            error: (err) => {
                this.isLoading = false;
                console.error('Error fetching services:', err);
            }
        });
    }

    goBack() {
        this.location.back();
    }
}
