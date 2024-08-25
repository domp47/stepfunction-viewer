import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { SfnClientService } from "../../services/sfn-client/sfn-client.service";
import { Subscription } from "rxjs";
import {
  DescribeExecutionCommand,
  DescribeStateMachineCommand,
  DescribeStateMachineForExecutionCommand,
  GetExecutionHistoryCommand,
  HistoryEvent,
  SFNClient,
} from "@aws-sdk/client-sfn";
import { SfnGrapherComponent } from "./sfn-grapher/sfn-grapher.component";
import { StepFunction } from "../../services/step-function/step-function";

@Component({
  selector: "app-view-execution",
  standalone: true,
  imports: [SfnGrapherComponent],
  templateUrl: "./view-execution.component.html",
  styleUrl: "./view-execution.component.scss",
})
export class ViewExecutionComponent implements OnInit, OnDestroy {
  executionArn: string = "";

  sfnClientSubscription: Subscription = new Subscription();
  client: SFNClient;

  sfnDefinition: StepFunction | undefined = undefined;

  constructor(
    private activatedRoute: ActivatedRoute,
    private clientService: SfnClientService,
  ) {
    this.client = clientService.sfnClient.value;
  }

  async ngOnInit(): Promise<void> {
    this.executionArn = this.activatedRoute.snapshot.params["arn"];

    this.sfnClientSubscription = this.clientService.sfnClient.subscribe((client) => {
      this.client = client;
    });

    const execution = await this.getExecutionDetails();
    this.sfnDefinition = await this.getSfnDefinition();
    console.log(execution);
    // console.log(definition);
  }

  async getSfnDefinition(): Promise<any> {
    let command = new DescribeStateMachineForExecutionCommand({
      executionArn: this.executionArn,
      includedData: "ALL_DATA",
    });

    const response = await this.client.send(command);

    return JSON.parse(response.definition ?? "{}");
  }

  async getExecutionDetails(): Promise<HistoryEvent[]> {
    const pageSize = 150;
    let nextToken = undefined;

    const executionData: HistoryEvent[] = [];

    do {
      const command: GetExecutionHistoryCommand = new GetExecutionHistoryCommand({
        executionArn: this.executionArn,
        includeExecutionData: true,
        maxResults: pageSize,
        nextToken: nextToken,
        reverseOrder: false,
      });
      const response = await this.client.send(command);

      executionData.push(...(response.events ?? []));
      nextToken = response.nextToken;
    } while (nextToken !== undefined);

    return executionData;
  }

  ngOnDestroy(): void {
    this.sfnClientSubscription.unsubscribe();
  }
}
