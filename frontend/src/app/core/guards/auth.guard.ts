import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Protects all routes — redirects to /login if not logged in
export const authGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.isLoggedIn()) {
        return true;
    }

    return router.createUrlTree(['/login']);
};

// Protects lead-only routes — redirects to /home if not a lead
export const leadGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.isLead()) {
        return true;
    }

    return router.createUrlTree(['/home']);
};
