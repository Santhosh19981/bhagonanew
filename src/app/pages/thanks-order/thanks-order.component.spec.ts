import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThanksOrderComponent } from './thanks-order.component';

describe('ThanksOrderComponent', () => {
  let component: ThanksOrderComponent;
  let fixture: ComponentFixture<ThanksOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThanksOrderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThanksOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
