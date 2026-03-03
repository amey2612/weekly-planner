import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavBarComponent } from '../../shared/components/nav-bar.component';
import { ApiService } from '../../core/services/api.service';
import { TeamMember } from '../../core/models/models';

@Component({
    selector: 'app-team',
    standalone: true,
    imports: [CommonModule, FormsModule, NavBarComponent],
    template: `
    <app-nav-bar></app-nav-bar>

    <div class="page-container">
      <div class="page-header">
        <h1>👥 Manage Team</h1>
        <button class="btn btn-ghost" (click)="router.navigate(['/home'])">
          ← Home
        </button>
      </div>

      <!-- Add member form -->
      <div class="card mb-16">
        <h2 class="mb-16">➕ Add Team Member</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr auto;
                    gap:12px;align-items:end;">
          <div class="form-group" style="margin:0">
            <label>Full Name</label>
            <input [(ngModel)]="newName" placeholder="e.g. Alice Johnson">
          </div>
          <div class="form-group" style="margin:0">
            <label>Role</label>
            <select [(ngModel)]="newIsLead">
              <option [ngValue]="false">Team Member</option>
              <option [ngValue]="true">Team Lead</option>
            </select>
          </div>
          <button class="btn btn-primary"
            (click)="addMember()"
            [disabled]="!newName.trim() || saving">
            {{ saving ? 'Adding...' : 'Add Member' }}
          </button>
        </div>
        <div *ngIf="addError" class="alert alert-danger mt-8">
          {{ addError }}
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="spinner"></div>

      <!-- Members list -->
      <div *ngIf="!loading" class="card">
        <h2 class="mb-16">Team Members ({{ members.length }})</h2>

        <div *ngIf="members.length === 0" class="empty-state">
          <div class="empty-icon">👤</div>
          <p>No team members yet. Add the first one above.</p>
        </div>

        <table *ngIf="members.length > 0" class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th style="text-align:right">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let m of members">
              <td>{{ m.name }}</td>
              <td>
                <span class="badge"
                  [class]="m.isLead ? 'badge-client' : 'badge-available'">
                  {{ m.isLead ? '⭐ Lead' : 'Member' }}
                </span>
              </td>
              <td>
                <span class="badge"
                  [class]="m.isActive ? 'badge-available' : 'badge-archived'">
                  {{ m.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td style="text-align:right">
                <button class="btn btn-danger"
                  style="padding:6px 12px;font-size:12px"
                  *ngIf="m.isActive"
                  (click)="deactivate(m)">
                  Deactivate
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class TeamComponent implements OnInit {

    members: TeamMember[] = [];
    loading = true;
    saving = false;
    newName = '';
    newIsLead = false;
    addError = '';

    constructor(public router: Router, private api: ApiService) { }

    ngOnInit(): void { this.load(); }

    load(): void {
        this.loading = true;
        this.api.getTeamMembers().subscribe({
            next: (m) => { this.members = m; this.loading = false; },
            error: () => { this.loading = false; }
        });
    }

    addMember(): void {
        if (!this.newName.trim()) return;
        this.saving = true;
        this.addError = '';
        this.api.createTeamMember({
            name: this.newName.trim(),
            isLead: this.newIsLead,
            azureAdObjectId: ''
        }).subscribe({
            next: () => {
                this.newName = '';
                this.newIsLead = false;
                this.saving = false;
                this.load();
            },
            error: (err) => {
                this.addError = 'Failed to add member.';
                this.saving = false;
            }
        });
    }

    deactivate(member: TeamMember): void {
        if (!confirm(`Deactivate ${member.name}?`)) return;
        this.api.deactivateTeamMember(member.id).subscribe({
            next: () => this.load(),
            error: () => alert('Failed to deactivate member.')
        });
    }
}
