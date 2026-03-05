import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Notification } from '../../core/models/models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container" style="max-width:800px">
      <div class="is-flex is-justify-content-space-between is-align-items-center mb-4">
        <div>
          <button class="button btn-secondary mr-2" (click)="router.navigate(['/home'])">← Home</button>
          <span class="title is-4 vertical-align-middle">Notifications</span>
        </div>
      </div>

      <div *ngIf="loading" class="has-text-centered py-6">
        <div class="button is-loading is-white"></div>
      </div>

      <div *ngIf="!loading && notifications.length === 0" class="notification is-app-info">
        No new notifications.
      </div>

      <div *ngIf="!loading && notifications.length > 0" class="box p-0" style="overflow: hidden;">
        <div *ngFor="let n of notifications; let last = last" 
             class="p-4 is-clickable action-card is-flex is-align-items-start" 
             [style.border-bottom]="!last ? '1px solid var(--border)' : 'none'"
             [style.background]="n.isRead ? 'transparent' : 'rgba(88, 166, 255, 0.05)'"
             (click)="markRead(n)">
             
          <div class="mr-3 mt-1">
            <span class="icon" [class.has-text-info]="!n.isRead" [class.has-text-grey-light]="n.isRead">
              <i class="fas" [class.fa-bell]="!n.isRead" [class.fa-check]="n.isRead"></i>
            </span>
          </div>
          <div style="flex: 1;">
            <p [class.has-text-weight-bold]="!n.isRead">{{ n.message }}</p>
            <p class="is-size-7 text-secondary mt-1">{{ n.createdAt | date:'MMM d, y h:mm a' }}</p>
          </div>
          <div *ngIf="!n.isRead" class="ml-3 mt-2">
            <span class="tag is-info is-light is-rounded is-small">New</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NotificationsComponent implements OnInit {

  notifications: Notification[] = [];
  loading = true;
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
    this.api.getMyNotifications(this.memberId).subscribe({
      next: (n) => { this.notifications = n; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  markRead(n: Notification): void {
    if (n.isRead) return;
    this.api.markNotificationRead(n.id, this.memberId).subscribe({
      next: () => { n.isRead = true; }
    });
  }
}

