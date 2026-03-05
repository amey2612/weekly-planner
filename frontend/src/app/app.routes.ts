import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/home/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'team',
    loadComponent: () => import('./features/team/team.component').then(m => m.TeamComponent)
  },
  {
    path: 'backlog',
    loadComponent: () => import('./features/backlog/backlog.component').then(m => m.BacklogComponent)
  },
  {
    path: 'plan-my-work',
    loadComponent: () => import('./features/plan-my-work/plan-my-work.component').then(m => m.PlanMyWorkComponent)
  },
  {
    path: 'week-setup',
    loadComponent: () => import('./features/week-setup/week-setup.component').then(m => m.WeekSetupComponent)
  },
  {
    path: 'past-weeks',
    loadComponent: () => import('./features/past-weeks/past-weeks.component').then(m => m.PastWeeksComponent)
  },
  {
    path: 'notifications',
    loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent)
  }
];