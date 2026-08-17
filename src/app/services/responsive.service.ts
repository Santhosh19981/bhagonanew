import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {
  private isMobileSubject = new BehaviorSubject<boolean>(false);
  public isMobile$ = this.isMobileSubject.asObservable();

  constructor() {
    if (typeof window !== 'undefined') {
      this.checkWidth();
      window.addEventListener('resize', () => this.checkWidth());
    }
  }

  public get isMobile(): boolean {
    return this.isMobileSubject.value;
  }

  private checkWidth() {
    this.isMobileSubject.next(window.innerWidth < 768);
  }
}
