import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavBarComponent } from '../../shared/components/nav-bar.component';
import { ApiService } from '../../core/services/api.service';
import { PlanningWeek, PlanItem, BacklogCategory } from '../../core/models/models';

@Component({
  selector: 'app-team-progress',
  standalone: true,
  imports: [CommonModule, NavBarComponent],
  template: `
    <app-nav-bar></app-nav-bar>

    <div class="container" style="max-width:960px">
      <div class="is-flex is-justify-content-space-between is-align-items-center mb-4">
        <div>
          <button class="button btn-secondary mr-2" (click)="router.navigate(['/home'])">← Home</button>
          <span class="title is-4 vertical-align-middle">See Team Progress</span>
        </div>
        <button class="button btn-danger is-light" *ngIf="week && week.state === 'Frozen'" (click)="closeWeek()">✅ Close This Week</button>
      </div>

      <div *ngIf="loading" class="has-text-centered py-6">
        <div class="button is-loading is-white"></div>
      </div>

      <div *ngIf="!loading && !week" class="notification is-app-info">
        No active week. Progress can only be viewed during an active week.
      </div>

      <div *ngIf="!loading && week">
        <!-- Dashboard Stats -->
        <div class="columns is-multiline">
          <div class="column is-3-desktop is-6-tablet">
            <div class="box has-text-centered p-4">
               <p class="is-size-1 has-text-info has-text-weight-bold">{{ totalTasks }}</p>
               <p class="text-secondary is-size-7 has-text-weight-bold is-uppercase">Total Tasks</p>
            </div>
          </div>
          <div class="column is-3-desktop is-6-tablet">
            <div class="box has-text-centered p-4">
               <p class="is-size-1 has-text-success has-text-weight-bold">{{ doneTasks }}</p>
               <p class="text-secondary is-size-7 has-text-weight-bold is-uppercase">Done Tasks</p>
            </div>
          </div>
          <div class="column is-3-desktop is-6-tablet">
            <div class="box has-text-centered p-4">
               <p class="is-size-1 has-text-danger has-text-weight-bold">{{ blockedTasks }}</p>
               <p class="text-secondary is-size-7 has-text-weight-bold is-uppercase">Blocked Tasks</p>
            </div>
          </div>
          <div class="column is-3-desktop is-6-tablet">
            <div class="box has-text-centered p-4">
               <p class="is-size-1 has-text-primary has-text-weight-bold">{{ teamPct }}%</p>
               <p class="text-secondary is-size-7 has-text-weight-bold is-uppercase">Hours Complete</p>
            </div>
          </div>
        </div>

        <div class="columns">
          <!-- By Category -->
          <div class="column is-4">
            <div class="box sticky-box">
              <h3 class="title is-5 mb-4">By Category</h3>
              <div class="mb-4" *ngFor="let cat of categoryProgress">
                <div class="is-flex is-justify-content-space-between mb-1 is-size-7">
                  <span class="has-text-weight-bold">{{ cat.label }}</span>
                  <span class="text-secondary">{{ cat.done }} / {{ cat.committed }}h</span>
                </div>
                <div class="progress-bar-outer">
                  <div class="progress-bar-inner" style="background:var(--primary)" [style.width.%]="cat.committed > 0 ? (cat.done / cat.committed) * 100 : 0"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- By Member -->
          <div class="column is-8">
            <h3 class="title is-5 mb-4">By Member</h3>
            <div class="box p-0" style="overflow-x: auto;">
              <table class="table is-fullwidth is-hoverable mb-0">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Tasks</th>
                    <th>Hours Done</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let row of memberProgress" style="cursor:pointer;" (click)="viewMember(row.memberId)">
                    <td class="has-text-weight-bold">{{ row.name }}</td>
                    <td>
                      <span class="tag is-success is-light" *ngIf="row.done > 0">{{ row.done }}</span>
                      <span class="tag is-danger is-light ml-1" *ngIf="row.blocked > 0">!{{ row.blocked }}</span>
                      <span class="text-secondary is-size-7 ml-1" *ngIf="row.done === 0 && row.blocked === 0">{{ row.tasks }}</span>
                    </td>
                    <td><strong [class.has-text-success]="row.hoursDone >= 30">{{ row.hoursDone }}</strong><span class="text-secondary is-size-7">/30h</span></td>
                    <td style="vertical-align: middle; width: 30%;">
                      <div class="progress-bar-outer" style="height: 6px;">
                        <div class="progress-bar-inner" [class.is-ok]="row.hoursDone >= 30" style="background:var(--info)" [style.width.%]="(row.hoursDone / 30) * 100"></div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="is-size-7 text-secondary mt-2 has-text-right">Click a member to see their specific tasks.</p>
          </div>
        </div>
      </div>

      <!-- Member Details Modal -->
      <div class="modal is-active" *ngIf="selectedMemberId">
        <div class="modal-background" (click)="selectedMemberId = null"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">{{ selectedMemberName }}'s Plan</p>
            <button class="delete" aria-label="close" (click)="selectedMemberId = null"></button>
          </header>
          <section class="modal-card-body p-0">
            <div class="notification is-app-info m-4" *ngIf="selectedMemberItems.length === 0">This member has no tasks.</div>
            <table class="table is-fullwidth is-striped mb-0" *ngIf="selectedMemberItems.length > 0">
               <thead>
                 <tr>
                   <th>Task</th>
                   <th>Category</th>
                   <th>Hours</th>
                   <th>Status</th>
                 </tr>
               </thead>
               <tbody>
                 <tr *ngFor="let item of selectedMemberItems">
                   <td><strong class="is-size-6">{{ item.backlogItemTitle }}</strong></td>
                   <td><span class="tag is-cat is-light">{{ categoryLabel(item.category) }}</span></td>
                   <td>{{ item.completedHours }} / {{ item.committedHours }}h</td>
                   <td><span class="tag" [ngClass]="{'is-light': item.status==='NotStarted', 'is-info is-light': item.status==='InProgress', 'is-danger is-light': item.status==='Blocked', 'is-success is-light': item.status==='Done'}">{{ item.status }}</span></td>
                 </tr>
               </tbody>
            </table>
          </section>
          <footer class="modal-card-foot" style="justify-content: flex-end;">
            <button class="button" (click)="selectedMemberId = null">Close</button>
          </footer>
        </div>
      </div>

    </div>
  `
})
export class TeamProgressComponent implements OnInit {

  week: PlanningWeek | null = null;
  allItems: PlanItem[] = [];
  loading = true;

  totalTasks = 0;
  doneTasks = 0;
  blockedTasks = 0;
  teamPct = 0;

  categoryProgress: any[] = [];
  memberProgress: any[] = [];

  selectedMemberId: string | null = null;
  selectedMemberName = '';
  selectedMemberItems: PlanItem[] = [];

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
              this.buildStats(week, items);
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

  buildStats(week: PlanningWeek, items: PlanItem[]): void {
    this.totalTasks = items.length;
    this.doneTasks = items.filter(i => i.status === 'Done').length;
    this.blockedTasks = items.filter(i => i.status === 'Blocked').length;
    const totalDone = items.reduce((s, i) => s + i.completedHours, 0);
    const totalCommitted = items.reduce((s, i) => s + i.committedHours, 0);
    this.teamPct = totalCommitted > 0
      ? Math.round((totalDone / totalCommitted) * 100) : 0;

    // Category breakdown
    const cats = [
      {
        key: 'ClientFocused', label: 'Client Focused',
        badgeClass: 'badge-client'
      },
      {
        key: 'TechDebt', label: 'Tech Debt',
        badgeClass: 'badge-techdebt'
      },
      {
        key: 'RAndD', label: 'R&D',
        badgeClass: 'badge-rnd'
      }
    ];

    this.categoryProgress = cats.map(c => {
      const catItems = items.filter(i => i.category === c.key);
      return {
        ...c,
        committed: catItems.reduce((s, i) => s + i.committedHours, 0),
        done: catItems.reduce((s, i) => s + i.completedHours, 0)
      };
    });

    // Member breakdown
    this.memberProgress = week.participants.map(p => {
      const myItems = items.filter(i => i.memberId === p.memberId);
      return {
        memberId: p.memberId,
        name: p.name,
        tasks: myItems.length,
        done: myItems.filter(i => i.status === 'Done').length,
        blocked: myItems.filter(i => i.status === 'Blocked').length,
        hoursDone: myItems.reduce((s, i) => s + i.completedHours, 0)
      };
    });
  }

  viewMember(memberId: string): void {
    const row = this.memberProgress.find(m => m.memberId === memberId);
    this.selectedMemberId = memberId;
    this.selectedMemberName = row?.name ?? '';
    this.selectedMemberItems = this.allItems.filter(
      i => i.memberId === memberId);
  }

  closeWeek(): void {
    if (!this.week) return;
    if (!confirm('Close this week? This cannot be undone.')) return;
    this.api.closeWeek(this.week.id).subscribe({
      next: () => this.router.navigate(['/home']),
      error: () => alert('Failed to close week.')
    });
  }

  categoryLabel(cat: BacklogCategory): string {
    const map: Record<BacklogCategory, string> = {
      ClientFocused: 'Client', TechDebt: 'Tech Debt', RAndD: 'R&D'
    };
    return map[cat] ?? cat;
  }
}

