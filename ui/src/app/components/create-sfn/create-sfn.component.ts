import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { SfnClientService } from "../../services/sfn-client/sfn-client.service";
import { Subscription } from "rxjs";
import { CreateStateMachineCommand, CreateStateMachineInput, SFNClient } from "@aws-sdk/client-sfn";
import { Router } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { AlertComponent, AlertInfo, AlertType } from "../alert/alert.component";

// TODO - Use highlight library: https://www.npmjs.com/package/ngx-highlightjs

@Component({
  selector: "app-create-sfn",
  standalone: true,
  imports: [MatFormFieldModule, ReactiveFormsModule, MatInputModule, MatIconModule, MatButtonModule, AlertComponent],
  templateUrl: "./create-sfn.component.html",
  styleUrl: "./create-sfn.component.scss",
})
export class CreateSfnComponent implements OnInit, OnDestroy {
  form = new FormGroup({
    sfnBody: new FormControl<string>(""),
    sfnName: new FormControl<string>(""),
  });

  alertInfo: AlertInfo | undefined;

  private client: SFNClient;
  private clientSubscription: Subscription = new Subscription();

  constructor(
    private sfnClientService: SfnClientService,
    private router: Router,
  ) {
    this.client = sfnClientService.sfnClient.value;
  }

  ngOnInit(): void {
    this.clientSubscription = this.sfnClientService.sfnClient.subscribe((client) => {
      this.client = client;
    });
  }

  ngOnDestroy(): void {
    this.clientSubscription.unsubscribe();
  }

  async createSfn(): Promise<void> {
    const sfnBody = this.form.value.sfnBody;
    if (sfnBody === "" || sfnBody === null || sfnBody === undefined) {
      this.alertInfo = {
        type: AlertType.Error,
        title: "Error",
        message: "State machine definition cannot be empty",
        closeable: true,
      };
      return;
    }

    const sfnName = this.form.value.sfnName;
    if (sfnName === "" || sfnName === null || sfnName === undefined) {
      this.alertInfo = {
        type: AlertType.Error,
        title: "Error",
        message: "State machine name cannot be empty",
        closeable: true,
      };
      return;
    }

    const input: CreateStateMachineInput = {
      definition: sfnBody,
      name: sfnName,
      roleArn: "arn:aws:iam::123456789012:role/service-role/StatesExecutionRole-us-east-1",
    };

    const command = new CreateStateMachineCommand(input);
    try {
      await this.client.send(command);
    } catch (error: any) {
      this.alertInfo = {
        type: AlertType.Error,
        title: `Error: ${error.name}`,
        message: error.message,
        closeable: true,
      };
    }

    this.router.navigate(["/list"]);
  }
}
