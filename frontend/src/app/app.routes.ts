import { Routes } from '@angular/router';
import { authGuard, leadGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    // Login screen — pick who you are
    {
        path: 'login',
        loadComponent: () =>
            import('./features/home/login.component').then(m => m.LoginComponent)
    },

    // Home screen — role-based dashboard
    {
        path: 'home',
        loadComponent: () =>
            import('./features/home/home.component').then(m => m.HomeComponent),
        canActivate: [authGuard]
    },

    // Lead only — manage team members
    {
        path: 'team',
        loadComponent: () =>
            import('./features/team/team.component').then(m => m.TeamComponent),
        canActivate: [authGuard, leadGuard]
    },

    // Lead only — manage backlog
    {
        path: 'backlog',
        loadComponent: () =>
            import('./features/backlog/backlog.component').then(m => m.BacklogComponent),
        canActivate: [authGuard, leadGuard]
    },

    // Lead only — set up a new week
    {
        path: 'week-setup',
        loadComponent: () =>
            import('./features/week-setup/week-setup.component').then(m => m.WeekSetupComponent),
        canActivate: [authGuard, leadGuard]
    },

    // Member — plan their 30 hours
    {
        path: 'plan-my-work',
        loadComponent: () =>
            import('./features/plan-my-work/plan-my-work.component').then(m => m.PlanMyWorkComponent),
        canActivate: [authGuard]
    },

    // Lead only — review plans and freeze
    {
        path: 'review-freeze',
        loadComponent: () =>
            import('./features/review-freeze/review-freeze.component').then(m => m.ReviewFreezeComponent),
        canActivate: [authGuard, leadGuard]
    },

    // Member — update task progress
    {
        path: 'update-progress',
        loadComponent: () =>
            import('./features/update-progress/update-progress.component').then(m => m.UpdateProgressComponent),
        canActivate: [authGuard]
    },

    // Lead only — see team progress dashboard
    {
        path: 'team-progress',
        loadComponent: () =>
            import('./features/team-progress/team-progress.component').then(m => m.TeamProgressComponent),
        canActivate: [authGuard, leadGuard]
    },

    // All — view past weeks
    {
        path: 'past-weeks',
        loadComponent: () =>
            import('./features/past-weeks/past-weeks.component').then(m => m.PastWeeksComponent),
        canActivate: [authGuard]
    },

    // Default redirect
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/login' }
];
