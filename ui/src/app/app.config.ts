import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { provideClientHydration } from "@angular/platform-browser";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideHttpClient, withFetch } from "@angular/common/http";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { provideHighlightOptions } from "ngx-highlightjs";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: "outline" },
    },
    provideHighlightOptions({
      coreLibraryLoader: () => import("highlight.js/lib/core"),
      lineNumbersLoader: () => import("ngx-highlightjs/line-numbers"), // Optional, add line numbers if needed
      languages: {
        json: () => import("highlight.js/lib/languages/json"),
      },
    }),
  ],
};
