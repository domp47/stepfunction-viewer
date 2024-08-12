import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { Router } from "@angular/router";
import { ConfigService } from "../../services/config-service/config-service.service";

@Component({
  selector: "app-set-endpoint",
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule],
  templateUrl: "./set-endpoint.component.html",
  styleUrl: "./set-endpoint.component.scss",
})
export class SetEndpointComponent implements OnInit {
  form = new FormGroup({
    apiEndpoint: new FormControl<string>(""),
    region: new FormControl<string>(""),
  });

  constructor(
    private router: Router,
    private configService: ConfigService,
  ) {}

  ngOnInit(): void {
    const apiEndpoint = this.configService.sfnApiEndpoint.value;
    const region = this.configService.awsRegion.value;

    this.form.setValue({ apiEndpoint, region });
  }

  onCancelClick() {
    this.router.navigate(["/list"]);
  }

  onSaveClick() {
    const apiEndpoint: string = this.form.value.apiEndpoint ?? "";
    this.configService.setSfnEndpoint(apiEndpoint);

    const region: string = this.form.value.region ?? "";
    this.configService.setAwsRegion(region);

    this.router.navigate(["/list"]);
  }
}
