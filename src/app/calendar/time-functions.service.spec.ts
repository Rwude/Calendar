import { TestBed } from '@angular/core/testing';

import { TimeFunctionsService } from './time-functions.service';

describe('TimeFunctionsService', () => {
  let service: TimeFunctionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeFunctionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
