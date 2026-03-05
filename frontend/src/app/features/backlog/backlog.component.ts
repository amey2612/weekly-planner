import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavBarComponent } from '../../shared/components/nav-bar.component';
import { ApiService } from '../../core/services/api.service';
import {
  BacklogItem, BacklogCategory, BacklogState
} from '../../core/models/models';

@Component({
  selector: 'app-backlog',
  standalone: true,
  imports: [CommonModule, FormsModule, NavBarComponent],
  template: `
    <app-nav-bar></app-nav-bar>

    <div class="container" style="max-width:960px">
      <button class="button btn-secondary mb-4" (click)="router.navigate(['/home'])">← Home</button>
      <h2 class="title is-4">Manage Backlog</h2>
      
      <!-- In the Vue app, it has an Add New Item button that toggles a view.
           Here we just show the Add form at the top (which matches the original logic but with Bulma styling). -->
      
      <div class="box mb-4">
        <h3 class="title is-5">Add a New Backlog Item</h3>
        <div class="field"><label class="label">Title *</label><div class="control"><input class="input" type="text" [(ngModel)]="form.title" placeholder="What is this work about?" maxlength="200"></div></div>
        <div class="field"><label class="label">Description</label><div class="control"><textarea class="textarea" [(ngModel)]="form.description" placeholder="Add more details here (optional)" maxlength="5000"></textarea></div></div>
        <div class="field"><label class="label">Category *</label><div class="control"><div class="select"><select [(ngModel)]="form.category">
          <option value="">Pick a category</option>
          <option value="ClientFocused">Client Focused</option>
          <option value="TechDebt">Tech Debt</option>
          <option value="RAndD">R&D</option>
        </select></div></div></div>
        <div class="field"><label class="label">Estimated hours (optional)</label><div class="control"><input class="input" type="number" [(ngModel)]="form.estimatedHours" placeholder="How many hours might this take?" min="0" max="999.5" step="0.5"></div></div>
        <p class="help has-text-danger mb-2" *ngIf="addError">{{ addError }}</p>
        <div class="field is-grouped">
          <div class="control"><button class="button btn-primary" (click)="addItem()" [disabled]="!form.title || !form.category || saving">{{ saving ? 'Adding...' : 'Save This Item' }}</button></div>
        </div>
      </div>

      <!-- Filters -->
      <div class="field is-grouped is-grouped-multiline mb-3">
        <div class="control" *ngFor="let f of filters">
          <button class="button is-small" [class.btn-primary]="activeFilter === f.value && f.value !== ''" [class.is-dark]="activeFilter === f.value && f.value === ''" [class.btn-secondary]="activeFilter !== f.value" (click)="setFilter(f.value)">
            {{ f.label }}
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="has-text-centered py-6">
        <div class="button is-loading is-white"></div>
      </div>

      <div *ngIf="!loading">
        <div class="notification is-app-info" *ngIf="items.length === 0">No backlog items match your filters.</div>

        <div class="box mb-2" *ngFor="let item of items">
          <div class="columns is-vcentered is-mobile is-multiline">
            <div class="column">
              <strong>{{ item.title }}</strong>
              <span class="tag is-cat ml-1" 
                [ngClass]="{
                  'cat-badge-CLIENT_FOCUSED': item.category==='ClientFocused',
                  'cat-badge-TECH_DEBT': item.category==='TechDebt',
                  'cat-badge-R_AND_D': item.category==='RAndD'
                }">
                {{ categoryLabel(item.category) }}
              </span>
              <span class="tag is-light ml-1">{{ item.state }}</span>
              <span class="text-secondary is-size-7 ml-1" *ngIf="item.estimatedHours">{{ item.estimatedHours }}h est.</span>
              <p class="text-secondary is-size-7 mt-1" *ngIf="item.description">{{ item.description.substring(0, 100) }}{{ item.description.length > 100 ? '...' : '' }}</p>
            </div>
            <div class="column is-narrow">
              <button class="button is-small btn-danger" *ngIf="item.state !== 'Archived'" (click)="archive(item)">Archive</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BacklogComponent implements OnInit {

  items: BacklogItem[] = [];
  loading = true;
  saving = false;
  addError = '';
  activeFilter: BacklogState | '' = '';

  form = {
    title: '',
    description: '',
    category: '' as BacklogCategory | '',
    estimatedHours: 0
  };

  filters = [
    { label: 'All', value: '' },
    { label: 'Available', value: 'Available' },
    { label: 'Picked', value: 'Picked' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Archived', value: 'Archived' }
  ];

  constructor(public router: Router, private api: ApiService) { }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const state = this.activeFilter || undefined;
    this.api.getBacklog(state).subscribe({
      next: (items) => { this.items = items; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  setFilter(value: any): void {
    this.activeFilter = value;
    this.load();
  }

  categoryLabel(cat: BacklogCategory): string {
    const map: Record<BacklogCategory, string> = {
      ClientFocused: 'Client',
      TechDebt: 'Tech Debt',
      RAndD: 'R&D'
    };
    return map[cat] ?? cat;
  }

  addItem(): void {
    if (!this.form.title || !this.form.category) return;
    this.saving = true;
    this.addError = '';
    this.api.createBacklogItem({
      title: this.form.title,
      description: this.form.description,
      category: this.form.category as BacklogCategory,
      estimatedHours: this.form.estimatedHours
    }).subscribe({
      next: () => {
        this.form = { title: '', description: '', category: '', estimatedHours: 0 };
        this.saving = false;
        this.load();
      },
      error: () => { this.addError = 'Failed to add item.'; this.saving = false; }
    });
  }

  archive(item: BacklogItem): void {
    if (!confirm(`Archive "${item.title}"?`)) return;
    this.api.archiveBacklogItem(item.id, item.category).subscribe({
      next: () => this.load(),
      error: () => alert('Failed to archive.')
    });
  }
}
