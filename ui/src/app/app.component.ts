import { Component, OnInit, Renderer2 } from "@angular/core";
import { RouterModule, RouterOutlet } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, MatIconModule, MatTooltipModule, MatToolbarModule, MatButtonModule, RouterModule],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  title = "AWS SFN Viewer";

  lightMode = false;
  lightModeToolTip = "Switch To Dark Mode";
  themeKey = "lightTheme";

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    console.log(
      `%c${this.title}`,
      "background: #000; color: #00a0df; font-size: 24px; font-family: Monospace; padding : 5px 234px 5px 10px;",
    );

    const lightTheme = localStorage.getItem(this.themeKey);
    if (lightTheme === "1") {
      this.lightMode = true;
      this.renderer.addClass(document.body, "dark-mode");
      this.lightModeToolTip = "Switch To Light Mode";
    }
  }

  toggleTheme() {
    this.lightMode = !this.lightMode;

    localStorage.setItem(this.themeKey, this.lightMode ? "1" : "0");
    if (this.lightMode) {
      this.renderer.addClass(document.body, "dark-mode");
      this.lightModeToolTip = "Switch To Light Mode";
    } else {
      this.renderer.removeClass(document.body, "dark-mode");
      this.lightModeToolTip = "Switch To Dark Mode";
    }
  }
}
