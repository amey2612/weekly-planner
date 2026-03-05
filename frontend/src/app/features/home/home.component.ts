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

    <div class="container" style="max-width:960px">
      <!-- Welcome -->
      <h1 class="title is-3">What do you want to do?</h1>
      <p class="subtitle is-5">Hi, <span>{{ userName }}</span>! <span class="tag" [class.is-warning]="isLead" [class.is-info]="!isLead">{{ isLead ? 'Team Lead' : 'Team Member' }}</span></p>

      <div *ngIf="!activeWeek && isLead" class="notification is-app-info mb-4">No planning weeks yet. Click "Start a New Week" to begin!</div>

      <div class="columns is-multiline">
        <!-- Lead: No active cycle -->
        <div class="column is-6" *ngIf="isLead && !activeWeek">
          <div class="box action-card" (click)="go('/week-setup')">
            <p class="is-size-5 has-text-weight-bold">🚀 Start a New Week</p>
            <p class="text-secondary">Set up a new planning cycle.</p>
          </div>
        </div>
        
        <!-- Lead: SETUP -->
        <div class="column is-6" *ngIf="isLead && activeWeek?.state === 'Setup'">
          <div class="box action-card" (click)="go('/week-setup')">
            <p class="is-size-5 has-text-weight-bold">⚙️ Set Up This Week's Plan</p>
            <p class="text-secondary">Pick members and set category percentages.</p>
          </div>
        </div>
        
        <!-- Lead: PLANNING -->
        <div class="column is-6" *ngIf="isLead && activeWeek?.state === 'Planning'">
          <div class="box action-card" (click)="go('/review-freeze')">
            <p class="is-size-5 has-text-weight-bold">❄️ Review and Freeze the Plan</p>
            <p class="text-secondary">Check everyone's hours and lock the plan.</p>
          </div>
        </div>
        
        <!-- Lead/Member: PLAN_WORK -->
        <!-- In a real implementation we would also check if they are participating -->
        <div class="column is-6" *ngIf="activeWeek?.state === 'Planning'">
          <div class="box action-card" (click)="go('/plan-my-work')">
            <p class="is-size-5 has-text-weight-bold">📝 Plan My Work</p>
            <p class="text-secondary">Pick backlog items and commit hours.</p>
          </div>
        </div>

        <!-- FROZEN: Team Progress -->
        <div class="column is-6" *ngIf="isLead && activeWeek?.state === 'Frozen'">
          <div class="box action-card" (click)="go('/team-progress')">
            <p class="is-size-5 has-text-weight-bold">📊 See Team Progress</p>
            <p class="text-secondary">Check how the team is doing.</p>
          </div>
        </div>
        
        <div class="column is-6" *ngIf="!isLead && activeWeek?.state === 'Frozen'">
          <div class="box action-card" (click)="go('/team-progress')">
            <p class="is-size-5 has-text-weight-bold">📊 See Team Progress</p>
            <p class="text-secondary">See how the team is doing overall.</p>
          </div>
        </div>

        <!-- FROZEN: Update Progress -->
        <div class="column is-6" *ngIf="activeWeek?.state === 'Frozen'">
          <div class="box action-card" (click)="go('/update-progress')">
            <p class="is-size-5 has-text-weight-bold">✏️ Update My Progress</p>
            <p class="text-secondary">Report hours and status on your tasks.</p>
          </div>
        </div>
        
        <!-- Lead: FINISH WEEK -->
        <div class="column is-6" *ngIf="isLead && activeWeek?.state === 'Frozen'">
          <div class="box action-card" (click)="go('/past-weeks')">
            <p class="is-size-5 has-text-weight-bold">✅ Finish This Week</p>
            <p class="text-secondary">Close out this cycle.</p>
          </div>
        </div>

        <!-- Member: No active cycle -->
        <div class="column is-12" *ngIf="!isLead && !activeWeek">
          <div class="notification is-app-info">There's no active plan for you right now. Check back on Tuesday or ask your Team Lead.</div>
        </div>

        <!-- Common: Backlog -->
        <div class="column is-6">
          <div class="box action-card" (click)="go('/backlog')">
            <p class="is-size-5 has-text-weight-bold">📋 Manage Backlog</p>
            <p class="text-secondary">Add, edit, or browse work items.</p>
          </div>
        </div>

        <!-- Lead: Manage Team -->
        <div class="column is-6" *ngIf="isLead">
          <div class="box action-card" (click)="go('/team')">
            <p class="is-size-5 has-text-weight-bold">👥 Manage Team Members</p>
            <p class="text-secondary">Add or remove team members.</p>
          </div>
        </div>

        <!-- Common: Past Weeks -->
        <div class="column is-6">
          <div class="box action-card" (click)="go('/past-weeks')">
            <p class="is-size-5 has-text-weight-bold">📅 View Past Weeks</p>
            <p class="text-secondary">Look at completed planning cycles.</p>
          </div>
        </div>
        
        <!-- Cancel Planning (lead) -->
        <div class="column is-6" *ngIf="isLead && activeWeek?.state === 'Planning'">
          <div class="box action-card" style="border-color:var(--danger)">
            <p class="is-size-5 has-text-weight-bold" style="color:var(--danger)">🗑️ Cancel This Week's Planning</p>
            <p class="text-secondary">Erase all plans and start over.</p>
          </div>
        </div>

      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="has-text-centered py-6">
        <div class="button is-loading is-white"></div>
      </div>

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
