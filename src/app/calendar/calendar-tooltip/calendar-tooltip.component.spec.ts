import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarTooltipComponent } from './calendar-tooltip.component';

describe('CalendarTooltipComponent', () => {
  let component: CalendarTooltipComponent;
  let fixture: ComponentFixture<CalendarTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalendarTooltipComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CalendarTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
