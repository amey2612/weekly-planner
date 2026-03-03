import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavBarComponent } from '../../shared/components/nav-bar.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-week-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, NavBarComponent],
  template: `
    <app-nav-bar></app-nav-bar>

    <div class="page-container" style="max-width:600px">
      <div class="page-header">
        <h1>🚀 Start New Week</h1>
        <button class="btn btn-ghost" (click)="router.navigate(['/home'])">
          ← Home
        </button>
      </div>

      <div class="card">

        <!-- Tuesday date picker -->
        <div class="form-group">
          <label>Planning Date (must be a Tuesday)</label>
          <input type="date" [(ngModel)]="tuesdayDate"
            (change)="validateDate()">
          <p *ngIf="dateError" class="text-muted mt-8"
            style="color:#f85149">{{ dateError }}</p>
        </div>

        <!-- Category splits -->
        <h3 class="mb-16">📊 Category Hour Split (must total 100%)</h3>

        <div class="form-group">
          <label>
            Client Focused %
            <span class="text-muted" style="font-size:12px">
              = {{ hoursFor(clientPct) }}h of 30
            </span>
          </label>
          <input type="number" [(ngModel)]="clientPct"
            min="0" max="100" (ngModelChange)="checkTotal()">
        </div>

        <div class="form-group">
          <label>
            Tech Debt %
            <span class="text-muted" style="font-size:12px">
              = {{ hoursFor(techDebtPct) }}h of 30
            </span>
          </label>
          <input type="number" [(ngModel)]="techDebtPct"
            min="0" max="100" (ngModelChange)="checkTotal()">
        </div>

        <div class="form-group">
          <label>
            R&D %
            <span class="text-muted" style="font-size:12px">
              = {{ hoursFor(rAndDPct) }}h of 30
            </span>
          </label>
          <input type="number" [(ngModel)]="rAndDPct"
            min="0" max="100" (ngModelChange)="checkTotal()">
        </div>

        <!-- Total indicator -->
        <div class="alert mb-16"
          [class]="totalPct === 100 ? 'alert-success' : 'alert-warning'">
          Total: {{ totalPct }}%
          {{ totalPct === 100 ? '✓ Perfect' : '— must equal 100%' }}
        </div>

        <!-- Error -->
        <div *ngIf="error" class="alert alert-danger mb-16">{{ error }}</div>

        <!-- Submit -->
        <button class="btn btn-primary w-full"
          (click)="create()"
          [disabled]="totalPct !== 100 || !!dateError ||
                      !tuesdayDate || saving">
          {{ saving ? 'Creating...' : '✅ Create Week & Open Planning' }}
        </button>

      </div>
    </div>
  `
})
export class WeekSetupComponent {

  tuesdayDate = '';
  clientPct = 40;
  techDebtPct = 40;
  rAndDPct = 20;
  totalPct = 100;
  dateError = '';
  error = '';
  saving = false;

  constructor(
    public router: Router,
    private api: ApiService,
    private auth: AuthService
  ) { }

  checkTotal(): void {
    this.totalPct = this.clientPct + this.techDebtPct + this.rAndDPct;
  }

  hoursFor(pct: number): number {
    return Math.round(30 * pct / 100);
  }

  validateDate(): void {
    if (!this.tuesdayDate) { this.dateError = ''; return; }
    const day = new Date(this.tuesdayDate).getDay();
    // getDay() returns 1 for Monday in UTC when date string parsed
    // Add timezone offset fix
    const d = new Date(this.tuesdayDate + 'T12:00:00');
    this.dateError = d.getDay() !== 2
      ? 'Please select a Tuesday.' : '';
  }

  create(): void {
    const user = this.auth.getCurrentUser();
    if (!user) return;
    this.saving = true;
    this.error = '';

    const dto = {
      tuesdayDate: new Date(this.tuesdayDate + 'T12:00:00').toISOString(),
      clientPct: this.clientPct,
      techDebtPct: this.techDebtPct,
      rAndDPct: this.rAndDPct,
      createdByMemberId: user.memberId
    };

    // Step 1 — create the week
    this.api.createWeek(dto).subscribe({
      next: (week) => {
        // Step 2 — immediately open it for planning
        this.api.openWeek(week.id).subscribe({
          next: () => {
            this.saving = false;
            this.router.navigate(['/home']);
          },
          error: () => {
            this.error = 'Week created but could not open for planning.';
            this.saving = false;
          }
        });
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create week.';
        this.saving = false;
      }
    });
  }
}
