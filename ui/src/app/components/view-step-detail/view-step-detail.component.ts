import { Component, Input } from "@angular/core";
import {
  StepFunctionMapStepExecutionData,
  StepFunctionStepExecutionData,
} from "../../services/step-function/compile-step-data";
import { MapDetailComponent } from "./map-detail/map-detail.component";
import { StepDetailComponent } from "./step-detail/step-detail.component";
import { NgIf } from "@angular/common";

@Component({
  selector: "app-view-step-detail",
  standalone: true,
  imports: [MapDetailComponent, StepDetailComponent, NgIf],
  templateUrl: "./view-step-detail.component.html",
  styleUrl: "./view-step-detail.component.scss",
})
export class ViewStepDetailComponent {
  flowStepData?: StepFunctionStepExecutionData;
  mapStepData?: StepFunctionMapStepExecutionData;

  @Input({ required: true }) set stepData(
    value: StepFunctionMapStepExecutionData | StepFunctionStepExecutionData | undefined,
  ) {
    if (value?.stepType === "map") {
      this.flowStepData = undefined;
      this.mapStepData = value as StepFunctionMapStepExecutionData;
    } else if (value?.stepType === "flow") {
      this.mapStepData = undefined;
      this.flowStepData = value as StepFunctionStepExecutionData;
    } else {
      this.mapStepData = undefined;
      this.flowStepData = undefined;
    }
  }
}
