import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ExecutionListItem, ListExecutionsCommand, ListExecutionsCommandOutput, SFNClient } from "@aws-sdk/client-sfn";
import { SfnClientService } from "../../services/sfn-client/sfn-client.service";
import { Subscription } from "rxjs";
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatTableModule } from "@angular/material/table";
import { DatePipe, NgIf, formatNumber } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { StartSfnDialogComponent } from "./start-sfn-dialog/start-sfn-dialog.component";

@Component({
  selector: "app-view-sfn",
  standalone: true,
  imports: [
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    NgIf,
    DatePipe,
  ],
  templateUrl: "./view-sfn.component.html",
  styleUrl: "./view-sfn.component.scss",
})
export class ViewSfnComponent implements OnInit, OnDestroy {
  sfnArn: string = "";

  sfnClientSubscription: Subscription = new Subscription();
  client: SFNClient;

  tableData: ExecutionListItem[] = [];
  displayedColumns: string[] = ["name", "status", "startDate", "stopDate", "duration"];

  constructor(
    private activatedRoute: ActivatedRoute,
    private clientService: SfnClientService,
    public dialog: MatDialog,
    private router: Router,
  ) {
    this.client = clientService.sfnClient.value;
  }

  ngOnInit(): void {
    this.sfnArn = this.activatedRoute.snapshot.params["arn"];

    this.sfnClientSubscription = this.clientService.sfnClient.subscribe((client) => {
      this.client = client;
    });

    this.getExecutionHistory();
  }

  ngOnDestroy(): void {
    this.sfnClientSubscription.unsubscribe();
  }

  async getExecutionHistory(): Promise<void> {
    if (this.sfnArn === "") {
      return;
    }

    const pageSize = 150;
    let nextToken = undefined;

    const executions: ExecutionListItem[] = [];

    do {
      const command: ListExecutionsCommand = new ListExecutionsCommand({
        stateMachineArn: this.sfnArn,
        maxResults: pageSize,
        nextToken: nextToken,
      });
      const response: ListExecutionsCommandOutput = await this.client.send(command);

      executions.push(...(response.executions ?? []));
      nextToken = response.nextToken;
    } while (nextToken !== undefined);

    this.tableData = executions;
  }

  calculateDuration(execution: ExecutionListItem): string {
    if (execution.startDate === undefined || execution.stopDate === undefined) {
      return "-";
    }

    let duration: number = execution.stopDate.getTime() - execution.startDate.getTime();

    const days = formatNumber(Math.floor(duration / (1000 * 60 * 60 * 24)), "en-US", "2.0-0");
    duration = duration % (1000 * 60 * 60 * 24);

    const hours = formatNumber(Math.floor(duration / (1000 * 60 * 60)), "en-US", "2.0-0");
    duration = duration % (1000 * 60 * 60);

    const minutes = formatNumber(Math.floor(duration / (1000 * 60)), "en-US", "2.0-0");
    duration = duration % (1000 * 60);

    const seconds = formatNumber(Math.floor(duration / 1000), "en-US", "2.0-0");
    const milliseconds = formatNumber(duration % 1000, "en-US", "3.0-0");

    return `${days}:${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  startExecution(): void {
    this.dialog.open(StartSfnDialogComponent, { data: this.sfnArn });
  }

  viewExecution(execution: ExecutionListItem): void {
    this.router.navigate(["/view-execution", execution.executionArn]);
  }
}
