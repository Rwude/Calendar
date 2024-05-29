import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSchedulerComponent } from './time-scheduler.component';

describe('TimeSchedulerComponent', () => {
  let component: TimeSchedulerComponent;
  let fixture: ComponentFixture<TimeSchedulerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeSchedulerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimeSchedulerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
