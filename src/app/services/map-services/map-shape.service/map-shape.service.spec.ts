import { TestBed } from '@angular/core/testing';

import { MapShapeService } from './map-shape.service';

describe('MapShapeService', () => {
  let service: MapShapeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapShapeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
