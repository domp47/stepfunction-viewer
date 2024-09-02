import { output } from "@angular/core";
import { HistoryEvent, HistoryEventType } from "@aws-sdk/client-sfn";

export enum StepFunctionStepStatus {
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED",
  TIMED_OUT = "TIMED_OUT",
  ABORTED = "ABORTED",
  RUNNING = "RUNNING",
}

export interface StepFunctionStepExecutionData {
  step: string;
  order: number;
  status: StepFunctionStepStatus;
  input: {
    input: string;
    inputPath: string;
    parameters: string;
    taskInput: string;
  };
  output: {
    taskResult: string;
    resultSelector: string;
    resultPath: string;
    outputPath: string;
    output: string;
  };
  details: {
    status: string;
    type: string;
    timeoutSeconds: number;
    heartbeatSeconds: number;
    startedAfter: string;
    duration: string;
  };
  events: HistoryEvent[];
}

function calculateStepData(stepName: string, stepEvents: HistoryEvent[]): StepFunctionStepExecutionData {
  const smallestId = Math.min.apply(stepEvents.map((event) => event.id ?? Number.MAX_SAFE_INTEGER));

  const stepData: StepFunctionStepExecutionData = {
    step: stepName,
    order: smallestId,
    status: StepFunctionStepStatus.SUCCEEDED,
    input: {
      input: "",
      inputPath: "",
      parameters: "",
      taskInput: "",
    },
    output: {
      taskResult: "",
      resultSelector: "",
      resultPath: "",
      outputPath: "",
      output: "",
    },
    details: {
      status: "",
      type: "",
      timeoutSeconds: 0,
      heartbeatSeconds: 0,
      startedAfter: "",
      duration: "",
    },
    events: stepEvents,
  };

  return stepData;
}

function getDetailsFromStep(step: HistoryEvent): any {
  for (const key in step) {
    if (key.endsWith("EventDetails") && (step as any)[key] !== undefined) {
      return (step as any)[key];
    }
  }

  return undefined;
}

interface GetStepsByNamesResult {
  eventsByStep: Record<string, HistoryEvent[]>;
  awsEvents: HistoryEvent[];
}

function getStepsByNames(history: HistoryEvent[]): GetStepsByNamesResult {
  const eventsByStep: Record<string, HistoryEvent[]> = {};
  const awsEvents: HistoryEvent[] = [];

  for (const event of history) {
    const stepType = event.type;
    // This shouldn't happen, but just cause typescript...
    if (stepType === undefined) {
      continue;
    }

    const details = getDetailsFromStep(event);

    let stepName: string | undefined = undefined;
    if (details !== undefined && "name" in (details as any)) {
      stepName = (details as any).name;
    }

    if (stepName === undefined) {
      awsEvents.push(event);
    } else {
      if (eventsByStep[stepName] === undefined) {
        eventsByStep[stepName] = [];
      }
      eventsByStep[stepName].push(event);
    }
  }

  return { eventsByStep, awsEvents };
}

export interface StepFunctionExecutionDataResult {
  executionSteps: StepFunctionStepExecutionData[];
  awsInformation: HistoryEvent[];
}

export function parseExecution(history: HistoryEvent[]): StepFunctionExecutionDataResult {
  const executionSteps: StepFunctionStepExecutionData[] = [];

  console.log(history);
  const { eventsByStep, awsEvents } = getStepsByNames(history);
  console.log(eventsByStep);
  console.log(awsEvents);

  // TODO use the Id's to build a DAG of the steps. Then Crawl the DAG to get the order of the steps, using started as the entry point.
  // Then use either Failed, Aborted, Exited, TimedOut, or Succeeded as the exit point.
  for (const [stepName, stepEvents] of Object.entries(eventsByStep)) {
    executionSteps.push(calculateStepData(stepName, stepEvents));
  }

  return { executionSteps, awsInformation: awsEvents };
}
