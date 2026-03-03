import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    TeamMember, CreateTeamMemberDto,
    BacklogItem, CreateBacklogItemDto, UpdateBacklogItemDto,
    PlanningWeek, CreatePlanningWeekDto,
    PlanItem, AddPlanItemDto,
    ProgressUpdate, LogProgressDto,
    Notification
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {

    private base = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // ── Team Members ────────────────────────────────────────────────────────────
    getTeamMembers(): Observable<TeamMember[]> {
        return this.http.get<TeamMember[]>(`${this.base}/team-members`);
    }

    createTeamMember(dto: CreateTeamMemberDto): Observable<TeamMember> {
        return this.http.post<TeamMember>(`${this.base}/team-members`, dto);
    }

    deactivateTeamMember(id: string): Observable<void> {
        return this.http.delete<void>(`${this.base}/team-members/${id}`);
    }

    // ── Backlog ─────────────────────────────────────────────────────────────────
    getBacklog(state?: string, category?: string): Observable<BacklogItem[]> {
        let params = new HttpParams();
        if (state) params = params.set('state', state);
        if (category) params = params.set('category', category);
        return this.http.get<BacklogItem[]>(`${this.base}/backlog`, { params });
    }

    createBacklogItem(dto: CreateBacklogItemDto): Observable<BacklogItem> {
        return this.http.post<BacklogItem>(`${this.base}/backlog`, dto);
    }

    updateBacklogItem(id: string, category: string, dto: UpdateBacklogItemDto): Observable<BacklogItem> {
        return this.http.put<BacklogItem>(
            `${this.base}/backlog/${id}?category=${category}`, dto);
    }

    archiveBacklogItem(id: string, category: string): Observable<void> {
        return this.http.patch<void>(
            `${this.base}/backlog/${id}/archive?category=${category}`, {});
    }

    // ── Planning Weeks ──────────────────────────────────────────────────────────
    getAllWeeks(): Observable<PlanningWeek[]> {
        return this.http.get<PlanningWeek[]>(`${this.base}/planning-weeks`);
    }

    getActiveWeek(): Observable<PlanningWeek | null> {
        return this.http.get<PlanningWeek | null>(`${this.base}/planning-weeks/active`);
    }

    createWeek(dto: CreatePlanningWeekDto): Observable<PlanningWeek> {
        return this.http.post<PlanningWeek>(`${this.base}/planning-weeks`, dto);
    }

    openWeek(id: string): Observable<void> {
        return this.http.put<void>(`${this.base}/planning-weeks/${id}/open`, {});
    }

    freezeWeek(id: string): Observable<void> {
        return this.http.put<void>(`${this.base}/planning-weeks/${id}/freeze`, {});
    }

    closeWeek(id: string): Observable<void> {
        return this.http.put<void>(`${this.base}/planning-weeks/${id}/close`, {});
    }

    cancelWeek(id: string): Observable<void> {
        return this.http.delete<void>(`${this.base}/planning-weeks/${id}`);
    }

    // ── Plan Items ──────────────────────────────────────────────────────────────
    getMyPlan(weekId: string, memberId: string): Observable<PlanItem[]> {
        return this.http.get<PlanItem[]>(
            `${this.base}/plan-items?weekId=${weekId}&memberId=${memberId}`);
    }

    addPlanItem(dto: AddPlanItemDto): Observable<PlanItem> {
        return this.http.post<PlanItem>(`${this.base}/plan-items`, dto);
    }

    removePlanItem(id: string, weekId: string): Observable<void> {
        return this.http.delete<void>(
            `${this.base}/plan-items/${id}?weekId=${weekId}`);
    }

    markReady(weekId: string, memberId: string): Observable<void> {
        return this.http.put<void>(
            `${this.base}/plan-items/ready?weekId=${weekId}&memberId=${memberId}`, {});
    }

    // ── Progress ────────────────────────────────────────────────────────────────
    getMyProgress(weekId: string, memberId: string): Observable<PlanItem[]> {
        return this.http.get<PlanItem[]>(
            `${this.base}/progress/my?weekId=${weekId}&memberId=${memberId}`);
    }

    getTeamProgress(weekId: string): Observable<PlanItem[]> {
        return this.http.get<PlanItem[]>(
            `${this.base}/progress/team?weekId=${weekId}`);
    }

    getProgressHistory(planItemId: string): Observable<ProgressUpdate[]> {
        return this.http.get<ProgressUpdate[]>(
            `${this.base}/progress/history/${planItemId}`);
    }

    logProgress(dto: LogProgressDto): Observable<ProgressUpdate> {
        return this.http.post<ProgressUpdate>(`${this.base}/progress`, dto);
    }

    // ── Notifications ───────────────────────────────────────────────────────────
    getMyNotifications(recipientId: string): Observable<Notification[]> {
        return this.http.get<Notification[]>(
            `${this.base}/notifications/my?recipientId=${recipientId}`);
    }

    markNotificationRead(id: string, recipientId: string): Observable<void> {
        return this.http.patch<void>(
            `${this.base}/notifications/${id}/read?recipientId=${recipientId}`, {});
    }
}
