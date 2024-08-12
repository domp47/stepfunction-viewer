import { Routes } from "@angular/router";
import { SetEndpointComponent } from "./components/set-endpoint/set-endpoint.component";
import { ListSfnsComponent } from "./components/list-sfns/list-sfns.component";
import { CreateSfnComponent } from "./components/create-sfn/create-sfn.component";

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
    path: "**",
    redirectTo: "/list",
  },
];
