import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupEventPreviewComponent } from './group-event-preview.component';

describe('GroupEventPreviewComponent', () => {
  let component: GroupEventPreviewComponent;
  let fixture: ComponentFixture<GroupEventPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GroupEventPreviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GroupEventPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
