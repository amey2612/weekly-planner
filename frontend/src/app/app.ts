import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div [class]="theme === 'dark' ? 'theme-dark' : 'theme-light'">
      <router-outlet></router-outlet>
    </div>
  `
})
export class App {
  theme = 'light'; // In a full implementation, this could bind to a service for swapping themes
}
