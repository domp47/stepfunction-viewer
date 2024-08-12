import { Component, Input } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";

export enum AlertType {
  Info,
  Warning,
  Success,
  Error,
}

export interface AlertInfo {
  type: AlertType;
  title: string;
  message: string;
  closeable: boolean;
}

@Component({
  selector: "app-alert",
  standalone: true,
  imports: [MatIconModule, CommonModule, MatButtonModule],
  templateUrl: "./alert.component.html",
  styleUrls: ["./alert.component.scss"],
})
export class AlertComponent {
  private _alert: AlertInfo | undefined;
  get alert(): AlertInfo | undefined {
    return this._alert;
  }
  @Input({ required: true }) set alert(value: AlertInfo | undefined) {
    this._alert = value;
    if (this._alert !== undefined) {
      this.setAlert(this._alert);
    }
  }

  iconName: string | undefined;
  alertClass = "";

  constructor() {
    if (this.alert !== undefined) {
      this.setAlert(this.alert);
    }
  }

  mapIcon(type: AlertType): string | undefined {
    switch (type) {
      case AlertType.Info:
        return "information";
      case AlertType.Warning:
        return "warning";
      case AlertType.Success:
        return "success";
      case AlertType.Error:
        return "error";
    }
  }

  mapClass(type: AlertType): string | undefined {
    switch (type) {
      case AlertType.Info:
        return "informational";
      case AlertType.Warning:
        return "warning";
      case AlertType.Success:
        return "success";
      case AlertType.Error:
        return "error";
    }
  }

  setAlert(alert: AlertInfo) {
    this.iconName = "assets/alert-icons/";
    this.iconName += this.mapIcon(alert.type);
    this.iconName += ".svg";

    this.alertClass = "alert--";
    this.alertClass += this.mapClass(alert.type);
  }

  clearAlert() {
    this.alert = undefined;
  }
}
