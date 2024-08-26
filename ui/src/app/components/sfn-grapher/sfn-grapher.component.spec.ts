import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SfnGrapherComponent } from "./sfn-grapher.component";

describe("SfnGrapherComponent", () => {
  let component: SfnGrapherComponent;
  let fixture: ComponentFixture<SfnGrapherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SfnGrapherComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SfnGrapherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
