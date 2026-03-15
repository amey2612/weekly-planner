# 📋 Weekly Planner Tracker

> A full-stack, event-driven weekly planning system built on Azure — enabling teams to plan, track, and close weekly work cycles with a strict 30-hour budget model and real-time async notifications.

**Live Demo:**
New link:
- 🌐 link : https://wonderful-water-0443bf40f.6.azurestaticapps.net/
Old link : expired on 12/03/2026
- 🌐 link : https://wonderful-water-0443bf40f.6.azurestaticapps.net/

---

## 📑 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Azure Infrastructure](#azure-infrastructure)
- [Project Structure](#project-structure)
- [Backend — .NET 10 Web API](#backend--net-10-web-api)
- [Azure Functions](#azure-functions)
- [Frontend — Angular 21](#frontend--angular-21)
- [Business Rules](#business-rules)
- [CI/CD Pipeline](#cicd-pipeline)
- [Getting Started — Local Development](#getting-started--local-development)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)

---

## Overview

Weekly Planner Tracker is a cloud-native team planning tool that enforces a **30-hour weekly work budget** across three categories — **Client Focused**, **Tech Debt**, and **R&D**. The Team Lead sets category percentages at the start of each week. Each member plans their tasks within those limits, marks themselves ready, and the Lead freezes the plan. After freeze, members log daily progress and the Lead monitors the team dashboard before closing the week.

### Key Capabilities

| Capability | Description |
|---|---|
| **30-Hour Budget** | Each member plans exactly 30 hours per week — no more, no less |
| **Category Splits** | Lead sets % allocation per category — enforced on every task added |
| **Week Lifecycle** | Setup → Planning → Frozen → Closed — strict state machine |
| **Async Events** | Service Bus publishes events on freeze and close — Functions respond automatically |
| **Real-time Notifications** | Members receive in-app notifications when the plan is frozen |
| **Change Feed** | Cosmos DB Change Feed auto-updates PlanItem progress — no polling needed |
| **Role-Based UI** | Lead and Member see different screens and actions |
| **CI/CD** | Every push to main auto-deploys all 3 services to Azure |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ANGULAR 21 SPA                           │
│              Azure Static Web Apps (Free Tier)                  │
│   Login │ Home │ Backlog │ Plan │ Freeze │ Progress │ Dashboard │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP REST (JSON)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    .NET 10 WEB API                               │
│              Azure App Service (B1 Linux)                       │
│  TeamMembers │ Backlog │ PlanningWeeks │ PlanItems │ Progress   │
└──────┬───────────────────────────────────────┬───────────────────┘
       │                                       │
       │ Read/Write                            │ Publish Events
       ▼                                       ▼
┌──────────────────┐              ┌────────────────────────────────┐
│  AZURE COSMOS DB │              │     AZURE SERVICE BUS          │
│  (Serverless)    │              │     (Standard Tier)            │
│                  │              │                                │
│  TeamMembers     │              │  plan-frozen-queue             │
│  BacklogItems    │              │  progress-update-queue         │
│  PlanningWeeks   │              │  week-events (topic)           │
│  PlanItems       │              │    └─ notification-sub         │
│  ProgressUpdates │◄─────────────│    └─ analytics-sub           │
│  Notifications   │  Change Feed │                                │
└──────────────────┘              └──────────────┬─────────────────┘
                                                 │ Trigger
                                                 ▼
                                  ┌──────────────────────────────┐
                                  │    AZURE FUNCTIONS (4)       │
                                  │    Consumption Plan          │
                                  │                              │
                                  │  NotificationFunction        │
                                  │  ProgressAnalyticsFunction   │
                                  │  WeekClosureFunction         │
                                  │  TuesdayReminderFunction     │
                                  └──────────────────────────────┘
                                                 │
                                  ┌──────────────▼─────────────┐
                                  │    APPLICATION INSIGHTS     │
                                  │  Telemetry from all 3 apps  │
                                  └────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | Angular | 21.2.0 |
| Frontend Hosting | Azure Static Web Apps | Free Tier |
| Backend | .NET / ASP.NET Core | 10.0 |
| Backend Hosting | Azure App Service | B1 Linux |
| Database | Azure Cosmos DB | Serverless |
| Messaging | Azure Service Bus | Standard |
| Background Jobs | Azure Functions | v4 Isolated Worker |
| Monitoring | Azure Application Insights | Workspace-based |
| Auth | Azure Active Directory | v2 |
| CI/CD | GitHub Actions | — |
| Package Manager | NuGet + npm | — |
| Testing | xUnit + Moq + FluentAssertions | — |

---

## Azure Infrastructure

All resources deployed in **Resource Group:** `rg-weeklyplanner-dev` (East US)

| Resource | Name | Purpose |
|---|---|---|
| Cosmos DB | `cosmos-weeklyplanner-dev` | Primary NoSQL database — 6 containers |
| Service Bus | `sb-weeklyplanner-dev` | Async event messaging |
| App Service | `app-weeklyplanner-api` | Hosts .NET Web API |
| Function App | `func-weeklyplanner-dev` | 4 serverless background functions |
| Static Web App | `stapp-weeklyplanner` | Hosts Angular SPA |
| Application Insights | `appi-weeklyplanner-dev` | Telemetry and monitoring |

### Cosmos DB Containers

| Container | Partition Key | Purpose |
|---|---|---|
| `TeamMembers` | `/id` | Team member documents |
| `BacklogItems` | `/category` | Work items with category as partition key |
| `PlanningWeeks` | `/id` | Weekly planning cycles |
| `PlanItems` | `/weekId` | Tasks assigned per member per week |
| `ProgressUpdates` | `/planItemId` | Append-only progress log |
| `Notifications` | `/recipientId` | In-app notifications per member |

### Service Bus Topology

```
plan-frozen-queue        ← API publishes when week is Frozen
                         → NotificationFunction consumes

progress-update-queue    ← API publishes when member logs progress
                         → (reserved for analytics extension)

week-events (topic)
  ├── notification-sub   → WeekClosureFunction consumes WeekClosed events
  └── analytics-sub      → Reserved for future analytics extension
```

---

## Project Structure

```
weekly-planner/
├── .github/
│   └── workflows/
│       └── ci-cd.yml                  # Single unified CI/CD pipeline
│
├── backend/
│   ├── WeeklyPlanner.sln
│   │
│   ├── WeeklyPlanner.API/             # Main .NET 10 Web API
│   │   ├── Controllers/               # 6 API controllers
│   │   │   ├── TeamMembersController.cs
│   │   │   ├── BacklogController.cs
│   │   │   ├── PlanningWeeksController.cs
│   │   │   ├── PlanItemsController.cs
│   │   │   ├── ProgressController.cs
│   │   │   └── NotificationsController.cs
│   │   ├── Models/                    # 6 Cosmos DB document models
│   │   │   ├── CosmosDocument.cs
│   │   │   ├── TeamMemberDocument.cs
│   │   │   ├── BacklogItemDocument.cs
│   │   │   ├── PlanningWeekDocument.cs
│   │   │   ├── PlanItemDocument.cs
│   │   │   ├── ProgressUpdateDocument.cs
│   │   │   └── NotificationDocument.cs
│   │   ├── Repositories/              # Generic Cosmos repository
│   │   │   ├── ICosmosRepository.cs
│   │   │   └── CosmosRepository.cs
│   │   ├── Services/                  # Business logic layer
│   │   │   ├── TeamMemberService.cs
│   │   │   ├── BacklogService.cs
│   │   │   ├── PlanningWeekService.cs
│   │   │   ├── PlanItemService.cs
│   │   │   ├── ProgressService.cs
│   │   │   └── NotificationService.cs
│   │   ├── DTOs/                      # Request/response data transfer objects
│   │   ├── Interfaces/                # Service and repository interfaces
│   │   ├── Middleware/                # Custom middleware
│   │   ├── Validators/                # FluentValidation validators
│   │   ├── Mapping/                   # AutoMapper profiles
│   │   ├── Program.cs                 # DI registration + middleware pipeline
│   │   └── appsettings.json
│   │
│   ├── WeeklyPlanner.Functions/       # Azure Functions v4 Isolated Worker
│   │   ├── Functions/
│   │   │   ├── NotificationFunction.cs
│   │   │   ├── ProgressAnalyticsFunction.cs
│   │   │   ├── WeekClosureFunction.cs
│   │   │   └── TuesdayReminderFunction.cs
│   │   ├── Models/
│   │   │   └── Documents.cs
│   │   ├── Program.cs
│   │   ├── host.json
│   │   └── local.settings.json        # Not committed — add to .gitignore
│   │
│   └── WeeklyPlanner.Tests/           # xUnit test project
│       ├── TeamMemberServiceTests.cs
│       ├── BacklogServiceTests.cs
│       ├── PlanningWeekServiceTests.cs
│       ├── PlanItemServiceTests.cs
│       └── ProgressServiceTests.cs
│
└── frontend/                          # Angular 21 SPA
    └── src/
        └── app/
            ├── core/
            │   ├── models/models.ts   # All TypeScript interfaces
            │   ├── services/
            │   │   ├── api.service.ts
            │   │   ├── auth.service.ts
            │   │   └── insights.service.ts
            │   └── guards/
            │       └── auth.guard.ts
            ├── features/
            │   ├── home/              # Login + Home dashboard
            │   ├── team/              # Team management
            │   ├── backlog/           # Backlog CRUD
            │   ├── week-setup/        # Create planning week
            │   ├── plan-my-work/      # 30h planning with budget bars
            │   ├── review-freeze/     # Lead review and freeze
            │   ├── update-progress/   # Member progress logging
            │   ├── team-progress/     # Lead team dashboard
            │   ├── past-weeks/        # Closed weeks history
            │   └── notifications/     # In-app notifications
            ├── shared/
            │   └── components/
            │       └── nav-bar.component.ts
            ├── app.routes.ts          # Lazy-loaded routes with guards
            └── app.config.ts          # Angular providers
```

---

## Backend — .NET 10 Web API

### Design Principles

- **Clean Architecture** — Controllers → Services → Repositories — no business logic in controllers
- **Generic Repository** — single `CosmosRepository<T>` handles all 6 containers
- **Dependency Injection** — all services registered as Scoped, repositories as Singleton
- **camelCase serialization** — Cosmos SDK configured to use camelCase matching Angular DTOs
- **Retry policy** — Cosmos client configured with 5 retries on rate limit (important for Serverless tier)
- **Soft delete** — team members are never hard deleted — `isActive` flag only

### Service Layer Summary

| Service | Key Responsibility |
|---|---|
| `TeamMemberService` | CRUD with soft delete — `isActive` flag |
| `BacklogService` | Create, update, archive — blocks edit on Completed items |
| `PlanningWeekService` | Week lifecycle state machine + Service Bus publishing |
| `PlanItemService` | 30h enforcement + category budget validation |
| `ProgressService` | Append-only progress log + Service Bus publishing |
| `NotificationService` | Read and mark-read — written by Functions not the API |

---

## Azure Functions

### NotificationFunction
- **Trigger:** Service Bus — `plan-frozen-queue`
- **Action:** Creates one `NotificationDocument` per participant in Cosmos `Notifications` container
- **Error handling:** Dead-letters message on failure for investigation

### ProgressAnalyticsFunction
- **Trigger:** Cosmos DB Change Feed — `ProgressUpdates` container
- **Action:** Reads latest progress update, updates parent `PlanItem.completedHours` and `status`
- **Pattern:** Groups updates by `planItemId` to avoid redundant writes

### WeekClosureFunction
- **Trigger:** Service Bus — `week-events` topic, `notification-sub` subscription
- **Action:** Finds all `Done` plan items for the closed week, marks their backlog items as `Completed`
- **Filter:** Only processes messages with `Subject = "WeekClosed"`

### TuesdayReminderFunction
- **Trigger:** Timer — every Tuesday at 08:00 UTC (`0 0 8 * * 2`)
- **Action:** Checks if an active week exists — if not, publishes a reminder event to `week-events`

---

## Frontend — Angular 21

### Screens

| Screen | Route | Access | Purpose |
|---|---|---|---|
| Login | `/login` | All | Select team member to act as |
| Home | `/home` | All | Role-based dashboard with active week status |
| Team | `/team` | Lead | Add/deactivate team members |
| Backlog | `/backlog` | Lead | Create and manage backlog items |
| Week Setup | `/week-setup` | Lead | Create week — Tuesday + % splits |
| Plan My Work | `/plan-my-work` | Member | Plan 30h with budget bars |
| Review & Freeze | `/review-freeze` | Lead | Member readiness + freeze button |
| Update Progress | `/update-progress` | Member | Log hours and status per task |
| Team Progress | `/team-progress` | Lead | Dashboard + close week |
| Past Weeks | `/past-weeks` | All | Closed weeks history |
| Notifications | `/notifications` | All | In-app notifications + mark read |

### Route Guards
- `authGuard` — redirects to `/login` if no session
- `leadGuard` — redirects to `/home` if user is not a Lead

### State Management
- No NgRx — simple service + component state
- Auth state persisted in `sessionStorage` across page refreshes
- All API calls go through a single `ApiService`

---

## Business Rules

### 30-Hour Budget Rule
Every team member must plan **exactly 30 hours** per week. The `MarkReady` endpoint enforces this — it throws `InvalidOperationException` if the total is anything other than 30.

### Category Budget Rule
Hours are split by percentage set at week creation:

```
Example: Client 40%, TechDebt 40%, R&D 20%

Client max   = 30 × 0.40 = 12h
TechDebt max = 30 × 0.40 = 12h
R&D max      = 30 × 0.20 = 6h
```

Adding a task that would exceed the category max returns `409 Conflict`.

### Week State Machine

```
Setup ──► Planning ──► Frozen ──► Closed
  │
  └──► (Deleted if cancelled before Opening)
```

| Transition | Condition |
|---|---|
| Setup → Planning | Lead clicks Open |
| Planning → Frozen | All participants `isReady = true` |
| Frozen → Closed | Lead clicks Close |
| Any → Deleted | Lead cancels before Frozen |

### Freeze Rule
Freeze is blocked if **any** participant has `isReady = false`. Lead can override this in the UI if needed (business decision).

### Progress Log Rule
Progress updates are **append-only**. A new `ProgressUpdateDocument` is created every time a member logs progress. The `ProgressAnalyticsFunction` reads the Change Feed and updates the parent `PlanItem` automatically.

---

## CI/CD Pipeline

```yaml
# .github/workflows/ci-cd.yml
# 5 jobs in a single workflow file

Job 1 — PR Quality Gate
  - Runs on: PR to dev or main
  - Steps: build + test backend, build + test Angular

Job 2 — Deploy .NET API
  - Runs on: push to main
  - Steps: publish + deploy to Azure App Service

Job 3 — Deploy Azure Functions
  - Runs on: push to main (after Job 2)
  - Steps: publish + deploy to Function App

Job 4 — Deploy Angular
  - Runs on: push to main + PR open/sync
  - Steps: build production bundle + deploy to Static Web Apps

Job 5 — Close PR Preview
  - Runs on: PR closed
  - Steps: cleanup Static Web App staging slot
```

### GitHub Secrets Required

| Secret | Used By |
|---|---|
| `AZURE_WEBAPP_PUBLISH_PROFILE` | Job 2 — App Service deploy |
| `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` | Job 3 — Function App deploy |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Job 4 — Static Web App deploy |

### Branch Strategy

```
main        ← production — every push triggers full deploy
  ▲
  │ PR
dev         ← integration branch — all features merge here first
  ▲
  │ PR
feature/*   ← one branch per day/feature
```

---

## Getting Started — Local Development

### Prerequisites

| Tool | Minimum Version |
|---|---|
| .NET SDK | 10.0.103 |
| Node.js | 22.x |
| Angular CLI | 21.x |
| Azure Functions Core Tools | 4.x |
| Git | 2.x |

### 1 — Clone the repo

```bash
git clone https://github.com/amey2612/weekly-planner.git
cd weekly-planner
```

### 2 — Configure backend secrets

Create `backend/WeeklyPlanner.API/appsettings.Development.json`:

```json
{
  "CosmosDb": {
    "ConnectionString": "YOUR_COSMOS_CONNECTION_STRING",
    "DatabaseName": "WeeklyPlannerDB"
  },
  "ServiceBus": {
    "ConnectionString": "YOUR_SERVICEBUS_CONNECTION_STRING"
  },
  "ApplicationInsights": {
    "ConnectionString": "YOUR_APPINSIGHTS_CONNECTION_STRING"
  }
}
```

### 3 — Run the API

```bash
cd backend/WeeklyPlanner.API
dotnet run
# API starts at http://localhost:5074
# Swagger at http://localhost:5074/swagger
```

### 4 — Configure frontend

Edit `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5074/api',
  tenantId: 'YOUR_TENANT_ID',
  spaClientId: 'YOUR_SPA_CLIENT_ID',
  apiClientId: 'YOUR_API_CLIENT_ID',
  appInsightsConnectionString: 'YOUR_APPINSIGHTS_CONNECTION_STRING'
};
```

### 5 — Run Angular

```bash
cd frontend
npm install
ng serve
# App at http://localhost:4200
```

### 6 — Run Azure Functions locally

Create `backend/WeeklyPlanner.Functions/local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "CosmosDb__ConnectionString": "YOUR_COSMOS_CONNECTION_STRING",
    "CosmosDb__DatabaseName": "WeeklyPlannerDB",
    "ServiceBus__ConnectionString": "YOUR_SERVICEBUS_CONNECTION_STRING",
    "APPLICATIONINSIGHTS_CONNECTION_STRING": "YOUR_APPINSIGHTS_CONNECTION_STRING"
  }
}
```

```bash
cd backend/WeeklyPlanner.Functions
func start
```

---

## API Reference

### Team Members
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/team-members` | Get all active members |
| POST | `/api/team-members` | Add a new member |
| DELETE | `/api/team-members/{id}` | Soft delete (deactivate) |

### Backlog
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/backlog` | Get items — filter by `?state=` or `?category=` |
| POST | `/api/backlog` | Create backlog item |
| PUT | `/api/backlog/{id}?category=` | Update item |
| PATCH | `/api/backlog/{id}/archive?category=` | Archive item |

### Planning Weeks
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/planning-weeks` | All weeks |
| GET | `/api/planning-weeks/active` | Current active week |
| POST | `/api/planning-weeks` | Create week (Lead) |
| PUT | `/api/planning-weeks/{id}/open` | Open for planning |
| PUT | `/api/planning-weeks/{id}/freeze` | Freeze plan |
| PUT | `/api/planning-weeks/{id}/close` | Close week |
| DELETE | `/api/planning-weeks/{id}` | Cancel week |

### Plan Items
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/plan-items?weekId=&memberId=` | Get member's plan |
| POST | `/api/plan-items` | Add item to plan |
| DELETE | `/api/plan-items/{id}?weekId=` | Remove item from plan |
| PUT | `/api/plan-items/ready?weekId=&memberId=` | Mark member as ready |

### Progress
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/progress/my?weekId=&memberId=` | My progress |
| GET | `/api/progress/team?weekId=` | All members progress |
| GET | `/api/progress/history/{planItemId}` | Full update history |
| POST | `/api/progress` | Log progress update |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications/my?recipientId=` | Get my notifications |
| PATCH | `/api/notifications/{id}/read?recipientId=` | Mark as read |

---

## Testing

### Run backend unit tests

```bash
cd backend
dotnet test WeeklyPlanner.sln
```

**Results: 18 tests — 0 failed**

| Test Class | Tests | What is covered |
|---|---|---|
| `TeamMemberServiceTests` | 4 | Get active, create, deactivate, not found |
| `BacklogServiceTests` | 4 | Create, archive, edit completed, not found |
| `PlanningWeekServiceTests` | 6 | Tuesday rule, 100% rule, duplicate week, freeze rules |
| `PlanItemServiceTests` | 5 | 30h rule, category budget, duplicate item, mark ready |
| `ProgressServiceTests` | 3 | Frozen check, closed check, append-only pattern |

### Test patterns used
- **Moq** — all repository and Service Bus dependencies mocked
- **FluentAssertions** — readable `Should().Be()` assertions
- **Arrange / Act / Assert** — every test follows this structure
- **Exception testing** — `ThrowAsync<InvalidOperationException>()` with message matching

---

## Deployment

### Full deploy via CI/CD (recommended)

Push to `main` branch — GitHub Actions handles everything automatically:

```bash
git checkout main
git push origin main
```

### Manual deploy — API

```bash
cd backend/WeeklyPlanner.API
dotnet publish -c Release -o ./publish
Compress-Archive -Path .\publish\* -DestinationPath .\api-deploy.zip -Force
az webapp deploy --resource-group rg-weeklyplanner-dev \
  --name app-weeklyplanner-api \
  --src-path .\api-deploy.zip --type zip
```

### Manual deploy — Functions

```bash
cd backend/WeeklyPlanner.Functions
dotnet publish -c Release -o ./publish
Compress-Archive -Path .\publish\* -DestinationPath .\functions-deploy.zip -Force
az functionapp deployment source config-zip \
  --resource-group rg-weeklyplanner-dev \
  --name func-weeklyplanner-dev \
  --src .\functions-deploy.zip
```

### Manual deploy — Angular

Angular deploys automatically via GitHub Actions when you push to `main`. No manual step needed.

---

## Environment Variables

### App Service — Application Settings

| Key | Description |
|---|---|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `CosmosDb__ConnectionString` | Cosmos DB primary connection string |
| `CosmosDb__DatabaseName` | `WeeklyPlannerDB` |
| `ServiceBus__ConnectionString` | Service Bus primary connection string |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | App Insights connection string |
| `AllowedOrigins` | Static Web App URL for CORS |

### Function App — Application Settings

| Key | Description |
|---|---|
| `CosmosDb__ConnectionString` | Cosmos DB primary connection string |
| `CosmosDb__DatabaseName` | `WeeklyPlannerDB` |
| `ServiceBus__ConnectionString` | Service Bus primary connection string |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | App Insights connection string |

> ⚠️ **Security:** Never commit real connection strings to the repository. Use Azure App Service configuration and GitHub Secrets for all sensitive values.

---

## Author

**Amey** — Built in 4 days as a full-stack Azure cloud project demonstrating:
- Event-driven serverless architecture
- Cosmos DB NoSQL design with partition key strategy
- Azure Service Bus async messaging
- Azure Functions background processing
- Angular 21 standalone components with lazy loading
- Clean architecture in .NET 10
- Automated CI/CD with GitHub Actions

---

*Built with .NET 10 · Angular 21 · Azure Cosmos DB · Azure Service Bus · Azure Functions · GitHub Actions*
