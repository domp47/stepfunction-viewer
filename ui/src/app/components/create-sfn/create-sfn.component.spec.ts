import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CreateSfnComponent } from "./create-sfn.component";

describe("CreateSfnComponent", () => {
  let component: CreateSfnComponent;
  let fixture: ComponentFixture<CreateSfnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSfnComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateSfnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
