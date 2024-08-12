import { TestBed } from "@angular/core/testing";

import { SfnClientService } from "./sfn-client.service";

describe("SfnClientService", () => {
  let service: SfnClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SfnClientService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
