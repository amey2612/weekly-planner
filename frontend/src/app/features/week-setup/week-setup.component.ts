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

    <div class="container" style="max-width:960px">
      <button class="button btn-secondary mb-4" (click)="router.navigate(['/home'])">← Home</button>
      <h2 class="title is-4">Set Up This Week's Plan</h2>
      <div class="box mb-4">
        <div class="field"><label class="label">Planning date (pick a Tuesday)</label>
          <div class="control"><input class="input" type="date" [(ngModel)]="tuesdayDate" (change)="validateDate()"></div>
          <p class="help has-text-danger" *ngIf="dateError">{{ dateError }}</p>
          <p class="help" *ngIf="tuesdayDate && !dateError">Work period: selected week.</p>
        </div>
      </div>
      
      <!-- In Alpine version, there is a member checklist. In current Angular logic, it adds everyone active automatically.
           I will keep the Angular class logic as is (creating week assigns active members implicitly in backend),
           and just format the percentages to match Alpine -->

      <div class="box mb-4">
        <label class="label">How should the hours be split?</label>
        <div class="columns">
          <div class="column">
            <div class="field"><label class="label is-small">Client Focused %</label>
            <div class="control"><input class="input" type="number" [(ngModel)]="clientPct" min="0" max="100" step="1" (ngModelChange)="checkTotal()"></div></div>
          </div>
          <div class="column">
            <div class="field"><label class="label is-small">Tech Debt %</label>
            <div class="control"><input class="input" type="number" [(ngModel)]="techDebtPct" min="0" max="100" step="1" (ngModelChange)="checkTotal()"></div></div>
          </div>
          <div class="column">
            <div class="field"><label class="label is-small">R&D %</label>
            <div class="control"><input class="input" type="number" [(ngModel)]="rAndDPct" min="0" max="100" step="1" (ngModelChange)="checkTotal()"></div></div>
          </div>
        </div>
        
        <p [class.has-text-success]="totalPct===100" [class.has-text-danger]="totalPct!==100" class="has-text-weight-bold">
          Total: {{ totalPct }}% 
          <span *ngIf="totalPct!==100">(must be 100%)</span>
          <span *ngIf="totalPct===100">✓</span>
        </p>

        <div class="columns mt-2" *ngIf="totalPct===100">
          <div class="column has-text-centered"><span class="tag cat-badge-CLIENT_FOCUSED">Client</span><br><strong>{{ hoursFor(clientPct) }}h /member</strong></div>
          <div class="column has-text-centered"><span class="tag cat-badge-TECH_DEBT">Tech Debt</span><br><strong>{{ hoursFor(techDebtPct) }}h /member</strong></div>
          <div class="column has-text-centered"><span class="tag cat-badge-R_AND_D">R&D</span><br><strong>{{ hoursFor(rAndDPct) }}h /member</strong></div>
        </div>
      </div>
      
      <p class="help has-text-danger mb-2" *ngIf="error">{{ error }}</p>
      <button class="button btn-primary is-medium" (click)="create()" [disabled]="totalPct!==100 || !!dateError || !tuesdayDate || saving">
        {{ saving ? 'Creating...' : 'Open Planning for the Team' }}
      </button>

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
