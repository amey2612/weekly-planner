import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/home/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'team',
    loadComponent: () =>
      import('./features/team/team.component').then(m => m.TeamComponent),
    canActivate: [authGuard]
  },
  {
    path: 'backlog',
    loadComponent: () =>
      import('./features/backlog/backlog.component').then(m => m.BacklogComponent),
    canActivate: [authGuard]
  },
  {
    path: 'week-setup',
    loadComponent: () =>
      import('./features/week-setup/week-setup.component').then(m => m.WeekSetupComponent),
    canActivate: [authGuard]
  },
  {
    path: 'plan-my-work',
    loadComponent: () =>
      import('./features/plan-my-work/plan-my-work.component').then(m => m.PlanMyWorkComponent),
    canActivate: [authGuard]
  },
  {
    path: 'review-freeze',
    loadComponent: () =>
      import('./features/review-freeze/review-freeze.component').then(m => m.ReviewFreezeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'update-progress',
    loadComponent: () =>
      import('./features/update-progress/update-progress.component').then(m => m.UpdateProgressComponent),
    canActivate: [authGuard]
  },
  {
    path: 'team-progress',
    loadComponent: () =>
      import('./features/team-progress/team-progress.component').then(m => m.TeamProgressComponent),
    canActivate: [authGuard]
  },
  {
    path: 'past-weeks',
    loadComponent: () =>
      import('./features/past-weeks/past-weeks.component').then(m => m.PastWeeksComponent),
    canActivate: [authGuard]
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./features/notifications/notifications.component').then(m => m.NotificationsComponent),
    canActivate: [authGuard]
  }
];

