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

    <div class="page-container">
      <div class="page-header">
        <h1>📋 Backlog</h1>
        <button class="btn btn-ghost" (click)="router.navigate(['/home'])">
          ← Home
        </button>
      </div>

      <!-- Add Item Form -->
      <div class="card mb-16">
        <h2 class="mb-16">➕ Add Backlog Item</h2>
        <div class="form-group">
          <label>Title *</label>
          <input [(ngModel)]="form.title" placeholder="e.g. Rebuild login page">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea [(ngModel)]="form.description"
            placeholder="What needs to be done?"></textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group">
            <label>Category *</label>
            <select [(ngModel)]="form.category">
              <option value="">Select category</option>
              <option value="ClientFocused">Client Focused</option>
              <option value="TechDebt">Tech Debt</option>
              <option value="RAndD">R&D</option>
            </select>
          </div>
          <div class="form-group">
            <label>Estimated Hours</label>
            <input type="number" [(ngModel)]="form.estimatedHours"
              placeholder="0" min="0">
          </div>
        </div>
        <div *ngIf="addError" class="alert alert-danger mb-8">{{ addError }}</div>
        <button class="btn btn-primary"
          (click)="addItem()"
          [disabled]="!form.title || !form.category || saving">
          {{ saving ? 'Adding...' : 'Add Item' }}
        </button>
      </div>

      <!-- Filters -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
        <button class="btn"
          *ngFor="let f of filters"
          [class]="activeFilter === f.value ? 'btn-blue' : 'btn-ghost'"
          (click)="setFilter(f.value)">
          {{ f.label }}
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="spinner"></div>

      <!-- Items -->
      <div *ngIf="!loading">
        <div *ngIf="items.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <p>No items in this view.</p>
        </div>

        <div class="card" *ngFor="let item of items"
          style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;
                      align-items:flex-start;gap:12px">
            <div style="flex:1">
              <div style="display:flex;align-items:center;gap:8px;
                          margin-bottom:6px">
                <span class="badge"
                  [ngClass]="{
                    'badge-client':   item.category==='ClientFocused',
                    'badge-techdebt': item.category==='TechDebt',
                    'badge-rnd':      item.category==='RAndD'
                  }">
                  {{ categoryLabel(item.category) }}
                </span>
                <span class="badge"
                  [ngClass]="{
                    'badge-available': item.state==='Available',
                    'badge-picked':    item.state==='Picked',
                    'badge-completed': item.state==='Completed',
                    'badge-archived':  item.state==='Archived'
                  }">
                  {{ item.state }}
                </span>
              </div>
              <h3>{{ item.title }}</h3>
              <p class="text-muted mt-8">{{ item.description }}</p>
              <p class="text-muted mt-8" *ngIf="item.estimatedHours">
                ~{{ item.estimatedHours }}h estimated
              </p>
            </div>
            <div style="display:flex;gap:8px;flex-shrink:0">
              <button class="btn btn-danger"
                style="padding:6px 12px;font-size:12px"
                *ngIf="item.state !== 'Archived'"
                (click)="archive(item)">
                Archive
              </button>
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
