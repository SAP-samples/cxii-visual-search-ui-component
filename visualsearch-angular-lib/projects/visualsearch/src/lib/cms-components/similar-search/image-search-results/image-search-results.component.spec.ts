import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageSearchResultsComponent } from './image-search-results.component';

describe('ImageSearchResultsComponent', () => {
  let component: ImageSearchResultsComponent;
  let fixture: ComponentFixture<ImageSearchResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageSearchResultsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageSearchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
