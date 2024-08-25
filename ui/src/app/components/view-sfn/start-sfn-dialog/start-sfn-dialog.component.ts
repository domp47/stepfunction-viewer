import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { NgFor, NgIf } from "@angular/common";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { AlertComponent, AlertInfo, AlertType } from "../../alert/alert.component";
import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";
import { Subscription } from "rxjs";
import { SfnClientService } from "../../../services/sfn-client/sfn-client.service";
import { MatCheckboxModule } from "@angular/material/checkbox";

@Component({
  selector: "app-start-sfn-dialog",
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    NgFor,
    NgIf,
    MatFormFieldModule,
    AlertComponent,
    MatCheckboxModule,
  ],
  templateUrl: "./start-sfn-dialog.component.html",
  styleUrl: "./start-sfn-dialog.component.scss",
})
export class StartSfnDialogComponent implements OnInit, OnDestroy {
  stateMachineArn: string;
  errorMessage: string | undefined;

  client: SFNClient;
  clientSubscription: Subscription = new Subscription();

  alertInfo: AlertInfo | undefined;

  form = new FormGroup({
    input: new FormControl<string>("{}"),
    newTab: new FormControl<boolean>(false),
  });

  constructor(
    public dialogRef: MatDialogRef<StartSfnDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string,
    private sfnClientService: SfnClientService,
  ) {
    this.stateMachineArn = data;
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

  formatInput(): void {
    const originalInput = this.form.value.input;
    if (originalInput === "" || originalInput === undefined || originalInput === null) {
      return;
    }

    try {
      const input = JSON.parse(originalInput);
      this.form.controls.input.setValue(JSON.stringify(input, null, 2));
      this.errorMessage = undefined;
    } catch (e: any) {
      console.error(e);
      this.errorMessage = `Error Formatting JSON: ${e.message}`;
    }
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  async onSaveClick(): Promise<void> {
    const command = new StartExecutionCommand({
      stateMachineArn: this.stateMachineArn,
      input: this.form.value.input ?? "{}",
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

    this.dialogRef.close();
    // TODO redirect to execution page
  }
}
