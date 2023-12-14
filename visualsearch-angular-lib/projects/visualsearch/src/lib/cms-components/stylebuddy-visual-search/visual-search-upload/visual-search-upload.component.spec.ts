import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualSearchUploadComponent } from './visual-search-upload.component';

describe('VisualSearchUploadComponent', () => {
  let component: VisualSearchUploadComponent;
  let fixture: ComponentFixture<VisualSearchUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisualSearchUploadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualSearchUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
