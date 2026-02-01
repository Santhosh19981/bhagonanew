import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = 'https://bhagona-backend-v2.vercel.app';

    constructor(private http: HttpClient) { }

    getEvents(): Observable<any> {
        return this.http.get(`${this.baseUrl}/customer/events`);
    }

    getEventById(id: any): Observable<any> {
        return this.http.get(`${this.baseUrl}/customer/events/${id}`);
    }

    getServices(): Observable<any> {
        return this.http.get(`${this.baseUrl}/customer/services`);
    }

    getMenuCategories(): Observable<any> {
        return this.http.get(`${this.baseUrl}/menu-categories`);
    }

    getMenuSubcategories(): Observable<any> {
        return this.http.get(`${this.baseUrl}/menu-subcategories`);
    }

    getMenuItems(): Observable<any> {
        return this.http.get(`${this.baseUrl}/menu-items`);
    }
}
