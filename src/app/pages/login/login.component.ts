import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
    loginMode: 'otp' | 'email' = 'otp';
    mobileNumber: string = '';
    otpSent: boolean = false;
    otpValue: string = '';
    emailValue: string = '';
    passwordValue: string = '';
    isLoading: boolean = false;
    errorMessage: string = '';
    returnUrl: string = '/home';

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        // Get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';

        // If already logged in, redirect
        if (this.authService.isLoggedIn()) {
            this.router.navigate([this.returnUrl]);
        }
    }

    setMode(mode: 'otp' | 'email') {
        this.loginMode = mode;
        this.errorMessage = '';
    }

    onMobileInput(event: any) {
        const input = event.target as HTMLInputElement;
        let value = input.value.replace(/[^0-9]/g, '');
        if (value.length > 10) {
            value = value.slice(0, 10);
        }
        this.mobileNumber = value;
        input.value = value;
    }

    sendOTP() {
        if (this.mobileNumber.length === 10) {
            this.isLoading = true;
            // Simulate API call
            setTimeout(() => {
                this.isLoading = false;
                this.otpSent = true;
                this.errorMessage = '';
            }, 1000);
        } else {
            this.errorMessage = 'Please enter a valid 10-digit mobile number.';
        }
    }

    verifyOTP() {
        if (this.otpValue.length === 4) {
            this.isLoading = true;
            this.authService.loginWithOTP(this.mobileNumber, this.otpValue).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.router.navigateByUrl(this.returnUrl);
                },
                error: (err) => {
                    this.isLoading = false;
                    this.errorMessage = 'Invalid OTP. Please try again.';
                }
            });
        } else {
            this.errorMessage = 'Please enter the 4-digit OTP.';
        }
    }

    loginWithEmail() {
        if (this.emailValue && this.passwordValue) {
            this.isLoading = true;
            this.authService.loginWithEmail(this.emailValue, this.passwordValue).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.router.navigateByUrl(this.returnUrl);
                },
                error: (err) => {
                    this.isLoading = false;
                    this.errorMessage = 'Invalid credentials. Please try again.';
                }
            });
        } else {
            this.errorMessage = 'Please fill in all fields.';
        }
    }
}
