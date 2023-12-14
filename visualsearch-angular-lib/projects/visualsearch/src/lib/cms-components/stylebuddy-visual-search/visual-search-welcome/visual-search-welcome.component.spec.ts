import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualSearchWelcomeComponent } from './visual-search-welcome.component';

describe('VisualSearchWelcomeComponent', () => {
  let component: VisualSearchWelcomeComponent;
  let fixture: ComponentFixture<VisualSearchWelcomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisualSearchWelcomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualSearchWelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
