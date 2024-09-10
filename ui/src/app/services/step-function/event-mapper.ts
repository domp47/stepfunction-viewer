import { HistoryEventType } from "@aws-sdk/client-sfn";

export const taskMap: Record<string, Set<string>> = {
  [HistoryEventType.ActivityStarted]: new Set<string>([
    HistoryEventType.ActivityFailed,
    HistoryEventType.ActivitySucceeded,
    HistoryEventType.ActivityTimedOut,
    HistoryEventType.ActivityScheduleFailed,
    HistoryEventType.ActivityTimedOut,
  ]),
  [HistoryEventType.ChoiceStateEntered]: new Set<string>([HistoryEventType.ChoiceStateExited]),
  [HistoryEventType.FailStateEntered]: new Set<string>([]),
  [HistoryEventType.LambdaFunctionStarted]: new Set<string>([
    HistoryEventType.LambdaFunctionFailed,
    HistoryEventType.LambdaFunctionScheduleFailed,
    HistoryEventType.LambdaFunctionStartFailed,
    HistoryEventType.LambdaFunctionSucceeded,
    HistoryEventType.LambdaFunctionTimedOut,
  ]),
  [HistoryEventType.MapIterationStarted]: new Set<string>([
    HistoryEventType.MapIterationAborted,
    HistoryEventType.MapIterationFailed,
    HistoryEventType.MapIterationSucceeded,
  ]),
  [HistoryEventType.MapRunStarted]: new Set<string>([
    HistoryEventType.MapRunAborted,
    HistoryEventType.MapRunFailed,
    HistoryEventType.MapRunSucceeded,
  ]),
  [HistoryEventType.MapRunRedriven]: new Set<string>([
    HistoryEventType.MapRunAborted,
    HistoryEventType.MapRunFailed,
    HistoryEventType.MapRunSucceeded,
  ]),
  [HistoryEventType.MapStateEntered]: new Set<string>([
    HistoryEventType.MapStateExited,
    HistoryEventType.MapStateAborted,
    HistoryEventType.MapStateFailed,
  ]),
  [HistoryEventType.ParallelStateEntered]: new Set<string>([
    HistoryEventType.ParallelStateExited,
    HistoryEventType.ParallelStateAborted,
    HistoryEventType.ParallelStateFailed,
  ]),
  [HistoryEventType.PassStateEntered]: new Set<string>([HistoryEventType.PassStateExited]),
  [HistoryEventType.SucceedStateEntered]: new Set<string>([HistoryEventType.SucceedStateExited]),
  [HistoryEventType.TaskStateEntered]: new Set<string>([
    HistoryEventType.TaskFailed,
    HistoryEventType.TaskStartFailed,
    HistoryEventType.TaskStateAborted,
    HistoryEventType.TaskStateExited,
    HistoryEventType.TaskSubmitFailed,
    HistoryEventType.TaskTimedOut,
  ]),
  [HistoryEventType.WaitStateEntered]: new Set<string>([
    HistoryEventType.WaitStateExited,
    HistoryEventType.WaitStateAborted,
  ]),
};
