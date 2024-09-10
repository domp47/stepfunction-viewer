import { taskMap } from "./event-mapper";
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

class SfnEventNode {
  event: HistoryEvent;
  children: SfnEventNode[];

  constructor(event: HistoryEvent, children: SfnEventNode[] = []) {
    this.event = event;
    this.children = children;
  }
}

function buildGraph(events: HistoryEvent[]): Map<number, SfnEventNode> {
  const sfnEventNodes: Map<number, SfnEventNode> = new Map();

  for (const event of events) {
    if (event.id) {
      sfnEventNodes.set(event.id, new SfnEventNode(event));
    }
  }

  for (const event of events) {
    const previousEventId = event.previousEventId ?? -1;
    const parentNode = sfnEventNodes.get(previousEventId);
    const currentNode = sfnEventNodes.get(event.id ?? -1);
    if (parentNode && currentNode) {
      parentNode.children.push(currentNode);
    }
  }

  return sfnEventNodes;
}

interface StackItem {
  stepStart: HistoryEvent;
  events: HistoryEvent[];
  stepNumber: number;
}

export function parseExecution(history: HistoryEvent[]): StepFunctionStepExecutionData[] {
  const executionSteps: StepFunctionStepExecutionData[] = [];

  console.log(history);

  const vertices = buildGraph(history);

  const sfnSteps: StackItem[] = [];
  const stack: StackItem[] = [];
  let stepNumber = 0;

  function dfs(node: SfnEventNode) {
    // This is a step end event, pop the stack and add the step to the execution steps
    if (stack.length > 0 && taskMap[stack[0].stepStart.type ?? ""].has(node.event.type ?? "")) {
      const step = stack.shift();
      step?.events.push(node.event);
      // This will never be undefined because we check the length of the stack, but TS apparently doesn't know that :')
      if (step) {
        sfnSteps.push(step);
      }
    }
    // This is a step start event, add a new item to the stack
    else if (taskMap.hasOwnProperty(node.event.type ?? "")) {
      stack.unshift({
        stepStart: node.event,
        events: [node.event],
        stepNumber: stepNumber++,
      });
    }
    // This is neither a step start or end event, add the event to the top of the stack
    // The stack __should__ always have at least one item in it, but we gotta check cuz TS
    else if (stack.length > 0) {
      stack[0].events.push(node.event);
    }

    for (const child of node.children) {
      dfs(child);
    }
  }

  // Start the DFS from the root node
  const root = vertices.get(2);
  if (root) {
    // TODO doesn't work completely as expected, but it's a start
    dfs(root);
  }

  sfnSteps.sort((a, b) => a.stepNumber - b.stepNumber);

  console.log(sfnSteps);

  return executionSteps;
}
