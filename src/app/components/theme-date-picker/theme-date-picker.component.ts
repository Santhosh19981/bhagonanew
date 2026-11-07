import {
  AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input,
  OnDestroy, Output, Renderer2, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface CalendarDay {
  date: Date;
  iso: string;
  day: number;
  inMonth: boolean;
  disabled: boolean;
  isToday: boolean;
}

/**
 * Brand-themed date picker.
 * Value format is 'YYYY-MM-DD' (same as <input type="date">), so it is a drop-in replacement:
 *   <app-theme-date-picker [(value)]="eventDate" [min]="minDate"></app-theme-date-picker>
 */
@Component({
  selector: 'app-theme-date-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-date-picker.component.html',
  styleUrl: './theme-date-picker.component.scss'
})
export class ThemeDatePickerComponent implements AfterViewInit, OnDestroy {
  @Input() value: string = '';
  @Input() min: string = '';
  @Input() placeholder: string = 'Select event date';
  @Input() size: 'md' | 'sm' = 'md';
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('trigger', { static: true }) trigger!: ElementRef<HTMLButtonElement>;
  @ViewChild('panel', { static: true }) panel!: ElementRef<HTMLDivElement>;

  readonly weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  readonly monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];

  isOpen = false;
  isSheet = false; // bottom sheet on small screens
  viewYear = new Date().getFullYear();
  viewMonth = new Date().getMonth();
  days: CalendarDay[] = [];
  panelStyle: { [k: string]: string } = {};

  constructor(private renderer: Renderer2, private host: ElementRef) { }

  ngAfterViewInit() {
    // Render the popup at <body> level so parent overflow / backdrop-filter never clip it
    this.renderer.appendChild(document.body, this.panel.nativeElement);
  }

  ngOnDestroy() {
    const el = this.panel?.nativeElement;
    if (el && el.parentNode) el.parentNode.removeChild(el);
    this.setBodyScrollLock(false);
  }

  // ---------------------------------------------------------------- display
  get displayValue(): string {
    const d = this.parse(this.value);
    if (!d) return '';
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  get canGoPrev(): boolean {
    const min = this.parse(this.min);
    if (!min) return true;
    return this.viewYear > min.getFullYear() ||
      (this.viewYear === min.getFullYear() && this.viewMonth > min.getMonth());
  }

  // ---------------------------------------------------------------- open / close
  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    const base = this.parse(this.value) || this.parse(this.min) || new Date();
    this.viewYear = base.getFullYear();
    this.viewMonth = base.getMonth();
    this.buildDays();
    this.isSheet = window.innerWidth < 768;
    this.isOpen = true;
    this.position();
    this.setBodyScrollLock(this.isSheet);
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.setBodyScrollLock(false);
  }

  private setBodyScrollLock(lock: boolean) {
    try {
      document.body.style.overflow = lock ? 'hidden' : '';
    } catch { /* noop */ }
  }

  private position() {
    if (this.isSheet) {
      this.panelStyle = {};
      return;
    }
    const rect = this.trigger.nativeElement.getBoundingClientRect();
    const width = 320;
    const height = 390;
    let left = Math.min(rect.left, window.innerWidth - width - 12);
    left = Math.max(12, left);
    const below = window.innerHeight - rect.bottom;
    const top = below >= height + 12 || rect.top < height + 12
      ? rect.bottom + 8
      : rect.top - height - 8;
    this.panelStyle = { top: `${Math.max(12, top)}px`, left: `${left}px`, width: `${width}px` };
  }

  @HostListener('window:resize')
  @HostListener('window:scroll')
  onViewportChange() {
    if (this.isOpen && !this.isSheet) this.position();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.close();
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.isOpen || this.isSheet) return;
    const target = event.target as Node;
    if (this.host.nativeElement.contains(target) || this.panel.nativeElement.contains(target)) return;
    this.close();
  }

  // ---------------------------------------------------------------- navigation
  prevMonth() {
    if (!this.canGoPrev) return;
    if (this.viewMonth === 0) { this.viewMonth = 11; this.viewYear--; } else { this.viewMonth--; }
    this.buildDays();
  }

  nextMonth() {
    if (this.viewMonth === 11) { this.viewMonth = 0; this.viewYear++; } else { this.viewMonth++; }
    this.buildDays();
  }

  select(day: CalendarDay) {
    if (day.disabled) return;
    this.value = day.iso;
    this.valueChange.emit(this.value);
    this.close();
  }

  selectToday() {
    const today = this.startOfDay(new Date());
    const min = this.parse(this.min);
    if (min && today < min) return;
    this.value = this.toIso(today);
    this.valueChange.emit(this.value);
    this.close();
  }

  clear() {
    this.value = '';
    this.valueChange.emit('');
    this.close();
  }

  trackByIso(_i: number, d: CalendarDay) {
    return d.iso;
  }

  // ---------------------------------------------------------------- calendar grid
  private buildDays() {
    const first = new Date(this.viewYear, this.viewMonth, 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay()); // back to Sunday
    const min = this.parse(this.min);
    const todayIso = this.toIso(new Date());

    const days: CalendarDay[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const iso = this.toIso(date);
      days.push({
        date,
        iso,
        day: date.getDate(),
        inMonth: date.getMonth() === this.viewMonth,
        disabled: !!min && date < min,
        isToday: iso === todayIso
      });
    }
    // Drop a trailing week that belongs entirely to the next month
    if (days.slice(35).every(d => !d.inMonth)) days.length = 35;
    this.days = days;
  }

  // ---------------------------------------------------------------- date utils
  private parse(value: string): Date | null {
    if (!value || typeof value !== 'string') return null;
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return isNaN(d.getTime()) ? null : d;
  }

  private toIso(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
}
