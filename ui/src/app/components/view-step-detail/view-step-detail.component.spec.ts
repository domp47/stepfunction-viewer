import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ViewStepDetailComponent } from "./view-step-detail.component";

describe("ViewStepDetailComponent", () => {
  let component: ViewStepDetailComponent;
  let fixture: ComponentFixture<ViewStepDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewStepDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewStepDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
