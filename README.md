# Ungraphity

Track your life with visuals.

---

## 🧭 Project Outline

### Main Functionality
1. Track habits  
2. Track progress (gym, steps)  
3. Get reminded of chores  

### Secondary Functionality
1. Visualize progress  
2. Take notes  

---

## 🧩 Architecture Overview

Ungraphity revolves around three main entities: **Scenarios**, **Trackables**, and **Records**.

A **Scenario** is a container for related **Trackables**, and each **Trackable** contains multiple **Records** representing measurable actions or data over time.

**Example:**  
- Scenario: *Gym*  
- Trackables: *Chest*, *Back*, *Legs*  
- Records: *Sets and reps per workout session*

---

## 🧱 Terminology and Keywords

### Core Entities

- **Scenario** — A logical group of related trackables (e.g., *Gym*, *Quit Smoking*).  
- **Trackable** — A measurable item with its own configuration, reminders, and goals.  
- **Record** — A timestamped entry representing a single action or measurement.

---

## 🗓️ Period and Time Rules

- Period boundaries follow the user’s timezone.  
- Daily trackables reset at local midnight.  
- Backfilling past days is allowed if enabled.  
- Editing past records recalculates totals and streaks.  
- Optional “grace window” after midnight prevents accidental resets.

---

## 💡 Dashboard Logic

The **Dashboard** is the main view of the application, showing active trackables as cards.

### Card States
- **Due** — awaiting input  
- **Completed** — goal reached or entry made  
- **Overdue** — goal missed for the current period  
- **Snoozed** — temporarily hidden  

### Display Rules
- **Persistent cards** stay visible after input.  
- **Non-persistent cards** hide after today’s entry when marked `hide-on-fill`.  
- A toggle allows switching between “Show All” and “Hide Completed.”

### Status Indicators
- Goal progress bar  
- Current streak  
- Last completion timestamp  

---

## 🔁 Streak and Validation Rules

- Streak continues only when the goal is met for consecutive periods.  
- Missing a day breaks the streak unless marked as a “skip day.”  
- Validation:
  - Counters and quantities must be non-negative.  
  - Boolean trackables are logged once per period.  
  - Compound records are validated by a user-defined schema.  

---

## 🧮 Example Scenarios

### 🛑 Quit Smoking
```json
{
  "scenario": { "name": "Quit Smoking" },
  "trackables": [
    {
      "name": "Days without smoking",
      "type": "counter",
      "period": "daily",
      "goal": { "kind": "streak", "target": 365, "direction": "at-least" },
      "visibility": "dashboard",
      "persistence": "persistent",
      "automation": "automatic-increment",
      "reminder": { "schedule": "once-daily", "times": ["09:00"], "muteWhenCompleted": false }
    }
  ],
  "notes": "If relapse occurs, add a 'relapse' record that resets the streak."
}
```

💧 Drink Water
```json
{
  "scenario": { "name": "Drink Water" },
  "trackables": [
    {
      "name": "Water Intake",
      "type": "quantity",
      "unit": "ml",
      "step": 50,
      "period": "daily",
      "goal": { "kind": "per-period", "target": 2000, "direction": "at-least" },
      "quickAdds": [250, 750, 1000],
      "visibility": "dashboard",
      "persistence": "hide-on-fill",
      "reminder": { "schedule": "multi-daily", "times": ["09:00", "12:00", "15:00", "18:00"], "muteWhenCompleted": true }
    }
  ]
}
```

📚 Read Books
```json
{
  "scenario": { "name": "Read Books" },
  "trackables": [
    {
      "name": "Books Finished",
      "type": "counter",
      "period": "none",
      "goal": { "kind": "absolute", "target": 10, "direction": "at-least" },
      "visibility": "hidden",
      "persistence": "persistent"
    },
    {
      "name": "Pages Read Today",
      "type": "counter",
      "period": "daily",
      "step": 1,
      "goal": { "kind": "per-period", "target": 30, "direction": "at-least" },
      "visibility": "dashboard",
      "persistence": "hide-on-fill",
      "quickAdds": [5, 10, 20]
    }
  ],
  "notes": "When a book is finished, increment 'Books Finished' separately from daily reading."
}
```

🏋️ Gym
```json
{
  "scenario": { "name": "Gym" },
  "trackables": [
    {
      "name": "Chest Workout",
      "type": "compound",
      "period": "daily",
      "visibility": "dashboard",
      "persistence": "hide-on-fill",
      "goal": { "kind": "per-period", "target": 1, "direction": "at-least" },
      "template": {
        "sets": [
          { "exercise": "string", "reps": "number", "weight": "number", "rpe": "optional number" }
        ],
        "durationSec": "optional number"
      }
    }
  ],
  "notes": "Each record supports multiple sets. Goal counts presence of session, not total reps."
}
```

## ⚙️ Design Considerations (continued)

### Data storage and indexing
- Local-first DB with sync later. SQLite (RN/Expo: WatermelonDB/SQLite) or IndexedDB (Web).
- Tables: scenarios, trackables, records, reminders, imports, settings.
- Indexes:
  - records: trackableId + dayKey (YYYY-MM-DD)
  - records: trackableId + at (timestamp)
  - trackables: scenarioId + sortOrder
  - reminders: nextFireAt
- Day keys precomputed for fast period totals.
- Soft delete via `deletedAt` to enable undo and safe sync.

### Identifiers and time
- ULID or UUIDv7 for IDs. Monotonic and sortable.
- Store ISO timestamps with user offset preserved.
- Derive `localDate` and `weekOfYear` at write time for queries.
- Handle DST with timezone library only at boundaries. Never back-calc raw `at`.

### Goal engine
- Supported kinds: absolute, per-period, streak.
- Evaluation triggers:
  - on record write/update/delete
  - on period rollover
  - on import batch
- Outputs: `isCompleted`, `progress`, `remaining`, `streakLength`, `lastBreakDate`.
- Over/under targets: clamp to zero; never negative remaining.

### Reminder engine
- Sources: schedule, snooze, goal state, “nag until done”.
- De-dupe by trackable per period.
- `muteWhenCompleted=true` cancels remaining fires today.
- Backoff policy for nags: 15m → 30m → 60m (cap).
- Respect Do Not Disturb windows.

### Dashboard UX rules
- Sort: manual > due soon > overdue > completed.
- Compact card tap = quick add; long-press = full editor.
- Persistent cards display next recommended action when completed.
- Accessibility targets: 44px tap area minimum.

### Import and integrations
- Health/fitness: steps, weight, water, sleep.
- File import: CSV and JSON. Idempotent via sourceId + externalId.
- Webhooks: signed HMAC, replay window 5 minutes.
- Conflict policy: newest `at` wins unless `source=manual` vs `auto` (manual wins).

### Privacy and security
- End-to-end encryption for cloud sync: user-managed key.
- Local encryption optional for device-only users.
- No third-party trackers. Telemetry strictly opt-in and anonymized.
- Export and delete-all available in Settings.

### Offline-first and sync
- Write-ahead local queue. Retries with exponential backoff.
- CRDT-lite: last-writer-wins with per-field clocks for records.
- Merge policy for streaks: recompute from canonical records after sync.

### Computations and formulas
- Read-only computed trackables from other trackables.
- Formula sandbox with whitelisted functions: sum, avg, min, max, count, rolling.
- Recompute on dependency change or on schedule.
- Prevent cycles by static DAG validation.

### Templates and presets
- Starter scenarios: Water, Gym, Reading, Sleep, Pomodoro, Chores.
- Each preset includes quickAdds, reminders, default goals.
- One-click “Apply preset” clones into workspace.

### Accessibility
- Color-contrast AA minimum.
- Motion-reduced mode for charts.
- VoiceOver/ScreenReader labels on all controls.
- Haptics optional.

### Internationalization
- All strings pulled from i18n bundle.
- Number and date formatting locale-aware.
- Units: metric/imperial toggle per trackable if relevant.

### Testing strategy
- Unit: goal evaluation, streak breaks, period rollover.
- Property tests for time math across DST.
- Integration: reminder firing and mute.
- Snapshot tests for dashboard sort order.
- Migration tests for versioned schema.

### Telemetry (opt-in)
- Event counts only: app open, record add/edit/delete, reminder fired/tapped.
- No payload values. Aggregate durations only.
- Local toggle and export of telemetry file.

### Performance targets
- Dashboard render < 50ms for 100 trackables.
- Record write < 10ms p95 offline.
- Sync batch 1k records < 2s on 4G.
- DB size guidance: 1M records ~ < 200MB compressed.

### Error handling
- All writes transactional.
- User-facing toasts: success, failure with retry.
- Corruption recovery path: rebuild indexes, re-run migrations.

### Edge cases
- Midnight entries within grace window attach to previous day.
- Leap day and year boundaries covered by tests.
- Back-to-back imports must not double-count per-period goals.

### API surface (future)
- Local HTTP bridge for automations (optional).
- Minimal endpoints: `/records`, `/trackables`, `/scenarios`, `/imports`.
- Auth via device key; rate limit locally.

### Versioning and migrations
- Semantic app schema version.
- Migrations are reversible. Backup before apply.
- Data export tagged with schema version.

### Backup and restore
- Manual and scheduled encrypted backups.
- Cloud target selectable (Drive, iCloud, S3-compatible).
- Partial restore by date range.

### Extensibility
- Plugin hooks:
  - `onRecordWritten`
  - `onPeriodRollover`
  - `onReminderFire`
- Safe sandbox with permission prompts.

---

## 🚀 MVP Scope

- Scenarios, trackables, records
- Daily and absolute goals
- Streaks
- Dashboard with quick adds
- Reminders: once-daily and multi-daily
- Local storage + JSON export
- Presets: Water, Reading, Gym

### Nice-to-have after MVP
- Imports (Health/Google Fit)
- Computed trackables
- End-to-end encrypted sync
- CSV import
- Widgets/complications



## Tech Stack (T3)

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io) + Neon.tech
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)
