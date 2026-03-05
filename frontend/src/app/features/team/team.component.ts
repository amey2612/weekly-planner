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

    <div class="container" style="max-width:960px">
      <button class="button btn-secondary mb-4" (click)="router.navigate(['/home'])">← Home</button>
      <h2 class="title is-4">Manage Team Members</h2>
      <div class="box mb-4">
        <div class="field has-addons">
          <div class="control is-expanded">
            <input class="input" type="text" [(ngModel)]="newName" placeholder="Type a name" maxlength="100" (keydown.enter)="addMember()">
          </div>
          <!-- In the reference, role selection was omitted for new members, but we keep the Angular role select logic in a small field right next to it or just stick to the simplest Bulma layout -->
          <div class="control">
            <span class="select">
              <select [(ngModel)]="newIsLead">
                <option [ngValue]="false">Member</option>
                <option [ngValue]="true">Lead</option>
              </select>
            </span>
          </div>
          <div class="control"><button class="button btn-primary" (click)="addMember()" [disabled]="!newName.trim() || saving">{{ saving ? 'Adding...' : 'Save This Person' }}</button></div>
        </div>
        <p class="help has-text-danger" *ngIf="addError">{{ addError }}</p>
      </div>

      <div *ngIf="loading" class="has-text-centered py-6">
        <div class="button is-loading is-white"></div>
      </div>

      <div *ngIf="!loading">
        <div *ngIf="members.length === 0" class="notification is-app-info">
          No team members yet. Add the first one above.
        </div>

        <div class="box mb-2" *ngFor="let m of members" [style.opacity]="!m.isActive ? '0.6' : '1'">
          <div class="columns is-vcentered is-mobile is-multiline">
            <div class="column">
              <span>
                <strong>{{ m.name }}</strong>
                <span class="tag is-warning is-light ml-1" *ngIf="m.isLead">Lead</span>
                <span class="tag is-light ml-1" *ngIf="!m.isActive">Inactive</span>
              </span>
            </div>
            <div class="column is-narrow">
              <button class="button is-small btn-danger mr-1" *ngIf="m.isActive" (click)="deactivate(m)">Deactivate</button>
              <!-- Implement Reactivate/Make Lead buttons if expanding API later -->
            </div>
          </div>
        </div>
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
