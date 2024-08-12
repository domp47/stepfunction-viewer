import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatTableModule } from "@angular/material/table";
import {
  SFNClient,
  ListStateMachinesCommand,
  StateMachineListItem,
  ListStateMachinesCommandOutput,
} from "@aws-sdk/client-sfn";
import { SfnClientService } from "../../services/sfn-client/sfn-client.service";
import { Subscription } from "rxjs";
import { NgIf } from "@angular/common";

@Component({
  selector: "app-list-sfns",
  standalone: true,
  imports: [MatTableModule, NgIf],
  templateUrl: "./list-sfns.component.html",
  styleUrl: "./list-sfns.component.scss",
})
export class ListSfnsComponent implements OnInit, OnDestroy {
  private client: SFNClient;

  private sfnClientSubscription: Subscription = new Subscription();

  displayedColumns: string[] = [];
  tableData: StateMachineListItem[] = [];

  constructor(private SfnClientService: SfnClientService) {
    this.client = SfnClientService.sfnClient.value;
  }

  ngOnInit(): void {
    this.sfnClientSubscription = this.SfnClientService.sfnClient.subscribe((client) => {
      this.client = client;
    });

    this.getSFNs();
  }

  ngOnDestroy(): void {
    this.sfnClientSubscription.unsubscribe();
  }

  async getSFNs(): Promise<void> {
    const pageSize = 150;
    let nextToken = undefined;

    const stateMachines: StateMachineListItem[] = [];

    do {
      const command: ListStateMachinesCommand = new ListStateMachinesCommand({
        maxResults: pageSize,
        nextToken: nextToken,
      });
      const response: ListStateMachinesCommandOutput = await this.client.send(command);

      stateMachines.push(...(response.stateMachines ?? []));
      nextToken = response.nextToken;
    } while (nextToken !== undefined);

    console.log(stateMachines);

    this.tableData = stateMachines;
  }
}
