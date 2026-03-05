import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavBarComponent } from '../../shared/components/nav-bar.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import {
  PlanningWeek, PlanItem, BacklogItem,
  BacklogCategory, CategoryBudget
} from '../../core/models/models';

@Component({
  selector: 'app-plan-my-work',
  standalone: true,
  imports: [CommonModule, FormsModule, NavBarComponent],
  template: `
    <div class="container" style="max-width:960px">
      <button class="button btn-secondary mb-4" (click)="router.navigate(['/home'])">← Home</button>
      <h2 class="title is-4">Plan Your Work</h2>

      <div *ngIf="loading" class="has-text-centered py-6">
        <div class="button is-loading is-white"></div>
      </div>

      <div *ngIf="!loading && !week" class="notification is-app-info">
        No active planning week. Check with your Team Lead.
      </div>

      <div *ngIf="!loading && week">
        <div class="columns">
          
          <!-- LEFT: My Plan & Add Work -->
          <div class="column is-8">
            <div class="box mb-4">
              <h3 class="title is-5 mb-2">My Plan</h3>
              <p class="text-secondary mb-4">Choose items from the backlog to fill your week.</p>
              
              <div *ngIf="planItems.length === 0" class="notification is-app-info is-light">
                 Your plan is empty. Click the button below to add work.
              </div>

              <div class="box mb-2" *ngFor="let item of planItems" style="border-left: 4px solid var(--primary); padding: 0.75rem 1rem;">
                <div class="columns is-vcentered is-mobile is-multiline">
                  <div class="column">
                    <strong>{{ item.backlogItemTitle }}</strong>
                    <span class="tag is-cat ml-1 is-light">{{ categoryLabel(item.category) }}</span>
                    <p class="text-secondary is-size-7 mt-1">{{ item.committedHours }}h committed</p>
                  </div>
                  <div class="column is-narrow">
                    <button class="button is-small is-danger is-light" (click)="removeItem(item)">Remove</button>
                  </div>
                </div>
              </div>

              <div class="mt-4">
                 <button class="button btn-secondary is-fullwidth" (click)="showPicker = true" [disabled]="totalPlanned >= 30">
                   ➕ Add Work from Backlog
                 </button>
              </div>
            </div>
            
            <div class="box has-text-centered mb-4 py-5" [class.overage]="totalPlanned > 30">
               <p class="mb-3">When you've hit exactly 30 hours, mark your plan as ready so the Team Lead can freeze it.</p>
               <button class="button is-medium" 
                 [class.btn-primary]="totalPlanned === 30 && !isReady" 
                 [class.is-success]="isReady"
                 [disabled]="totalPlanned !== 30" 
                 (click)="markReady()">
                 {{ isReady ? '✅ Ready!' : 'Mark as Ready (30h)' }}
               </button>
            </div>
          </div>

          <!-- RIGHT: Budget Status -->
          <div class="column is-4">
             <div class="box sticky-box" style="position: sticky; top: 20px;">
               <h3 class="title is-5">Hours Summary</h3>
               
               <div class="mb-4">
                 <div class="is-flex is-justify-content-space-between mb-1">
                   <strong>Total Hours</strong>
                   <strong [class.has-text-danger]="totalPlanned > 30" [class.has-text-success]="totalPlanned === 30">{{ totalPlanned }} / 30h</strong>
                 </div>
                 <div class="progress-bar-outer"><div class="progress-bar-inner" [style.width.%]="(totalPlanned / 30) * 100" [class.is-ok]="totalPlanned === 30" [class.is-over]="totalPlanned > 30"></div></div>
               </div>
               
               <hr>
               
               <div class="mb-3" *ngFor="let b of budgets">
                 <div class="is-flex is-justify-content-space-between mb-1 is-size-7">
                   <span>{{ b.label }}</span>
                   <span [class.has-text-danger]="b.plannedHours > b.maxHours">{{ b.plannedHours }} / {{ b.maxHours }}h</span>
                 </div>
                 <div class="progress-bar-outer"><div class="progress-bar-inner" style="background:var(--primary)" [style.width.%]="(b.plannedHours / (b.maxHours || 1)) * 100" [class.is-over]="b.plannedHours > b.maxHours"></div></div>
               </div>
               
             </div>
          </div>
        </div>
      </div>

      <!-- ── BACKLOG PICKER MODAL ── -->
      <div class="modal is-active" *ngIf="showPicker">
        <div class="modal-background" (click)="showPicker=false; selectedBacklog=null; pickerHours=0"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Pick a Backlog Item</p>
            <button class="delete" aria-label="close" (click)="showPicker=false; selectedBacklog=null; pickerHours=0"></button>
          </header>
          <section class="modal-card-body">
            <p class="mb-4 has-text-weight-bold">You have {{ 30 - totalPlanned }} hours left to plan.</p>
            
            <div *ngIf="backlogLoading" class="has-text-centered py-6">
              <div class="button is-loading is-white"></div>
            </div>

            <!-- List -->
            <div *ngIf="!selectedBacklog && !backlogLoading">
              <div class="notification is-app-info" *ngIf="availableBacklog.length === 0">No available items in the backlog.</div>
              <div class="box mb-2 action-card" *ngFor="let item of availableBacklog" (click)="selectBacklogItem(item)" style="padding: 1rem;">
                <strong>{{ item.title }}</strong>
                <span class="tag is-cat ml-2 is-light">{{ categoryLabel(item.category) }}</span>
                <p class="text-secondary is-size-7 mt-1" *ngIf="item.estimatedHours">~{{ item.estimatedHours }}h estimated • {{ remainingForCategory(item.category) }}h budget remaining</p>
              </div>
            </div>

            <!-- Detail/Commit -->
            <div *ngIf="selectedBacklog">
              <button class="button is-small is-ghost mb-3 px-0" (click)="selectedBacklog=null; pickerHours=0">← Back to list</button>
              <h4 class="title is-5 mb-2">{{ selectedBacklog.title }}</h4>
              <span class="tag is-cat mb-4 is-light">{{ categoryLabel(selectedBacklog.category) }}</span>
              <p class="mb-4">{{ selectedBacklog.description || 'No description provided.' }}</p>
              
              <div class="box has-background-light">
                <div class="field">
                  <label class="label">Hours to commit (Max: {{ remainingForCategory(selectedBacklog.category) }}h)</label>
                  <div class="control">
                    <input class="input is-medium block" type="number" [(ngModel)]="pickerHours" min="0.5" [max]="remainingForCategory(selectedBacklog.category)" step="0.5">
                  </div>
                  <p class="help has-text-danger" *ngIf="pickerError">{{ pickerError }}</p>
                </div>
              </div>
            </div>
            
          </section>
          <footer class="modal-card-foot" style="justify-content: flex-end;">
            <button class="button" (click)="showPicker=false; selectedBacklog=null; pickerHours=0">Cancel</button>
            <button class="button btn-primary" *ngIf="selectedBacklog" (click)="confirmAdd()" [disabled]="!pickerHours || pickerHours <= 0 || addingItem || pickerHours > remainingForCategory(selectedBacklog!.category)">
              {{ addingItem ? 'Adding...' : 'Add to Plan' }}
            </button>
          </footer>
        </div>
      </div>

    </div>
  `
})
export class PlanMyWorkComponent implements OnInit {

  week: PlanningWeek | null = null;
  planItems: PlanItem[] = [];
  availableBacklog: BacklogItem[] = [];
  budgets: CategoryBudget[] = [];

  loading = true;
  backlogLoading = false;
  showPicker = false;
  addingItem = false;
  isReady = false;

  selectedBacklog: BacklogItem | null = null;
  pickerHours = 0;
  pickerError = '';
  totalPlanned = 0;

  private memberId = '';

  constructor(
    public router: Router,
    private api: ApiService,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user) { this.router.navigate(['/login']); return; }
    this.memberId = user.memberId;
    this.loadWeekAndPlan();
  }

  loadWeekAndPlan(): void {
    this.api.getActiveWeek().subscribe({
      next: (week) => {
        this.week = week;
        if (week) {
          this.calcBudgets(week);
          this.loadPlan(week.id);
        } else {
          this.loading = false;
        }
      },
      error: () => { this.loading = false; }
    });
  }

  loadPlan(weekId: string): void {
    this.api.getMyPlan(weekId, this.memberId).subscribe({
      next: (items) => {
        this.planItems = items;
        this.totalPlanned = items.reduce((s, i) => s + i.committedHours, 0);
        this.updateBudgets();

        // Check if member is already ready
        const me = this.week?.participants
          .find(p => p.memberId === this.memberId);
        this.isReady = me?.isReady ?? false;

        this.loading = false;
        // Load backlog whenever plan changes
        this.loadBacklog();
      },
      error: () => { this.loading = false; }
    });
  }

  loadBacklog(): void {
    this.backlogLoading = true;
    this.api.getBacklog('Available').subscribe({
      next: (items) => {
        // Filter out items already in my plan
        const myItemIds = new Set(this.planItems.map(p => p.backlogItemId));
        this.availableBacklog = items.filter(i => !myItemIds.has(i.id));
        this.backlogLoading = false;
      },
      error: () => { this.backlogLoading = false; }
    });
  }

  calcBudgets(week: PlanningWeek): void {
    this.budgets = [
      {
        category: 'ClientFocused',
        label: 'Client Focused',
        maxHours: Math.round(30 * week.clientPct / 100),
        plannedHours: 0,
        remaining: Math.round(30 * week.clientPct / 100)
      },
      {
        category: 'TechDebt',
        label: 'Tech Debt',
        maxHours: Math.round(30 * week.techDebtPct / 100),
        plannedHours: 0,
        remaining: Math.round(30 * week.techDebtPct / 100)
      },
      {
        category: 'RAndD',
        label: 'R&D',
        maxHours: Math.round(30 * week.rAndDPct / 100),
        plannedHours: 0,
        remaining: Math.round(30 * week.rAndDPct / 100)
      }
    ];
  }

  updateBudgets(): void {
    this.budgets.forEach(b => {
      b.plannedHours = this.planItems
        .filter(p => p.category === b.category)
        .reduce((s, p) => s + p.committedHours, 0);
      b.remaining = b.maxHours - b.plannedHours;
    });
  }

  remainingForCategory(category: BacklogCategory): number {
    const b = this.budgets.find(x => x.category === category);
    const catRemaining = b ? b.remaining : 0;
    const totalRemaining = 30 - this.totalPlanned;
    return Math.min(catRemaining, totalRemaining);
  }

  selectBacklogItem(item: BacklogItem): void {
    this.selectedBacklog = item;
    this.pickerHours = Math.min(
      item.estimatedHours || 1,
      this.remainingForCategory(item.category)
    );
    this.pickerError = '';
  }

  confirmAdd(): void {
    if (!this.selectedBacklog || !this.week) return;
    this.addingItem = true;
    this.pickerError = '';

    this.api.addPlanItem({
      weekId: this.week.id,
      backlogItemId: this.selectedBacklog.id,
      committedHours: this.pickerHours,
      memberId: this.memberId
    }).subscribe({
      next: () => {
        this.showPicker = false;
        this.selectedBacklog = null;
        this.pickerHours = 0;
        this.addingItem = false;
        this.loadPlan(this.week!.id);
      },
      error: (err) => {
        this.pickerError = err.error?.message || 'Failed to add item.';
        this.addingItem = false;
      }
    });
  }

  removeItem(item: PlanItem): void {
    if (!confirm(`Remove "${item.backlogItemTitle}" from your plan?`)) return;
    this.api.removePlanItem(item.id, item.weekId).subscribe({
      next: () => this.loadPlan(this.week!.id),
      error: () => alert('Failed to remove item.')
    });
  }

  markReady(): void {
    if (!this.week) return;
    this.api.markReady(this.week.id, this.memberId).subscribe({
      next: () => { this.isReady = true; },
      error: (err) => alert(err.error?.message || 'Failed to mark ready.')
    });
  }

  categoryLabel(cat: BacklogCategory): string {
    const map: Record<BacklogCategory, string> = {
      ClientFocused: 'Client', TechDebt: 'Tech Debt', RAndD: 'R&D'
    };
    return map[cat] ?? cat;
  }
}

