import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, firstValueFrom } from "rxjs";

const defaults = {
  api: {
    value: "http://localhost:8083",
    storageKey: "sfnApi",
  },
  region: {
    value: "us-east-1",
    storageKey: "awsRegion",
  },
};

@Injectable({
  providedIn: "root",
})
export class ConfigService {
  public sfnApiEndpoint = new BehaviorSubject<string>(defaults.api.value);
  public awsRegion = new BehaviorSubject<string>(defaults.region.value);

  constructor() {
    const endpoint = localStorage.getItem(defaults.api.storageKey);
    this.sfnApiEndpoint.next(endpoint ?? defaults.api.value);

    const region = localStorage.getItem(defaults.region.storageKey);
    this.awsRegion.next(region ?? defaults.region.value);
  }

  setSfnEndpoint(newEndpoint: string) {
    this.sfnApiEndpoint.next(newEndpoint);
    localStorage.setItem(defaults.api.storageKey, newEndpoint);
  }

  setAwsRegion(newRegion: string) {
    this.awsRegion.next(newRegion);
    localStorage.setItem(defaults.region.storageKey, newRegion);
  }
}
