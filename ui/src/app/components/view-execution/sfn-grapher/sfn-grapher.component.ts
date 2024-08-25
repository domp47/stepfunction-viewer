import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import { buildGraph } from "../../../services/step-function/graph";
import { StepFunction } from "../../../services/step-function/step-function";
import * as d3 from "d3";
import * as graphlib from "@dagrejs/graphlib";
import * as dagresRender from "../../../services/step-function/render/render";

@Component({
  selector: "app-sfn-grapher",
  standalone: true,
  imports: [],
  templateUrl: "./sfn-grapher.component.html",
  styleUrl: "./sfn-grapher.component.scss",
})
export class SfnGrapherComponent implements OnChanges {
  @Input({ required: true }) sfn: StepFunction | undefined;
  @Input({ required: false }) clickable: boolean = false;
  @Output() stepClicked: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild("sfnGraph")
  private graphContainer!: ElementRef;

  private svg: any;

  ngOnChanges(): void {
    if (this.graphContainer === undefined || this.sfn === undefined) {
      return;
    }

    this.setGraph();
  }

  enhanceWithCurvedEdges(graph: any) {
    (graph.edges || []).forEach((edge: any) => {
      edge.value = {
        ...edge.value,
        curve: d3.curveBasis,
      };
    });
    return graph;
  }

  graphClicked(event: PointerEvent): void {
    const element = event.currentTarget as HTMLElement;
    const tspans = element.getElementsByTagName("tspan");
    const tspan = tspans.length > 0 ? tspans[0] : undefined;

    if (tspan !== undefined && this.sfn !== undefined && this.sfn.States.hasOwnProperty(tspan.innerHTML)) {
      this.stepClicked.emit(tspan.innerHTML);
    }
  }

  setGraph(): void {
    if (this.sfn === undefined) {
      return;
    }

    d3.select("svg").remove();

    const serializedGraph = buildGraph(this.sfn);

    const element = this.graphContainer.nativeElement;
    this.svg = d3.select(element).append("svg").attr("width", "100%").attr("height", "75vh");

    const inner = this.svg.append("g");

    const zoom = d3.zoom().on("zoom", (event) => {
      inner.attr("transform", event.transform);
    });
    this.svg.call(zoom).on("dblclick.zoom", null);

    const render = dagresRender.render();
    const g = graphlib.json.read(this.enhanceWithCurvedEdges(JSON.parse(serializedGraph)));

    // Run the renderer. This is what draws the final graph.
    try {
      g.graph().transition = (selection: any) => {
        return selection.transition().duration(500);
      };

      render(inner, g);

      if (!this.clickable) {
        inner
          .selectAll("g.node")
          .style("cursor", "pointer")
          .on("click", (data: PointerEvent) => this.graphClicked(data));
      }

      // Center the graph
      const initialScale = 1;

      const svgWidth = +this.svg.style("width").slice(0, -2);
      const svgHeight = +this.svg.style("height").slice(0, -2);

      this.svg.call(
        zoom.transform,
        d3.zoomIdentity
          .translate((svgWidth - g.graph().width * initialScale) / 2, (svgHeight - g.graph().height * initialScale) / 2)
          .scale(initialScale),
      );
    } catch (error) {
      console.log(error);
    }
  }
}
