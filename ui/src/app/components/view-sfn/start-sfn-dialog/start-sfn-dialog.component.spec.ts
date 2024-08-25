import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StartSfnDialogComponent } from "./start-sfn-dialog.component";

describe("StartSfnDialogComponent", () => {
  let component: StartSfnDialogComponent;
  let fixture: ComponentFixture<StartSfnDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartSfnDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StartSfnDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
