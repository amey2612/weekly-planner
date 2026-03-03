import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
    selector: 'app-nav-bar',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <nav class="nav-bar">
      <a class="nav-brand" routerLink="/home">📋 Weekly Planner</a>
      <div class="nav-actions">
        <!-- Notification bell — shows unread count -->
        <button class="btn btn-ghost" style="position:relative"
          (click)="goToNotifications()">
          🔔
          <span *ngIf="unreadCount > 0"
            style="position:absolute;top:-4px;right:-4px;
                   background:#da3633;color:white;border-radius:50%;
                   width:18px;height:18px;font-size:11px;
                   display:flex;align-items:center;justify-content:center;">
            {{ unreadCount }}
          </span>
        </button>
        <span class="nav-user">{{ userName }}</span>
        <span class="badge" [class]="isLead ? 'badge-client' : 'badge-available'">
          {{ isLead ? 'Lead' : 'Member' }}
        </span>
        <button class="btn btn-ghost" (click)="logout()">Logout</button>
      </div>
    </nav>
  `
})
export class NavBarComponent implements OnInit {

    userName = '';
    isLead = false;
    unreadCount = 0;

    constructor(
        private auth: AuthService,
        private api: ApiService,
        private router: Router
    ) { }

    ngOnInit(): void {
        const user = this.auth.getCurrentUser();
        if (user) {
            this.userName = user.name;
            this.isLead = this.auth.isLead();
            this.loadNotifications(user.memberId);
        }
    }

    loadNotifications(memberId: string): void {
        this.api.getMyNotifications(memberId).subscribe({
            next: (notifications) => {
                this.unreadCount = notifications.filter(n => !n.isRead).length;
            },
            error: () => { }
        });
    }

    goToNotifications(): void {
        this.router.navigate(['/notifications']);
    }

    logout(): void {
        this.auth.logout();
        this.router.navigate(['/login']);
    }
}
