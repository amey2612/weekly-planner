import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavBarComponent } from '../../shared/components/nav-bar.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PlanningWeek } from '../../core/models/models';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, NavBarComponent],
    template: `
    <app-nav-bar></app-nav-bar>

    <div class="page-container">

      <!-- Welcome -->
      <div class="mb-16">
        <h1>👋 Hi, {{ userName }}!</h1>
        <p class="text-muted mt-8">What do you want to do today?</p>
      </div>

      <!-- Active week status card -->
      <div *ngIf="activeWeek" class="card mb-16"
        style="border-color:#1f6feb;">
        <div style="display:flex;justify-content:space-between;
                    align-items:center;flex-wrap:wrap;gap:12px;">
          <div>
            <p class="text-muted" style="font-size:12px;margin-bottom:4px;">
              ACTIVE WEEK
            </p>
            <h2>Week of {{ activeWeek.tuesdayDate | date:'MMM d, y' }}</h2>
            <p class="text-muted mt-8">
              {{ activeWeek.participants.length }} participants ·
              Client {{ activeWeek.clientPct }}% ·
              Tech Debt {{ activeWeek.techDebtPct }}% ·
              R&D {{ activeWeek.rAndDPct }}%
            </p>
          </div>
          <span class="badge"
            [ngClass]="{
              'badge-available': activeWeek.state === 'Planning',
              'badge-client':    activeWeek.state === 'Frozen',
              'badge-picked':    activeWeek.state === 'Setup',
              'badge-archived':  activeWeek.state === 'Closed'
            }">
            {{ activeWeek.state }}
          </span>
        </div>
      </div>

      <!-- No active week -->
      <div *ngIf="!activeWeek && !loading" class="alert alert-info mb-16">
        No active planning week. {{ isLead ? 'Start one below.' :
          'Ask your Team Lead to start a new week.' }}
      </div>

      <!-- ── LEAD ACTIONS ── -->
      <div *ngIf="isLead">
        <h2 class="mb-16">⚙️ Lead Actions</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,
                    minmax(200px,1fr));gap:12px;margin-bottom:24px;">

          <button class="btn btn-primary" (click)="go('/week-setup')"
            [disabled]="!!activeWeek">
            🚀 Start New Week
          </button>

          <button class="btn btn-blue" (click)="go('/review-freeze')"
            [disabled]="!activeWeek || activeWeek.state !== 'Planning'">
            ❄️ Review & Freeze
          </button>

          <button class="btn btn-blue" (click)="go('/team-progress')"
            [disabled]="!activeWeek">
            📊 Team Progress
          </button>

          <button class="btn btn-outline" (click)="go('/backlog')">
            📋 Manage Backlog
          </button>

          <button class="btn btn-outline" (click)="go('/team')">
            👥 Manage Team
          </button>

          <button class="btn btn-ghost" (click)="go('/past-weeks')">
            📅 Past Weeks
          </button>

        </div>
      </div>

      <!-- ── MEMBER ACTIONS ── -->
      <div *ngIf="!isLead">
        <h2 class="mb-16">📝 My Actions</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,
                    minmax(200px,1fr));gap:12px;margin-bottom:24px;">

          <button class="btn btn-primary" (click)="go('/plan-my-work')"
            [disabled]="!activeWeek || activeWeek.state !== 'Planning'">
            📝 Plan My Work
          </button>

          <button class="btn btn-blue" (click)="go('/update-progress')"
            [disabled]="!activeWeek || activeWeek.state !== 'Frozen'">
            ✏️ Update My Progress
          </button>

          <button class="btn btn-outline" (click)="go('/team-progress')"
            [disabled]="!activeWeek">
            📊 See Team Progress
          </button>

          <button class="btn btn-ghost" (click)="go('/past-weeks')">
            📅 Past Weeks
          </button>

        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="spinner"></div>

    </div>
  `
})
export class HomeComponent implements OnInit {

    activeWeek: PlanningWeek | null = null;
    loading = true;
    userName = '';
    isLead = false;

    constructor(
        private api: ApiService,
        private auth: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        const user = this.auth.getCurrentUser();
        if (!user) { this.router.navigate(['/login']); return; }
        this.userName = user.name;
        this.isLead = this.auth.isLead();
        this.loadActiveWeek();
    }

    loadActiveWeek(): void {
        this.api.getActiveWeek().subscribe({
            next: (week) => { this.activeWeek = week; this.loading = false; },
            error: () => { this.loading = false; }
        });
    }

    go(path: string): void {
        this.router.navigate([path]);
    }
}
