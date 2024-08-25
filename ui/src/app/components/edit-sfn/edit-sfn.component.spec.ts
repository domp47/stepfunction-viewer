import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EditSfnComponent } from "./edit-sfn.component";

describe("EditSfnComponent", () => {
  let component: EditSfnComponent;
  let fixture: ComponentFixture<EditSfnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSfnComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditSfnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
