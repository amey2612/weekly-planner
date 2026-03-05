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
    <div class="section" style="min-height:100vh;display:flex;align-items:center;justify-content:center;">
      <div style="width:100%;max-width:500px;">
        <!-- Header -->
        <h1 class="title is-3 has-text-centered mb-2">Who are you?</h1>
        <p class="subtitle is-6 has-text-centered mb-6">Click your name to get started.</p>

        <!-- Loading -->
        <div *ngIf="loading" class="has-text-centered py-6">
          <div class="button is-loading is-white"></div>
        </div>

        <!-- Error -->
        <div *ngIf="error" class="notification is-app-danger mb-4">
          {{ error }}
        </div>

        <!-- Identity List -->
        <div *ngIf="!loading">
          <div *ngIf="members.length === 0" class="box has-text-centered py-6">
             <p class="text-secondary">No team members added yet.</p>
             <p class="is-size-7 text-secondary mt-2">Ask your Team Lead to set up the team.</p>
          </div>

          <div class="columns is-multiline">
            <div class="column is-12" *ngFor="let member of members">
              <div class="member-card" (click)="selectMember(member)">
                <p class="is-size-5 has-text-weight-semibold">{{ member.name }}</p>
                <span class="tag mt-2" 
                      [class.is-warning]="member.isLead" 
                      [class.is-info]="!member.isLead">
                  {{ member.isLead ? 'Team Lead' : 'Team Member' }}
                </span>
              </div>
            </div>
          </div>
        </div>

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
