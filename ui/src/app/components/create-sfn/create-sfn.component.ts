import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { SfnClientService } from "../../services/sfn-client/sfn-client.service";
import { Subscription, debounceTime } from "rxjs";
import { CreateStateMachineCommand, CreateStateMachineInput, SFNClient } from "@aws-sdk/client-sfn";
import { Router } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { AlertComponent, AlertInfo, AlertType } from "../alert/alert.component";
import { StepFunction } from "../../services/step-function/step-function";
import { SfnGrapherComponent } from "../sfn-grapher/sfn-grapher.component";

// TODO - Use highlight library: https://www.npmjs.com/package/ngx-highlightjs

@Component({
  selector: "app-create-sfn",
  standalone: true,
  imports: [
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    AlertComponent,
    SfnGrapherComponent,
  ],
  templateUrl: "./create-sfn.component.html",
  styleUrl: "./create-sfn.component.scss",
})
export class CreateSfnComponent implements OnInit, OnDestroy {
  form = new FormGroup({
    sfnBody: new FormControl<string>(""),
    sfnName: new FormControl<string>(""),
  });

  sfnDefinition: StepFunction | undefined = undefined;

  alertInfo: AlertInfo | undefined;

  private client: SFNClient;
  private clientSubscription: Subscription = new Subscription();
  private formChangeSubscription: Subscription = new Subscription();

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

    this.formChangeSubscription = this.form.valueChanges
      .pipe(debounceTime(100))
      .subscribe(() => this.validateAndUpdateSfn());
  }

  ngOnDestroy(): void {
    this.clientSubscription.unsubscribe();
    this.formChangeSubscription.unsubscribe();
  }

  async validateAndUpdateSfn(): Promise<void> {
    // AWS Local SFN doesn't support this API endpoint yet :'(
    // const command = new ValidateStateMachineDefinitionCommand({definition: this.form.value.sfnBody ?? "{}"});
    // const response = await this.client.send(command);

    // if (response.result !== "OK") {
    //   let errorMessage = "";
    //   for (const diagnostic of response.diagnostics ?? []) {
    //     errorMessage += `(${diagnostic.severity}) ${diagnostic.message}<br>`;
    //   }

    //   this.alertInfo = {
    //     type: AlertType.Error,
    //     title: `Error: Invalid State Machine Definition`,
    //     message: errorMessage,
    //     closeable: true,
    //   };
    //   return;
    // }

    this.sfnDefinition = JSON.parse(this.form.value.sfnBody ?? "{}");
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
      return;
    }

    this.router.navigate(["/list"]);
  }
}
