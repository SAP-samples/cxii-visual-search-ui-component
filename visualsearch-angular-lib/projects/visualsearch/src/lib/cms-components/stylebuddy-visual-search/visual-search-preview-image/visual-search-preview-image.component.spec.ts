import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualSearchPreviewImageComponent } from './visual-search-preview-image.component';

describe('VisualSearchPreviewImageComponent', () => {
  let component: VisualSearchPreviewImageComponent;
  let fixture: ComponentFixture<VisualSearchPreviewImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisualSearchPreviewImageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualSearchPreviewImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
