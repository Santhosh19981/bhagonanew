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

    getChefs(): Observable<any> {
        return this.http.get(`${this.baseUrl}/customer/partners/chefs`);
    }
    getServiceItemsById(id: any, vendorId?: any): Observable<any> {
        const params: any = {};
        if (vendorId) {
            params.vendor_id = vendorId;
        }
        return this.http.get(`${this.baseUrl}/customer/service-items/${id}`, { params });
    }

    getVendorsByServiceId(serviceId: string): Observable<any> {
        return this.http.get(`${this.baseUrl}/customer/partners/vendors`, {
            params: { service_id: serviceId }
        });
    }

    getBanners(vendorId?: any): Observable<any> {
        let url = `${this.baseUrl}/banners`;
        if (vendorId) url += `?vendor_id=${vendorId}`;
        return this.http.get(url);
    }

    getReviews(vendorId: any): Observable<any> {
        return this.http.get(`${this.baseUrl}/reviews/vendor/${vendorId}`);
    }
}
