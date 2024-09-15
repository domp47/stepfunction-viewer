import { Component, Input } from "@angular/core";
import { StepFunctionStepExecutionData } from "../../../services/step-function/compile-step-data";
import { MatTabsModule } from "@angular/material/tabs";
import { MatExpansionModule } from "@angular/material/expansion";
import { Highlight, HighlightAuto } from "ngx-highlightjs";
import { HighlightLineNumbers } from "ngx-highlightjs/line-numbers";

@Component({
  selector: "app-step-detail",
  standalone: true,
  imports: [MatTabsModule, MatExpansionModule, Highlight, HighlightAuto, HighlightLineNumbers],
  templateUrl: "./step-detail.component.html",
  styleUrl: "./step-detail.component.scss",
})
export class StepDetailComponent {
  @Input({ required: true }) stepData?: StepFunctionStepExecutionData;
}
