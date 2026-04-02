import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface User {
    id: string;
    name: string;
    email?: string;
    mobile?: string;
    role: string;
    token?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();
    private apiUrl = 'http://localhost:3000'; // Match backend port

    constructor(private http: HttpClient) {
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

    loginWithOTP(mobile: string, otp: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, { username: mobile, password: otp }).pipe(
            tap(res => {
                if (res.token) {
                    const user: User = {
                        id: res.user.id,
                        name: res.user.name,
                        email: res.user.email,
                        mobile: res.user.mobile,
                        role: res.user.role,
                        token: res.token
                    };
                    this.setSession(user);
                }
            })
        );
    }

    loginWithEmail(email: string, password: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, { username: email, password: password }).pipe(
            tap(res => {
                if (res.token) {
                    const user: User = {
                        id: res.user.id,
                        name: res.user.name,
                        email: res.user.email,
                        mobile: res.user.mobile,
                        role: res.user.role,
                        token: res.token
                    };
                    this.setSession(user);
                }
            })
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
