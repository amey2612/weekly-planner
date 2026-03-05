import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { PlanningWeek } from '../../core/models/models';

@Component({
  selector: 'app-past-weeks',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container" style="max-width:960px">
      <div class="is-flex is-justify-content-space-between is-align-items-center mb-4">
        <div>
          <button class="button btn-secondary mr-2" (click)="router.navigate(['/home'])">← Home</button>
          <span class="title is-4 vertical-align-middle">Past Weeks</span>
        </div>
      </div>

      <div *ngIf="loading" class="has-text-centered py-6">
        <div class="button is-loading is-white"></div>
      </div>

      <div *ngIf="!loading && pastWeeks.length === 0" class="notification is-app-info">
        No past weeks yet. Weeks appear here after they are closed.
      </div>

      <div class="columns is-multiline">
        <div class="column is-6" *ngFor="let week of pastWeeks">
          <div class="box h-100 is-flex is-flex-direction-column">
            <div class="is-flex is-justify-content-space-between is-align-items-flex-start mb-3">
               <h3 class="title is-5 mb-0">Week of {{ week.tuesdayDate | date:'MMM d, y' }}</h3>
               <span class="tag is-light is-rounded">Archived</span>
            </div>
            
            <div class="columns is-mobile is-multiline mb-2 mt-auto">
               <div class="column is-6 py-1">
                 <div class="is-size-7 text-secondary">Members</div>
                 <div class="has-text-weight-bold">{{ week.participants.length }}</div>
               </div>
               <div class="column is-6 py-1">
                 <div class="is-size-7 text-secondary">Client Split</div>
                 <div class="has-text-weight-bold">{{ week.clientPct }}%</div>
               </div>
               <div class="column is-6 py-1">
                 <div class="is-size-7 text-secondary">Tech Debt Split</div>
                 <div class="has-text-weight-bold">{{ week.techDebtPct }}%</div>
               </div>
               <div class="column is-6 py-1">
                 <div class="is-size-7 text-secondary">R&D Split</div>
                 <div class="has-text-weight-bold">{{ week.rAndDPct }}%</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PastWeeksComponent implements OnInit {

  pastWeeks: PlanningWeek[] = [];
  loading = true;

  constructor(public router: Router, private api: ApiService) { }

  ngOnInit(): void {
    this.api.getAllWeeks().subscribe({
      next: (weeks) => {
        // Only show closed weeks
        this.pastWeeks = weeks
          .filter(w => w.state === 'Closed')
          .sort((a, b) =>
            new Date(b.tuesdayDate).getTime() -
            new Date(a.tuesdayDate).getTime());
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}

