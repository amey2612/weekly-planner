import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {

    // In a real app this comes from MSAL JWT claims
    // For now we store the selected member in sessionStorage
    // so it persists across page refreshes during dev

    private MEMBER_KEY = 'wpt_current_member';
    private LEAD_KEY = 'wpt_is_lead';

    setCurrentUser(memberId: string, name: string, isLead: boolean): void {
        sessionStorage.setItem(this.MEMBER_KEY, JSON.stringify({ memberId, name }));
        sessionStorage.setItem(this.LEAD_KEY, String(isLead));
    }

    getCurrentUser(): { memberId: string; name: string } | null {
        const raw = sessionStorage.getItem(this.MEMBER_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    isLead(): boolean {
        return sessionStorage.getItem(this.LEAD_KEY) === 'true';
    }

    isLoggedIn(): boolean {
        return !!sessionStorage.getItem(this.MEMBER_KEY);
    }

    logout(): void {
        sessionStorage.removeItem(this.MEMBER_KEY);
        sessionStorage.removeItem(this.LEAD_KEY);
    }
}
