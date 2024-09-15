import { HistoryEvent, HistoryEventType } from "@aws-sdk/client-sfn";
import { SfnStepItem } from "./parse-execution";

export enum StepFunctionStepStatus {
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED",
  TIMED_OUT = "TIMED_OUT",
  ABORTED = "ABORTED",
  RUNNING = "RUNNING",
}

export interface BaseStepFunctionStepExecutionData {
  stepType: string;
}

export interface StepFunctionMapStepExecutionData extends BaseStepFunctionStepExecutionData {
  step: string;
  order: number;
  status: StepFunctionStepStatus;
  definition: string;
  input: {
    input: string;
    inputPath: string;
    itemsPath: string;
  };
  output: {
    taskResult: string;
    resultSelector: string;
    resultPath: string;
    outputPath: string;
    output: string;
  };
  details: {
    type: string;
    startedAfter: string;
    duration: string;
    mapRunArn: string;
  };
  events: HistoryEvent[];
}

export interface StepFunctionStepExecutionData extends BaseStepFunctionStepExecutionData {
  step: string;
  order: number;
  status: StepFunctionStepStatus;
  definition: string;
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
    type: string;
    timeoutSeconds?: number;
    heartbeatSeconds?: number;
    startedAfter: string;
    duration: string;
  };
  events: HistoryEvent[];
}

function formatTimeDelta(delta: number): string {
  const hours = Math.floor(delta / (1000 * 60 * 60));
  delta -= hours * (1000 * 60 * 60);

  const minutes = Math.floor(delta / (1000 * 60));
  delta -= minutes * (1000 * 60);

  const seconds = Math.floor(delta / 1000);
  const ms = delta - seconds * 1000;

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
}

function getDataForFlowStep(
  event: SfnStepItem,
  stepDefs: Record<string, any>,
  sfnExecutionTime: Date,
): StepFunctionStepExecutionData {
  const enteredEvent = event.stepStart;
  const exitedEvent = event.events.length > 0 ? event.events[event.events.length - 1] : undefined;
  let output = "";

  let result = StepFunctionStepStatus.RUNNING;
  if (exitedEvent && exitedEvent.type?.endsWith("Exited")) {
    result = StepFunctionStepStatus.SUCCEEDED;
    output = exitedEvent.stateExitedEventDetails?.output ?? "";
  } else if (exitedEvent && exitedEvent.type?.endsWith("Failed")) {
    result = StepFunctionStepStatus.FAILED;
  } else if (exitedEvent && exitedEvent.type?.endsWith("TimedOut")) {
    result = StepFunctionStepStatus.TIMED_OUT;
  } else if (exitedEvent && exitedEvent.type?.endsWith("Aborted")) {
    result = StepFunctionStepStatus.ABORTED;
  }

  let stepDef = undefined;
  let defStr = "{}";
  if (stepDefs.hasOwnProperty(enteredEvent.stateEnteredEventDetails?.name ?? "")) {
    stepDef = stepDefs[enteredEvent.stateEnteredEventDetails?.name ?? ""];
    defStr = JSON.stringify(stepDef);
  }

  const timeStartAfter = (enteredEvent.timestamp ?? sfnExecutionTime).getTime() - sfnExecutionTime.getTime();

  return {
    stepType: "flow",
    step: enteredEvent.stateEnteredEventDetails?.name ?? "",
    order: event.stepNumber,
    status: result,
    definition: defStr,
    input: {
      input: enteredEvent.stateEnteredEventDetails?.input ?? "",
      inputPath: stepDef?.InputPath ?? "",
      parameters: stepDef?.Parameters ?? "",
      taskInput: "",
    },
    output: {
      taskResult: "",
      resultSelector: stepDef?.ResultSelector ?? "",
      resultPath: stepDef?.ResultPath ?? "",
      outputPath: stepDef?.OutputPath ?? "",
      output: output,
    },
    details: {
      type: stepDef?.Type ?? "",
      startedAfter: formatTimeDelta(timeStartAfter),
      duration: "0",
    },
    events: event.events,
  };
}

function getDataForFlowWithDurationStep(
  event: SfnStepItem,
  stepDefs: Record<string, any>,
  sfnExecutionTime: Date,
): StepFunctionStepExecutionData {
  const enteredEvent = event.stepStart;
  const exitedEvent = event.events.length > 0 ? event.events[event.events.length - 1] : undefined;

  let duration = "0";
  if (exitedEvent) {
    duration = formatTimeDelta(
      (exitedEvent.timestamp ?? sfnExecutionTime).getTime() - (enteredEvent.timestamp ?? sfnExecutionTime).getTime(),
    );
  }

  const data = getDataForFlowStep(event, stepDefs, sfnExecutionTime);
  data.details.duration = duration;

  return data;
}

function getDataForMapStep(
  event: SfnStepItem,
  stepDefs: Record<string, any>,
  sfnExecutionTime: Date,
): StepFunctionMapStepExecutionData {
  const enteredEvent = event.stepStart;
  const exitedEvent = event.events.length > 0 ? event.events[event.events.length - 1] : undefined;
  let output = "";

  let result = StepFunctionStepStatus.RUNNING;
  if (exitedEvent && exitedEvent.type?.endsWith("Exited")) {
    result = StepFunctionStepStatus.SUCCEEDED;
    output = exitedEvent.stateExitedEventDetails?.output ?? "";
  } else if (exitedEvent && exitedEvent.type?.endsWith("Failed")) {
    result = StepFunctionStepStatus.FAILED;
  } else if (exitedEvent && exitedEvent.type?.endsWith("TimedOut")) {
    result = StepFunctionStepStatus.TIMED_OUT;
  } else if (exitedEvent && exitedEvent.type?.endsWith("Aborted")) {
    result = StepFunctionStepStatus.ABORTED;
  }

  let stepDef = undefined;
  let defStr = "{}";
  if (stepDefs.hasOwnProperty(enteredEvent.stateEnteredEventDetails?.name ?? "")) {
    stepDef = stepDefs[enteredEvent.stateEnteredEventDetails?.name ?? ""];
    defStr = JSON.stringify(stepDef);
  }

  const timeStartAfter = (enteredEvent.timestamp ?? sfnExecutionTime).getTime() - sfnExecutionTime.getTime();
  let duration = "0";
  if (exitedEvent) {
    duration = formatTimeDelta(
      (exitedEvent.timestamp ?? sfnExecutionTime).getTime() - (enteredEvent.timestamp ?? sfnExecutionTime).getTime(),
    );
  }

  const mapRunStartEvent = event.events.find((e) => e.type === HistoryEventType.MapRunStarted);

  return {
    stepType: "map",
    step: enteredEvent.stateEnteredEventDetails?.name ?? "",
    order: event.stepNumber,
    status: result,
    definition: defStr,
    input: {
      input: enteredEvent.stateEnteredEventDetails?.input ?? "",
      inputPath: stepDef?.InputPath ?? "",
      itemsPath: stepDef?.itemsPath ?? "",
    },
    output: {
      taskResult: "",
      resultSelector: stepDef?.ResultSelector ?? "",
      resultPath: stepDef?.ResultPath ?? "",
      outputPath: stepDef?.OutputPath ?? "",
      output: output,
    },
    details: {
      type: stepDef?.Type ?? "",
      startedAfter: formatTimeDelta(timeStartAfter),
      duration: duration,
      mapRunArn: mapRunStartEvent?.mapRunStartedEventDetails?.mapRunArn ?? "",
    },
    events: event.events,
  };
}

function getDataForTaskStep(
  event: SfnStepItem,
  stepDefs: Record<string, any>,
  sfnExecutionTime: Date,
): StepFunctionStepExecutionData {
  const taskScheduledEvent = event.events.find((e) => e.type === HistoryEventType.TaskScheduled);
  const taskSucceededEvent = event.events.find((e) => e.type === HistoryEventType.TaskSucceeded);

  const data = getDataForFlowWithDurationStep(event, stepDefs, sfnExecutionTime);
  data.input.taskInput = taskScheduledEvent?.taskScheduledEventDetails?.parameters ?? "";
  data.output.taskResult = taskSucceededEvent?.taskSucceededEventDetails?.output ?? "";
  data.details.timeoutSeconds = taskScheduledEvent?.taskScheduledEventDetails?.timeoutInSeconds;
  data.details.heartbeatSeconds = taskScheduledEvent?.taskScheduledEventDetails?.heartbeatInSeconds;

  return data;
}

export function compileStepData(
  events: SfnStepItem[],
  sfnDefStr: string,
  sfnExecutionTime: Date,
): (StepFunctionMapStepExecutionData | StepFunctionStepExecutionData)[] {
  const stepData: (StepFunctionMapStepExecutionData | StepFunctionStepExecutionData)[] = [];
  const sfnDefinition = JSON.parse(sfnDefStr);

  for (const event of events) {
    switch (event.stepStart.type) {
      case HistoryEventType.ChoiceStateEntered:
      case HistoryEventType.SucceedStateEntered:
      case HistoryEventType.WaitStateEntered:
      case HistoryEventType.PassStateEntered:
      case HistoryEventType.FailStateEntered:
        stepData.push(getDataForFlowStep(event, sfnDefinition.States, sfnExecutionTime));
        break;
      case HistoryEventType.WaitStateEntered:
      case HistoryEventType.ParallelStateEntered:
        stepData.push(getDataForFlowWithDurationStep(event, sfnDefinition.States, sfnExecutionTime));
        break;
      case HistoryEventType.MapStateEntered:
        stepData.push(getDataForMapStep(event, sfnDefinition.States, sfnExecutionTime));
        break;
      case HistoryEventType.TaskStateEntered:
        stepData.push(getDataForTaskStep(event, sfnDefinition.States, sfnExecutionTime));
        break;
    }
  }

  return stepData;
}
