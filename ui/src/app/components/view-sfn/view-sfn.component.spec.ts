import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ViewSfnComponent } from "./view-sfn.component";

describe("ViewSfnComponent", () => {
  let component: ViewSfnComponent;
  let fixture: ComponentFixture<ViewSfnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSfnComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewSfnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
