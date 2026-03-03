import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { TeamMember } from '../../core/models/models';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div style="min-height:100vh;display:flex;align-items:center;
                justify-content:center;padding:20px;">
      <div style="width:100%;max-width:440px;">

        <!-- Logo / Title -->
        <div class="text-center mb-16">
          <div style="font-size:48px;margin-bottom:12px;">📋</div>
          <h1>Weekly Planner Tracker</h1>
          <p class="text-muted mt-8">Click your name to get started</p>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="spinner"></div>

        <!-- Error -->
        <div *ngIf="error" class="alert alert-danger mb-16">
          {{ error }}
        </div>

        <!-- Team member list -->
        <div *ngIf="!loading" class="card">
          <h2 class="mb-16">👥 Who are you?</h2>

          <!-- Empty state -->
          <div *ngIf="members.length === 0" class="empty-state">
            <div class="empty-icon">🤷</div>
            <p>No team members found.</p>
            <p class="mt-8">Ask your Team Lead to add members first.</p>
          </div>

          <!-- Member buttons -->
          <div class="flex flex-col gap-8">
            <button
              *ngFor="let member of members"
              class="btn"
              [style]="'background:#21262d;border:1px solid #30363d;
                        color:#e6edf3;text-align:left;padding:16px;
                        border-radius:10px;font-size:15px;' +
                       (member.isLead ? 'border-color:#58a6ff;' : '')"
              (click)="selectMember(member)">

              <div style="display:flex;align-items:center;
                          justify-content:space-between;">
                <span>{{ member.name }}</span>
                <span class="badge"
                  [class]="member.isLead ? 'badge-client' : 'badge-available'">
                  {{ member.isLead ? '⭐ Team Lead' : 'Member' }}
                </span>
              </div>
            </button>
          </div>
        </div>

        <!-- First time setup hint -->
        <p class="text-center text-muted mt-16" style="font-size:12px;">
          First time? The Team Lead must add members via the Team screen.
        </p>

      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {

    members: TeamMember[] = [];
    loading = true;
    error = '';

    constructor(
        private api: ApiService,
        private auth: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        // If already logged in go straight to home
        if (this.auth.isLoggedIn()) {
            this.router.navigate(['/home']);
            return;
        }
        this.loadMembers();
    }

    loadMembers(): void {
        this.api.getTeamMembers().subscribe({
            next: (members) => {
                this.members = members;
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Could not load team members. Is the API running?';
                this.loading = false;
            }
        });
    }

    selectMember(member: TeamMember): void {
        // Save who is logged in to session storage
        this.auth.setCurrentUser(member.id, member.name, member.isLead);
        this.router.navigate(['/home']);
    }
}
