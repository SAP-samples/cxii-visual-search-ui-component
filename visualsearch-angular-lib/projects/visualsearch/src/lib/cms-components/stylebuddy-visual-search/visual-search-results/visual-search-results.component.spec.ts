import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualSearchResultsComponent } from './visual-search-results.component';

describe('VisualSearchResultsComponent', () => {
  let component: VisualSearchResultsComponent;
  let fixture: ComponentFixture<VisualSearchResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisualSearchResultsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualSearchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
