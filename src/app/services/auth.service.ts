import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

export interface User {
    id: string;
    name: string;
    email?: string;
    mobile?: string;
    role: 'user' | 'admin';
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor() {
        const savedUser = localStorage.getItem('bhagona_user');
        if (savedUser) {
            this.currentUserSubject.next(JSON.parse(savedUser));
        }
    }

    public get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    public isLoggedIn(): boolean {
        return !!this.currentUserSubject.value;
    }

    loginWithOTP(mobile: string, otp: string): Observable<User> {
        // Mocking an API call
        const mockUser: User = {
            id: '1',
            name: 'User ' + mobile.slice(-4),
            mobile: mobile,
            role: 'user'
        };

        return of(mockUser).pipe(
            delay(1500),
            tap(user => this.setSession(user))
        );
    }

    loginWithEmail(email: string, password: string): Observable<User> {
        // Mocking an API call
        const mockUser: User = {
            id: '2',
            name: email.split('@')[0],
            email: email,
            role: 'user'
        };

        return of(mockUser).pipe(
            delay(1500),
            tap(user => this.setSession(user))
        );
    }

    logout() {
        localStorage.removeItem('bhagona_user');
        this.currentUserSubject.next(null);
    }

    private setSession(user: User) {
        localStorage.setItem('bhagona_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
    }
}
