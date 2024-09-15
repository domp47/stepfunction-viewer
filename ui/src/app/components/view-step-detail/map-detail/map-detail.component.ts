import { Component, Input } from "@angular/core";
import { StepFunctionMapStepExecutionData } from "../../../services/step-function/compile-step-data";

@Component({
  selector: "app-map-detail",
  standalone: true,
  imports: [],
  templateUrl: "./map-detail.component.html",
  styleUrl: "./map-detail.component.scss",
})
export class MapDetailComponent {
  @Input({ required: true }) stepData?: StepFunctionMapStepExecutionData;
}
