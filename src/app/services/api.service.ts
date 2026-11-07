import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, timer } from 'rxjs';
import { catchError, retry, shareReplay, tap, timeout } from 'rxjs/operators';
import { config } from '../config';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    get baseUrl(): string {
        return config.apiUrl;
    }

    constructor(private http: HttpClient) { }

    // ------------------------------------------------------------------
    // Catalog cache: menu / events / services rarely change, so we keep
    //  - an in-memory copy (instant navigation inside the app), and
    //  - a persisted copy in localStorage (instant first paint on reload,
    //    and a fallback when the network is slow or fails).
    // Every call still revalidates from the server after the TTL.
    // ------------------------------------------------------------------
    private static readonly CACHE_PREFIX = 'bhagona_api_cache_v1:';
    private static readonly CACHE_TTL_MS = 2 * 60 * 1000;
    private static readonly MAX_PERSIST_CHARS = 1_000_000;
    private memCache = new Map<string, { at: number; obs: Observable<any> }>();

    /** Synchronously returns the last saved response for a catalog path (or null). */
    getCachedSnapshot(path: string): any {
        try {
            const raw = localStorage.getItem(ApiService.CACHE_PREFIX + this.baseUrl + path);
            return raw ? JSON.parse(raw).data : null;
        } catch {
            return null;
        }
    }

    private persist(url: string, data: any) {
        try {
            const raw = JSON.stringify({ at: Date.now(), data });
            if (raw.length > ApiService.MAX_PERSIST_CHARS) return; // never fill storage with huge payloads
            localStorage.setItem(ApiService.CACHE_PREFIX + url, raw);
        } catch {
            // storage full / disabled - caching is best effort
        }
    }

    private cachedGet(path: string): Observable<any> {
        const url = `${this.baseUrl}${path}`;
        const hit = this.memCache.get(url);
        if (hit && Date.now() - hit.at < ApiService.CACHE_TTL_MS) {
            return hit.obs;
        }

        const obs = this.http.get(url).pipe(
            timeout(20000),
            retry({ count: 2, delay: (_err, attempt) => timer(attempt * 1000) }),
            tap(res => this.persist(url, res)),
            catchError(err => {
                this.memCache.delete(url);
                const stale = this.getCachedSnapshot(path);
                return stale ? of(stale) : throwError(() => err);
            }),
            shareReplay(1)
        );
        this.memCache.set(url, { at: Date.now(), obs });
        return obs;
    }

    getImageUrl(path: string | null): string | null {
        if (typeof path !== 'string') return null;
        path = path.trim();
        // Ignore junk values ("", "undefined", "null") so callers fall back to a default image
        if (!path || path === 'undefined' || path === 'null' || path === 'NaN') return null;
        if (path.startsWith('data:')) return path;
        
        // Fix for hardcoded localhost URLs in database
        if (path.includes('localhost:3000')) {
            return path.replace('http://localhost:3000', this.baseUrl);
        }

        if (path.startsWith('/')) {
            return `${this.baseUrl}${path}`;
        }
        return path;
    }

    getEvents(): Observable<any> {
        return this.cachedGet('/customer/events');
    }

    getEventById(id: any): Observable<any> {
        return this.http.get(`${this.baseUrl}/customer/events/${id}`);
    }

    getServices(): Observable<any> {
        return this.cachedGet('/customer/services');
    }

    getMenuCategories(): Observable<any> {
        return this.cachedGet('/menu-categories');
    }

    getMenuSubcategories(): Observable<any> {
        return this.cachedGet('/menu-subcategories');
    }

    getMenuItems(): Observable<any> {
        return this.cachedGet('/menu-items');
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

    createRazorpayOrder(data: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/razorpay/create-order`, data);
    }

    verifyRazorpayPayment(data: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/razorpay/verify-payment`, data);
    }
}

