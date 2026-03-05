import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavBarComponent } from '../../shared/components/nav-bar.component';
import { ApiService } from '../../core/services/api.service';
import { PlanningWeek, PlanItem } from '../../core/models/models';

@Component({
  selector: 'app-review-freeze',
  standalone: true,
  imports: [CommonModule, NavBarComponent],
  template: `
    <app-nav-bar></app-nav-bar>

    <div class="container" style="max-width:960px">
      <button class="button btn-secondary mb-4" (click)="router.navigate(['/home'])">← Home</button>
      <h2 class="title is-4">Review and Freeze Plan</h2>
      <p class="subtitle is-6 text-secondary mb-5">Check everyone's hours before locking the plan for the week.</p>

      <div *ngIf="loading" class="has-text-centered py-6">
        <div class="button is-loading is-white"></div>
      </div>

      <div *ngIf="!loading && !week" class="notification is-app-info">
        No active planning week found.
      </div>

      <div *ngIf="!loading && week">
        <!-- Error -->
        <div *ngIf="error" class="notification is-app-danger mb-4">{{ error }}</div>

        <div class="columns">
          
          <!-- Category Summary -->
          <div class="column is-4">
            <div class="box sticky-box" style="position: sticky; top: 20px;">
              <h3 class="title is-5 mb-4">Category Budgets</h3>
              
              <div class="mb-4" *ngFor="let row of categoryRows">
                <div class="is-flex is-justify-content-space-between mb-1 is-size-7">
                  <span class="has-text-weight-bold">{{ row.label }}</span>
                  <span>
                     <span [class.has-text-danger]="row.planned > row.budget" [class.has-text-success]="row.planned === row.budget">{{ row.planned }} / {{ row.budget }}h</span>
                  </span>
                </div>
                <div class="progress-bar-outer">
                  <div class="progress-bar-inner" [style.width.%]="(row.planned / (row.budget || 1)) * 100" [class.is-over]="row.planned > row.budget" [class.is-ok]="row.planned === row.budget" style="background:var(--primary)"></div>
                </div>
              </div>

              <!-- Freeze Action -->
              <div class="mt-5 pt-4" style="border-top: 1px solid var(--border)">
                <div class="notification is-app-warning p-3 is-size-7 mb-3" *ngIf="!allReady">
                  Some members aren't ready/budgeted fully yet!
                </div>
                <!-- In this Angular port, keep the cancel button near the freeze, matching functionality of Alpine app -->
                <button class="button btn-primary is-fullwidth mb-2" (click)="freeze()" [disabled]="freezing">
                  {{ freezing ? 'Freezing...' : '❄️ Freeze the Plan' }}
                </button>
                <button class="button is-danger is-light is-fullwidth is-small" (click)="cancel()">🗑️ Cancel Week</button>
              </div>

            </div>
          </div>

          <!-- Member Readiness -->
          <div class="column is-8">
            <h3 class="title is-5 mb-4">Member Progress</h3>
            
            <div class="box mb-3 p-4" *ngFor="let row of memberRows" [style.border-left]="row.total === 30 && row.isReady ? '4px solid var(--success)' : (row.total === 30 ? '4px solid var(--warning)' : '4px solid var(--border)')">
              <div class="columns is-vcentered is-mobile is-multiline mb-0">
                <div class="column is-narrow">
                  <!-- User Avatar Placeholder -->
                  <div class="has-background-light has-text-centered has-text-weight-bold is-size-5" style="width: 40px; height: 40px; border-radius: 50%; line-height: 40px; color: var(--text-secondary)">
                    {{ row.name.charAt(0).toUpperCase() }}
                  </div>
                </div>
                <div class="column">
                  <strong class="is-size-5">{{ row.name }}</strong>
                  <div class="mt-1">
                    <span class="tag is-success is-light mr-2" *ngIf="row.isReady">✅ Ready</span>
                    <span class="tag is-warning is-light mr-2" *ngIf="!row.isReady && row.total === 30">✋ 30h Set (Not Ready)</span>
                    <span class="tag is-light mr-2" *ngIf="!row.isReady && row.total !== 30">⏳ Planning</span>
                  </div>
                </div>
                <div class="column is-narrow has-text-right">
                  <span class="is-size-4 has-text-weight-bold" [class.has-text-success]="row.total === 30" [class.has-text-danger]="row.total > 30">{{ row.total }}</span><span class="has-text-grey is-size-6">/30h</span>
                </div>
              </div>
              
              <div class="columns is-mobile is-multiline mt-2" *ngIf="row.total > 0">
                 <div class="column is-4 py-1">
                   <div class="is-size-7 has-text-grey">Client</div>
                   <div class="has-text-weight-bold">{{ row.client }}h</div>
                 </div>
                 <div class="column is-4 py-1">
                   <div class="is-size-7 has-text-grey">Tech Debt</div>
                   <div class="has-text-weight-bold">{{ row.techDebt }}h</div>
                 </div>
                 <div class="column is-4 py-1">
                   <div class="is-size-7 has-text-grey">R&D</div>
                   <div class="has-text-weight-bold">{{ row.rnd }}h</div>
                 </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  `
})
export class ReviewFreezeComponent implements OnInit {

  week: PlanningWeek | null = null;
  allItems: PlanItem[] = [];
  loading = true;
  freezing = false;
  error = '';
  allReady = false;

  categoryRows: any[] = [];
  memberRows: any[] = [];

  constructor(public router: Router, private api: ApiService) { }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.getActiveWeek().subscribe({
      next: (week) => {
        this.week = week;
        if (week) {
          this.api.getTeamProgress(week.id).subscribe({
            next: (items) => {
              this.allItems = items;
              this.buildRows(week, items);
              this.loading = false;
            },
            error: () => { this.loading = false; }
          });
        } else {
          this.loading = false;
        }
      },
      error: () => { this.loading = false; }
    });
  }

  buildRows(week: PlanningWeek, items: PlanItem[]): void {
    const totalHours = 30;

    // Category rows
    const cats = [
      {
        key: 'ClientFocused', label: 'Client Focused',
        pct: week.clientPct, badgeClass: 'badge-client'
      },
      {
        key: 'TechDebt', label: 'Tech Debt',
        pct: week.techDebtPct, badgeClass: 'badge-techdebt'
      },
      {
        key: 'RAndD', label: 'R&D',
        pct: week.rAndDPct, badgeClass: 'badge-rnd'
      }
    ];

    this.categoryRows = cats.map(c => ({
      label: c.label,
      badgeClass: c.badgeClass,
      budget: Math.round(totalHours * c.pct / 100) * week.participants.length,
      planned: items
        .filter(i => i.category === c.key)
        .reduce((s, i) => s + i.committedHours, 0)
    }));

    // Member rows
    this.memberRows = week.participants.map(p => {
      const myItems = items.filter(i => i.memberId === p.memberId);
      return {
        name: p.name,
        isReady: p.isReady,
        total: myItems.reduce((s, i) => s + i.committedHours, 0),
        client: myItems
          .filter(i => i.category === 'ClientFocused')
          .reduce((s, i) => s + i.committedHours, 0),
        techDebt: myItems
          .filter(i => i.category === 'TechDebt')
          .reduce((s, i) => s + i.committedHours, 0),
        rnd: myItems
          .filter(i => i.category === 'RAndD')
          .reduce((s, i) => s + i.committedHours, 0)
      };
    });

    this.allReady = week.participants.every(p => p.isReady);
  }

  freeze(): void {
    if (!this.week) return;
    if (!confirm('Freeze the plan? Members will only be able to log progress after this.')) return;
    this.freezing = true;
    this.error = '';
    this.api.freezeWeek(this.week.id).subscribe({
      next: () => {
        this.freezing = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to freeze.';
        this.freezing = false;
      }
    });
  }

  cancel(): void {
    if (!this.week) return;
    if (!confirm('Cancel this week? All plans will be deleted.')) return;
    this.api.cancelWeek(this.week.id).subscribe({
      next: () => this.router.navigate(['/home']),
      error: () => alert('Failed to cancel week.')
    });
  }
}

