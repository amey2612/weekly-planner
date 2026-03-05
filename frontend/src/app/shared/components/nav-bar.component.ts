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
    <nav class="navbar is-app" role="navigation">
      <div class="navbar-brand">
        <a class="navbar-item has-text-weight-bold is-size-5" routerLink="/home">📋 Weekly Plan Tracker</a>
      </div>
      <div class="navbar-end">
        
        <!-- Notifications -->
        <a class="navbar-item" (click)="goToNotifications()" title="Notifications" style="position:relative">
          🔔
          <span *ngIf="unreadCount > 0"
            style="position:absolute;top:6px;right:6px;
                   background:var(--danger);color:white;border-radius:50%;
                   width:16px;height:16px;font-size:10px;
                   display:flex;align-items:center;justify-content:center;">
            {{ unreadCount }}
          </span>
        </a>

        <!-- User identity -->
        <div class="navbar-item" *ngIf="userName">
          <span class="tag is-light mr-2">{{ userName }}</span>
          <span class="tag" [class.is-warning]="isLead" [class.is-info]="!isLead">{{ isLead ? 'Lead' : 'Member' }}</span>
        </div>
        
        <a class="navbar-item" (click)="logout()" title="Switch Person">🔄 Switch</a>
        <a class="navbar-item" routerLink="/home" title="Home">🏠 Home</a>
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
