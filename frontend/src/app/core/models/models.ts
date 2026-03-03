// ── Team Member ──────────────────────────────────────────────────────────────
export interface TeamMember {
    id: string;
    name: string;
    isLead: boolean;
    isActive: boolean;
    azureAdObjectId: string;
    createdAt: string;
}

export interface CreateTeamMemberDto {
    name: string;
    isLead: boolean;
    azureAdObjectId: string;
}

// ── Backlog ──────────────────────────────────────────────────────────────────
export type BacklogCategory = 'ClientFocused' | 'TechDebt' | 'RAndD';
export type BacklogState = 'Available' | 'Picked' | 'Completed' | 'Archived';

export interface BacklogItem {
    id: string;
    title: string;
    description: string;
    category: BacklogCategory;
    estimatedHours: number;
    state: BacklogState;
    createdAt: string;
}

export interface CreateBacklogItemDto {
    title: string;
    description: string;
    category: BacklogCategory;
    estimatedHours: number;
}

export interface UpdateBacklogItemDto {
    title: string;
    description: string;
    estimatedHours: number;
}

// ── Planning Week ────────────────────────────────────────────────────────────
export type WeekState = 'Setup' | 'Planning' | 'Frozen' | 'Closed';

export interface WeekParticipant {
    memberId: string;
    name: string;
    isReady: boolean;
}

export interface PlanningWeek {
    id: string;
    tuesdayDate: string;
    state: WeekState;
    clientPct: number;
    techDebtPct: number;
    rAndDPct: number;
    createdByMemberId: string;
    participants: WeekParticipant[];
    createdAt: string;
}

export interface CreatePlanningWeekDto {
    tuesdayDate: string;
    clientPct: number;
    techDebtPct: number;
    rAndDPct: number;
    createdByMemberId: string;
}

// ── Plan Items ───────────────────────────────────────────────────────────────
export type TaskStatus = 'NotStarted' | 'InProgress' | 'Blocked' | 'Done';

export interface PlanItem {
    id: string;
    weekId: string;
    memberId: string;
    memberName: string;
    backlogItemId: string;
    backlogItemTitle: string;
    category: BacklogCategory;
    committedHours: number;
    completedHours: number;
    status: TaskStatus;
    createdAt: string;
}

export interface AddPlanItemDto {
    weekId: string;
    backlogItemId: string;
    committedHours: number;
    memberId: string;
}

// ── Progress ─────────────────────────────────────────────────────────────────
export interface ProgressUpdate {
    id: string;
    planItemId: string;
    weekId: string;
    memberId: string;
    hoursLogged: number;
    status: TaskStatus;
    note: string;
    timestamp: string;
}

export interface LogProgressDto {
    planItemId: string;
    weekId: string;
    memberId: string;
    hoursLogged: number;
    status: TaskStatus;
    note: string;
}

// ── Notifications ────────────────────────────────────────────────────────────
export interface Notification {
    id: string;
    recipientId: string;
    message: string;
    weekId: string;
    isRead: boolean;
    createdAt: string;
}

// ── UI helpers ───────────────────────────────────────────────────────────────

// Used in PlanMyWork to show budget per category
export interface CategoryBudget {
    category: BacklogCategory;
    label: string;
    maxHours: number;
    plannedHours: number;
    remaining: number;
}
