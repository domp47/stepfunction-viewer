import { Component } from "@angular/core";
import { FormGroup, FormControl, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  SFNClient,
  ValidateStateMachineDefinitionCommand,
  DescribeStateMachineCommand,
  UpdateStateMachineCommand,
} from "@aws-sdk/client-sfn";
import { Subscription, debounceTime } from "rxjs";
import { SfnClientService } from "../../services/sfn-client/sfn-client.service";
import { AlertComponent, AlertInfo, AlertType } from "../alert/alert.component";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { StepFunction } from "../../services/step-function/step-function";
import { SfnGrapherComponent } from "../sfn-grapher/sfn-grapher.component";

@Component({
  selector: "app-edit-sfn",
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
  templateUrl: "./edit-sfn.component.html",
  styleUrl: "./edit-sfn.component.scss",
})
export class EditSfnComponent {
  form = new FormGroup({
    sfnBody: new FormControl<string>(""),
  });

  alertInfo: AlertInfo | undefined;

  private client: SFNClient;
  private clientSubscription: Subscription = new Subscription();
  private formChangeSubscription: Subscription = new Subscription();

  private sfnArn: string = "";
  sfnName: string = "";
  sfnDefinition: StepFunction | undefined = undefined;

  constructor(
    private sfnClientService: SfnClientService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.client = sfnClientService.sfnClient.value;
  }

  ngOnInit(): void {
    this.clientSubscription = this.sfnClientService.sfnClient.subscribe((client) => {
      this.client = client;
    });

    this.form.valueChanges.pipe(debounceTime(100)).subscribe(() => this.validateAndUpdateSfn());

    this.sfnArn = this.activatedRoute.snapshot.params["arn"];
    this.getSfn();
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

  async getSfn(): Promise<void> {
    const command = new DescribeStateMachineCommand({
      stateMachineArn: this.sfnArn,
      includedData: "METADATA_ONLY",
    });

    const response = await this.client.send(command);

    this.form.setValue({ sfnBody: response.definition ?? "" });
    this.sfnDefinition = JSON.parse(response.definition ?? "{}");
    this.sfnName = response.name ?? "";
  }

  async updateSfn(): Promise<void> {
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

    const command = new UpdateStateMachineCommand({
      stateMachineArn: this.sfnArn,
      definition: sfnBody,
    });
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
