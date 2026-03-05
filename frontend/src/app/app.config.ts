import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Router with all our routes
    provideRouter(routes),

    // HttpClient — required for all API calls
    provideHttpClient(),

    // Angular Material animations
    provideAnimations(),
  ]
};
