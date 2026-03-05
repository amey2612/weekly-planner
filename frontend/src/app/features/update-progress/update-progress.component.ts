import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavBarComponent } from '../../shared/components/nav-bar.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PlanItem, TaskStatus, BacklogCategory } from '../../core/models/models';

@Component({
  selector: 'app-update-progress',
  standalone: true,
  imports: [CommonModule, FormsModule, NavBarComponent],
  template: `
    <app-nav-bar></app-nav-bar>

    <div class="container" style="max-width:960px">
      <button class="button btn-secondary mb-4" (click)="router.navigate(['/home'])">← Home</button>
      <h2 class="title is-4">Update My Progress</h2>
      <p class="subtitle is-6 text-secondary mb-5">Log hours against your committed work.</p>

      <div *ngIf="loading" class="has-text-centered py-6">
        <div class="button is-loading is-white"></div>
      </div>

      <div *ngIf="!loading && !weekId" class="notification is-app-info">
        No active frozen week. Progress can only be logged after the plan is frozen.
      </div>

      <div *ngIf="!loading && weekId">
        <!-- Overall progress -->
        <div class="box mb-5">
           <h3 class="title is-5 mb-2">Overall Progress</h3>
           <div class="is-flex is-justify-content-space-between mb-1">
             <span class="has-text-weight-bold">Total Done</span>
             <span [class.has-text-warning]="pct > 100">{{ totalDone }} / 30h ({{ pct }}%)</span>
           </div>
           <div class="progress-bar-outer"><div class="progress-bar-inner" style="background:var(--success)" [style.width.%]="pct > 100 ? 100 : pct" [class.is-over]="pct > 100"></div></div>
        </div>

        <h3 class="title is-5 mb-4 mt-5">My Tasks</h3>
        <div *ngIf="items.length === 0" class="notification is-app-info is-light">
          No tasks planned.
        </div>

        <div class="box mb-3" *ngFor="let item of items" style="border-left: 4px solid var(--border); padding: 1rem;" [style.border-left-color]="item.status === 'Done' ? 'var(--success)' : (item.status === 'InProgress' ? 'var(--info)' : 'var(--border)')">
          <div class="columns is-multiline">
             <div class="column is-8">
               <div class="is-flex is-align-items-center mb-2">
                 <span class="tag is-cat mr-2 is-light">{{ categoryLabel(item.category) }}</span>
                 <span class="tag" [ngClass]="{'is-light': item.status==='NotStarted', 'is-info is-light': item.status==='InProgress', 'is-danger is-light': item.status==='Blocked', 'is-success is-light': item.status==='Done'}">{{ item.status }}</span>
               </div>
               <strong class="is-size-5 block mb-1">{{ item.backlogItemTitle }}</strong>
               <p class="text-secondary is-size-7 mb-2">Committed: <strong>{{ item.committedHours }}h</strong> • Logged: <strong [class.has-text-danger]="item.completedHours > item.committedHours">{{ item.completedHours }}h</strong></p>
               <div class="notification is-app-warning is-light py-2 px-3 is-size-7 mb-2" *ngIf="item.completedHours > item.committedHours">
                 ⚠ Logged more than committed.
               </div>
             </div>
             <div class="column is-4 has-text-right-tablet">
               <button class="button is-small" [class.is-success]="item.status === 'Done'" [class.is-light]="item.status === 'Done'" [class.btn-secondary]="item.status !== 'Done'" (click)="startEdit(item)" *ngIf="editingId !== item.id" [disabled]="item.status === 'Done'">
                 {{ item.status === 'Done' ? '✅ Finished' : '✏️ Log Progress' }}
               </button>
             </div>
          </div>
          
          <!-- Edit Form -->
          <div class="box has-background-light mt-3" *ngIf="editingId === item.id">
            <h4 class="has-text-weight-bold mb-3">Update Progress</h4>
            
            <div class="columns">
               <div class="column is-4">
                 <div class="field">
                   <label class="label is-small">Total hours done</label>
                   <div class="control">
                     <input class="input" type="number" [(ngModel)]="editHours" min="0" step="0.5">
                   </div>
                 </div>
               </div>
               <div class="column is-4">
                 <div class="field">
                   <label class="label is-small">Current Status</label>
                   <div class="control">
                     <div class="select is-fullwidth">
                       <select [(ngModel)]="editStatus">
                         <option value="NotStarted">Not Started</option>
                         <option value="InProgress">In Progress</option>
                         <option value="Blocked">Blocked</option>
                         <option value="Done">Done</option>
                       </select>
                     </div>
                   </div>
                 </div>
               </div>
               <div class="column is-4">
                 <div class="field">
                   <label class="label is-small">Notes (Optional)</label>
                   <div class="control">
                     <input class="input" type="text" [(ngModel)]="editNote" placeholder="Any blockers?">
                   </div>
                 </div>
               </div>
            </div>
            
            <div class="buttons mt-2">
              <button class="button btn-primary is-small" (click)="saveProgress(item)" [disabled]="saving">Save</button>
              <button class="button is-ghost is-small" (click)="editingId = null">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UpdateProgressComponent implements OnInit {

  items: PlanItem[] = [];
  loading = true;
  saving = false;
  weekId = '';
  totalDone = 0;
  pct = 0;

  editingId: string | null = null;
  editHours = 0;
  editStatus: TaskStatus = 'InProgress';
  editNote = '';

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
    this.load();
  }

  load(): void {
    this.api.getActiveWeek().subscribe({
      next: (week) => {
        if (!week || week.state === 'Setup' || week.state === 'Planning') {
          this.loading = false;
          return;
        }
        this.weekId = week.id;
        this.api.getMyProgress(week.id, this.memberId).subscribe({
          next: (items) => {
            this.items = items;
            this.totalDone = items.reduce(
              (s, i) => s + i.completedHours, 0);
            this.pct = Math.round((this.totalDone / 30) * 100);
            this.loading = false;
          },
          error: () => { this.loading = false; }
        });
      },
      error: () => { this.loading = false; }
    });
  }

  startEdit(item: PlanItem): void {
    this.editingId = item.id;
    this.editHours = item.completedHours;
    this.editStatus = item.status;
    this.editNote = '';
  }

  saveProgress(item: PlanItem): void {
    this.saving = true;
    this.api.logProgress({
      planItemId: item.id,
      weekId: this.weekId,
      memberId: this.memberId,
      hoursLogged: this.editHours,
      status: this.editStatus,
      note: this.editNote
    }).subscribe({
      next: () => {
        this.editingId = null;
        this.saving = false;
        this.load();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to save progress.');
        this.saving = false;
      }
    });
  }

  categoryLabel(cat: BacklogCategory): string {
    const map: Record<BacklogCategory, string> = {
      ClientFocused: 'Client', TechDebt: 'Tech Debt', RAndD: 'R&D'
    };
    return map[cat] ?? cat;
  }
}

