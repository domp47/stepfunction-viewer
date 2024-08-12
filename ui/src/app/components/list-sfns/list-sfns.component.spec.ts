import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ListSfnsComponent } from "./list-sfns.component";

describe("ListSfnsComponent", () => {
  let component: ListSfnsComponent;
  let fixture: ComponentFixture<ListSfnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListSfnsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListSfnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
