import { Injectable } from "@angular/core";
import { SFNClient } from "@aws-sdk/client-sfn";
import { BehaviorSubject } from "rxjs";
import { AwsCredentialIdentity } from "@aws-sdk/types";
import { ConfigService } from "../config-service/config-service.service";

@Injectable({
  providedIn: "root",
})
export class SfnClientService {
  sfnClient = new BehaviorSubject<SFNClient>(new SFNClient());

  private dummyCredentials: AwsCredentialIdentity = { accessKeyId: "abc", secretAccessKey: "123" };

  constructor(configService: ConfigService) {
    configService.sfnApiEndpoint.subscribe((endpoint) => {
      this.sfnClient.next(
        new SFNClient({
          endpoint: endpoint,
          region: configService.awsRegion.value,
          credentials: this.dummyCredentials,
        }),
      );
    });

    configService.awsRegion.subscribe((region) => {
      this.sfnClient.next(
        new SFNClient({
          endpoint: configService.sfnApiEndpoint.value,
          region: region,
          credentials: this.dummyCredentials,
        }),
      );
    });
  }
}
