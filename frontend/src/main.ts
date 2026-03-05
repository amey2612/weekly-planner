import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// imports are above
// bootstrapApplication(App, appConfig).catch((err) => console.error(err));
console.log('Angular bootstrap bypassed intentionally to run pure Alpine.js template');
