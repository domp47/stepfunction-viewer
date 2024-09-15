import { Component, EventEmitter, Inject, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { SfnClientService } from "../../services/sfn-client/sfn-client.service";
import { Subscription } from "rxjs";
import {
  DescribeStateMachineForExecutionCommand,
  GetExecutionHistoryCommand,
  HistoryEvent,
  HistoryEventType,
  SFNClient,
} from "@aws-sdk/client-sfn";
import { SfnGrapherComponent } from "../sfn-grapher/sfn-grapher.component";
import { StepFunction } from "../../services/step-function/step-function";
import { parseExecution } from "../../services/step-function/parse-execution";
import {
  StepFunctionMapStepExecutionData,
  StepFunctionStepExecutionData,
  StepFunctionStepStatus,
  compileStepData,
} from "../../services/step-function/compile-step-data";
import { CommonModule, DOCUMENT } from "@angular/common";

@Component({
  selector: "app-view-execution",
  standalone: true,
  imports: [SfnGrapherComponent, CommonModule],
  templateUrl: "./view-execution.component.html",
  styleUrl: "./view-execution.component.scss",
})
export class ViewExecutionComponent implements OnInit, OnDestroy {
  executionArn: string = "";

  sfnClientSubscription: Subscription = new Subscription();
  client: SFNClient;

  sfnDefinition: StepFunction | undefined = undefined;
  sfnDefinitionString: string | undefined = undefined;

  stepData: (StepFunctionMapStepExecutionData | StepFunctionStepExecutionData)[] = [];
  stepClickedEmitter = new EventEmitter<StepFunctionMapStepExecutionData | StepFunctionStepExecutionData>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private clientService: SfnClientService,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.client = clientService.sfnClient.value;
  }

  async ngOnInit(): Promise<void> {
    this.executionArn = this.activatedRoute.snapshot.params["arn"];

    this.sfnClientSubscription = this.clientService.sfnClient.subscribe((client) => {
      this.client = client;
    });

    this.sfnDefinition = await this.getSfnDefinition();
  }

  async getSfnDefinition(): Promise<any> {
    let command = new DescribeStateMachineForExecutionCommand({
      executionArn: this.executionArn,
      includedData: "ALL_DATA",
    });

    const response = await this.client.send(command);

    this.sfnDefinitionString = response.definition ?? "";
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

  colorSteps(stepData: StepFunctionMapStepExecutionData | StepFunctionStepExecutionData) {
    const element = this.document.getElementById(`${stepData.step}-step`);
    if (element === null) {
      console.error(`Element not found for step ${stepData.step}`);
      return;
    }

    const outcomeClasses: Record<string, string> = {
      [StepFunctionStepStatus.SUCCEEDED]: "step-succeeded",
      [StepFunctionStepStatus.FAILED]: "step-failed",
      [StepFunctionStepStatus.RUNNING]: "step-running",
      [StepFunctionStepStatus.ABORTED]: "step-aborted",
    };

    // Clear em in case they were set before
    for (const key in outcomeClasses) {
      element.classList.remove(outcomeClasses[key]);
    }

    element.classList.add(outcomeClasses[stepData.status]);
  }

  async onGraphLoaded(): Promise<void> {
    const execution = await this.getExecutionDetails();

    const executionStartTime =
      execution.find((event) => event.type === HistoryEventType.ExecutionStarted)?.timestamp ?? new Date();

    const sfnItems = parseExecution(execution);
    const stepData = compileStepData(sfnItems, this.sfnDefinitionString ?? "", executionStartTime);

    for (const step of stepData) {
      this.colorSteps(step);
    }
    console.log(stepData);
    this.stepData = stepData;
  }

  stepClicked(stepName: string): void {
    const step = this.stepData.find((stepData) => stepData.step === stepName);
    if (step === undefined) {
      console.error(`Step ${stepName} not found`);
      return;
    }

    this.stepClickedEmitter.emit(step);
  }

  ngOnDestroy(): void {
    this.sfnClientSubscription.unsubscribe();
  }
}
