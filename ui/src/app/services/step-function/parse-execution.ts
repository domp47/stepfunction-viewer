import { taskMap } from "./event-mapper";
import { HistoryEvent } from "@aws-sdk/client-sfn";
import { PriorityQueue } from "../../utils/priority-queue";

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

export interface SfnStepItem {
  stepStart: HistoryEvent;
  events: HistoryEvent[];
  stepNumber: number;
}

type Tuple<T, V> = [T, V];

export function parseExecution(history: HistoryEvent[]): SfnStepItem[] {
  const vertices = buildGraph(history);

  const sfnSteps: SfnStepItem[] = [];
  const pendingSteps: Record<string, SfnStepItem> = {};
  const pQueue = new PriorityQueue<Tuple<SfnEventNode, number[]>>();
  const visited = new Set<number>();

  let stepNumber = 0;

  const root = vertices.get(2);
  if (root) {
    pQueue.enqueue([root, []], 2);
  }

  while (pQueue.size() > 0) {
    const item = pQueue.dequeue();

    // Event will never be undefined because we check the size of the queue, but TS doesn't know that :')
    if (item === undefined) {
      continue;
    }

    const [node, parentIds] = item;
    let nextId = parentIds[0];
    const pendingStep = pendingSteps.hasOwnProperty(nextId) ? pendingSteps[nextId] : undefined;

    // This is a step end event, pop the stack and add the step to the execution steps
    if (pendingStep && taskMap[pendingStep.stepStart.type ?? ""].has(node.event.type ?? "")) {
      delete pendingSteps[nextId];
      parentIds.shift();

      pendingStep.events.push(node.event);
      sfnSteps.push(pendingStep);

      // The step is done, so all children added to the queue will be the parent of the following steps
      nextId = parentIds.length > 0 ? parentIds[0] : -1;
    }
    // This is a step start event, add a new item to the stack
    else if (taskMap.hasOwnProperty(node.event.type ?? "")) {
      pendingSteps[node.event.id ?? 0] = {
        stepStart: node.event,
        events: [node.event],
        stepNumber: stepNumber++,
      };
      nextId = node.event.id ?? 0;
      parentIds.unshift(nextId);
    }
    // This is neither a step start or end event, add the event to the pending step
    // The pending step __should__ always exist...
    else if (pendingStep) {
      pendingStep.events.push(node.event);
    }

    for (const child of node.children) {
      if (visited.has(child.event.id ?? 0)) {
        continue;
      }

      const childId = child.event.id ?? 0;

      visited.add(node.event.id ?? 0);
      pQueue.enqueue([child, [...parentIds]], childId);
    }
  }

  for (const key in pendingSteps) {
    sfnSteps.push(pendingSteps[key]);
  }

  sfnSteps.sort((a, b) => a.stepNumber - b.stepNumber);

  return sfnSteps;
}
