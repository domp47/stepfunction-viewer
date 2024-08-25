import { Routes } from "@angular/router";
import { SetEndpointComponent } from "./components/set-endpoint/set-endpoint.component";
import { ListSfnsComponent } from "./components/list-sfns/list-sfns.component";
import { CreateSfnComponent } from "./components/create-sfn/create-sfn.component";
import { ViewSfnComponent } from "./components/view-sfn/view-sfn.component";
import { ViewExecutionComponent } from "./components/view-execution/view-execution.component";
import { EditSfnComponent } from "./components/edit-sfn/edit-sfn.component";

export const routes: Routes = [
  {
    path: "setup",
    component: SetEndpointComponent,
  },
  {
    path: "list",
    component: ListSfnsComponent,
  },
  {
    path: "new-sfn",
    component: CreateSfnComponent,
  },
  {
    path: "edit-sfn/:arn",
    component: EditSfnComponent,
  },
  {
    path: "view-sfn/:arn",
    component: ViewSfnComponent,
  },
  {
    path: "view-execution/:arn",
    component: ViewExecutionComponent,
  },
  {
    path: "**",
    redirectTo: "/list",
  },
];
