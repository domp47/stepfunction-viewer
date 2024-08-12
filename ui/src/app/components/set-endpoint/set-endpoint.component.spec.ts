import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SetEndpointComponent } from "./set-endpoint.component";

describe("SetEndpointComponent", () => {
  let component: SetEndpointComponent;
  let fixture: ComponentFixture<SetEndpointComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetEndpointComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SetEndpointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
