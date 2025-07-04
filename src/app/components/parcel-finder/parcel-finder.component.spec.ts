import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParcelFinderComponent } from './parcel-finder.component';

describe('ParcelFinderComponent', () => {
  let component: ParcelFinderComponent;
  let fixture: ComponentFixture<ParcelFinderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParcelFinderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParcelFinderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
