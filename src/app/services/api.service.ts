import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) { }

    getImageUrl(path: string | null): string | null {
        if (!path) return null;
        if (path.startsWith('data:')) return path;
        if (path.startsWith('/')) {
            return `${this.baseUrl}${path}`;
        }
        return path;
    }

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

    getBanners(vendorId?: any, serviceId?: any): Observable<any> {
        let url = `${this.baseUrl}/banners`;
        const params: any = {};
        if (vendorId) params.vendor_id = vendorId;
        if (serviceId) params.service_id = serviceId;
        return this.http.get(url, { params });
    }

    getOffers(vendorId: any, serviceId?: any): Observable<any> {
        if (!vendorId || vendorId === 'undefined') {
            return new Observable(observer => {
                observer.next({ status: true, data: [] });
                observer.complete();
            });
        }
        let url = `${this.baseUrl}/offers/active/${vendorId}`;
        const params: any = {};
        if (serviceId) params.service_id = serviceId;
        return this.http.get(url, { params });
    }

    getReviews(vendorId: any): Observable<any> {
        if (!vendorId || vendorId === 'undefined') {
            return new Observable(observer => {
                observer.next({ status: true, data: [] });
                observer.complete();
            });
        }
        return this.http.get(`${this.baseUrl}/reviews/vendor/${vendorId}`);
    }
}
