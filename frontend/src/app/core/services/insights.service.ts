import { Injectable } from '@angular/core';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InsightsService {

    private appInsights: ApplicationInsights;

    constructor() {
        this.appInsights = new ApplicationInsights({
            config: {
                connectionString: environment.appInsightsConnectionString,
                enableAutoRouteTracking: true,
                enableCorsCorrelation: true
            }
        });
        this.appInsights.loadAppInsights();
    }

    // Call this when a key business action happens
    trackEvent(name: string, properties?: { [key: string]: string }): void {
        this.appInsights.trackEvent({ name }, properties);
    }

    // Call this in error handlers
    trackError(error: Error): void {
        this.appInsights.trackException({ exception: error });
    }
}
